"""
Functions to support actions that control the flow of the game such as
game start, goal setting, and moving cubes.
"""

import flask
import equations
import random
import time
from equations.data import rooms_info, user_info, socket_info, MapsLock
from equations.data import get_name_and_room, get_current_mover
from flask_socketio import emit

# Constant to represent index of a moved cube in resources list
MOVED_CUBE_IDX = -1

@equations.socketio.on('start_game')
def handle_start_game():
    """Player pressed start_game."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed start_game for room {room}!")

    if rooms_info[room]["game_finished"]:
        return

    if room not in rooms_info or rooms_info[room]['game_started']:
        print("Game start rejected")
        return

    current_players = rooms_info[room]['players']

    if len(current_players) < 2:
        emit('server_message', 
             "You can only start a game with 2 or 3 players.", 
             room=room)
        return
    
    assert name in current_players
    assert len(current_players) <= 3
    assert not rooms_info[room]['game_started']

    random.seed(time.time())
    rolled_cubes = [random.randint(0, 5) for _ in range(24)]

    rooms_info[room] = {
        "game_started": True,
        "game_finished": False,
        "players": current_players,
        "spectators": rooms_info[room]["spectators"],
        "sockets": rooms_info[room]["sockets"],
        "p1scores": [0],
        "p2scores": [0],
        "p3scores": [0],
        "starttime": time.time(),
        "cube_index": rolled_cubes[:],  # fixed length of 24, index is cube's id
        "resources": rolled_cubes,  # fixed length of 24
        "goal": [],  # stores cube ids (based on cube_index); same for 3 below
        "required": [],
        "permitted": [],
        "forbidden": [],
        "turn": random.randint(0, len(current_players) - 1),
        "touched_cube": None,
        "bonus_clicked": False,
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

    start_instruction = f"{name} started the game! The cubes have been rolled! \
        {get_current_mover(room)} is chosen to be the goal setter. \
            Move cubes by clicking a cube in resources, \
                then clicking the area on the mat you want to move it to. \
                    If you touch a cube you must move it! \
                    Press \"Goal Set!\" when you're done!"
    emit("server_message", start_instruction, room=room)

@equations.socketio.on("cube_clicked")
def handle_cube_click(pos):
    """Highlight cube if it's clicker's turn and clicker hasn't clicked yet."""
    MapsLock()
    [user, room] = get_name_and_room(flask.request.sid)

    if rooms_info[room]["game_finished"]:
        return

    # Reject if a cube has already been clicked. You touch it you move it!
    if rooms_info[room]['touched_cube'] is not None:
        return

    if rooms_info[room]["resources"][pos] == MOVED_CUBE_IDX:
        return

    turn_idx = rooms_info[room]['turn']
    turn_user = rooms_info[room]['players'][turn_idx]

    if turn_user == user:
        if not rooms_info[room]["goalset"] and len(rooms_info[room]["goal"]) >= 6:
            emit("server_message", 
                 "Max number of cubes on goal set! Please press \"Goal Set!\"", 
                 room=room)
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
    rooms_info[room]["resources"][touched_cube_idx] = MOVED_CUBE_IDX

    move_command = {
        "from": touched_cube_idx,
        "to": sectorid,
    }
    emit("move_cube", move_command, room=room)

def is_leading(room, player):
    """Determines if player is leading the match."""
    player_num = rooms_info[room]["players"].index(player)
    player_score = sum(rooms_info[room][f"p{player_num+1}scores"])

    p1score = sum(rooms_info[room]["p1scores"])
    p2score = sum(rooms_info[room]["p2scores"])
    p3score = sum(rooms_info[room]["p3scores"])
    
    max_score = max(p1score, p2score, p3score)
    min_score = min(p2score, p2score, p3score)

    if player_score != 0 and max_score != min_score and player_score == max_score:
        return True

    return False

def next_turn(room):
    """Move to next turn in a room."""
    next_turn_idx = (rooms_info[room]["turn"] + 1) % \
        len(rooms_info[room]["players"])
    rooms_info[room]["turn"] = next_turn_idx

    turn_player = rooms_info[room]["players"][next_turn_idx]
    next_turn_command = {
        "player": turn_player,
        "show_bonus": not is_leading(room, turn_player),
    }

    emit("next_turn", next_turn_command, room=room)

    # TODO timer logic
    # TODO ability to challenge

@equations.socketio.on("sector_clicked")
def handle_sector_click(sectorid):
    """Receive a click action on a playable area of the board."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} clicked {sectorid} in room {room}")

    if rooms_info[room]["game_finished"]:
        return

    if name != get_current_mover(room):
        print(f"Not {name}'s turn. Do nothing.")
        return

    if rooms_info[room]["bonus_clicked"]:
        if sectorid != "forbidden-sector":
            emit("server_message", 
                 "To bonus you must first place a cube in forbidden!", 
                 room=room)
            return
        else:
            move_cube(room, sectorid)
            rooms_info[room]["bonus_clicked"] = False
            return

    if not rooms_info[room]["goalset"]:
        if sectorid != "goal-sector":
            print(f"Goalsetter clicked on a non-goal area.")
            return
    elif sectorid == "goal-sector":
        print(f"Someone clicked on goal area but goal is already set")
        return

    move_cube(room, sectorid)
    
    if rooms_info[room]["goalset"]:
        next_turn(room)

@equations.socketio.on("set_goal")
def handle_set_goal():
    """Handle goal set."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    assert name == get_current_mover(room)

    if rooms_info[room]["game_finished"]:
        return

    rooms_info[room]["goalset"] = True
    next_turn(room)
    
@equations.socketio.on("bonus_clicked")
def handle_bonus_click():
    """Bonus button was clicked."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    if get_current_mover(room) != name:
        print("non mover somehow clicked the bonus button. hacker")
        return
    assert not rooms_info[room]["bonus_clicked"]
    rooms_info[room]["bonus_clicked"] = True
