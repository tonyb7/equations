"""Server side networking module."""

import flask
import equations

@equations.socketio.on('connect')
def on_connect():
    """Handle request to connect to server."""
    print(f"Client {flask.request.sid} connected!")

@equations.socketio.on('register_player')
def register_player(json):
    """Register a player."""
    print(f"Player {json['name']} wants to join room {json['room']}")

