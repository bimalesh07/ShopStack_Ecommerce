from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import(
    CustomerRegisterSerializer,
    VendorRegisterSeralizer,
    LoginSerializers,
    UserSerializer,
    ChangePasswordSerializer
)
from .google_auth import verify_google_token, get_or_create_google_user
from .utils import generate_otp, get_otp, get_client_ip
from .tasks import send_verification_email 

def get_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }

class CustomerRegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = CustomerRegisterSerializer(data= request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)
            # Otp Genereate
            otp = generate_otp(user.email)
            send_verification_email.delay(user.email, otp)
            tokens = get_token_for_user(user)
            return Response({
                "message": "OTP sent to your email. Please verify.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorRegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = VendorRegisterSeralizer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)
            otp = generate_otp(user.email)
            send_verification_email.delay(user.email, otp)
            tokens = get_token_for_user(user)
            return Response({
                "message": "OTP sent to your email. Please verify.",
                "email": user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class VerifyOTPView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        otp_received = request.data.get("otp")
    
        stored_otp = get_otp(email)

        if stored_otp and str(stored_otp) == str(otp_received):
       
            from .utils import delete_otp
            delete_otp(email)

            from users.models import User, UserDevice
            user = User.objects.get(email=email)
            
         
            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
      
            device, created = UserDevice.objects.get_or_create(
                user=user, 
                ip_address=ip_address, 
                user_agent=user_agent
            )
            device.is_trusted = True
            device.save()

          
            if user.role == "vendor":
                from vendorapp.tasks import send_registration_thankyou_email
                send_registration_thankyou_email.delay(user.email, user.name)
                
                return Response({
                    "message": "Email verified successfully! Your application is now with the admin for approval. You will receive an email once approved."
                }, status=status.HTTP_200_OK)

            else:
             
                user.is_active = True
                user.save() 
                
                tokens = get_token_for_user(user)
                return Response({
                    "message": "Account verified successfully!",
                    "user": UserSerializer(user).data,
                    "tokens": tokens
                }, status=status.HTTP_200_OK)

        return Response({"error": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializers(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            
           
            if not user.is_active:
                return Response({
                    "error": "Your account is not active. If you are a vendor, please wait for admin approval."
                }, status=status.HTTP_403_FORBIDDEN)

          
            ip_address = get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            from users.models import UserDevice
            device, created = UserDevice.objects.get_or_create(
                user=user,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            if not device.is_trusted:
             
                otp = generate_otp(user.email)
                send_verification_email.delay(user.email, otp)
                return Response({
                    "otp_required": True,
                    "message": "Login attempt from a new device. Please verify with the OTP sent to your email.",
                    "email": user.email
                }, status=status.HTTP_200_OK)

            tokens = get_token_for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "tokens": tokens
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) 

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try :
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(
                {
                    "message":"Logged out successfully"
                }, status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"error":"invalid token"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class ProfileView(APIView):
    permission_classes =(IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self, request):
        seralizer = UserSerializer(request.user, data=request.data, partial =True)
        if seralizer.is_valid():
            seralizer.save()
            return Response(seralizer.data)
        return Response(seralizer.errors, status=status.HTTP_201_CREATED)


class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data= request.data)
        if serializer.is_valid():
            user = request.user

            if not user.check_password(serializer.validated_data["old_password"]):
                return Response(
                    {"old_password": "Wrong password"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(serializer.validated_data["new_password"])
            user.save()
            return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get("credential")
        role = request.data.get("role", "customer")

        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = verify_google_token(token)
            user = get_or_create_google_user(idinfo, role)

            if not user.is_active:
                return Response(
                    {"error": "Account is not active. Please wait for approval."},
                    status=status.HTTP_403_FORBIDDEN
                )

            tokens = get_token_for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "tokens": tokens
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            

class ResendOTPView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        from users.models import User
        try:
            user = User.objects.get(email=email)
            otp = generate_otp(user.email)
            send_verification_email.delay(user.email, otp)
            return Response({"message": "OTP resent successfully"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)
