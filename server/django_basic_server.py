"""
docstring for module
Includes various Django server setup + configuration details
"""

import os

# ----------

# pylint: disable=line-too-long

# npm run CLIENT ---------> "client": "sleep 1 && vite",  ..... RUN Vite client app w/ 1 second delay to allow Python server to load first (used w/ 'npm-run-all')
# npm run SERVER ---------> "server": "python3 server/manage.py runserver $npm_package_config_proxy_server_port",
# npm run DEV ------------> "dev": "PYTHON_ENV=development npm-run-all -p -r server client",  .....  INITIAL COMMAND WAS AS FOLLOWS, but needed to revise / add in 'npm-run-all' since Vite client app loaded faster than Python server, omitting data onload --> "PYTHON_ENV=development vite & PYTHON_ENV=development npm run server", (see separate client script w/ delay in seconds & server script)
# npm run BUILD ----------> "tsc && vite build && npm run collectstatic && npm run updatehtmltemplate",  ..... RUN Typescript compiler, then Vite client app build, then collectstatic command (described below), and finally updatehtmltemplate command (described below)
# npm run COLLECTSTATIC --> "collectstatic": "find server/staticfiles -maxdepth 1 -type f \\( -name '*.js' -o -name '*.css' \\) -delete && python3 server/manage.py collectstatic --noinput",  ..... First delete all .js and .css files in server/staticfiles folder, then run Django's 'collectstatic' command to generate (or refresh) contents in the server/staticfiles folder, sourced from the Vite client app's new bundled build sent to dist/assets folder
# npm run PREVIEW --------> "preview": "PYTHON_ENV=production npm run server",
# npm run UPDATEHTMLTEMPLATE --> "updatehtmltemplate": "python3 server/updatehtmltemplate.py",  ..... custom script to auto-update the server/templates/index.html file with the latest, post-build .js and .css dynamically generated file names (injecting these into the static templating to avoid errors in the browser)
# npm run ESLINT ---------> "eslint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",  ..... static code analysis tool / linter for Typescript (client side in this case)
# npm run PYLINT ---------> "cd server && pylint **/*.py",   ..... static code analysis tool / linter for Python
# npm run MYPY -----------> "mypy": "cd server && mypy .",   ..... static type checker for Python
# npm run LINTING-TYPING -> "linting-typing": "npm-run-all -p eslint pylint mypy",  ..... RUN ALL 3 LINTING & TYPING SCRIPTS IN PARALLEL (ESLint, Pylint, Mypy)
# npm run TEST -----------> "test": "jest --verbose --coverage --watchAll=false --maxWorkers=1"

# "proxy": "http://localhost:3000" (set in package.json config & vite.config.js)
# HRM for Vite frontend & Django server's built-in auto-refresh for Python backend

# ----------

# DJANGO SERVER SETUP

# Install Django
# cd to /server folder
# pip3 install django
# django-admin startproject <PROJECT_NAME> .  (e.g. 'django-admin startproject django_server') -- (Note:  don't forget the '.' at end to avoid an extra unneeded folder)
# python3 manage.py startapp <APP_NAME>  (e.g. 'python3 manage.py startapp django_app')

# Run Django server (CLI)
# python3 server/manage.py runserver [3000]

# Django REST Framework (DRF) - https://www.django-rest-framework.org/
# Django REST framework provides a set of tools for building Web APIs (e.g., serializers, views, viewsets, authentication, permissions, throttling, pagination, etc.)
# pip3 install djangorestframework
# Add 'rest_framework' to INSTALLED_APPS in settings.py
# Optional:  Add path('api-auth/', include('rest_framework.urls')) to server/django_server/urls.py to enable to enable built-in login and logout views provided by Django REST framework
# Note:  DRF provides a built-in Postman-like Browsable API allowing interaction with the API via web browser (e.g., GET, POST, PUT, PATCH, DELETE) --> http://localhost:3000/deleteAllCompletedTodos

