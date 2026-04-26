from rest_framework.permissions import BasePermission

class isVendor(BasePermission):
    message = "Only vender can perform this action"
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_vendor
        )
        
class IsCustomer(BasePermission):
    message ="Only Customers can perform this action"
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_customer
        )


class IsVenderOrReadOnly(BasePermission):
    message = "Only vendors can modify"
    def has_permission(self, request, view):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_vendor
        )
    
    