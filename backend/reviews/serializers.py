from rest_framework import serializers
from .models import Review

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Review
        fields = ('id', 'product', 'user', 'user_name', 'order', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'user', 'created_at')

    def validate(self, data):
        user = self.context['request'].user
        product = data['product']
        order = data.get('order')
        
        # Check if user already reviewed this specific order-product combo
        if order and Review.objects.filter(product=product, user=user, order=order).exists():
            raise serializers.ValidationError("You have already reviewed this purchase.")
        elif not order and Review.objects.filter(product=product, user=user).exists():
             raise serializers.ValidationError("You have already reviewed this product.")  
        return data
