"""Equations package initializer."""
import flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = flask.Flask(__name__)  # pylint: disable=invalid-name
socketio = SocketIO(app, ping_timeout=12, ping_interval=1)

# Read settings from config module (equations/config.py)
app.config.from_object('equations.config')

# Overlay settings read from file specified by environment variable. This is
# useful for using different on development and production machines.
# Reference: http://flask.pocoo.org/docs/config/
app.config.from_envvar('EQ_SETTINGS', silent=True)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

import equations.views  # noqa: E402  pylint: disable=wrong-import-position
import equations.models  # noqa: E402  pylint: disable=wrong-import-position
import equations.networking  # noqa: E402  pylint: disable=wrong-import-position
