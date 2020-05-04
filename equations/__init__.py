"""Equations package initializer."""
import flask
from flask_socketio import SocketIO

app = flask.Flask(__name__)  # pylint: disable=invalid-name
socketio = SocketIO(app, ping_timeout=3, ping_interval=1)

# Read settings from config module (equations/config.py)
app.config.from_object('equations.config')

# Overlay settings read from file specified by environment variable. This is
# useful for using different on development and production machines.
# Reference: http://flask.pocoo.org/docs/config/
app.config.from_envvar('EQ_SETTINGS', silent=True)

import equations.views  # noqa: E402  pylint: disable=wrong-import-position
import equations.model  # noqa: E402  pylint: disable=wrong-import-position
