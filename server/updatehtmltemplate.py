# pylint: disable=line-too-long

"""
docstring for module
This module is a custom script that is called w/ 'npm run build' to auto-update the server/templates/index.html file with the latest, post-build .js and .css dynamically generated file names
If post-build file name changes are NOT reflected in the Django server's index.html template file, the client app will not load properly in the browser...
"""

import os
import glob
import re

# Grab the names of the .js and .css files from the newly transpiled dist/assets directory
js_files = glob.glob('dist/assets/*.js')
css_files = glob.glob('dist/assets/*.css')

# Extract the base names of the files -- below assumes there is ONLY one .js and one .css file in the dist/assets directory (may need to modify logic for multiple of each if app size grows or code splitting is implemented)
JS_FILE_NAME = os.path.basename(js_files[0]) if js_files else ''
CSS_FILE_NAME = os.path.basename(css_files[0]) if css_files else ''

# Open the server/templates/index.html file, read its content & update the .js and .css file names
with open('server/templates/index.html', 'r+', encoding='utf-8') as file:
    content = file.read()

    # Replace the old .js and .css file names with the new ones pulled from the freshly updated, post-Vite client app build files placed in the dist/assets directory
    content = re.sub(r"{% static 'index-.*\.js' %}", "{% static '" + JS_FILE_NAME + "' %}", content)
    content = re.sub(r"{% static 'index-.*\.css' %}", "{% static '" + CSS_FILE_NAME + "' %}", content)

    # Write the updated content back to the file
    file.seek(0)
    file.write(content)
    file.truncate()
