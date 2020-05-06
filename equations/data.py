"""Data structures for server state/game states."""

from threading import Lock

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
    - Map username -> latest socketid for each room, gameroom
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

# Mutex to protect above three maps
maps_lock = Lock()

class MapsLock():
    """RAII wrapper around maps lock."""
    def __init__(self):
        maps_lock.acquire()
    
    def __del__(self):
        maps_lock.release()


def can_create_room(name):
    """Ensure that a user is only playing in one match at a time."""
    MapsLock()
    if name in user_info and user_info[name]["gameroom"] is not None:
        return False
    return True

def get_name_and_room(socketid):
    """Get the username and room associated with a socketid."""
    MapsLock()
    assert socketid in socket_info
    name = socket_info[socketid]['name']
    assert name in user_info
    room = socket_info[socketid]['room']
    return [name, room]

def get_current_mover(room):
    """Return who the current mover is in a room."""
    MapsLock()
    assert room in rooms_info
    assert rooms_info[room]['game_started']
    turn_idx = rooms_info[room]['turn']
    return rooms_info[room]['players'][turn_idx]
