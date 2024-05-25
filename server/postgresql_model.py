"""
docstring for module
This module implements a Database class that connects to a PostgreSQL database and executes queries
"""

# pylint: disable=line-too-long
import os  # used for .env variables
from typing import Dict, Optional
import psycopg2  # python3 -m pip install psycopg2-binary (must activate venv first) -- https://www.psycopg.org/docs/install.html
from dotenv import load_dotenv  # used to import in .env variables -- python3 -m pip install python-dotenv

# ----------

load_dotenv()  # grab environment variables from .env file
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
db_name = os.getenv('DB_NAME')

db_config = {
    'user': db_user,
    'password': db_password,
    'host': db_host,
    'port': db_port,
    'database': db_name
}

# ----------

# To Do data structure typing
ToDoType = Dict[str, int | str | bool]

# ----------

class Database:
    """
    This class implements a Database object that connects to a PostgreSQL database and executes queries
    """
    def __init__(self, config):
        """docstring for function"""
        self.conn = psycopg2.connect(  # Connect to Postgres database
            user=config['user'],
            password=config['password'],
            host=config['host'],
            port=config['port'],
            database=config['database']
        )

    def seed_db(self):  # seed database w/ sample data
        """docstring for function"""
        try:
            # Start transaction
            cursor = self.conn.cursor()  # Create/open cursor object to perform database operations
            if cursor:
                print('Connected to PostgreSQL DB...')

            for i in range(6, 0, -1):
                if i == 5:
                    cursor.execute(f"INSERT INTO todos (sorted_rank, task, status_complete) VALUES ({i}, 'Sample Task {i}', true) RETURNING *")
                else:
                    cursor.execute(f"INSERT INTO todos (sorted_rank, task, status_complete) VALUES ({i}, 'Sample Task {i}', false) RETURNING *")

            # Commit the transaction
            self.conn.commit()
        except psycopg2.Error as e:
            # Roll back transaction in case of error
            self.conn.rollback()
            print(f"An error occurred: {e}")

    def update_sorted_rank(self, sorted_todos_array: list[ToDoType]):  # update sorted_rank key fields w/in DB based on latest DnD positioning
        """docstring for function - DB transaction"""
        try:
            # Start transaction
            cursor = self.conn.cursor()  # Create/open cursor object to perform database operations
            if cursor:
                print('Connected to PostgreSQL DB...')

            for todo in sorted_todos_array:
                # cursor.execute(f"INSERT INTO todos (sorted_rank, task, status_complete) VALUES ({todo['sortedRank']}, '{todo['task']}', {todo['statusComplete']}) RETURNING *")
                # Update each task's sorted_rank in DB
                query_string = '''
                UPDATE todos
                SET sorted_rank = %s
                WHERE id = %s
                RETURNING *;
                '''
                cursor.execute(query_string, [todo['sortedRank'], todo['id']])

            # Commit the transaction
            self.conn.commit()
        except psycopg2.Error as e:
            # Roll back transaction in case of error
            self.conn.rollback()
            print(f"An error occurred: {e}")

    def execute(self, query_string: str, values: Optional[list] = None):  # Execute query and return results
        """docstring for function"""
        cursor = self.conn.cursor()  # Create/open cursor object to perform database operations
        if cursor:
            print('Connected to PostgreSQL DB...')

        if values is None:  # If no values are passed in (for SELECT only)
            cursor.execute(query_string)
        else:  # If values are passed in (for DELETE / INSERT / UPDATE)
            cursor.execute(query_string, values)  # Execute query
        self.conn.commit()  # Commit changes (for DELETE / INSERT / UPDATE, not necessary for SELECT)
        return cursor.fetchall()  # Retrieve query results

    def close(self):  # Close connection to database
        """docstring for function"""
        self.conn.close()
        print('Shutting down PostgreSQL DB connection...')

# Create instance of Database class, passing in .env variables -- import this into basic_server.py
db = Database(db_config)

# ----------

# TO RUN THIS FILE IN CLI --> python3 server/postgresql_model.py
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
# db.seed_db()

# ------------
