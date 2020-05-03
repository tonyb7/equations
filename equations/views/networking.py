"""Server side networking module."""

import flask
import equations
from flask_socketio import join_room, leave_room, emit

# Map room_nonce to: num_players, player_ids/names, game_started
rooms_info = {}
socket_info = {}

@equations.socketio.on('connect')
def on_connect():
    """Handle request to connect to server."""
    print(f"Client {flask.request.sid} connected!")

@equations.socketio.on('disconnect')
def on_disconnect():
    """Handle disconnect."""
    print(f"Client {flask.request.sid} disconnected!")

@equations.socketio.on('register_player')
def register_player(player_info):
    """Register a player."""
    socketid = flask.request.sid
    name = player_info['name']
    room = player_info['room']

    print(f"Client {socketid}: Player {name} wants to join room {room}")
    socket_info[socketid] = room

    # TODO: Error checking, save info in dict

    join_room(room)

@equations.socketio.on('deregister_player')
def deregister_player(player_info):
    socketid = flask.request.sid
    name = player_info['name']
    room = player_info['room']

    print(f"Client {socketid}: Player {name} left room {room}")

    # TODO

    leave_room(room)

@equations.socketio.on('new_message')
def receive_message(message_info):
    """Receive a chat message from client."""
    name = message_info['name']
    message = message_info['message']
    print(f"I got a message from {name}: {message}")

    # Send the message to everyone in the room
    emit('message', message_info, room = socket_info[flask.request.sid])

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



