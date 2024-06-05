# pylint: disable=line-too-long

"""
docstring for module
This module implements the TodosSerializer class for the Django app
"""

from rest_framework import serializers  # type: ignore
from .models import Todos

class TodosSerializer(serializers.ModelSerializer):
    """docstring for class"""
    # pylint: disable=R0903
    class Meta:
        """docstring for class"""
        model = Todos
        fields = ["id", "sorted_rank", "created_at", "task", "status_complete"]  # Alternative: fields = '__all__'
