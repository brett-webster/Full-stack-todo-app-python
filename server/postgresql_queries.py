"""
docstring for module
This module implements PostgreSQL queries for the To Do List app
"""
import datetime
import copy
from postgresql_model import db, ToDoType

# ----------

# pylint: disable=line-too-long
# Helper function to SORT ASCENDING todos_array of objects based on 'sorted_rank' key
def sort_asc_by_rank_todos_array(todos_array: list[ToDoType]) -> list[ToDoType]:
    """docstring for function"""
    sorted_todos_array = copy.deepcopy(todos_array)  # create deep copy of todos_array
    sorted_todos_array.sort(key=lambda todo: todo['sortedRank'])  # sort todos_array by 'sorted_rank' key in ascending order
    return sorted_todos_array

# ----------------- POSTGRESQL QUERIES -----------------

# GET/SELECT
# http://localhost:3000/api/allTodos
def select_all_and_assemble_todos_array() -> list[ToDoType]:
    """docstring for function"""
    query_results: list[tuple[int, int, datetime.datetime, str, bool]] = db.execute("SELECT * FROM todos")

    todos_array_full: list[ToDoType] = []
    for row in query_results:
        todos_array_full.append({
            "id": row[0],
            "sortedRank": row[1],  # row[2] is the timestamp (not currently used)
            "task": row[3],
            "statusComplete": row[4]
        })
    return todos_array_full


# POST
# http://localhost:3000/api/addNewTask
def add_new_task(new_task_to_add: ToDoType):
    """docstring for function"""
    # Insert new task into DB
    max_sorted_rank: int = db.execute("SELECT MAX(sorted_rank) FROM todos")[0][0]  # fetch max sorted_rank value from DB (increment by +1 for new task)
    values: list = [max_sorted_rank + 1, new_task_to_add['task'], new_task_to_add['statusComplete']]
    query_string = '''
    INSERT INTO todos
    (
        sorted_rank,
        task,
        status_complete
    )
    VALUES(%s, %s, %s)
    RETURNING *;
    '''
    db.execute(query_string, values)  # add new task to DB, if newTaskToAdd is valid

    # SELECT ALL & return latest, sorted todos_array of objects for display on frontend
    revised_todos_array: list[ToDoType] = select_all_and_assemble_todos_array()
    sorted_todos_array: list[ToDoType] = sort_asc_by_rank_todos_array(revised_todos_array)
    return sorted_todos_array


# PUT - NOT used in this project


# PATCH
# http://localhost:3000/api/updateTodoStatus/4
def update_todo_status(path_sections: list[str]):
    """docstring for function"""
    try:
        id_to_update_status: int | None = int(path_sections[3])
    except ValueError:
        id_to_update_status = None

    # SELECT ALL & return latest, sorted todos_array of objects to be updated before being returned for display on frontend
    todos_array_full: list[ToDoType] = select_all_and_assemble_todos_array()
    sorted_todos_array: list[ToDoType] = sort_asc_by_rank_todos_array(todos_array_full)

    # Update task completed status in DB
    query_string = '''
    UPDATE todos
    SET status_complete = NOT status_complete
    WHERE id = %s
    RETURNING *;
    '''
    db.execute(query_string, [id_to_update_status])  # update/toggle task complete status DB, if taskId is valid

    revised_todos_array = copy.deepcopy(sorted_todos_array)  # create deep copy of todos_array_full
    for todo in revised_todos_array:
        if todo['id'] == id_to_update_status:
            todo['statusComplete'] = not todo['statusComplete']
    return revised_todos_array


# DELETE
# http://localhost:3000/api/deleteTodo/3
def delete_single_todo(path_sections: list[str]):
    """docstring for function"""
    try:
        id_to_delete: int | None = int(path_sections[3])
    except ValueError:
        id_to_delete = None

    # Delete specified task from DB
    query_string = '''
    DELETE FROM todos
    WHERE id = %s
    RETURNING *;
    '''
    db.execute(query_string, [id_to_delete])  # remove task from DB, if taskId is valid

    # SELECT ALL & return latest, sorted todos_array of objects for display on frontend
    revised_todos_array: list[ToDoType] = select_all_and_assemble_todos_array()
    sorted_todos_array: list[ToDoType] = sort_asc_by_rank_todos_array(revised_todos_array)
    return sorted_todos_array

# http://localhost:3000/api/deleteAllCompletedTodos
def delete_all_completed_todos(ids_to_delete: list[int]):
    """docstring for function"""
    values = ', '.join(['%s'] * len(ids_to_delete))  # use '%s' placeholders for each id in ids_to_delete
    query_string = f'''
    DELETE FROM todos
    WHERE id IN ({values})
    RETURNING *;
    '''
    db.execute(query_string, ids_to_delete)  # remove task from DB, if taskId is valid

    # SELECT ALL & return latest, sorted todos_array of objects for display on frontend
    revised_todos_array = select_all_and_assemble_todos_array()
    sorted_todos_array = sort_asc_by_rank_todos_array(revised_todos_array)
    return sorted_todos_array
