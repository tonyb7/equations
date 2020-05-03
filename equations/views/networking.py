"""Server side networking module."""

import flask
import equations
from flask_socketio import join_room, leave_room, emit

# Map room nonce to: game_started, num_players, socketids
rooms_info = {}
# Map socketid to room nonce and name
socket_info = {}

def can_join_room(room):
    """Returns whether another player can join the room."""
    if room not in rooms_info:
        return True
    if rooms_info[room]['game_started'] or rooms_info[room]['num_players'] >= 3:
        return False
    return True

@equations.socketio.on('connect')
def on_connect():
    """Handle request to connect to server."""
    print(f"Client {flask.request.sid} connected!")

@equations.socketio.on('disconnect')
def on_disconnect():
    """Handle disconnect."""
    print(f"Client {flask.request.sid} disconnected!")
    socketid = flask.request.sid
    room = None
    if socketid in socket_info:
        room = socket_info[socketid]['room']
    else:
        print(f"Client {socketid} didn't have a room!?")
        return
    
    leave_room(room)
    emit("server_message", f"Player {socket_info[socketid]['name']} has left.", room=room);
    del socket_info[socketid]
    print(f"Client {socketid}: Player left room {room}")

@equations.socketio.on('register_player')
def register_player(player_info):
    """Register a player."""
    socketid = flask.request.sid
    name = player_info['name']
    room = player_info['room']

    print(f"Client {socketid}: Player {name} wants to join room {room}")

    # Save room nonce -> room info mapping
    if room not in rooms_info:
        rooms_info[room] = {
            "game_started": False,
            "num_players": 1,
            "socketids": [socketid]
        }
    else:
        rooms_info[room]['num_players'] += 1
        rooms_info[room]['socketids'].append(socketid)

    # Save socketid -> room nonce, name mapping
    if socketid in socket_info:
        print("This socket is somehow connected to another room...")
    socket_info[socketid] = {
        "room": room,
        "name": name
    }

    join_room(room)
    print(f"Client {socketid}: Player {name} joined room {room}")
    emit("server_message", f"Player {name} has joined.", room=room)

    names = []
    for sid in rooms_info[room]['socketids']:
        names.append(socket_info[sid]['name'])
    message = "Players in this room: "
    names_message = ", ".join(names)
    emit("server_message", message + names_message, room=room)

@equations.socketio.on('new_message')
def receive_message(message_info):
    """Receive a chat message from client."""
    name = message_info['name']
    message = message_info['message']
    print(f"I got a message from {name}: {message}")

    # Send the message to everyone in the room
    emit('message', message_info, room = socket_info[flask.request.sid]['room'])

@equations.socketio.on('start_game')
def handle_start_game(player_info):
    """Player pressed start_game."""
    name = player_info['name']
    print(f"{name} pressed start_game!")

@equations.socketio.on('flip_timer')
def handle_flip_timer(player_info):
    """Player pressed flip_timer."""
    name = player_info['name']
    print(f"{name} pressed flip_timer!")

@equations.socketio.on('claim_warning')
def handle_claim_warning(player_info):
    """Player pressed claim_warning."""
    name = player_info['name']
    print(f"{name} pressed claim_warning!")

@equations.socketio.on('claim_minus_one')
def handle_claim_minus_one(player_info):
    """Player pressed claim_minus_one."""
    name = player_info['name']
    print(f"{name} pressed claim_minus_one!")

@equations.socketio.on('a_flub')
def handle_a_flub(player_info):
    """Player pressed a_flub."""
    name = player_info['name']
    print(f"{name} pressed a_flub!")

@equations.socketio.on('p_flub')
def handle_p_flub(player_info):
    """Player pressed p_flub."""
    name = player_info['name']
    print(f"{name} pressed p_flub!")

@equations.socketio.on('force_out')
def handle_force_out(player_info):
    """Player pressed force_out."""
    name = player_info['name']
    print(f"{name} pressed force_out!")



