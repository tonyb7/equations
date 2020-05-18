"""Functions to handle time control."""

import flask
import equations
from equations.data import get_name_and_room, MapsLock

@equations.socketio.on('flip_timer')
def handle_flip_timer():
    """Player pressed flip_timer."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed flip_timer!")

@equations.socketio.on('claim_warning')
def handle_claim_warning():
    """Player pressed claim_warning."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed claim_warning!")

@equations.socketio.on('claim_minus_one')
def handle_claim_minus_one():
    """Player pressed claim_minus_one."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed claim_minus_one!")
