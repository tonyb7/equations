"""Equations package initializer."""
import flask
from flask_socketio import SocketIO
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.middleware.proxy_fix import ProxyFix

app = flask.Flask(__name__)  # pylint: disable=invalid-name
socketio = SocketIO(app, ping_timeout=12, ping_interval=1)
# Heroku terminates TLS before forwarding HTTP to the dyno. Wrap the socket
# middleware too, so its same-origin check sees the original HTTPS scheme.
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=0, x_proto=1, x_host=0, x_port=0, x_prefix=0)

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
