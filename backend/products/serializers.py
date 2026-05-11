from rest_framework import serializers
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image", "created_at")
        read_only_fields = ("id", "slug", "created_at")

    def get_image(self, obj):
        # Get the latest active product in this category
        latest_product = obj.products.filter(is_active=True).first()
        if latest_product:
            # Try to get the primary image first
            primary_image = latest_product.images.filter(is_primary=True).first()
            if primary_image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(primary_image.image.url)
                return primary_image.image.url
            
            # Fallback to any image if no primary is marked
            any_image = latest_product.images.first()
            if any_image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(any_image.image.url)
                return any_image.image.url
        return None

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "is_primary")
        read_only_fields = ("id",)


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.shop_name", read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "vendor",
            "vendor_name",
            "category",
            "category_name",
            "name",
            "slug",
            "description",
            "mrp_price",
            "selling_price",
            "discount_percentage",
            "stock",
            "is_in_stock",
            "is_active",
            "images",
            "created_at",
        )
        read_only_fields = ("id", "slug", "vendor_name", "created_at", "discount_percentage")


class ProductCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child = serializers.ImageField(),
        write_only = True,
        required = False
    )
    class Meta:
        model = Product
        fields = (
            "category",
            "name",
            "description",
            "mrp_price",
            "selling_price",
            "stock",
            "is_active",
            "images",
        )
    def create(self, validated_data):
        images_data = validated_data.pop("images",[])
        product = Product.objects.create(**validated_data)
        for index, image in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image = image,
                is_primary=(index==0)
            )
        return product

class ProductUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            "category",
            "name",
            "description",
            "mrp_price",
            "selling_price",
            "stock",
            "is_active",
        )
