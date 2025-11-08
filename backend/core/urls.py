from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, CartItemViewSet, CartViewSet, OrderViewSet, search_books

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='books')
router.register(r'carts', CartViewSet, basename='carts')
router.register(r'cart-items', CartItemViewSet, basename='cart-items')
router.register(r'orders', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
    path('search/', search_books, name='search_books'),
]
