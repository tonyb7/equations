"""
Functions to support actions that control the flow of the game such as
game start, goal setting, and moving cubes.
"""

import flask
import equations
import random
import time
import re
from equations.db_serialize import db_insert
from equations.data import rooms_info, user_info, socket_info, MapsLock
from equations.data import get_name_and_room, get_current_mover
from equations.networking.challenge import handle_force_out
from flask_socketio import emit

# Constant to represent index of a moved cube in resources list
MOVED_CUBE_IDX = -1
# Total cubes in the game
TOTAL_CUBES = 24

def start_shake(new_game, is_restart):
    """Handle logic for starting a shake. new_game specifies if shake
    is the first shake in a game."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    print(f"{name} pressed start_game for room {room}!")

    if rooms_info[room]["game_finished"]:
        return

    if not new_game and rooms_info[room]["five_minute_warning_called"]:
        emit("server_message", "Five minute warning has been called so a new shake cannot be started.", room=room)
        return

    if room not in rooms_info or (new_game and rooms_info[room]['game_started']) \
            or (not new_game and rooms_info[room]['shake_ongoing']):
        print("Game start rejected")
        return

    current_players = rooms_info[room]['players']

    if len(current_players) < 2:
        emit('server_message', 
             f"{name} clicked \"Start Game\" but a game can only be started with 2 or 3 players.", 
             room=room)
        return
    
    assert name in current_players
    assert len(current_players) <= 3

    random.seed(time.time())
    rolled_cubes = [random.randint(0, 5) for _ in range(24)]

    if is_restart:
        # Goalsetter needs to be the same as the previous shake.
        rooms_info[room]['goalsetter_index'] = \
            (rooms_info[room]['goalsetter_index'] - 1) % len(rooms_info[room]['players'])
    
    if new_game:
        rooms_info[room] = {
            "game_started": True,
            "game_finished": False,
            "tournament": None,
            "players": current_players,
            "spectators": rooms_info[room]["spectators"],
            "sockets": rooms_info[room]["sockets"],
            "p1scores": [0],
            "p2scores": [0],
            "p3scores": [0],
            "variations_state": {
                "variations": [],
                "num_players_called": 0,
                "caller_index": None,
            },
            "starttime": time.time(),
            "last_timer_flip": None,
            # cube_index is poorly named. fixed length of 24, index is cube's id.
            # first six are red, next six are blue, next six are green, last six are black.
            # so if the first element of cube_index was x (where 0 <= x <= 5), the
            # corresponding cube is given by the file "rx.png" (where x is replaced w/#)
            "cube_index": rolled_cubes[:], 
            "resources": rolled_cubes,  # fixed length of 24
            "goal": [],  # stores cube id, x pos on canvas, orientation of cube
            "required": [], # stores cube ids (based on cube_index); same for 2 below
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
            "shake_ongoing": True,
            "five_minute_warning_called": False,
            "time_up": False,
        }

        rooms_info[room]['goalsetter_index'] = rooms_info[room]['turn']
        rooms_info[room]["variations_state"]["caller_index"] = rooms_info[room]['turn']

        db_insert(room, rooms_info[room])

        game_begin_instructions = {
            'cubes': rolled_cubes,
            'players': current_players,
            'starter': name,
            'goalsetter': get_current_mover(room),
            'starttime': rooms_info[room]['starttime'],
            'variations_state': rooms_info[room]['variations_state'],
        }

        emit("begin_game", game_begin_instructions, room=room)
    else:
        rooms_info[room]["last_timer_flip"] = None
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
        rooms_info[room]["shake_ongoing"] = True
        rooms_info[room]["variations_state"] = {
            "variations": [],
            "num_players_called": 0,
            "caller_index": rooms_info[room]["goalsetter_index"],
        }

        db_insert(room, rooms_info[room])

        goalsetter = get_current_mover(room)
        shake_begin_instructions = {
            'cubes': rolled_cubes,
            'players': current_players,
            'goalsetter': goalsetter,
            'show_bonus': not is_leading(room, goalsetter),
            'variations_state': rooms_info[room]['variations_state'],
        }
    
        emit("begin_shake", shake_begin_instructions, room=room)

@equations.socketio.on('start_game')
def handle_start_game():
    """Player pressed start_game."""
    start_shake(True, False)

@equations.socketio.on('new_shake')
def handle_new_shake():
    """Handle start of new shake."""
    start_shake(False, False)

@equations.socketio.on('restart_shake')
def handle_restart_shake():
    """Restart a shake with the same goalsetter after a no goal."""
    start_shake(False, True)

@equations.socketio.on("cube_clicked")
def handle_cube_click(pos):
    """Highlight cube if it's clicker's turn and clicker hasn't clicked yet."""
    MapsLock()
    [user, room] = get_name_and_room(flask.request.sid)

    turn_user = get_current_mover(room)
    if rooms_info[room]["game_finished"] or rooms_info[room]["challenge"] \
            or rooms_info[room]["resources"][pos] == MOVED_CUBE_IDX \
            or turn_user != user:
        return

    # Cannot move cubes before finishing calling variations
    if rooms_info[room]['variations_state']['num_players_called'] < len(rooms_info[room]['players']):
        emit("server_message", "Please wait for variations to be called before moving a cube!")
        return

    do_not_rehighlight = False
    if rooms_info[room]['touched_cube'] is not None:
        if rooms_info[room]['touched_cube'] == pos:
            do_not_rehighlight = True
        emit("unhighlight_cube", rooms_info[room]['touched_cube'], room=room)
        rooms_info[room]['touched_cube'] = None

    if not do_not_rehighlight:
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
    if sector_str != "goal":
        rooms_info[room][sector_str].append(touched_cube_idx)
    else:
        goal_cube_dict = {
            "idx": touched_cube_idx,
            # unit for x is thousandths of canvas width
            # should recv actual value from client after cube is moved
            "x": 0, 
            "orientation": 0,
        }
        rooms_info[room]['goal'].append(goal_cube_dict)

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

    num_greater = 0
    for score in [p1score, p2score, p3score]:
        if player_score > score:
            num_greater += 1    

    # if 3 player match, obv this make sense. if 2 player match, unused player
    # will always have score of 0
    assert num_greater <= 2
    if num_greater == 2:
        return True
    
    return False

