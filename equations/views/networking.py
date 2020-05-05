"""Server side networking module."""

import flask
import equations
from flask_socketio import join_room, leave_room, emit
import time
import random

# Map room nonce to game info
rooms_info = {}
# Map username to latest socketid, and room
user_info = {}
# Map socketid to username
socket_info = {}


def can_join_room(room, name):
    """Returns whether another player can join/create the room."""
    # Handle case where user is already in a match
    if name in user_info:
        if user_info[name]['room'] == room:
            return True
        else:
            return False

    # A user can create a new room
    if room not in rooms_info:
        return True

    # A user cannot join an existing room that is full.
    if rooms_info[room]['game_started'] \
            or len(rooms_info[room]['players']) >= 3:
        return False

    return True

def get_name_and_room(socketid):
    """Get the username and room associated with a socketid."""
    assert socketid in socket_info
    name = socket_info[socketid]

    assert name in user_info
    room = user_info[name]['room']

    return [name, room]

@equations.socketio.on('connect')
def on_connect():
    """Handle request to connect to server."""
    print(f"Client {flask.request.sid} connected!")

@equations.socketio.on('disconnect')
def on_disconnect():
    """Handle disconnect."""
    print(f"Client {flask.request.sid} disconnected!")
    socketid = flask.request.sid

    username = None
    assert socketid in socket_info
    assert socket_info[socketid] in user_info
    username = socket_info[socketid]
    
    room = user_info[username]['room']
    leave_room(room)
    del socket_info[socketid]
    if user_info[username]['latest_socket'] != socketid:
        # User made a new connection to the room, so current socket is outdated
        print(f"Outdated socket {socketid} for user {username} disconnected")
        return

    # TODO what happens if user joins back while below code is executing...? :(
    # TODO spectation not supported so how handle if refresh in middle of game?

    # Actual player is gone
    # User did not create new connection. So user is officially not in a room.
    emit("server_message", f"{username} has left.", room=room)

    rooms_info[room]['players'].remove(username)
    if len(rooms_info[room]['players']) == 0:
        del rooms_info[room]

    del user_info[username]

    print(f"Client {socketid}: {username} left room {room}")

@equations.socketio.on('register_player')
def register_player(player_info):
    """Register a player."""
    socketid = flask.request.sid
    name = player_info['name']
    room = player_info['room']

    print(f"Socket {socketid} associated with {name} wants to join room {room}")
    assert socketid not in socket_info
    socket_info[socketid] = name

    rejoin = False

    if name in user_info:
        print(f"Re-registering {name}")
        rejoin = True

        old_socketid = user_info[name]['latest_socket']
        if old_socketid in socket_info:
            assert socket_info[old_socketid] == name
        else:
            print(f"Old socket id for socket {old_socketid}, \
                user {name} disconnected already")

        assert user_info[name]['room'] == room
        user_info[name]['latest_socket'] = socketid

    else:
        user_info[name] = {
            'latest_socket': socketid,
            'room': room
        }

    # Save room nonce -> room info mapping
    if room not in rooms_info:
        assert not rejoin
        rooms_info[room] = {
            "game_started": False,
            "players": [name]
        }
    else:
        if not rejoin:
            rooms_info[room]['players'].append(name)

    join_room(room)

    if rejoin and rooms_info[room]['game_started']:
        # Send current game state to just-rejoined player so he/she is up to date
        emit("render_game_state", rooms_info[room])

    rejoin_str = "rejoined" if rejoin else "joined"
    print(f"Client {socketid}: Player {name} {rejoin_str} room {room}")
    emit("server_message", f"{name} has {rejoin_str}.", room=room)

    message = "Players in this room: "
    names_message = ", ".join(rooms_info[room]['players'])
    emit("server_message", message + names_message, room=room)

@equations.socketio.on('new_message')
def receive_message(message_info):
    """Receive a chat message from client."""
    name = message_info['name']
    message = message_info['message']
    print(f"{name} send the message: {message}")

    assert name == socket_info[flask.request.sid]

    # Send the message to everyone in the room
    emit('message', message_info, room=user_info[name]['room'])

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
    emit("server_message", f"{name} started the game! The cubes have been rolled!", room=room)

    rooms_info[room] = {
        "game_started": True,
        "players": current_players,
        "starttime": time.time(),
        "cube_index": rolled_cubes,  # fixed length of 24, index is cube's id
        "resources": rolled_cubes,  # fixed length of 24
        "goal": [],  # stores cube ids (based on cube_index); same for 3 below
        "required": [],
        "permitted": [],
        "forbidden": [],
        "turn": random.randint(0, len(current_players) - 1),
        "touched_cube": False,
        "state": "goalset",  # enum?
        "num_timer_flips": 0,
        "10s_warning_called": False,
    }

    game_begin_instructions = {
        'cubes': rolled_cubes,
        'players': current_players,
        'firstmove': rooms_info[room]['turn'],
    }

    emit("begin_game", game_begin_instructions, room=room)

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
    socketid = flask.request.sid
    user = socket_info[socketid]
    room = user_info[user]['room']

    # TODO: state later for goal setting, bonus moves, etc
    if rooms_info[room]['touched_cube']:
        return

    turn_idx = rooms_info[room]['turn']
    turn_user = rooms_info[room]['players'][turn_idx]

    if turn_user == user:
        rooms_info[room]['touched_cube'] = True
        emit("highlight_cube", pos, room=room)

@equations.socketio.on("sector_clicked")
def handle_sector_click(sectorid):
    """Receive a click action on a playable area of the board."""
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} clicked {sectorid} in room {room}")
