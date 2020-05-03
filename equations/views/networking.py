"""Server side networking module."""

import flask
import equations
from flask_socketio import join_room, leave_room

@equations.socketio.on('connect')
def on_connect():
    """Handle request to connect to server."""
    print(f"Client {flask.request.sid} connected!")

@equations.socketio.on('disconnect')
def on_disconnect():
    """Handle disconnect."""
    print(f"Client {flask.request.sid} disconnected!")
    # TODO leave_room()

@equations.socketio.on('register_player')
def register_player(json):
    """Register a player."""
    socketid = flask.request.sid
    name = json['name']
    room = json['room']

    print(f"Client {socketid}: Player {name} wants to join room {room}")

    # TODO: Error checking, save info in dict

    join_room(room)



