from datetime import datetime
import requests
from rest_framework.decorators import api_view
from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import Book, Cart, CartItem, Order, SearchHistory
from .serializers import BookSerializer, CartSerializer, CartItemSerializer, OrderSerializer
from django.contrib.auth import login, authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'description']
    filterset_fields = ['author']
    ordering_fields = ['price', 'title', 'created_at']

    def get_queryset(self):
        queryset = Book.objects.all()
        # Filter out books with no stock
        if self.request.query_params.get('in_stock_only'):
            queryset = queryset.filter(stock__gt=0)
        return queryset

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own cart
        return Cart.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        # Get or create cart for user
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

class CartItemViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own cart items
        cart = self.get_user_cart()
        return CartItem.objects.filter(cart=cart)

    def get_user_cart(self):
        """Get or create cart for the current user"""
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def perform_create(self, serializer):
        cart = self.get_user_cart()
        book = serializer.validated_data['book']
        quantity = serializer.validated_data['quantity']

        # Check if book is in stock
        if book.stock < quantity:
            raise serializers.ValidationError({
                'error': f'Only {book.stock} items available in stock'
            })

        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            book=book,
            defaults={'quantity': quantity}
        )

        if not created:
            # Update quantity if item already exists
            cart_item.quantity += quantity
            if cart_item.quantity > book.stock:
                raise serializers.ValidationError({
                    'error': f'Cannot add more than {book.stock} items'
                })
            cart_item.save()

    def perform_update(self, serializer):
        cart_item = self.get_object()
        new_quantity = serializer.validated_data['quantity']

        # Check stock
        if new_quantity > cart_item.book.stock:
            raise serializers.ValidationError({
                'error': f'Only {cart_item.book.stock} items available in stock'
            })

        serializer.save()

    @action(detail=False, methods=['post'])
    def clear_cart(self, request):
        cart = self.get_user_cart()
        cart.items.all().delete()
        return Response({'message': 'Cart cleared successfully'})

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['created_at', 'total_price']

    def get_queryset(self):
        # Users can only see their own orders
        return Order.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        with transaction.atomic():
            # Get user's cart
            cart = Cart.objects.get(user=self.request.user)
            cart_items = cart.items.all()

            if not cart_items:
                raise self.serializers.ValidationError({'error': 'Cart is empty'})

            # Check stock for all items
            for item in cart_items:
                if item.quantity > item.book.stock:
                    raise self.serializers.ValidationError({
                        'error': f'Not enough stock for {item.book.title}'
                    })

            # Calculate total price
            total_price = cart.total_price

            # Create order
            order = serializer.save(user=self.request.user, total_price=total_price)

            # Create order items and update book stock
            for item in cart_items:
                order.order_items.create(
                    book=item.book,
                    quantity=item.quantity,
                    price=item.book.price
                )
                # Update book stock
                item.book.stock -= item.quantity
                item.book.save()

            # Clear the cart
            cart.items.all().delete()

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        order = self.get_object()
        if order.status == 'pending':
            # Restore stock
            with transaction.atomic():
                for order_item in order.order_items.all():
                    order_item.book.stock += order_item.quantity
                    order_item.book.save()
                order.status = 'cancelled'
                order.save()
            return Response({'message': 'Order cancelled successfully'})
        else:
            return Response(
                {'error': 'Only pending orders can be cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

# Google Books API Integration
@api_view(['GET'])
def search_books(request):
    query = request.GET.get('q')
    if not query:
        return Response({'error': 'Query parameter "q" is required.'}, status=status.HTTP_400_BAD_REQUEST)

    url = f'https://www.googleapis.com/books/v1/volumes?q={query}'
    response = requests.get(url)
    SearchHistory.objects.create(user=request.user, query=query)

    if response.status_code != 200:
        return Response({'error': 'Failed to fetch data from Google Books API'}, status=response.status_code)

    data = response.json()
    books = []

    for item in data.get('items', []):
        volume = item.get('volumeInfo', {})
        books.append({
            'title': volume.get('title', 'Unknown'),
            'author': ', '.join(volume.get('authors', [])) if 'authors' in volume else 'Unknown',
            'description': volume.get('description', ''),
            'published_date': volume.get('publishedDate', ''),
            'isbn': volume.get('industryIdentifiers', [{}])[0].get('identifier', ''),
            'price' : volume.get('retailPrice', {}).get('amount', 0)
        })

    # Save books in database
    for book in books:
        if not Book.objects.filter(isbn=book['isbn']).exists():
            if book['published_date']:
                published_date = book['published_date']
                try:
                    correct_published_date = datetime.strptime(published_date, '%Y-%m-%d').date()
                    Book.objects.create(title=book['title'],
                                        author=book['author'],
                                        description=book['description'],
                                        published_date=correct_published_date,
                                        isbn=book['isbn'],
                                        price=book['price'])
                except ValueError:
                    correct_published_date = None

    return Response(books, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(username=username, password=password, email=email)
    login(request, user)

    return Response({
        'message': 'User created successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        return Response({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        })
    else:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def logout_view(request):
    from django.contrib.auth import logout
    logout(request)
    return Response({'message': 'Logout successful'})

@api_view(['GET'])
def current_user(request):
    if request.user.is_authenticated:
        return Response({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email
            }
        })
    else:
        return Response(
            {'error': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )