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
            user = serializer.save()
            tokens = get_token_for_user(user)
            return Response({
                "user": UserSerializer(user).data,
                "tokens": tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VenderRegisterView(APIView):
    permission_classes =(AllowAny,)

    def post(self, request):
        seralizer = VendorRegisterSeralizer(data= request.data)
        if seralizer.is_valid():
            user = seralizer.save()

            return Response({
                "message": "Vendor registered successfully. Please wait for superuser approval.",
                "user": UserSerializer(user).data,
            }, status=status.HTTP_201_CREATED)
        return Response(seralizer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        serializer = LoginSerializers(data= request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            tokens = get_token_for_user(user)
            return Response({
                "user":UserSerializer(user).data,
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

            

