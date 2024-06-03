# pylint: disable=line-too-long

"""
docstring for module
This module implements URL route configuration for the Django app
"""

from django.urls import path
from . import views

# URL Configuration
urlpatterns = [
    path('', views.root_path, name='root_path'),  # /
    path('setCSRFtokenAsCookie', views.set_csrf_token_as_cookie),  # /api/setCSRFtokenAsCookie
    path('allTodos', views.get_all_todos),  # /api/allTodos
    path('addNewTask', views.add_new_task),  # /api/addNewTask
    path('updateTodoStatus/<int:id_to_update>', views.update_todo_status),  # /api/updateTodoStatus/4
    path('updateSortingOrderPostDnD', views.update_sorting_order_post_dnd),  # /api/updateSortingOrderPostDnD
    path('deleteTodo/<int:id_to_delete>', views.delete_single_todo),  # /api/deleteTodo/3
    path('deleteAllCompletedTodos', views.delete_all_completed_todos),  # /api/deleteAllCompletedTodos
]
