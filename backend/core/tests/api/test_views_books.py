from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from core.models import Book

class BookViewTests(APITestCase):
    def setUp(self):
        pass

    def test_book_list(self):
        pass

    def test_create_book(self):
        pass

    def test_get_book_by_title(self):
        pass

    def test_delete_book(self):
        pass

class CartViewSets(APITestCase):
    def setUp(self):
        return super().setUp()

class CartItemViewSets(APITestCase):
    def setUp(self):
        return super().setUp()

class OrdersViewSets(APITestCase):
    def setUp(self):
        return super().setUp()

class OrderItemSets(APITestCase):
    def setUp(self):
        return super().setUp()