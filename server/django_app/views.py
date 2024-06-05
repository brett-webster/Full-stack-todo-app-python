# pylint: disable=line-too-long

"""
docstring for module
This module implements a basic Django server with various HTTP methods
It includes handlers for GET, POST, PUT, PATCH and DELETE requests
It incorporates Django REST Framework, Django's ORM (built-in), auto-reload (built-in), type checking (mypy) and linting (pylint)
"""

import psycopg2  # python3 -m pip install psycopg2-binary (must activate venv first) -- https://www.psycopg.org/docs/install.html
from django.shortcuts import render, get_object_or_404  # render can be imported to render dynamic HTML templates
from django.views.static import serve
from django.http import FileResponse
from django.conf import settings
from django.middleware.csrf import get_token
from django.db.models import QuerySet, Max
from django.utils import timezone
from rest_framework.views import APIView  # type: ignore
from rest_framework.request import Request  # type: ignore
from rest_framework.response import Response  # type: ignore
from rest_framework import status  # type: ignore
from rest_framework.exceptions import ValidationError  # type: ignore
from django_basic_server import initiate_django_server  # import server function to initiate Django server (based on environment)
from django_app.serializers import TodosSerializer
from django_app.models import Todos, ToDoType
from django_app import serializers

# ----------

# SEED EMPTY DATABASE TABLE WITH SAMPLE DATA
# TO SEED DB IN CLI --> python3 server/manage.py runserver (OR 'npm run server / dev')
# Todos.seed_db()   # <--- undocument this line

# ----------

initiate_django_server()  # invoke Django server function (sets up configuration based on dev/production environment variable)

# Create your views here.
def root_path(request: Request) -> Response:
    """GET method for ROOT path to render index.html"""
    return render(request, 'index.html')

def serve_production_file(request: Request, filename: str) -> FileResponse:
    """GET method for serving production files (e.g. index.js, index.css, 2 .jpgs)"""
    return serve(request, filename, settings.STATIC_ROOT)

# --------- HELPER FUNCTIONS ---------

# Map frontend field names / keys onto PostgreSQL field names / keys so response object is compatible w/ backend expectations
# Alternatively, could add 'djangorestframework_camel_case.parser.CamelCaseJSONParser' to 'DEFAULT_PARSER_CLASSES' to convert keys from camelCase to snake_case (& vice-versa)
# https://github.com/vbabiy/djangorestframework-camel-case
def map_todo_keys_for_backend(todo: ToDoType) -> ToDoType:
    """docstring for helper function"""
    backend_todo: ToDoType = {
            "id": todo['id'],  # Note: timestamp not currently used
            "sorted_rank": -1,  # -1 is only placeholder (needs to be included to avoid serialized error in Django)
            "task": todo['task'],
            "status_complete": todo['statusComplete']
        }
    return backend_todo

# Helper function to fetch all tasks from DB, sort by rank, serialize & return results (used by various HTTP methods below)
def fetch_sort_then_serialize_response() -> Response:
    """docstring for helper function"""
    results: QuerySet = Todos.objects.all().order_by('sorted_rank')  # Fetch all tasks from DB & sort by rank

    # Serialize the data for the frontend & return (Note: need to convert keys from snake_case to camelCase on frontend)
    serializer: serializers.TodosSerializer = TodosSerializer(results, many=True)  # 'many' denotes list of objects
    return Response(serializer.data)

# --------- HTTP METHODS & ASSOCIATED DJANGO ORM QUERIES ---------

# GET
# /api/setCSRFtokenAsCookie -- pass CSRF token on pageload to frontend cookie storage to use for non-GET requests
class SetCsrfTokenAsCookie(APIView):  # class inherits the APIView class
    """GET method using Django REST Framework APIView class"""
    def get(self, request: Request) -> Response:
        """GET method"""
        csrf_token = get_token(request)
        response = Response({'csrftoken': csrf_token})
        response.set_cookie('csrftoken', csrf_token)  # setting Secure to be True for HTTPS & samesite to 'Strict' for CSRF protection in settings.py
        return response

# GET
# /api/allTodos
class GetAllTodos(APIView):
    """GET method using Django REST Framework APIView class"""
    # pylint: disable=unused-argument
    def get(self, request: Request) -> Response:
        """GET method"""
        return fetch_sort_then_serialize_response()  # Invoke above helper function to fetch all tasks from DB, sort by rank, serialize & return results


