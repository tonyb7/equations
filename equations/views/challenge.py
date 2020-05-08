"""Functions to handle challenges."""

import flask
import equations
from equations.data import get_name_and_room, MapsLock


@equations.socketio.on('a_flub')
def handle_a_flub():
    """Player pressed a_flub."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed a_flub!")

@equations.socketio.on('p_flub')
def handle_p_flub():
    """Player pressed p_flub."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed p_flub!")

@equations.socketio.on('force_out')
def handle_force_out():
    """Player pressed force_out."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed force_out!")
