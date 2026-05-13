from rest_framework import serializers
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "image", "created_at")
        read_only_fields = ("id", "slug", "created_at")

    def get_image(self, obj):
        latest_product = obj.products.filter(is_active=True).first()
        if latest_product:
            image_obj = latest_product.images.filter(is_primary=True).first() or latest_product.images.first()
            
            if image_obj and image_obj.image:
                #  image_obj.image.url
                url = image_obj.image.url
                #  Cloudinary Optimization
                if 'cloudinary.com' in url:
                    url = url.replace('/upload/', '/upload/q_auto,f_auto,w_500/')
                
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(url)

                if url.startswith('http'):
                    return url
                return f"https://shopstack-ecommerce-1.onrender.com{url}"
        return None



class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField() 

    class Meta:
        model = ProductImage
        fields = ("id", "image", "is_primary")
        read_only_fields = ("id",)
    def get_image(self, obj):
        if not obj.image:
            return None
        
        url = obj.image.url
        # Cloudinary Optimization
        if 'cloudinary.com' in url:
            url = url.replace('/upload/', '/upload/q_auto,f_auto,w_800/')
        
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(url)
        if url.startswith('http'):
            return url
        return f"https://shopstack-ecommerce-1.onrender.com{url}"



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
