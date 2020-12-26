"""Module to handle what the goal line looks like."""

import flask
import equations
from equations.data import rooms_info, get_name_and_room, MapsLock
from flask_socketio import emit

@equations.socketio.on("xy_pos_update")
def update_cube_xypos(info):
    """Update a goalline cube's x & y position."""
    MapsLock()
    [_, room] = get_name_and_room(flask.request.sid)

    i = info['order']
    new_x_pos = info['x_pos_per_mille']
    new_y_pos = info['y_pos_per_mille']
    
    rooms_info[room]["goal"][i]["x"] = new_x_pos
    rooms_info[room]["goal"][i]["y"] = new_y_pos

    update_msg = {
        "type": "xy_pos", 
        "order": i,
        "new_val": [new_x_pos, new_y_pos],
    }
    emit("update_goalline", update_msg, room=room, include_self=False)

@equations.socketio.on("orientation_update")
def update_cube_orientation(info):
    """Update a goalline cube's orientation."""
    MapsLock()
    [_, room] = get_name_and_room(flask.request.sid)

    i = info['order']
    new_orientation = info['orientation']

    rooms_info[room]["goal"][i]["orientation"] = new_orientation

    update_msg = {
        "type": "orientation", 
        "order": i,
        "new_val": new_orientation,
    }
    emit("update_goalline", update_msg, room=room, include_self=False)

