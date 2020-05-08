"""Handle chat messaging."""

import flask
import equations
from equations.data import get_name_and_room, MapsLock
from flask_socketio import emit

@equations.socketio.on('new_message')
def receive_message(message_info):
    """Receive a chat message from client."""
    name = message_info['name']
    message = message_info['message']
    print(f"{name} send the message: {message}")

    MapsLock()
    [stored_name, room] = get_name_and_room(flask.request.sid)
    assert name == stored_name

    # Send the message to everyone in the room
    emit('message', message_info, room=room)
