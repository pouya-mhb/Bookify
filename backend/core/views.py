import requests
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book, Cart, CartItem, Order
from .serializers import BookSerializer, CartSerializer, OrderSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class CartViewSet(viewsets.ModelViewSet):
    queryset = Cart.objects.all()
    serializer_class = CartSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


# Google Books API Integration
@api_view(['GET'])
def search_books(request):
    query = request.GET.get('q')
    if not query:
        return Response({'error': 'Query parameter "q" is required.'}, status=status.HTTP_400_BAD_REQUEST)

    url = f'https://www.googleapis.com/books/v1/volumes?q={query}'
    response = requests.get(url)

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
        })

    return Response(books, status=status.HTTP_200_OK)
