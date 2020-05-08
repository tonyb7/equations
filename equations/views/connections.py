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

    print(f"Socket {socketid} associated with {name} wants to join room {room}")

    MapsLock()
    assert socketid not in socket_info
    socket_info[socketid] = {
        "name": name,
        "room": room,
    }

    # This if-else block will be responsible for the rooms_info data structure
    # as well asserting the "gameroom" field of users in user_info
    joined_as_player = True
    rejoin = False
    if room not in rooms_info:  # for create room
        # This is a new game room and players can always join as player
        # See Issue #17 on Github
        if name in user_info:
            # this assertion should be guaranteed by call to
            # can_create_room() from create_game
            assert user_info[name]["gameroom"] is None

        rooms_info[room] = {
            "game_started": False,
            "game_finished": False,
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
            # assert name in user_info game coulda ended
            # assert user_info[name]["gameroom"] == room game coulda ended
            rejoin = True
            print(f"{name} rejoined room {room}")
        elif rooms_info[room]["game_started"] or len(rooms_info[room]["players"]) >= 3 \
                or (name in user_info and user_info[name]["gameroom"] != room):
            # join as spectator
            rooms_info[room]["spectators"].append(name)
            joined_as_player = False
            print(f"{name} joined room {room} as spectator")
        else:
            # join as new player
            if name in user_info:
                assert user_info[name]["gameroom"] is None
            rooms_info[room]["players"].append(name)
            print(f"{name} joined room {room} as new player")

        rooms_info[room]["sockets"].append(socketid)
    
    join_room(room)
    
    if name not in user_info:
        user_info[name] = {
            "latest_socketids": {},
            "gameroom": room if joined_as_player else None,
        }
        user_info[name]["latest_socketids"][room] = socketid
    else:
        if joined_as_player:
            user_info[name]['gameroom'] = room
        user_info[name]["latest_socketids"][room] = socketid
    
    if rooms_info[room]['game_started'] and not joined_as_player:
        # Render every visual aspect of the board correctly for a spectator.
        # Required only if game has started
        emit("render_spectator_state", rooms_info[room])
    if joined_as_player:
        # Joined as player. Clientside should render visuals as well as register
        # callbacks as appropriate (according to whether game has started)
        emit("render_player_state", rooms_info[room])

    rejoin_str = "rejoined" if rejoin else "joined"
    spectator_str = "" if joined_as_player else " as spectator"
    emit("server_message", f"{name} has {rejoin_str}{spectator_str}.", room=room)
    
    if len(rooms_info[room]["spectators"]) > 0:
        people_message = "People in this room: "
        people = ", ".join([socket_info[x]['name'] for x in rooms_info[room]["sockets"]])
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
        # in this case socket disconnected before it *started*.
        print("Socket disconnected before register_player started")
        return

    [username, room] = get_name_and_room(socketid)

    # Leave the room
    leave_room(room)

    # Update socket_info
    del socket_info[socketid]

    # Update room info
    filter(lambda x: x != username, rooms_info[room]["spectators"])
    rooms_info[room]["sockets"].remove(socketid)
    if len(rooms_info[room]["sockets"]) == 0:
        # If all players leave, then game is considered finished even if it's not.
        if rooms_info[room]["game_started"] and not rooms_info[room]["game_finished"]:
            rooms_info[room]["game_finished"] = True

            db_insert(room, rooms_info[room])

            for player in rooms_info[room]["players"]:
                assert player in user_info
                user_info[player]["gameroom"] = None

        del rooms_info[room]

    # Update user_info
    if room in user_info[username]["latest_socketids"] and \
            user_info[username]["latest_socketids"][room] == socketid:

        print(f"{username} is no longer connected to {room}")
        del user_info[username]["latest_socketids"][room]

        # If a player leaves before a game is started, then remove him/her as a player
        current_game = user_info[username]["gameroom"]
        if current_game is not None:
            if current_game not in rooms_info:
                user_info[username]["gameroom"] = None
            elif not rooms_info[current_game]["game_started"]:
                user_info[username]["gameroom"] = None
                rooms_info[current_game]["players"].remove(username)

        # Unmap user if he/she is not in any rooms and he/she is not playing a game
        if len(user_info[username]["latest_socketids"]) == 0 and \
                user_info[username]["gameroom"] is None:
            del user_info[username]

        emit("server_message", f"{username} has left.", room=room)
        print(f"Client {socketid}: {username} left room {room}")

    else:
        # User made a new connection to the room, so current socket is outdated
        print(f"Outdated socket {socketid} for user {username} disconnected")
