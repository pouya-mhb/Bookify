from django.test import TestCase
from core.models import UserProfile,Book, Cart, CartItem, Order, OrderItem
from django.contrib.auth.models import User
from datetime import date

class ModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.profile = UserProfile.objects.create(user=self.user,bio='Test bio',location='Test location')
        self.book = Book.objects.create(title='Test Book',
                                        author='Test Author',
                                        description='Test Description',
                                        price=9.99,
                                        stock=100,
                                        isbn='1234567890123',
                                        published_date=date.today())
        self.cart=Cart.objects.create(user=self.user)
        self.cartitem = CartItem.objects.create(cart=self.cart, book=self.book, quantity=1)
        self.order = Order.objects.create(user=self.user,
                                          cart=self.cart,
                                          total_price = self.cartitem.book.price * self.cartitem.quantity)


    def test_create_user_profile(self):

        self.assertEqual(self.profile.user, self.user)


    def test_create_book(self):
        self.assertEqual(self.book.title, 'Test Book')

    def test_create_cart(self):
        cart = Cart.objects.create(user=self.user)
        self.assertEqual(cart.user, self.user)

    def test_create_cart_item(self):
        self.assertEqual(self.cartitem.cart, self.cart)
        self.assertEqual(self.cartitem.book, self.book)

    def test_create_order(self):
        self.assertEqual(self.order.user, self.user)
        self.assertEqual(self.order.cart, self.cart)
        # self.assertEqual(self.order.items, self.cartitem)
        self.assertEqual(self.order.total_price, self.cartitem.book.price * self.cartitem.quantity)