"""Functions to handle time control."""

import datetime
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

    current_time = datetime.datetime.now().timestamp()
    if rooms_info[room]["last_timer_flip"] is None:
        rooms_info[room]["last_timer_flip"] = current_time
    else:
        time_since_flip = current_time - rooms_info[room]["last_timer_flip"]
        if time_since_flip < 5:
            # TODO to prevent cases where multiple players click at the same time
            # Right now, enforce 5 sec cooldown. There may be a better solution.
            emit("server_message", "Please wait at least 5 seconds between timer flips!")
            return

        if time_since_flip > 60:
            rooms_info[room]["last_timer_flip"] = current_time
        else:
            rooms_info[room]["last_timer_flip"] = current_time - (60 - time_since_flip)
    
    info = {
        "last_timer_flip": rooms_info[room]["last_timer_flip"],
        "flipper": name,
    }
    emit("timer_flip", info, room=room)

@equations.socketio.on('claim_warning')
def handle_claim_warning():
    """Player claims a 10 second warning."""

    # TODO for more complicated timer flipping 

    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed claim_warning!")

@equations.socketio.on('claim_minus_one')
def handle_claim_minus_one():
    """Player claims a minus one."""

    # TODO for more complicated timer flipping
    # have a judge sign off on -1?

    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed claim_minus_one!")
