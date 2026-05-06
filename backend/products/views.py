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

# category views
class CategoryListView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        category = Category.objects.all()
        serializer = CategorySerializer(category, many=True)
        return Response(serializer.data)
    
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

class ProductListView(APIView):
    permission_classes = (AllowAny,)
    def get(self, request):
        products = Product.objects.filter(
            is_active=True,
            vendor__is_approved=True
        ).select_related("category", "vendor").prefetch_related("images")

        # filtring
        category = request.query_params.get("category")
        search = request.query_params.get("search")
        min_price = request.query_params.get("min_price")
        max_price = request.query_params.get("max_price")

        if category:
            import uuid
            try:
                # Check if category is a valid UUID (ID)
                uuid.UUID(str(category))
                products = products.filter(category_id=category)
            except ValueError:
                # Otherwise treat as category name
                products = products.filter(category__name__iexact=category)
        if search:
            products = products.filter(name__icontains=search)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        
        # ordering
        ordering = request.query_params.get("ordering")
        if ordering:
            allowed_ordering = ["price", "-price", "created_at", "-created_at"]
            if ordering in allowed_ordering:
                products = products.order_by(ordering)
        
        #paginations start
        paginator = StandardPagination()
        #paginations start
        page = paginator.paginate_queryset(products, request)

        if page is not None:
            serializer = ProductSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        # if pagiantions fallback not workingn
        
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class ProductDetailView(APIView):
    permission_classes = (AllowAny,)
    def get(self, request, pk):
        try:
            product =Product.objects.select_related(
                "category", "vendor"
            ).prefetch_related("images").get(
                pk=pk,
                is_active = True,
                vendor__is_approved = True
            )
        except Product.DoesNotExist:
            return Response(
                {"error":" Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)
    
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



