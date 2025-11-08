from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, CartItemViewSet, CartViewSet, OrderViewSet, search_books, login_view, register, logout_view, current_user

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='books')
router.register(r'carts', CartViewSet, basename='carts')
router.register(r'cart-items', CartItemViewSet, basename='cart-items')
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', search_books, name='search_books'),
    path('auth/register/', register, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/current-user/', current_user, name='current_user'),
]
