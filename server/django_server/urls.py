# pylint: disable=line-too-long

"""
URL configuration for django_server project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django_app.views import root_path, serve_production_file

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('django_app.urls')),  # root path -- include the Django app's URLs
    path('api/', include('django_app.urls')), # this covers all of the /api/ routes
    path('__debug__/', include('debug_toolbar.urls')), # need to add this line once django-debug-toolbar is installed
]

# ---------

# Production ONLY: Added the following to serve static files in production using 'serve_production_file' view
# By default Django does NOT handle static files in production (i.e. when DEBUG = False), adding this to override & serve static files in production
# This pulls in dynamic file names as new builds are generated & file names are dynamically modified w/in the dist/assets folder.  This occurs after running the 'python3 server/manage.py collectstatic' script to generate or refresh the server/staticfiles folder
# Note:  Ignoring types below to avoid following mypy error --> 'django_server/urls.py:37: error: List item 0 has incompatible type "URLPattern"; expected "URLResolver" [list-item]'
if not settings.DEBUG:
    urlpatterns += [
        # index_js
        re_path(r'static/(?P<filename>.*\.js)$', serve_production_file), # type: ignore
        # index_css
        re_path(r'static/(?P<filename>.*\.css)$', serve_production_file), # type: ignore
        # 2 .jpg images
        re_path(r'^assets/(?P<filename>.*\.jpg)$', serve_production_file), # type: ignore
    ]

# Add the catch-all route, AFTER the static file routes (dev/production), re-directed to root path
urlpatterns += [
    re_path('.*', root_path),  # type: ignore
]
