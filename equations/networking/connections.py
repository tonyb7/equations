"""Handle socket connects and disconnects."""

import copy
import flask
import equations
from equations.data import rooms_info, user_info, socket_info, MapsLock, get_name_and_room
from equations.db_serialize import db_deserialize
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

    print(f"QUERYING DB FOR GAME {room}")
    game = Game.query.filter_by(nonce=room).first()
    assert game is not None
    is_player = name in game.players

    if room not in rooms_info:
        rooms_info[room] = db_deserialize(game)
    rooms_info[room]["players"] = game.players
    rooms_info[room]["sockets"].append(socketid)
    if not is_player and name not in rooms_info[room]["spectators"]:
        rooms_info[room]["spectators"].append(name)
    
    if name not in user_info:
        user_info[name] = {
            "latest_socketids": {},     # maps room -> array of socket ids
            "leave_requests": set(),    # set of rooms where leave_room was requested
        }
    if room not in user_info[name]["latest_socketids"]:
        user_info[name]["latest_socketids"][room] = []
    user_info[name]["latest_socketids"][room].append(socketid)
    print("User info: ", user_info)

    join_room(room)

    ############################################################################
    #   Emit messages to client-side for chat and rendering.
    ############################################################################

    join_msg = "as a player" if is_player else "as a spectator"
    emit("server_message", f"{name} has connected {join_msg}.", room=room)
    emit("new_player", rooms_info[room]["players"], room=room)

    print(f"Connected to room {room} with the following rooms_info: {rooms_info[room]}")
    
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
        
        # Leave the room if the player requested to leave the room, and the game hasn't started yet.
        if username in rooms_info[room]['players'] and room in user_info[username]['leave_requests'] \
                and not rooms_info[room]['game_started'] and rooms_info[room]["tournament"] is None:
            # Button should not be clickable if this is a tournament match
            assert rooms_info[room]['tournament'] is None
            # Remove the user as a player from the database
            game = Game.query.filter_by(nonce=room).first()
            assert game is not None
            player_list = copy.deepcopy(game.players)
            player_list.remove(username)
            game.players = player_list
            equations.db.session.commit()
            # Remove room from this user's leave requests -- it was used up
            user_info[username]['leave_requests'].remove(room)
            # Remove player from rooms_info and report to the clientside
            rooms_info[room]['players'].remove(username)
            emit("player_left", rooms_info[room]["players"], room=room)
            emit("server_message", f"{username} is no longer a player in this game.")
        
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
    print(f"Sockets left in room {room}: {len(rooms_info[room]['sockets'])}")

    if len(rooms_info[room]["sockets"]) == 0:
        # If all players and spectators leave a non-tournament match before the 
        # game has started, then game is deleted from the rooms_info map only.
        # Do not delete from database, as a slow refresh/hard refresh has proven to be problematic 
        # (game will get deleted before refresh finishes/refresh causes use of new socket and is slow)
        print(f"Has game started? {rooms_info[room]['game_started']}, tournament: {rooms_info[room]['tournament']}")
        if not rooms_info[room]["game_started"] and rooms_info[room]["tournament"] is None:
            del rooms_info[room]

@equations.socketio.on('leave_game')
def on_leave():
    """Handle when a player chooses to leave a non-tournament game before game starts."""
    print("on_leave triggered")
    [name, room] = get_name_and_room(flask.request.sid)
    MapsLock()
    user_info[name]["leave_requests"].add(room)
