# pylint: disable=line-too-long

"""
docstring for module
This configuration module implements the DjangoAppConfig class, which inherits from Django's AppConfig class
"""
from django.apps import AppConfig


class DjangoAppConfig(AppConfig):
    """docstring for class"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'django_app'