def next_turn(room):
    """Move to next turn in a room."""
    next_turn_idx = (rooms_info[room]["turn"] + 1) % \
        len(rooms_info[room]["players"])
    rooms_info[room]["turn"] = next_turn_idx

    turn_player = rooms_info[room]["players"][next_turn_idx]
    cubes_in_resources = TOTAL_CUBES - rooms_info[room]['resources'].count(MOVED_CUBE_IDX)
    print("Cubes in resources: ", cubes_in_resources)

    next_turn_command = {
        "player": turn_player,
        "show_bonus": cubes_in_resources >= 2 and not is_leading(room, turn_player),
    }

    rooms_info[room]["started_move"] = False

    if cubes_in_resources > 0:
        emit("next_turn", next_turn_command, room=room)
    else:
        handle_force_out(room)

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

@equations.socketio.on("variation_called")
def handle_variation_called(info):
    """A player submitted variations."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)

    assert info["player"] == name

    # Split provided string into variations. A variation in the string is considered
    # to be a consecutive sequence of numbers, letters, underscore, hyphen, 
    # exclamation mark, operation signs, apostrophe, and spaces.
    # This operation also serves to sufficiently sanitize what's being added to the DOM.
    variations = re.findall(r"[-\w'!_+*^\/ ]+", info["content"])
    variations = [x.strip().upper() for x in variations] # Convert every string to all uppercase
    variations = list(filter(None, variations))

    if len(variations) > 0:
        rooms_info[room]['variations_state']['variations'].extend(variations)
        rooms_info[room]['variations_state']['num_players_called'] += 1
        rooms_info[room]['variations_state']['caller_index'] = \
            (rooms_info[room]['variations_state']['caller_index'] + 1) % len(rooms_info[room]['players'])
        emit("server_message", f"{name} has submitted \"{info['content']}\" for variations. "
            "These variations have been recorded in the variations section.", room=room)
    else:
        emit("server_message", f"{name} has submitted nothing for variations. Please call at least one variation!", room=room)

    update_info = {
        "variations_state": rooms_info[room]['variations_state'],
        "players": rooms_info[room]['players'],
    }
    emit("update_variations", update_info, room=room)
    if (rooms_info[room]['variations_state']['num_players_called'] >= len(rooms_info[room]['players'])):
        assert rooms_info[room]['variations_state']['num_players_called'] == len(rooms_info[room]['players'])
        variations_finished_info = {
            "is_first_shake": rooms_info[room]["p1scores"][0] == 0,
            "goalsetter": get_current_mover(room),
        }
        emit("variations_finished", variations_finished_info, room=room)

    