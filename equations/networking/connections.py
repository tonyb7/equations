"""Handle socket connects and disconnects."""

import flask
import equations
from equations.data import rooms_info, user_info, socket_info, MapsLock, get_name_and_room
from equations.db_serialize import db_insert, db_deserialize
from flask_socketio import join_room, leave_room, emit
from equations.models import Game


@equations.socketio.on('connect')
def on_connect():
    """Handle request to connect to server."""
    print(f"Client {flask.request.sid} connected!")

@equations.socketio.on('register_client')
def register_client(player_info):
    """Register a client."""
    socketid = flask.request.sid
    name = player_info['name']
    room = player_info['room']

    print(f"Socket {socketid} associated with {name} wants to join room {room}")

    ############################################################################
    #   Modify maps, and join socketid room (with the join_room call).
    ############################################################################

    MapsLock()
    assert socketid not in socket_info
    socket_info[socketid] = {
        "name": name,
        "room": room,
    }

    game = Game.query.filter_by(nonce=room).first()
    assert game is not None
    is_player = name in game.players

    if room not in rooms_info:
        rooms_info[room] = db_deserialize(game)
    rooms_info[room]["players"] = game.players
    rooms_info[room]["sockets"].append(socketid)
    if not is_player and name not in rooms_info[room]["spectators"]:
        rooms_info[room]["spectators"].append(name)
    
    if user not in user_info:
        user_info[name] = {
            "latest_socketids": {},
        }
    if room not in user_info[name]["latest_socketids"]:
        user_info[name]["latest_socketids"][room] = []
    user_info[name]["latest_socketids"][room].append(socketid)

    join_room(room)

    ############################################################################
    #   Emit messages to client-side for chat and rendering.
    ############################################################################

    join_msg = "as a player" if is_player else "as a spectator"
    emit("server_message", f"{name} has connected {join_msg}.", room=room)
    emit("new_player", rooms_info[room]["players"], room=room)
    
    if len(rooms_info[room]["spectators"]) > 0:
        people_message = "People in this room: "
        people = ", ".join(list(set([socket_info[x]['name'] for x in rooms_info[room]["sockets"]])))
        emit("server_message", people_message + people, room=room)

    if not is_player and rooms_info[room]['game_started']:
        # Render every visual aspect of the board correctly for a spectator.
        # Required only if game has started
        emit("render_spectator_state", rooms_info[room])
    if is_player:
        # Joined as player. Clientside should render visuals as well as register
        # callbacks as appropriate (according to whether game has started)
        emit("render_player_state", rooms_info[room])
        
    if rooms_info[room]["game_finished"]:
        emit("server_message", "This game has finished.", room=room)

@equations.socketio.on('disconnect')
def on_disconnect():
    """Handle disconnect."""
    print(f"Client {flask.request.sid} disconnected!")
    socketid = flask.request.sid

    MapsLock()
    if socketid not in socket_info:
        # Note: MapsLock makes register_player atomic, so we can safely say
        # in this case socket disconnected before register_player *started*.
        print("Socket disconnected before register_player started")
        return

    [username, room] = get_name_and_room(socketid)

    # Leave the room
    leave_room(room)

    # Update socket_info
    del socket_info[socketid]

    # Remove socket from user's maps
    user_info[username]["latest_socketids"][room].remove(socketid)
    if len(user_info[username]["latest_socketids"][room]) == 0:

        print(f"{username} is no longer connected to {room}")
        del user_info[username]["latest_socketids"][room]

        # Remove spectators on disconnect.
        if username in rooms_info[room]['spectators']:
            rooms_info[room]['spectators'].remove(username)
        
        # Unmap user if he/she has not more socket connections.
        # User could still be a player in a game.
        if len(user_info[username]["latest_socketids"]) == 0:
            del user_info[username]
        
        emit("server_message", f"All of {username}'s connections to this room "
                                "have disconnected.", room=room)
        print(f"Client {socketid}: {username} completely disconnected from room {room}")

    else:
        print(f"Socket {socketid} for user {username} disconnected, but user "
               "still has another connection to the room open")

    rooms_info[room]["sockets"].remove(socketid)
    if len(rooms_info[room]["sockets"]) == 0:
        # If all players and spectators leave a non-tournament match before the 
        # game has started, then game is deleted.
        if not rooms_info[room]["game_started"] and len(rooms_info[room]["tournament"]) == 0:
            del rooms_info[room]
            game = Game.query.filter_by(nonce=room).first()
            assert game is not None
            print("Deleting game of id ", room)
            equations.db.session.delete(game)
            equations.db.session.commit()

