"""Server side networking module."""

import flask
import equations
from equations.data import rooms_info, user_info, socket_info, MapsLock
from equations.data import get_name_and_room, get_current_mover
from flask_socketio import join_room, leave_room, emit
import time
import random


@equations.socketio.on('new_message')
def receive_message(message_info):
    """Receive a chat message from client."""
    name = message_info['name']
    message = message_info['message']
    print(f"{name} send the message: {message}")

    [stored_name, room] = get_name_and_room(flask.request.sid)
    assert name == stored_name

    # Send the message to everyone in the room
    emit('message', message_info, room=room)

@equations.socketio.on('start_game')
def handle_start_game():
    """Player pressed start_game."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed start_game for room {room}!")

    if room not in rooms_info or rooms_info[room]['game_started']:
        print("Game start rejected")
        return

    current_players = rooms_info[room]['players']

    if len(current_players) < 2:
        emit('server_message', "You can only start a game with 2 or 3 players.", room=room)
        return
    
    assert name in current_players
    assert len(current_players) <= 3
    assert not rooms_info[room]['game_started']

    random.seed(time.time())
    rolled_cubes = [random.randint(0, 5) for _ in range(24)]

    rooms_info[room] = {
        "game_started": True,
        "game_finished": False,
        "players": current_players,
        "spectators": rooms_info[room]["spectators"],
        "sockets": rooms_info[room]["sockets"],
        "p1scores": [],
        "p2scores": [],
        "p3scores": [],
        "starttime": time.time(),
        "cube_index": rolled_cubes[:],  # fixed length of 24, index is cube's id
        "resources": rolled_cubes,  # fixed length of 24
        "goal": [],  # stores cube ids (based on cube_index); same for 3 below
        "required": [],
        "permitted": [],
        "forbidden": [],
        "turn": random.randint(0, len(current_players) - 1),
        "touched_cube": None,
        "goalset": False,
        "num_timer_flips": 0,
        "10s_warning_called": False,
    }

    game_begin_instructions = {
        'cubes': rolled_cubes,
        'players': current_players,
        'firstmove': rooms_info[room]['turn'],
    }

    emit("begin_game", game_begin_instructions, room=room)

    start_instruction = f"{name} started the game! The cubes have been rolled! \
        {get_current_mover(room)} is chosen to be the goal setter. \
            Move cubes by clicking a cube in resources, \
                then clicking the area on the mat you want to move it to. \
                    If you touch a cube you must move it! \
                    Press \"Goal Set!\" when you're done!"
    emit("server_message", start_instruction, room=room)

@equations.socketio.on('flip_timer')
def handle_flip_timer():
    """Player pressed flip_timer."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed flip_timer!")

@equations.socketio.on('claim_warning')
def handle_claim_warning():
    """Player pressed claim_warning."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed claim_warning!")

@equations.socketio.on('claim_minus_one')
def handle_claim_minus_one():
    """Player pressed claim_minus_one."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed claim_minus_one!")

@equations.socketio.on('a_flub')
def handle_a_flub():
    """Player pressed a_flub."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed a_flub!")

@equations.socketio.on('p_flub')
def handle_p_flub():
    """Player pressed p_flub."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed p_flub!")

@equations.socketio.on('force_out')
def handle_force_out():
    """Player pressed force_out."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed force_out!")

@equations.socketio.on("cube_clicked")
def handle_cube_click(pos):
    """Highlight cube if it's clicker's turn and clicker hasn't clicked yet."""
    [user, room] = get_name_and_room(flask.request.sid)

    # TODO: state later for goal setting, bonus moves, etc

    # Reject if a cube has already been clicked. You touch it you move it!
    if rooms_info[room]['touched_cube'] is not None:
        return

    if rooms_info[room]["resources"][pos] == -1:  # magic bad
        return

    turn_idx = rooms_info[room]['turn']
    turn_user = rooms_info[room]['players'][turn_idx]

    if turn_user == user:
        if not rooms_info[room]["goalset"] and len(rooms_info[room]["goal"]) >= 6:
            emit("server_message", "Max number of cubes on goal set! Please press \"Goal Set!\"", room=room)
            return
        else:
            rooms_info[room]['touched_cube'] = pos
            emit("highlight_cube", pos, room=room)

def move_cube(room, sectorid):
    """Update data structures and generate message to send to client upon moving a cube."""
    [sector_str, _] = sectorid.split('-')

    touched_cube_idx = rooms_info[room]['touched_cube']
    assert touched_cube_idx is not None
    rooms_info[room][sector_str].append(touched_cube_idx)
    rooms_info[room]['touched_cube'] = None
    rooms_info[room]["resources"][touched_cube_idx] = -1  # magic bad

    move_command = {
        "from": touched_cube_idx,
        "to": sectorid,
    }
    return move_command

def next_turn(room):
    """Move to next turn in a room."""
    next_turn_idx = (rooms_info[room]["turn"] + 1) % \
        len(rooms_info[room]["players"])
    rooms_info[room]["turn"] = next_turn_idx

    # TODO timer logic
    # TODO ability to challenge

    return rooms_info[room]["players"][next_turn_idx]

@equations.socketio.on("sector_clicked")
def handle_sector_click(sectorid):
    """Receive a click action on a playable area of the board."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} clicked {sectorid} in room {room}")

    if name != get_current_mover(room):
        print(f"Not {name}'s turn. Do nothing.")
        return

    if not rooms_info[room]["goalset"]:
        if sectorid != "goal-sector":
            print(f"Goalsetter clicked on a non-goal area.")
            return
    elif sectorid == "goal-sector":
        print(f"Someone clicked on goal area but goal is already set")
        return

    emit("move_cube", move_cube(room, sectorid), room=room)
    
    if rooms_info[room]["goalset"]:
        emit("next_turn", next_turn(room), room=room)

@equations.socketio.on("set_goal")
def handle_set_goal():
    """Handle goal set."""
    [name, room] = get_name_and_room(flask.request.sid)
    assert name == get_current_mover(room)
    rooms_info[room]["goalset"] = True

    emit("next_turn", next_turn(room), room=room)
    
