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
    path('setCSRFtokenAsCookie', views.SetCsrfTokenAsCookie.as_view()),  # /api/setCSRFtokenAsCookie
    path('allTodos', views.GetAllTodos.as_view()),  # /api/allTodos
    path('addNewTask', views.AddNewTask.as_view()),  # /api/addNewTask
    path('updateTodoStatus/<int:id_to_update>', views.UpdateTodoStatus.as_view()),  # /api/updateTodoStatus/4
    path('updateSortingOrderPostDnD', views.UpdateSortingOrderPostDnD.as_view()),  # /api/updateSortingOrderPostDnD
    path('deleteTodo/<int:id_to_delete>', views.DeleteSingleTodo.as_view()),  # /api/deleteTodo/3
    path('deleteAllCompletedTodos', views.DeleteAllCompletedTodos.as_view()),  # /api/deleteAllCompletedTodos
]
