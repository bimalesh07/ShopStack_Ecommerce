from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser,FormParser
from users.permissions import isVendor
from .models import Category, Product, ProductImage
from .permissions import IsProductOwner
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
    ProductImageSerializer
)
from config.pagination import StandardPagination
from rest_framework import generics, filters
from django.core.cache import cache

# category views
class CategoryListView(APIView):
    permission_classes = (AllowAny,)
    def get(self, request):
        cache_key = "all_categories"
        data = cache.get(cache_key)
        if not data:
            category = Category.objects.all()
            serializer = CategorySerializer(category, many=True, context={'request': request})
            data = serializer.data
            # 24 hours
            cache.set(cache_key, data, 86400)
            print("Categories from DB")
        else:
            print("Categories from Redis ⚡")
            
        return Response(data)
    
class CategoryCreateView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self , request):
        if not request.user.is_staff:
            return Response({
                "error":"Only superuser can create categories."
            },status=status.HTTP_403_FORBIDDEN)
        serializer = CategorySerializer(data= request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
    
# public Product View
class ProductListView(generics.ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ProductSerializer
    pagination_class = StandardPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['selling_price', 'created_at']

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == "vendor":
            # If user is a vendor, show only their own products
            queryset = Product.objects.filter(
                vendor=self.request.user.vendor
            )
        else:
            # For customers or anonymous users, show all active and approved products
            queryset = Product.objects.filter(
                is_active=True,
                vendor__is_approved=True
            )
        
        queryset = queryset.select_related("category", "vendor").prefetch_related("images")

        # manual filtring for category and price range
        category = self.request.query_params.get("category")
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")

        if category:
            import uuid
            try:
                # Check if category is a valid UUID (ID)
                uuid.UUID(str(category))
                queryset = queryset.filter(category_id=category)
            except ValueError:
                # Otherwise treat as category name
                queryset = queryset.filter(category__name__iexact=category)
        
        if min_price:
            queryset = queryset.filter(selling_price__gte=min_price)
        if max_price:
            queryset = queryset.filter(selling_price__lte=max_price)
        
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    
class ProductDetailView(APIView):
    permission_classes = (AllowAny,)
    def get(self, request, slug):
        cache_key = f"product_detail_{slug}"
        data = cache.get(cache_key)

        if not data:
            try:
                product = Product.objects.select_related(
                    "category", "vendor"
                ).prefetch_related("images").get(
                    slug=slug,
                    is_active=True,
                    vendor__is_approved=True
                )
                serializer = ProductSerializer(product, context={'request': request})
                data = serializer.data
                # 1 hours
                cache.set(cache_key, data, 3600)
                print("Product from DB")
            except Product.DoesNotExist:
                return Response({"error":"Product not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            print("Product from Redis ⚡")

        return Response(data)
    
# Vndor products 
class VendorProductListCreateview(APIView):
    permission_classes = (IsAuthenticated, isVendor, )
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        if not request.user.vendor.is_approved:
            return Response(
                {"error":" Your Shop is not approved yet."},
                status=status.HTTP_403_FORBIDDEN
            )
        products = Product.objects.filter(
            vendor = request.user.vendor

        ).select_related("category").prefetch_related("images")
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        if not request.user.vendor.is_approved:
            return Response({
                "error":"Your Shop is not approved yet"
            }, status=status.HTTP_403_FORBIDDEN)
        serializer = ProductCreateSerializer(data= request.data)
        if serializer.is_valid():
            serializer.save(vendor = request.user.vendor)
            return Response(
                ProductSerializer(serializer.instance, context={'request': request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class VendorProductDetailView(APIView):
    permission_classes = (IsAuthenticated, isVendor)

    def get_object(self, pk, vendor):
        try:
            return Product.objects.get(pk=pk, vendor=vendor)
        except Product.DoesNotExist:
            return None
    
    def get(self, request, pk):
        product =  self.get_object(pk, request.user.vendor)
        if not product:
            return Response(
                {"error":"Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    
    
    def patch(self, request, pk):
        product = self.get_object(pk , request.user.vendor)
        if not product:
            return Response(
                {"error":"Product not Found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductUpdateSerializer(
            product, data=request.data, partial =True
        )

        if serializer.is_valid():
            serializer.save( )
            return Response(ProductSerializer(product, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        product = self.get_object(pk, request.user.vendor)
        if not product:
            return Response(
                {"error":"Product not found"}
                , status=status.HTTP_404_NOT_FOUND
            )
        product.delete()

        return Response(
            {"message":"Product deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )
    
class ProductImageUploadView(APIView):
    permission_classes = (IsAuthenticated, isVendor)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, pk):
        try:
            product = Product.objects.get(pk=pk, vendor=request.user.vendor)
        except Product.DoesNotExist:
            return Response(
               {"error":"Prodict not Found"},
               status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductImageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, image_id):
        try:
            image = ProductImage.objects.get(pk=image_id, product__vendor=request.user.vendor)
        except ProductImage.DoesNotExist:
            return Response(
                {"error":" Image not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        image.delete()
        return Response(
            {"message":"Image delted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )



