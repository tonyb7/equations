"""Functions to handle challenges."""

import flask
import equations
from equations.data import get_name_and_room, get_current_mover, get_previous_mover, MapsLock, rooms_info
from flask_socketio import emit


def initialize_endgame(room, challenge, name, last_mover, sider):
    """Set up rooms_info's endgame structure."""
    if challenge == "a_flub":
        rooms_info[room]['endgame'] = {
            "challenger": name,
            "writers": [name],
            "solutions": {},
            "solution_status": {},
            "sider": sider,
        }
    elif challenge == "p_flub":
        rooms_info[room]['endgame'] = {
            "challenger": name,
            "writers": [last_mover],
            "solutions": {},
            "solution_status": {},
            "sider": sider,
        }
    elif challenge == "no_goal":
        rooms_info[room]['endgame'] = {
            # TODO
        }

challenge_translation = {
    "a_flub": "Challenge Now",
    "p_flub": "Challenge Never",
    "no_goal": "Challenge No Goal",
}

def handle_challenge(socketid, challenge):
    """Handle a challenge."""
    MapsLock()
    [name, room] = get_name_and_room(socketid)
    print(f"{name} pressed {challenge}")

    assert room in rooms_info
    if rooms_info[room]["challenge"] is not None:
        print(f"{name} tried to challenge {challenge} but was too late")
        return

    defender = get_previous_mover(room)
    challenge_message = f"{name} has called {challenge_translation[challenge]}"
    if challenge == "no_goal":
        challenge_message += "!"
    else:
        challenge_message += f" on {defender}!"

    sider = None
    if rooms_info[room]["started_move"]:  # TODO minus 1?
        challenge_message += f" But {name} has started their move so {name} " \
                             f"must finish the move and cannot challenge!"
        emit("server_message", challenge_message, room=room)
        return
    elif defender == name:  # TODO minus 1?
        challenge_message += f" But {name} just moved so {name} cannot challenge!"
        emit("server_message", challenge_message, room=room)
        return
    elif challenge != "no_goal" and len(rooms_info[room]['players']) == 3:  # TODO handle no goals
        sider_list = list(filter(lambda x: x != name and x != defender, rooms_info[room]['players']))
        assert len(sider_list) == 1
        sider = sider_list[0]
        challenge_message += f" {sider} has one minute to side!"

    if challenge == "no_goal":  # TODO gotta implement to goal -- both other players are siders
        if rooms_info[room]["goalset"]:
            no_goal_msg = f"{name} has called Challenge No Goal! But Goal has already been set, so challenge cannot be made!"  # TODO minus one?
            emit("server_message", no_goal_msg, room=room)
            return
        else:
            assert defender is None
            if name != get_current_mover(room):
                no_goal_err_msg = f"{name} called Challenge No Goal but that is " \
                                  f"not allowed because {name} is not setting the goal!"
                emit("server_message", no_goal_err_msg, room=room)
                return
    else:
        if not rooms_info[room]["goalset"]:
            assert defender is None
            emit("server_message", "Goal has not been set yet! You cannot challenge.", room=room)  # TODO handle this
            return
        assert defender is not None

    if challenge == "a_flub":
        cubes_left = len([x for x in rooms_info[room]["resources"] if x != -1])  # TODO magic bad
        if cubes_left < 2:
            emit("server_message", f"{name} called Challenge Now but that is not allowed!", room=room)  # TODO minus 1
            return

    if challenge == "p_flub":
        pass  # TODO Gotta make sure not called after first minute in a force out

    rooms_info[room]["challenge"] = challenge
    initialize_endgame(room, challenge, name, defender, sider)
    emit("server_message", challenge_message, room=room)

    challenge_info = {
        "challenge": challenge,
        "defender": defender,
        "caller": name,
        "sider": sider,
    }
    emit("handle_challenge", challenge_info, room=room)

@equations.socketio.on('a_flub')
def handle_a_flub():
    """Player pressed a_flub."""
    handle_challenge(flask.request.sid, "a_flub")

@equations.socketio.on('p_flub')
def handle_p_flub():
    """Player pressed p_flub."""
    handle_challenge(flask.request.sid, "p_flub")

@equations.socketio.on('no_goal')
def handle_no_goal():
    """Player pressed no_goal."""
    handle_challenge(flask.request.sid, "no_goal")

@equations.socketio.on('sided')
def handle_siding(writing):
    """Player sided."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)

    if writing:
        assert rooms_info[room]["endgame"]["sider"] == name
        rooms_info[room]["endgame"]["writers"].append(name)
    rooms_info[room]["endgame"]["sider"] = None
    
    msg_diff = "" if writing else "not "
    emit("server_message", f"{name} has decided " + msg_diff + "to write a solution!", room=room)

@equations.socketio.on('solution_submitted')
def handle_solution_submit(solution):
    """A player submitted a solution."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    rooms_info[room]["endgame"]["solutions"][name] = solution
    if rooms_info[room]["endgame"]["sider"] is None and \
            len(rooms_info[room]["endgame"]["solutions"]) == len(rooms_info[room]["endgame"]["writers"]):
        emit("review_solutions", rooms_info[room]["endgame"]["solutions"], room=room)

# TODO need handle: force out, no goal
def finish_shake(room):
    """Handle when all solutions have been reviewed."""
    players = rooms_info[room]['players']
    challenger = rooms_info[room]['challenger']

    solution_statuses = rooms_info[room]['endgame']['solution_status']
    one_writer_correct = True in solution_statuses.values()
    solution_writers = solution_statuses.keys()

    non_writers = [name for name in players if name not in set(solution_writers)]

    shake_scores = {}
    if one_writer_correct:
        if challenger in solution_writers and solution_statuses[challenger]:
            for writer in solution_writers:
                shake_scores[writer] = 4 if solution_statuses[writer] else 2
            shake_scores[challenger] = 6
        else:
            for writer in solution_writers:
                shake_scores[writer] = 6 if solution_statuses[writer] else 2

        for non_writer in non_writers:
                shake_scores[non_writer] = 2
    else:
        if challenger in non_writers:
            for non_writer in non_writers:
                shake_scores[non_writer] = 4
            shake_scores[challenger] = 6
        else:
            for non_writer in non_writers:
                shake_scores[non_writer] = 6

        for writer in solution_writers:
                shake_scores[writer] = 2
    
    converted_shake_scores = {
        "p1score": 0,
        "p2score": 0,
        'p3score': 0,
    }

    for player in shake_scores:
        index = players.index(player)
        converted_shake_scores[f"p{index+1}score"] = shake_scores[player]
    
    for i in range(3):
        rooms_info[room][f"p{i+1}scores"].append(converted_shake_scores[f"p{i+1}score"])
    
    emit("finish_shake", converted_shake_scores, room=room)

@equations.socketio.on('decided')
def handle_solution_decision(info):
    """Handle when a player accepts or rejects a solution."""
    writer = info['name']
    accepted = info['accepted']

    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)

    accepted_str = "accepted" if accepted else "rejected"
    emit("server_message", f"{name} " + accepted_str + f" {writer}'s solution!", room=room)

    if not accepted:
        emit("rejection_assent", {"rejecter": name, "writer": writer}, room=room)
    else:
        rooms_info[room]['endgame']['solution_status'][name] = True
        if len(rooms_info[room]['endgame']['solution_status']) == len(rooms_info[room]['endgame']['solutions']):
            finish_shake(room)

@equations.socketio.on('assented')
def handle_rejection_assent(info):
    """Handle when a player assents to a rejection."""
    rejecter = info['rejecter']
    assented = info['assented']

    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)

    if assented:
        emit("server_message", f"{name} has accepted that his/her solution is incorrect.", room=room)

        rooms_info[room]['endgame']['solution_status'][name] = False
        if len(rooms_info[room]['endgame']['solution_status']) == len(rooms_info[room]['endgame']['solutions']):
            finish_shake(room)

        return

    assert name in rooms_info[room]['endgame']['solutions']
    reevaluate_msg = {
        "writer": name,
        "solution": rooms_info[room]['endgame']['solutions'][name],
        "rejecter": rejecter,
    }
    emit("reevaluate_solution", reevaluate_msg, room=room)
    
