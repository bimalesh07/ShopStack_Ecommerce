from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Review
from .serializers import ReviewSerializer
from order.models import Order, OrderItem
from products.models import Product

class ReviewListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id)
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request, product_id):
        # Check if user bought and received the product
        has_bought = OrderItem.objects.filter(
            order__user=request.user,
            order__order_status='delivered',
            product_id=product_id
        ).exists()

        if not has_bought:
            return Response(
                {"error": "You can only review products that have been delivered to you."},
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data.copy()
        data['product'] = product_id
        
        serializer = ReviewSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductRatingView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, product_id):
        reviews = Review.objects.filter(product_id=product_id)
        if not reviews.exists():
            return Response({"average_rating": 0, "review_count": 0})
        
        avg_rating = sum(r.rating for r in reviews) / reviews.count()
        return Response({
            "average_rating": round(avg_rating, 1),
            "review_count": reviews.count()
        })