# Access DB via Django shell (CLI) - manually modify DB (similar to psql)
# python3 server/manage.py shell
# from django_app.models import Todos
# Todos.objects.all()  (view all todos)
# Todos.objects.create(task='Learn Django', status_complete=False, sorted_rank=-1)  (create a new todo)  <---  'sorted_rank' is set to -1 as a placeholder to avoid error
# Todos.objects.all().delete()  (delete all todos)

# Run DB migration (manual via CLI, not automated in this project)
# python3 server/manage.py makemigrations
# python3 server/manage.py migrate
# Note:  If table already exists, may need to DROP table & then recreate it by running above migrate command (may need to copy table contents temporarily to another table to store during transition)

# Django Admin Panel (useful GUI for DB interaction when running server)
# python3 server/manage.py createsuperuser
# python3 server/manage.py runserver [3000]
# http://localhost:3000/admin/ <--- Access Django Admin Panel (login w/ below superuser credentials)
# USER: sarahkhuwaja
# PASS: superdjango
# Note:  This provides a GUI to view and modify the DB (can add / edit / delete / view todos here)

# Django Debug Toolbar (GUI for debugging in dev mode)
# pip3 install django-debug-toolbar
# Add 'debug_toolbar' to INSTALLED_APPS in settings.py
# Add 'DebugToolbarMiddleware' to MIDDLEWARE in settings.py
# Add 'INTERNAL_IPS' to settings.py
# Add path('__debug__/', include('debug_toolbar.urls')) to server/django_server/urls.py
# To view:  See vertical tab on right side of browser window (http://localhost:3000), displayed in dev mode only

# ----------

# TYPE CHECKING & LINTING

# Install mypy for Python type checking in venv
# pip3 install mypy
# mypy 'server/django_app/views.py' ---> (equiv of 'tsc' for Typescript files)
# mypy . ---> FOR ALL .py FILES

# Install pylint for Python linting in venv
# pip3 install pylint
# pylint server/django_app/views.py ---> (equiv of 'npm run eslint')
# pylint **/*.py ---> FOR ALL .py FILES (including nested directories)

# ----------

# CREATE PYTHON VIRTUAL ENVIROMENT

# python3 -m venv /Users/sarahkhuwaja/brett/Full-stack-todo-app-python/venv  (CREATE VIRTUAL ENVIRONMENT)
# source /Users/sarahkhuwaja/brett/Full-stack-todo-app-python/venv/bin/activate  (ACTIVATE VIRTUAL ENVIRONMENT to use or install packages)
# python3 -m pip install psycopg2-binary  (once ACTIVATED & in venv, can then install packages)
# deactivate  (DEACTIVATE VIRTUAL ENVIRONMENT once finished work)

# Note: need to locally install all packages in venv (including pylint, mypy) to avoid false flag errors when running linting-typing checks
# python3 -m pip install pylint
# python3 -m pip install mypy

# ----------

# Note:  SEE views.py for key Django server logic

def initiate_django_server() -> None:
    """docstring for function"""

    host = 'localhost'  # '127.0.0.1' used in place of 'localhost' for IPv4 equivalent in vite.config.ts
    vite_app_server_port = os.getenv('npm_package_config_vite_app_server_port') or 8080  # defaults to 8080, if falsy
    proxy_server_port = os.getenv('npm_package_config_proxy_server_port') or 3000  # defaults to 3000, if falsy
    env = os.getenv('PYTHON_ENV')

    # production mode
    if env == 'production':
        print(f"DEPLOYED, RUNNING IN PRODUCTION MODE ON port {proxy_server_port} at 'http://{host}:{proxy_server_port}/' ...")
    # dev mode
    if env == 'development':
        print(f'PYTHON DJANGO SERVER RUNNING IN DEV MODE ON port {proxy_server_port} & APP ON port {vite_app_server_port} at http://{host}:{vite_app_server_port}/ ... ')
    # server-only mode
    if env not in ['development', 'production']:
        print(f'PYTHON DJANGO SERVER RUNNING ON port {proxy_server_port} at http://{host}:{proxy_server_port}/ ... ')
