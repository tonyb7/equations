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

def start_shake(new_game):
    """Handle logic for starting a shake. new_game specifies if shake
    is the first shake in a game."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed start_game for room {room}!")

    if rooms_info[room]["game_finished"]:
        return

    if room not in rooms_info or (new_game and rooms_info[room]['game_started']):
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

    random.seed(time.time())
    rolled_cubes = [random.randint(0, 5) for _ in range(24)]

    if new_game:
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
            "goalset": False,
            "num_timer_flips": 0,
            "10s_warning_called": False,
            "challenge": None,
            "touched_cube": None,
            "bonus_clicked": False,
            "started_move": False,
            "endgame": None,
        }

        rooms_info[room]['goalsetter_index'] = rooms_info[room]['turn']

        game_begin_instructions = {
            'cubes': rolled_cubes,
            'players': current_players,
            'starter': name,
            'goalsetter': get_current_mover(room),
        }

        emit("begin_game", game_begin_instructions, room=room)
    else:
        rooms_info[room]["cube_index"] = rolled_cubes[:]
        rooms_info[room]["resources"] = rolled_cubes
        rooms_info[room]["goal"] = []
        rooms_info[room]["required"] = []
        rooms_info[room]["permitted"] = []
        rooms_info[room]["forbidden"] = []
        rooms_info[room]['goalsetter_index'] = \
            (rooms_info[room]['goalsetter_index'] + 1) % len(rooms_info[room]['players'])
        rooms_info[room]["turn"] = rooms_info[room]['goalsetter_index']
        rooms_info[room]["goalset"] = False
        rooms_info[room]["num_timer_flips"] = 0
        rooms_info[room]["10s_warning_called"] = False
        rooms_info[room]["challenge"] = None
        rooms_info[room]["touched_cube"] = None
        rooms_info[room]["bonus_clicked"] = False
        rooms_info[room]["started_move"] = False
        rooms_info[room]["endgame"] = None

        shake_begin_instructions = {
            'cubes': rolled_cubes,
            'players': current_players,
            'goalsetter': get_current_mover(room),
        }

        emit("begin_shake", shake_begin_instructions, room=room)

@equations.socketio.on('start_game')
def handle_start_game():
    """Player pressed start_game."""
    start_shake(True)

@equations.socketio.on('new_shake')
def handle_new_shake():
    """Handle start of new shake."""
    start_shake(False)

@equations.socketio.on("cube_clicked")
def handle_cube_click(pos):
    """Highlight cube if it's clicker's turn and clicker hasn't clicked yet."""
    MapsLock()
    [user, room] = get_name_and_room(flask.request.sid)

    if rooms_info[room]["game_finished"]:
        return

    if rooms_info[room]["challenge"]:
        return

    if rooms_info[room]['touched_cube'] is not None:
        emit("unhighlight_cube", pos, room=room)
        rooms_info[room]['touched_cube'] = None
        return

    if rooms_info[room]["resources"][pos] == MOVED_CUBE_IDX:
        return

    turn_user = get_current_mover(room)

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
    rooms_info[room]["started_move"] = True

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
    min_score = min(p1score, p2score) if p3score == 0 else min(p2score, p2score, p3score)

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

    rooms_info[room]["started_move"] = False
    emit("next_turn", next_turn_command, room=room)

    # TODO timer logic
    # TODO ability to challenge

@equations.socketio.on("sector_clicked")
def handle_sector_click(sectorid):
    """Receive a click action on a playable area of the board."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} clicked {sectorid} in room {room}")

    if rooms_info[room]["game_finished"] or rooms_info[room]["touched_cube"] is None:
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

    if len(rooms_info[room]['goal']) == 0:
        emit("server_message", "You must set at least one cube on the goal!")
        return

    if rooms_info[room]["game_finished"]:
        return

    emit("hide_goal_setting_buttons", room=room)
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

    if rooms_info[room]["started_move"]:
        print("started move but somehow clicked bonus button")
        return

    rooms_info[room]["bonus_clicked"] = not rooms_info[room]["bonus_clicked"]
    print("bonus clicked set to ", rooms_info[room]["bonus_clicked"])

@equations.socketio.on("call_judge")
def handle_call_judge():
    """Player requested to call a judge."""
    pass
