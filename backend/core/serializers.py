from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Book, Cart, CartItem, Order, OrderItem

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'location']

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

class CartItemSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)
    book_id = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), source='book', write_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    class Meta:
        model = CartItem
        fields = ['cart', 'book', 'quantity', 'book_id', 'total_price']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, source='cartitem_set', read_only=True)
    total_price = serializers.ReadOnlyField()
    total_items = serializers.ReadOnlyField()
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price', 'total_items']

class OrderItemSerializer(serializers.ModelSerializer):
    book = BookSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['order', 'book', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, source='orderitem_set', read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'cart', 'items', 'status', 'created_at', 'updated_at']