# POST
# /api/addNewTask
class AddNewTask(APIView):
    """POST method using Django REST Framework APIView class"""
    def post(self, request: Request) -> Response:
        """POST method"""
        backend_todo: ToDoType = map_todo_keys_for_backend(request.data.get('newTaskToAdd'))  # map frontend todo keys to backend format so compatible (camelCase --> snake_case)

        serializer = TodosSerializer(data=backend_todo)
        if serializer.is_valid():
            max_sorted_rank = Todos.objects.aggregate(Max('sorted_rank'))['sorted_rank__max'] or 0  # fetch max sorted_rank value from DB (increment by +1 for new task below)
            validated_data = serializer.validated_data.copy()  # create copy of validated_data
            validated_data.pop('sorted_rank', None)  # remove 'sorted_rank' from the copy to avoid duplicate key error when attempting to .create()
            try:
                Todos.objects.create(sorted_rank=max_sorted_rank + 1, **validated_data)  # modify sorted_rank & unpack amended validated_data (sans sorted_rank) into create method
            except psycopg2.IntegrityError as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return fetch_sort_then_serialize_response()  # invoke above helper function to fetch all tasks from DB, sort by rank, serialize & return results
        return ValidationError(serializer.errors)  # return error if serializer is not valid


# PATCH
# /api/updateSortingOrderPostDnD
class UpdateSortingOrderPostDnD(APIView):
    """PATCH method using Django REST Framework APIView class"""
    # pylint: disable=unused-argument
    def patch(self, request: Request) -> Response:
        """PATCH method"""
        reordered_data: list[ToDoType] = request.data['toDosArrayFull']  # grab body sent from frontend request
        Todos.update_sorted_rank(reordered_data)  # update values in DB, if data is valid

        return fetch_sort_then_serialize_response()  # Invoke above helper function to fetch all tasks from DB, sort by rank, serialize & return results

class UpdateTodoStatus(APIView):
    """PATCH method using Django REST Framework APIView class"""
    # pylint: disable=unused-argument
    def patch(self, request: Request, id_to_update: int) -> Response:
        """PATCH method"""
        task_to_update: Todos = get_object_or_404(Todos, id=id_to_update)  # Get task from the DB

        # Update task in DB (use update() method for multiple fields)
        task_to_update.status_complete = not task_to_update.status_complete  # toggle status_complete key field
        # Make the existing datetime timezone-aware (avoids following CLI error: 'RuntimeWarning: DateTimeField Todos.created_at received a naive datetime (2024-05-29 06:04:16.935156) while time zone support is active.')
        aware_datetime = timezone.make_aware(task_to_update.created_at, timezone=timezone.get_default_timezone())
        task_to_update.created_at = aware_datetime  # Set created_at to the timezone-aware datetime
        task_to_update.save()

        return fetch_sort_then_serialize_response()  # Invoke above helper function to fetch all tasks from DB, sort by rank, serialize & return results


# DELETE
# /api/api/deleteTodo/3
class DeleteSingleTodo(APIView):
    """DELETE method using Django REST Framework APIView class"""
    # pylint: disable=unused-argument
    def delete(self, request: Request, id_to_delete: int) -> Response:
        """DELETE method"""
        task_to_delete = get_object_or_404(Todos, id=id_to_delete)  # Get task from the DB
        task_to_delete.delete()  # Delete task from DB

        return fetch_sort_then_serialize_response()  # Invoke above helper function to fetch all tasks from DB, sort by rank, serialize & return results

# /api/api/deleteAllCompletedTodos
class DeleteAllCompletedTodos(APIView):
    """DELETE method using Django REST Framework APIView class"""
    # pylint: disable=unused-argument
    def delete(self, request: Request) -> Response:
        """DELETE method"""
        # Get QuerySet of all completed tasks & delete all objects in the QuerySet
        queryset: QuerySet = Todos.objects.filter(status_complete=True)

        # Error handle in case of no tasks to delete
        if not queryset.exists():
            return Response({"error": "No tasks to delete"}, status=status.HTTP_400_BAD_REQUEST)

        queryset.delete()

        return fetch_sort_then_serialize_response()  # Invoke above helper function to fetch all tasks from DB, sort by rank, serialize & return results
