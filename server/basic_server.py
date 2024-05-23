"""
docstring for module
This module implements a simple server with various HTTP methods
It includes handlers for GET, POST, PUT, PATCH and DELETE requests
It incorporates auto-reload (watchdog), type checking (mypy) and linting (pylint)
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, ParseResult
import json
from typing import Dict, Any
import os
import mimetypes
import copy

# ----------

# pylint: disable=line-too-long

# npm run CLIENT ---------> "client": "sleep 1 && vite",  ..... RUN Vite client app w/ 1 second delay to allow Python server to load first (used w/ 'npm-run-all')
# npm run SERVER ---------> "server": "watchmedo auto-restart -d . -R -p '*.py' -- python3 server/simple_server_mypy.py",
# npm run DEV ------------> "dev": "PYTHON_ENV=development npm-run-all -p -r server client",  .....  INITIAL COMMAND WAS AS FOLLOWS, but needed to revise / add in 'npm-run-all' since Vite client app loaded faster than Python server, omitting data onload --> "PYTHON_ENV=development vite & PYTHON_ENV=development npm run server", (see separate client script w/ delay in seconds & server script)
# npm run BUILD ----------> "build": "tsc && vite build",
# npm run PREVIEW --------> "preview": "PYTHON_ENV=production npm run server",
# npm run ESLINT ---------> "eslint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",  ..... static code analysis tool / linter for Typescript (client side in this case)
# npm run PYLINT ---------> "pylint": "cd server && pylint *.py",   ..... static code analysis tool / linter for Python
# npm run MYPY -----------> "mypy": "cd server && mypy .",   ..... static type checker for Python
# npm run LINTING-TYPING -> "linting-typing": "npm-run-all -p eslint pylint mypy",  ..... RUN ALL 3 LINTING & TYPING SCRIPTS IN PARALLEL (ESLint, Pylint, Mypy)
# npm run TEST -----------> "test": "jest --verbose --coverage --watchAll=false --maxWorkers=1"

# "proxy": "http://localhost:3000" (set in package.json config & vite.config.js)
# HRM for Vite frontend & server auto-refresh watchdog for Python backend

# ----------

# Run server (CLI)
# python3 server/basic_server.py

# Including Auto-reload for Python server  (Django/Flask servers have this built-in)
# pipx install watchdog ---> (1st brew install pipx ---> pipx is designed to manage Python-based applications in isolated environments, which can help avoid conflicts between packages and their dependencies)
# watchmedo auto-restart -d . -R -p '*.py' -- python3 server/basic_server.py

# Install mypy for Python type checking
# brew install mypy
# mypy 'server/basic_server.py' ---> (equiv of 'tsc' for Typescript files)
# mypy . ---> FOR ALL .py FILES

# Install pylint for Python linting
# brew install pylint
# pylint server/basic_server.py ---> (equiv of 'npm run eslint')
# pylint *.py ---> FOR ALL .py FILES

# ----------

# Sample data
toDosArray: list[dict[str, Any]] = [
  { "id": 1, "task": "Sample Task 1", "statusComplete": False },
  { "id": 2, "task": "Sample Task 2", "statusComplete": False },
  { "id": 3, "task": "Sample Task 3", "statusComplete": False },
  { "id": 4, "task": "Sample Task 4", "statusComplete": False },
  { "id": 5, "task": "Sample Task 5", "statusComplete": True },
  { "id": 6, "task": "Sample Task 6", "statusComplete": False },
]

# To Do data structure typing
ToDoType = Dict[str, int | str | bool]

# ----------

HOST = 'localhost'  # '127.0.0.1' used in place of 'localhost' for IPv4 equivalent in vite.config.ts
vite_app_server_port = os.getenv('npm_package_config_vite_app_server_port') or 8080  # defaults to 8080, if falsy
proxy_server_port = os.getenv('npm_package_config_proxy_server_port') or 3000  # defaults to 3000, if falsy

env = os.getenv('PYTHON_ENV')

# ----------

class RequestHandler(BaseHTTPRequestHandler):
    """SIMPLE SERVER HANDLING ALL KEY HTTP methods"""

    # pylint: disable=invalid-name
    def do_GET(self) -> None:
        """GET method"""

        parsed_path: ParseResult = urlparse(self.path)  # ParseResult(scheme='', netloc='', path='/', params='', query='', fragment='')

        # production mode
        dist_directory = os.path.join(os.path.dirname(__file__), '../dist')
        if env == 'production':
            if parsed_path.path == "/":  # root URL
                file_path = os.path.join(dist_directory, "index.html")
            else:
                file_path = os.path.join(dist_directory, parsed_path.path[1:])  # omit leading '/' on parsed_path.path

            mimetype, _ = mimetypes.guess_type(file_path)
            if mimetype is not None:  # need this conditional so that CRUD paths below on /api are not affected (e.g. /api/allTodos, /api/post, /api/put, /api/patch, /api/delete)
                try:
                    with open(file_path, 'rb') as file:
                        self.send_response(200)
                        self.send_header('Content-type', mimetype)  # required to set the MIME type of the response so everything displays properly (e.g. text/html, text/css, text/javascript, image/jpeg, image/png, image/svg+xml, etc.)
                        self.end_headers()
                        self.wfile.write(file.read())
                except FileNotFoundError:
                    self.send_response(404)
                    self.end_headers()
                    self.wfile.write(b"File not found")

        # development mode
        # URL --> http://localhost:3000/  (root URL is assigned to serve index.html file)
        if env == 'development' and parsed_path.path == "/":
            try:
                with open("index.html", encoding='utf-8') as f:
                    file_to_open: str = f.read()
                self.send_response(200)
            except FileNotFoundError:
                file_to_open = "File not found"
                self.send_response(404)
            self.end_headers()
            self.wfile.write(bytes(file_to_open, 'utf-8'))

        # URL --> http://localhost:3000/api/allTodos
        if parsed_path.path == "/api/allTodos":
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')  # Allows CORS
            self.end_headers()
            self.wfile.write(json.dumps(toDosArray).encode('utf-8'))  # return sample data (stringified/serialized to bytes) to client from server for display


    def do_POST(self) -> None:
        """POST method (body ONLY, no query/path params in URL)"""

        parsed_path: ParseResult = urlparse(self.path)

        # URL --> http://localhost:3000/api/addNewTask
        if parsed_path.path == "/api/addNewTask":
            content_length: int = int(self.headers['Content-Length'])
            body: bytes = self.rfile.read(content_length)
            data: dict[str, ToDoType | list[ToDoType]] = json.loads(body) # convert body data to JSON object (deserialize from bytes & convert to dictionary)

            # Ensure that data['newTaskToAdd'] is a ToDoType
            new_task_to_add: ToDoType = {}
            if 'newTaskToAdd' in data and isinstance(data['newTaskToAdd'], dict):
                new_task_to_add = data['newTaskToAdd']

            # Ensure that data['toDosArrayFull'] is a list of ToDoType
            toDos_array_full: list[ToDoType] = []
            if 'toDosArrayFull' in data and isinstance(data['toDosArrayFull'], list) and all(isinstance(i, dict) for i in data['toDosArrayFull']):
                toDos_array_full = data['toDosArrayFull']

            if not new_task_to_add:  # early exit if no new task object is provided (i.e. is falsy)
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps("No new task provided").encode('utf-8'))
                return
            required_ToDoType_keys = ['id', 'task', 'statusComplete']
            if not all(key in new_task_to_add for key in required_ToDoType_keys) or len(new_task_to_add) != 3:  # early exit if new task object shape is invalid -- i.e. does not contain the matching keys required for ToDoType class
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps("New task object shape mismatch").encode('utf-8'))
                return

            toDos_array_full.append(new_task_to_add)  # add new task object to existing array, if newTaskToAdd is valid
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(toDos_array_full).encode('utf-8'))  # return augmented data body (stringified/serialized to bytes) back to client
            return


    # Note: no PUT required amongst CRUD operations (using PATCH instead)


    def do_PATCH(self) -> None:
        """PATCH method (body + path param in URL)"""
        # Note: no error handling if 'user_id' path param is NOT found in body data...simply returns original body data OR if a collision between newBody user_id & pre-existing body data user_id occurs

        parsed_path: ParseResult = urlparse(self.path)
        path_sections: list[str] = parsed_path.path.split('/')  # localhost:3000/patch/3

        # URL --> http://localhost:3000/api/updateTodoStatus/4  (toggles a single task's completedStatus w/ id of 4)
        if parsed_path.path[:21] == "/api/updateTodoStatus":
            content_length: int = int(self.headers['Content-Length'])
            body: bytes = self.rfile.read(content_length)
            data: dict[str, list[ToDoType]] = json.loads(body) # convert body data to JSON object (deserialize from bytes & convert to dictionary)
            todos_array_full: list[ToDoType] = data['toDosArrayFull'] if 'toDosArrayFull' in data else []

            try:
                id_to_update_status: int | None = int(path_sections[3])
            except ValueError:
                id_to_update_status = None

            revised_todos_array = copy.deepcopy(todos_array_full)  # create deep copy of todos_array_full
            for todo in revised_todos_array:
                if todo['id'] == id_to_update_status:
                    todo['statusComplete'] = not todo['statusComplete']

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(revised_todos_array).encode('utf-8'))  # return augmented data body (stringified/serialized to bytes) back to client


    def do_DELETE(self) -> None:
        """DELETE method (body + path param in URL)"""
        # Note: no error handling if 'user_id' path param is NOT found in body data...simply returns original body data

        parsed_path: ParseResult = urlparse(self.path)
        path_sections: list[str] = parsed_path.path.split('/')  # localhost:3000/delete/2

        content_length: int = int(self.headers['Content-Length'])
        body: bytes = self.rfile.read(content_length)
        data: dict[str, list[ToDoType]] = json.loads(body) # convert body data to JSON object (deserialize from bytes & convert to dictionary)
        todos_array_full: list[ToDoType] = data['toDosArrayFull'] if 'toDosArrayFull' in data else []

        # URL --> http://localhost:3000/api/deleteTodo/3  (delete single task w/ id of 3)
        if parsed_path.path[:15] == "/api/deleteTodo":
            try:
                id_to_delete: int | None = int(path_sections[3])
            except ValueError:
                id_to_delete = None

            revised_todos_array = [todo for todo in todos_array_full if todo['id'] != id_to_delete]

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(revised_todos_array).encode('utf-8'))  # return augmented data body (stringified/serialized to bytes) back to client
            return

        # URL --> http://localhost:3000/api/deleteAllCompletedTodos  (delete ALL tasks w/ statusComplete of True)
        if parsed_path.path == "/api/deleteAllCompletedTodos":
            revised_todos_array = [todo for todo in todos_array_full if todo['statusComplete'] is False]

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(revised_todos_array).encode('utf-8'))  # return augmented data body (stringified/serialized to bytes) back to client
            return

# ----------

# Below try/except block is used to handle KeyboardInterrupt & keep the CLI clean of errors / Traceback messages for bad requests
try:
    http_server = HTTPServer((HOST, int(proxy_server_port)), RequestHandler)

    # production mode
    if env == 'production':
        print(f"DEPLOYED, RUNNING IN PRODUCTION MODE ON port {proxy_server_port} at 'http://localhost:{proxy_server_port}/' ...")
    # dev mode
    if env == 'development':
        print(f'PYTHON SERVER RUNNING IN DEV MODE ON port {proxy_server_port} & APP ON port {vite_app_server_port} at http://localhost:{vite_app_server_port}/ ... ')
    # server-only mode
    if env not in ['development', 'production']:
        print(f'PYTHON SERVER RUNNING ON port {proxy_server_port} at http://localhost:{proxy_server_port}/ ... ')

    http_server.serve_forever()

except KeyboardInterrupt:
    print("\nShutting down server...")
    http_server.server_close()
