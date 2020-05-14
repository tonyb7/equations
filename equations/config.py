"""Equations development configuration."""

import os

# Root of this application, useful if it doesn't occupy an entire domain
APPLICATION_ROOT = '/'

# Secret key for encrypting cookies
PART1 = b'\xceSY\xf6#\x10:\xef\xd3\x84I\xa707k'
PART2 = b'\x7f\xe1\x9c\x9d\xf7\xd3\xb2\\$'
SECRET_KEY = PART1 + PART2  # split into 2 parts to pass style tests
SESSION_COOKIE_NAME = 'login'

# File Upload to var/uploads/
# UPLOAD_FOLDER = os.path.join(
#     os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
#     'var', 'uploads'
# )
# ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
# MAX_CONTENT_LENGTH = 16 * 1024 * 1024

# Database file is var/equations.sqlite3
DATABASE_FILENAME = os.path.join(
    os.path.dirname(os.path.dirname(os.path.realpath(__file__))),
    'var', 'equations.sqlite3'
)

#BASE_URL = "http://localhost:8000"
BASE_URL = "https://equations-online.herokuapp.com/"
