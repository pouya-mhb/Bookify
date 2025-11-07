from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, CartViewSet, OrderViewSet, search_books

router = DefaultRouter()
router.register(r'books', BookViewSet)
router.register(r'cart', CartViewSet)
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('search/', search_books, name='search_books'),
]
