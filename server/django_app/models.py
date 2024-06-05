# pylint: disable=line-too-long

# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.

"""
docstring for module
This module implements the Todos model for the To Do List app
"""

from typing import Dict
from django.db import models, transaction, IntegrityError
from django.utils import timezone

# ----------

# To Do data structure typing
ToDoType = Dict[str, int | str | bool]

# ----------

class Todos(models.Model):
    """docstring for class"""
    sorted_rank = models.IntegerField()  # type: ignore
    created_at = models.DateTimeField(auto_now_add=True)  # type: ignore  # replaced 'blank=True, null=True' w/ default timestamp using Django's 'auto_now_add=True'
    task = models.CharField(max_length=50)  # type: ignore
    status_complete = models.BooleanField(default=False)  # type: ignore

    objects = models.Manager()  # including this to avoid 'no-member' pylint error in Django (noting that this is unnecessary as Django automatically adds an objects attribute to every model, an instance of django.db.models.Manager)

    # pylint: disable=too-few-public-methods
    class Meta:
        """docstring for class"""
        db_table = 'todos'  # specify the exact table name used in PostgreSQL DB

    def __str__(self) -> str:
        """docstring for function - displays task name in Django Admin Panel for improved readability"""
        return f'{self.task}'

    @classmethod
    def seed_db(cls):  # seed database w/ sample data
        """docstring for function - seeding DB transaction"""
        try:
            # Start DB transaction using Django's transaction.atomic() context manager
            with transaction.atomic():
                # Note: Use bulk_create() for large data sets
                for i in range(6, 0, -1):
                    if i == 5:
                        cls.objects.create(sorted_rank=i, task=f'Sample Task {i}', status_complete=True)
                    else:
                        cls.objects.create(sorted_rank=i, task=f'Sample Task {i}', status_complete=False)
        except IntegrityError as e:
            # Note:  Transaction roll back in case of error handled automatically / implicitly above by Django
            raise IntegrityError('An error occurred, rolling back transaction: ' + str(e)) from e

    @classmethod
    def update_sorted_rank(cls, sorted_todos_array: list[ToDoType]):  # update sorted_rank key fields w/in DB based on latest DnD positioning
        """docstring for function - DB transaction"""
        try:
            # Start DB transaction using Django's transaction.atomic() context manager
            with transaction.atomic():
                for todo in sorted_todos_array:
                    if todo['id'] != -1:  # check if 'id' key on todo object represents newly added task (-1) that needs to be auto-assigned by PostgreSQL
                        obj = cls.objects.get(id=todo['id'])
                    else:  # if 'id' key in todo object = -1, add new task to DB (changing / auto-incrementing 'id' field in PostgreSQL)
                        obj = cls.objects.get(task=todo['task'], status_complete=todo['statusComplete'])  # Note: assuming this 2 field combo is unique
                    obj.sorted_rank = todo['newSortedRank']  # update sorted_rank key field w/in pre-existing DB row
                    # Make the existing datetime timezone-aware (avoids following CLI error: 'RuntimeWarning: DateTimeField Todos.created_at received a naive datetime (2024-05-29 06:04:16.935156) while time zone support is active.')
                    aware_datetime = timezone.make_aware(obj.created_at, timezone=timezone.get_default_timezone())
                    obj.created_at = aware_datetime  # Set created_at to the timezone-aware datetime
                    obj.save()
        except IntegrityError as e:
            # Note:  Transaction roll back in case of error handled automatically / implicitly above by Django
            raise IntegrityError('An error occurred, rolling back transaction: ' + str(e)) from e

# ----------

# Note: .env file has connection string for PostgreSQL DB

# ------------

# INITIAL SETUP OF POSTGRESQL DB:

# CREATE DATABASE todos;

# CREATE TABLE todos
# (
#     id SERIAL PRIMARY KEY,
#     sorted_rank INTEGER NOT NULL,
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
#     task VARCHAR NOT NULL,
#     status_complete BOOLEAN NOT NULL
# )
# ;
# DELETE FROM todos;
# DROP TABLE todos;

# SELECT * FROM todos;

# INSERT INTO todos
# (
#     sorted_rank
#     task,
#     status_complete
# )
# VALUES(6, 'Sample Task 6', false)
# RETURNING *;

# SEED DATABASE WITH SAMPLE DATA
# Todos.seed_db()  # Call the class method to seed DB w/ sample data (Note: need to invoke this from a different file, 'django_app/views.py' to avoid error)
