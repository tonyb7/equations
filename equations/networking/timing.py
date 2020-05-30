"""Functions to handle time control."""

import flask
import equations
from equations.data import get_name_and_room, MapsLock, rooms_info
from equations.networking.challenge import handle_force_out, clean_up_finished_room
from flask_socketio import emit

@equations.socketio.on("five_minute_warning")
def handle_five_minute_warning():
    """Thirty minute mark has been reached."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    if not rooms_info[room]["five_minute_warning_called"]:
        rooms_info[room]["five_minute_warning_called"] = True
        emit("five_minute_warning_message", room=room)
    if not rooms_info[room]["shake_ongoing"]:
        clean_up_finished_room(room)

@equations.socketio.on("game_time_up")
def handle_game_time_up():
    """Thirty five minute mark has been reached."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    if not rooms_info[room]["time_up"]:
        rooms_info[room]["time_up"] = True
        if rooms_info[room]["shake_ongoing"] and rooms_info[room]["endgame"] is None:
            handle_force_out(room)

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
