"""Functions to handle challenges."""

import flask
import equations
from equations.data import get_name_and_room, get_previous_mover, MapsLock, rooms_info
from flask_socketio import emit


challenge_translation = {
    "a_flub": "Challenge Now",
    "p_flub": "Challenge Never",
    "no_goal": "Challenge No Goal",
}

def handle_challenge(socketid, challenge):
    """Handle a challenge."""
    MapsLock()
    [name, room] = get_name_and_room(socketid)
    print(f"{name} pressed {challenge}")

    assert room in rooms_info
    if rooms_info[room]["challenge"] is not None:
        print(f"{name} tried to challenge {challenge} but was too late")
        return

    defender = get_previous_mover(room)
    challenge_message = f"{name} has called {challenge_translation[challenge]}"
    if challenge == "no_goal":
        challenge_message += "!"
    else:
        challenge_message += f" on {defender}!"

    sider = None
    if defender == name:  # TODO minus 1?
        challenge_message += f" But {name} just moved so {name} cannot challenge!"
        emit("server_message", challenge_message, room=room)
        return
    elif challenge != "no_goal" and len(rooms_info[room]['players']) == 3:  # TODO handle no goals
        sider_list = filter(lambda x: x != name and x != defender, rooms_info['players'])
        assert len(sider_list) == 1
        sider = sider_list[0]
        challenge_message += f" {sider} has one minute to side!"

    if challenge == "no_goal":
        if rooms_info[room]["goalset"]:
            no_goal_msg = f"{name} has called Challenge No Goal! But Goal has already been set, so challenge cannot be made!"  # TODO minus one?
            emit("server_message", no_goal_msg, room=room)
            return
        else:
            assert defender is None
    else:
        assert defender is not None
        if not rooms_info[room]["goalset"]:
            emit("server_message", "Goal has not been set yet! You cannot challenge.", room=room)  # TODO handle this
            return

    if challenge == "a_flub":
        cubes_left = len([x for x in rooms_info[room]["resources"] if x != -1])  # TODO magic bad
        if cubes_left < 2:
            emit("server_message", f"{name} called Challenge Now but that is not allowed!", room=room)  # TODO minus 1
            return

    if challenge == "p_flub":
        pass  # TODO Gotta make sure not called after first minute in a force out

    rooms_info[room]["challenge"] = challenge
    emit("server_message", challenge_message, room=room)

    challenge_info = {
        "challenge": challenge,
        "defender": defender,
        "caller": name,
        "sider": sider,
    }
    emit("handle_challenge", challenge_info, room=room)

@equations.socketio.on('a_flub')
def handle_a_flub():
    """Player pressed a_flub."""
    handle_challenge(flask.request.sid, "a_flub")

@equations.socketio.on('p_flub')
def handle_p_flub():
    """Player pressed p_flub."""
    handle_challenge(flask.request.sid, "p_flub")

@equations.socketio.on('no_goal')
def handle_no_goal():
    """Player pressed no_goal."""
    handle_challenge(flask.request.sid, "no_goal")
