# pylint: disable=line-too-long

"""
docstring for module
This module implements a basic Django server with various HTTP methods
It includes handlers for GET, POST, PUT, PATCH and DELETE requests
It incorporates auto-reload (built-in), type checking (mypy) and linting (pylint)
"""

import json
import psycopg2  # python3 -m pip install psycopg2-binary (must activate venv first) -- https://www.psycopg.org/docs/install.html
from django.shortcuts import render  # render can be imported to render dynamic HTML templates
from django.views.static import serve
from django.http import HttpRequest, HttpResponse, JsonResponse, FileResponse
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect  # use '@csrf_exempt' to disable CSRF protection, if needed
from django.db.models import QuerySet, Max
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from django_app.models import Todos, ToDoType
from django_basic_server import initiate_django_server  # import server function to initiate Django server (based on environment)

# ----------

# SEED EMPTY DATABASE TABLE WITH SAMPLE DATA
# TO SEED DB IN CLI --> python3 server/manage.py runserver (OR 'npm run server / dev')
# Todos.seed_db()   # <--- undocument this line

# ----------

initiate_django_server()  # invoke Django server function (sets up configuration based on dev/production environment variable)

# Create your views here.
def root_path(request: HttpRequest) -> HttpResponse:
    """GET method for ROOT path to render index.html"""
    return render(request, 'index.html')

def serve_production_file(request: HttpRequest, filename: str) -> FileResponse:
    """GET method for serving production files (e.g. index.js, index.css, 2 .jpgs)"""
    return serve(request, filename, settings.STATIC_ROOT)

# --------- HELPER FUNCTIONS ---------

# Map PostgreSQL field names / keys onto frontend field names / keys so response object is compatible w/ frontend expectations
def map_todos_array_for_frontend(sorted_todos_array_list: list[ToDoType]) -> list[ToDoType]:
    """docstring for helper function"""
    todos_array_for_frontend: list[ToDoType] = []
    for row in sorted_todos_array_list:
        todos_array_for_frontend.append({
            "id": row['id'],
            "newSortedRank": row['sorted_rank'],  # Note: timestamp not currently used/displayed on frontend
            "task": row['task'],
            "statusComplete": row['status_complete']
        })
    return todos_array_for_frontend

# Map frontend field names / keys onto PostgreSQL field names / keys so response object is compatible w/ backend expectations
def map_todos_array_for_backend(sorted_todos_array_list: list[ToDoType]) -> list[ToDoType]:
    """docstring for helper function"""
    todos_array_for_backend: list[ToDoType] = []
    for row in sorted_todos_array_list:
        todos_array_for_backend.append({
            "id": row['id'],
            "newSortedRank": row['newSortedRank'],  # Note: timestamp not currently used
            "task": row['task'],
            "status_complete": row['statusComplete']
        })
    return todos_array_for_backend

# Helper function to fetch all tasks from DB and sort by rank (used by various HTTP methods below)
def fetch_all_and_sort_by_rank() -> list[ToDoType]:
    """docstring for helper function"""
    # pylint: disable=no-member
    todos_array: QuerySet = Todos.objects.all()  # Fetch all tasks from DB
    sorted_todos_array: QuerySet = todos_array.order_by('sorted_rank')  # Sort fetched tasks by rank
    sorted_todos_array_list: list[ToDoType] = list(sorted_todos_array.values())  # Convert QuerySet --> list of dictionaries
    return sorted_todos_array_list

# Helper function to fetch all tasks from DB, sort by rank, map to frontend syntax & return response (used by most HTTP methods below)
def fetch_all_todos_then_map_to_frontend_syntax_and_return_response() -> JsonResponse:
    """docstring for helper function"""
    sorted_todos_array_list: list[ToDoType] = fetch_all_and_sort_by_rank()  # invoke query helper fxn above

    # Map PostgreSQL field names / keys onto frontend field names / keys so response object is compatible w/ frontend expectations
    todos_array_for_frontend: list[ToDoType] = map_todos_array_for_frontend(sorted_todos_array_list)

    # Return jsonResponse w/ sorted todos array
    response: JsonResponse = JsonResponse(todos_array_for_frontend, safe=False)  # safe=False argument used because we're serializing a list, not a dictionary
    response["Access-Control-Allow-Origin"] = "*"  # Allows CORS
    return response

# --------- HTTP METHODS & ASSOCIATED DJANGO ORM QUERIES ---------

# GET
# /api/setCSRFtokenAsCookie -- pass CSRF token on pageload to frontend cookie storage to use for non-GET requests
@require_http_methods(["GET"])
def set_csrf_token_as_cookie(request: HttpRequest) -> JsonResponse:
    """GET method"""
    if request.path == "/api/setCSRFtokenAsCookie":
        csrf_token = get_token(request)
        response: JsonResponse = JsonResponse({'csrftoken': csrf_token})
        response.set_cookie('csrftoken', csrf_token)  # setting Secure to be True for HTTPS & samesite to 'Strict' for CSRF protection in settings.py
        return response
    return JsonResponse({"error": "Invalid request"}, status=400)  # error handling

# GET
# /api/allTodos
@require_http_methods(["GET"])
def get_all_todos(request: HttpRequest) -> JsonResponse:
    """GET method"""
    if request.path == "/api/allTodos":
        response: JsonResponse = fetch_all_todos_then_map_to_frontend_syntax_and_return_response()
        return response
    return JsonResponse({"error": "Invalid request"}, status=400)  # error handling


