# pylint: disable=line-too-long

"""
docstring for module
This module includes tests for the Django app
"""

from django.test import TestCase  # Django's TestCase class is a subclass of 'unittest.TestCase' that runs each test inside a transaction to provide isolation between tests
from django_app.views import map_todo_keys_for_backend

# Create your tests here.

# RUN TESTS in CLI
# python3 manage.py test  <--- RUN ALL TESTS in PROJECT (need to cd into 'server' directory first, unclear why can't simply run 'python3 server/manage.py test'...)
# python3 server/manage.py test django_app.tests  <--- RUN ALL TESTS in SPECIFIC APP
# Note:  modified package.json to run ALL TESTS in PROJECT (need to run Python tests 1st for both to run...
# ----> "test": "cd server && python3 manage.py test && jest --verbose --coverage --watchAll=false --maxWorkers=1"

class TestMapTodoKeysForBackend(TestCase):
    """docstring for class"""
    def test_map_todo_keys_for_backend_one(self):
        """docstring for test function"""
        todo_input = {
            'id': 1,
            'task': 'Test task',
            'statusComplete': False
        }
        expected_backend_todo = {
            'id': 1,
            'sorted_rank': -1,
            'task': 'Test task',
            'status_complete': False
        }
        self.assertEqual(map_todo_keys_for_backend(todo_input), expected_backend_todo)

    def test_map_todo_keys_for_backend_two(self):
        """docstring for test function"""
        todo_input = {
            'id': 2,
            'task': 'Test task 2',
            'statusComplete': True
        }
        expected_backend_todo = {
            'id': 2,
            'sorted_rank': -1,
            'task': 'Test task 2',
            'status_complete': False  # <-- expected value is True
        }
        self.assertNotEqual(map_todo_keys_for_backend(todo_input), expected_backend_todo)
