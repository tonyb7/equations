"""Data structures for server state/game states."""

from threading import Lock

"""
    rooms_info

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
    user_info

    - Map username -> latest socketid for each room, gameroom.
    - A user can be *playing* in any number of games at a time, and those games are
        tracked in the "gamerooms" list, which is set of room ids
    - All rooms that the user is in (spectating or playing) will be tracked in
        the "rooms" dict, which maps room ids to list of socketids.
    - A user will always be in this map as long as he/she has at least one 
        active socket connection (one item in the rooms dict) and at least one
        of its games in the gamerooms list is still active.
    - A game in the gamerooms list will stay there until the game finishes.
    - In summary, username will be mapped whenever a user makes his/her
        first connection, regardless of whether that connection is to join a room
        as a spectator or as a player.
    - And username will be unmapped when that user has no more live connections
        AND the user is no longer a player in any active games.
    - There is one more field in user_info, which is the "room_modes" dict,
        which maps, for every room the player is in, a room id to one of the
        below *_MODE constants
"""
user_info = {}
PLAYER_MODE = "player"
SPECTATOR_MODE = "spectator"
REJOINED_MODE = "rejoin"  # rejoined as player

"""
    socket_info

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

"""
Caller's responsibility to grab maps lock before calling functions below.
"""

def get_name_and_room(socketid):
    """Get the username and room associated with a socketid."""
    assert socketid in socket_info
    name = socket_info[socketid]['name']
    assert name in user_info
    room = socket_info[socketid]['room']
    return [name, room]

def get_current_mover(room):
    """Return who the current mover is in a room."""
    assert room in rooms_info
    assert rooms_info[room]['game_started']
    turn_idx = rooms_info[room]['turn']
    return rooms_info[room]['players'][turn_idx]

def get_previous_mover(room):
    """Return whoever just moved. Returns None if no moves have been made yet."""
    assert room in rooms_info
    if not rooms_info[room]["goalset"]:
        return None 
    
    previous_mover_index = (rooms_info[room]['turn'] - 1) % (len(rooms_info[room]["players"]))
    return rooms_info[room]['players'][previous_mover_index]
