"""Equations development configuration."""

import os

# Root of this application, useful if it doesn't occupy an entire domain
APPLICATION_ROOT = '/'

# Secret key for encrypting cookies
SECRET_KEY = os.environb[b'SECRET_KEY']
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

SQLALCHEMY_DATABASE_URI = os.environ['DATABASE_URL']

#BASE_URL = "http://localhost:8000"
BASE_URL = "https://equations-online.herokuapp.com/"
