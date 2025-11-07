from django.contrib import admin
from .models import Book,Cart,CartItem,Order,OrderItem,SearchHistory,UserProfile

admin.site.register(Book)
admin.site.register(Cart)
admin.site.register(CartItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(SearchHistory)
admin.site.register(UserProfile)
