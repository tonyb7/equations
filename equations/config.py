"""Equations application configuration."""

import os

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))


def normalize_database_url(database_url):
    """Normalize database URLs from common hosting providers."""
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql://", 1)
    return database_url


# Root of this application, useful if it doesn't occupy an entire domain
APPLICATION_ROOT = '/'

# Secret key for encrypting cookies
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-me')
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
    PROJECT_ROOT, 'var', 'equations.sqlite3'
)

SQLALCHEMY_DATABASE_URI = normalize_database_url(
    os.environ.get('DATABASE_URL', f"sqlite:///{DATABASE_FILENAME}")
)
SQLALCHEMY_TRACK_MODIFICATIONS = False

#BASE_URL = "http://localhost:8000"
#BASE_URL = "https://equations-online.herokuapp.com/"
