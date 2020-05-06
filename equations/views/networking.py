"""Server side networking module."""

import flask
import equations
from flask_socketio import join_room, leave_room, emit
import time
import random

"""
    - Map room_id -> game info
    - See handle_start_game for the specific fields in game info
    - Notably, game info stores player names, spectator names, and socketids
        of all sockets that are connected to it
    - Room_id is unmapped whenever socketid list becomes empty
    - Room_id is mapped when a user creates the room and joins it (these two events
        should happen at the same time. So a mapped room_id should never have an
        empty socketid list)
    - Game info also keeps track of whether a game has started
"""
rooms_info = {}

"""
    - Map username -> queue of (socketid, room), gameroom
    - A user can only be playing in one game at a time, and that game is
        specified by gameroom. Gameroom is set to None if a user is not playing.
    - A user will always be in this map as long as he/she has at least one 
        active socket connection (queue is nonempty)
    - In other words, username will be mapped whenever a user makes his/her
        first connection, regardless of whether that connection is to join a room
        as a spectator or as a player
    - And username will be unmapped when that user has no more live connections
        AND the user is not in a game room anymore
    - Player will continue being in that game room until that game is finished...TODO
"""
user_info = {}

"""
    - On register_player, map socketid -> username, room
    - On disconnect, unmap socketid
"""
socket_info = {}


def can_create_room(name):
    """Ensure that a user is only playing in one match at a time."""
    if name in user_info and user_info[name]["gameroom"] is not None:
        return False
    return True    

def get_name_and_room(socketid):
    """Get the username and room associated with a socketid."""
    assert socketid in socket_info
    name = socket_info[socketid]

    assert name in user_info
    room = user_info[name]['room']

    return [name, room]

def get_current_mover(room):
    """Return who the current mover is in a room."""
    assert room in rooms_info
    assert rooms_info[room]['game_started']
    turn_idx = rooms_info[room]['turn']
    return rooms_info[room]['players'][turn_idx]

@equations.socketio.on('connect')
def on_connect():
    """Handle request to connect to server."""
    print(f"Client {flask.request.sid} connected!")

@equations.socketio.on('register_player')
def register_player(player_info):
    """Register a player."""
    socketid = flask.request.sid
    name = player_info['name']
    room = player_info['room']

    print(f"Socket {socketid} associated with {name} wants to join room {room}")
    assert socketid not in socket_info
    socket_info[socketid] = {
        "name": name,
        "room": room,
    }

    # This if-else block will be responsible for the rooms_info data structure
    # as well asserting the "gameroom" field of users in user_info
    joined_as_player = False
    rejoin = False
    if room not in rooms_info:  # for create room
        # This is a new game room and players can always join as player
        # See Issue #17 on Github
        joined_as_player = True
        if name in user_info:
            # this assertion should be guaranteed by call to
            # can_create_room() from create_game
            assert user_info[name]["gameroom"] is None

        rooms_info[room] = {
            "game_started": False,
            "players": [name],
            "spectators": [],
            "sockets": [socketid]
        }

        print(f"{name} joined room {room} as new player")

    else:  # for join room
        # If the user is a player in this room, he/she will join as player
        # Else, the user will join as spectator if the game has started or if 
        # there are no spots left or if the player is in another match
        # as a player (regardless of whether that match has started or not)
        # Otherwise, the user will join as player
        # See Issue #17 on Github
        if name in rooms_info[room]["players"]:
            # join as existing player
            assert name in user_info
            assert user_info[name]["gameroom"] == room
            joined_as_player = True
            rejoin = True
            print(f"{name} rejoined room {room}")
        elif rooms_info[room]["game_started"] or len(rooms_info[room]["players"]) >= 3 \
                or (name in user_info and user_info[name]["gameroom"] != room):
            # join as spectator
            rooms_info[room]["spectators"].append(name)
            print(f"{name} joined room {room} as spectator")
        else:
            # join as new player
            if name in user_info:
                assert user_info[name]["gameroom"] is None
            rooms_info[room]["players"].append(name)
            joined_as_player = True
            print(f"{name} joined room {room} as new player")

        rooms_info[room]["sockets"].append(socketid)
    
    join_room(room)
    
    if name not in user_info:
        user_info[name] = {
            "gameroom": room if joined_as_player else None
        }
        user_info[name]["rooms"][room] = [socketid]
    else:
        if joined_as_player:
            user_info[name]['gameroom'] = room
        user_info[name]["rooms"][room].append(socketid)
    
    if joined_as_player:
        # Allow players to press start button as appropriate
        emit("register_player_callbacks", room=room)  # TODO 

    if rooms_info[room]['game_started']:
        # Send current game state to just-joined player so he/she is up to date
        # De-register start button callback; register board callbacks if is a player
        emit("render_game_state", rooms_info[room])  # TODO

    rejoin_str = "rejoined" if rejoin else "joined"
    print(f"Client {socketid}: Player {name} {rejoin_str} room {room}")
    emit("server_message", f"{name} has {rejoin_str}.", room=room)

    message = "Players in this room: "
    names_message = ", ".join(rooms_info[room]['players'])
    emit("server_message", message + names_message, room=room)

# TODO Handle if a player leaves before a game is started
@equations.socketio.on('disconnect')
def on_disconnect():
    """Handle disconnect."""
    print(f"Client {flask.request.sid} disconnected!")
    socketid = flask.request.sid

    if socketid not in socket_info:
        print("Socket disconnected before register_player finished")
        # TODO this is bad ^
        return

    username = socket_info[socketid]['name']
    room = socket_info[socketid]['room']
    assert username in user_info

    # Update socket_info
    del socket_info[socketid]

    # Update user_info
    leave_room(room)
    assert room in user_info[username]["rooms"]
    num_socks_in_room_for_user = len(user_info[username]["rooms"][room]) 
    assert num_socks_in_room_for_user > 0
    if num_socks_in_room_for_user == 1:
        
    if user_info[username]["rooms"][room][-1] == socketid and num_socks_in_
    if user_info[username]["rooms"][room][-1] != socketid or num_socks_in_room != 1:
        # happily disconnect an outdated socket
        user_info[username]["rooms"][room].remove(socketid)
    else:
        if num_socks_in_room == 1:
            pass
        else:
            pass

    user_info[username]["rooms"][room].remove(socketid)  # could be not latest socketid...

    rooms_info[room]["sockets"].remove(socketid)
    if len(rooms_info[room]["sockets"]) == 0:
        del rooms_info[room]
        # TODO equations.model.get_db() set to ended

    if user_info[username]['latest_socket'] != socketid:
        # User made a new connection to the room, so current socket is outdated
        print(f"Outdated socket {socketid} for user {username} disconnected")
        return

    # TODO what happens if user joins back while below code is executing...? :(
    # TODO spectation not supported so how handle if refresh in middle of game?

    # Actual player is gone
    # User did not create new connection. So user is officially not in a room.
    emit("server_message", f"{username} has left.", room=room)

    del user_info[username]

    print(f"Client {socketid}: {username} left room {room}")

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

    rooms_info[room] = {
        "game_started": True,
        "players": current_players,
        "num_active": len(current_players),  # TODO add spectators
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
    emit("server_message", f"{name} started the game! The cubes have been rolled!", room=room)
    emit("server_message", f"{get_current_mover(room)} is chosen to be the goal setter. Please set the goal!", room=room)

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
    
