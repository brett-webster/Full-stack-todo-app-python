"""
docstring for module
In this file, we register the Todos model with the Django admin site
"""
from django.contrib import admin
from django_app.models import Todos  # import Todos model

# Register your models here.
admin.site.register(Todos)