# POST
# /api/addNewTask
@csrf_protect
@require_http_methods(["POST"])
def add_new_task(request: HttpRequest) -> JsonResponse:
    """POST method"""
    if request.path == "/api/addNewTask":
        new_task_to_add_obj: dict[str, ToDoType] = json.loads(request.body.decode('utf-8'))  # convert body data to JSON object (deserialize from bytes & convert to dictionary)
        num_tasks_in_db: int = Todos.objects.count()  # fetch number of tasks in DB
        max_sorted_rank: int = 0  # default value for max_sorted_rank to avoid error if no tasks in DB
        if num_tasks_in_db > 0:
            max_sorted_rank = Todos.objects.aggregate(Max('sorted_rank'))['sorted_rank__max']  # fetch max sorted_rank value from DB (increment by +1 for new task below)

        # Insert new task into DB & fetch updated todos array list
        try:
            Todos.objects.create(sorted_rank=max_sorted_rank + 1, task=new_task_to_add_obj['newTaskToAdd']['task'], status_complete=new_task_to_add_obj['newTaskToAdd']['statusComplete'])
        except psycopg2.Error as e:
            print('An error occurred: ', e)

        response: JsonResponse = fetch_all_todos_then_map_to_frontend_syntax_and_return_response()
        return response
    return JsonResponse({"error": "Invalid request"}, status=400)  # error handling


# PATCH
# /api/updateSortingOrderPostDnD
@csrf_protect
@require_http_methods(["PATCH"])
def update_sorting_order_post_dnd(request: HttpRequest) -> JsonResponse:
    """PATCH method"""
    if request.path[:30] == "/api/updateSortingOrderPostDnD":
        reordered_data: dict[str, list[ToDoType]] = json.loads(request.body.decode('utf-8'))  # convert body data to JSON object (deserialize from bytes & convert to dictionary)
        backend_todo_list: list[ToDoType] = map_todos_array_for_backend(reordered_data['toDosArrayFull'])  # map todos array for backend so compatible

        Todos.update_sorted_rank(backend_todo_list)  # update values in DB, if data is valid
        sorted_todos_array_list: list[ToDoType] = fetch_all_and_sort_by_rank()  # invoke query helper fxn above

        # Return jsonResponse w/ sorted todos array
        response: JsonResponse = JsonResponse(sorted_todos_array_list, safe=False)  # safe=False argument used because we're serializing a list, not a dictionary
        response["Access-Control-Allow-Origin"] = "*"  # Allows CORS
        return response
    return JsonResponse({"error": "Invalid request"}, status=400)  # error handling

@csrf_protect
@require_http_methods(["PATCH"])
def update_todo_status(request: HttpRequest, id_to_update: int) -> JsonResponse:
    """PATCH method"""
    if request.path[:21] == "/api/updateTodoStatus":
        try:
            task_to_update = Todos.objects.get(id=id_to_update)  # Get task from the DB
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)
        # Update task in DB (use update() method for multiple fields)
        task_to_update.status_complete = not task_to_update.status_complete  # toggle status_complete key field
        # Make the existing datetime timezone-aware (avoids following CLI error: 'RuntimeWarning: DateTimeField Todos.created_at received a naive datetime (2024-05-29 06:04:16.935156) while time zone support is active.')
        aware_datetime = timezone.make_aware(task_to_update.created_at, timezone=timezone.get_default_timezone())
        task_to_update.created_at = aware_datetime  # Set created_at to the timezone-aware datetime
        task_to_update.save()

        response: JsonResponse = fetch_all_todos_then_map_to_frontend_syntax_and_return_response()
        return response
    return JsonResponse({"error": "Invalid request"}, status=400)  # error handling


# DELETE
# /api/api/deleteTodo/3
@csrf_protect
@require_http_methods(["DELETE"])
def delete_single_todo(request: HttpRequest, id_to_delete: int) -> JsonResponse:
    """DELETE method"""
    if request.path[:15] == "/api/deleteTodo":
        try:
            task_to_delete = Todos.objects.get(id=id_to_delete)  # Get task from the DB
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Task not found"}, status=404)
        task_to_delete.delete()  # Delete task from DB

        response: JsonResponse = fetch_all_todos_then_map_to_frontend_syntax_and_return_response()
        return response
    return JsonResponse({"error": "Invalid request"}, status=400)  # error handling

# /api/api/deleteTodo/3
@csrf_protect
@require_http_methods(["DELETE"])
def delete_all_completed_todos(request: HttpRequest) -> JsonResponse:
    """DELETE method"""
    if request.path == "/api/deleteAllCompletedTodos":
        sorted_todos_array_list: list[ToDoType] = fetch_all_and_sort_by_rank()  # invoke query helper fxn above for updated todos array list

        ids_to_delete: list[int] = [todo['id'] for todo in sorted_todos_array_list if todo['status_complete'] is True and isinstance(todo['id'], int)]
        # Error handle in case of no tasks to delete
        if len(ids_to_delete) == 0:
            return JsonResponse({"error": "No tasks to delete"}, status=400)

        # Get QuerySet of all objects whose 'id' is in ids_to_delete list & delete all objects in the QuerySet
        queryset = Todos.objects.filter(id__in=ids_to_delete)
        queryset.delete()

        response: JsonResponse = fetch_all_todos_then_map_to_frontend_syntax_and_return_response()
        return response
    return JsonResponse({"error": "Invalid request"}, status=400)  # error handling
