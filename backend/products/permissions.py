from rest_framework.permissions import BasePermission

class IsProductOwner(BasePermission):
    message = "You can only modify your own products"

    def has_object_permission(self, request, view, obj):
        return obj.vendor == request.user.vendor