"""Handle socket connects and disconnects."""

import flask
import equations
from equations.data import rooms_info, user_info, socket_info, MapsLock, get_name_and_room
from equations.db_serialize import db_insert
from flask_socketio import join_room, leave_room, emit


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
    
    # Guaranteed by index.py's join_game and create_game
    # Will fail when I try to do my old debugging trick, where I hard refresh
    # on a gamepage after restarting the server.
    assert name in user_info
    assert room in rooms_info

    print(f"Socket {socketid} associated with {name} wants to join room {room}")

    MapsLock()
    assert socketid not in socket_info
    socket_info[socketid] = {
        "name": name,
        "room": room,
    }

    join_room(room)
    
    rooms_info[room]["sockets"].append(socketid)
    user_info[name]["latest_socketids"][room].append(socketid)
    
    mode = user_info[name]["room_modes"][room]
    rejoin = (mode == equations.data.REJOINED_MODE)
    joined_as_player = rejoin or (mode == equations.data.PLAYER_MODE)

    if not joined_as_player and rooms_info[room]['game_started']:
        # Render every visual aspect of the board correctly for a spectator.
        # Required only if game has started
        assert mode == equations.data.SPECTATOR_MODE
        emit("render_spectator_state", rooms_info[room])
    if joined_as_player:
        # Joined as player. Clientside should render visuals as well as register
        # callbacks as appropriate (according to whether game has started)
        emit("render_player_state", rooms_info[room])

    rejoin_str = "rejoined" if rejoin else "joined"
    spectator_str = "" if joined_as_player else " as spectator"
    emit("server_message", f"{name} has {rejoin_str}{spectator_str}.", room=room)
    emit("new_player", rooms_info[room]["players"], room=room)
    
    if len(rooms_info[room]["spectators"]) > 0:
        people_message = "People in this room: "
        people = ", ".join(list(set([socket_info[x]['name'] for x in rooms_info[room]["sockets"]])))
        emit("server_message", people_message + people, room=room)

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

    # Update room info
    if username in rooms_info[room]['spectators']:
        # Remove spectators on disconnect. But do not remove player until game finishes.
        rooms_info[room]['spectators'].remove(username)

    rooms_info[room]["sockets"].remove(socketid)
    if len(rooms_info[room]["sockets"]) == 0:
        # If all players and spectators leave, then game is considered finished even if it's not.
        # TODO Right now this is only way a game ends. When implement timing, may need to reconsider this.
        if not rooms_info[room]["game_finished"]:
            rooms_info[room]["game_finished"] = True
            db_insert(room, rooms_info[room])

            for player in rooms_info[room]["players"]:
                assert player in user_info
                assert room in user_info[player]["gamerooms"]
                user_info[player]["gamerooms"].remove(room)

        del rooms_info[room]

    # Update user_info
    # On a refresh on a game page, due to delay in socket disconnect, new socket
    # (most likely) has connected by the time this code runs and (potentially) deletes
    # the user from the user_info dict. Even if not, worst thing that can happen
    # is that the game is marked as finished.
    assert room in user_info[username]["latest_socketids"].keys()
    user_info[username]["latest_socketids"][room].remove(socketid)
    if len(user_info[username]["latest_socketids"][room]) == 0:

        print(f"{username} is no longer connected to {room}")
        del user_info[username]["latest_socketids"][room]

        assert room in user_info[username]["room_modes"].keys()
        del user_info[username]["room_modes"][room]

        # If a player leaves before a game is started, then remove him/her as a player
        if room in rooms_info and not rooms_info[room]["game_started"] \
                and username in rooms_info[room]["players"]:
            if room in user_info[username]["gamerooms"]:
                # Need if statement because could gotten removed above in update rooms_info
                user_info[username]["gamerooms"].remove(room)
            if room in rooms_info:
                rooms_info[room]["players"].remove(username)
            emit("player_left", rooms_info[room]["players"], room=room)
        
        if room in user_info[username]["gamerooms"] and room not in rooms_info:
            user_info[username]["gamerooms"].remove(room)

        # Unmap user if he/she is not in any rooms and he/she is not playing a game
        if len(user_info[username]["latest_socketids"]) == 0 and \
                len(user_info[username]["gamerooms"]) == 0:
            del user_info[username]

        emit("server_message", f"{username} has left.", room=room)
        print(f"Client {socketid}: {username} left room {room}")

    else:
        print(f"Socket {socketid} for user {username} disconnected, but user "
               "still has another connection to the room open")
