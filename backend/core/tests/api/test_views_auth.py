# 'user': {
#                 'id': user.id,
#                 'username': user.username,
#                 'email': user.email
#             }

from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User

class AuthViewsTests(APITestCase):
    def setUp(self,id):
        self.user = User.objects.get(id=id)

    def create_user(self):
        pass

    def update_user(self):
        pass

    def delete_user(self):
        pass

    def register_user(self):
        pass

    def login_user(self):
        pass

    def logout_user(self):
        pass