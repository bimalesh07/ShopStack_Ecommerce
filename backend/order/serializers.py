from rest_framework import serializers
from address.serializers import AddressSerializer
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            "id",
            "product",
            "product_name",
            "product_price",
            "quantity",
            "total_price",
            "vendor",
            "product_image",
        )
        read_only_fields = fields

    def get_product_image(self, obj):
        if obj.product and obj.product.images.exists():
            return self.context['request'].build_absolute_uri(obj.product.images.first().image.url)
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    address = AddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            "id",
            "address",
            "payment_method",
            "payment_status",
            "order_status",
            "total_amount",
            "note",
            "items",
            "created_at",
        )
        read_only_fields = (
            "id",
            "payment_status",
            "order_status",
            "total_amount",
            "created_at",
        )


class OrderCreateSerializer(serializers.Serializer):
    address_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(
        choices=Order.PaymentMethod.choices,
        default =Order.PaymentMethod.COD
    )
    note = serializers.CharField(required=False, allow_blank=True)

    def validate_address_id(self, value):
        from address.models import Address
        request = self.context.get("request")
        try:
            Address.objects.get(pk=value, user=request.user)
        except Address.DoesNotExist:
            raise serializers.ValidationError("Address not found.")
        return value

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ("order_status",)
    
    def validate_order_status(self, value):
        order = self.instance
        valid_transitions ={
            Order.OrderStatus.PENDING:[
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.CANCELLED
            ],
            Order.OrderStatus.CONFIRMED:[
                Order.OrderStatus.SHIPPED,
                Order.OrderStatus.CANCELLED
            ],
            Order.OrderStatus.SHIPPED:[
                Order.OrderStatus.DELIVERED
            ],
            Order.OrderStatus.DELIVERED:[],
            Order.OrderStatus.CANCELLED:[],
        }

        if value not in valid_transitions[order.order_status]:
            raise serializers.ValidationError(
                f"Cannot change the status from "
                f"'{order.order_status}' to '{value}'"
            )
        return value