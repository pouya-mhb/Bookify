from datetime import datetime
import requests
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Book, Cart, CartItem, Order, SearchHistory
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
