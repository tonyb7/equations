"""Functions to handle challenges."""

import flask
import equations
from equations.data import get_name_and_room, get_current_mover, get_previous_mover, MapsLock, rooms_info
from equations.db_serialize import db_insert
from flask_socketio import emit
from enum import Enum


"""Tracked in review_status field of endgame info.
Not an enum cuz JSON serialization gets angry."""
REVIEWSTATUS_ACCEPTED = "ACCEPTED"
REVIEWSTATUS_ASSENTING = "ASSENTING" # reviewer has rejected, waiting for solution writer to assent
REVIEWSTATUS_REJECTED = "REJECTED"

challenge_translation = {
    "a_flub": "Challenge Now",
    "p_flub": "Challenge Never",
    "no_goal": "Challenge No Goal",
    "force_out": "Force Out",
}

def initialize_endgame(room, challenge, name, last_mover, sider):
    """Set up rooms_info's endgame structure."""
    if challenge == "a_flub":
        rooms_info[room]['endgame'] = {
            "challenger": name,
            "writers": [name],
            "nonwriters": [last_mover],
            "sider": sider,
            "solutions": {},
            "solution_decisions": {},
            "solution_status": {},
            "review_status": {},
        }
    elif challenge == "p_flub":
        rooms_info[room]['endgame'] = {
            "challenger": name,
            "writers": [last_mover],
            "nonwriters": [name],
            "sider": sider,
            "solutions": {},
            "solution_decisions": {},
            "solution_status": {},
            "review_status": {},
        }
    elif challenge == "no_goal":
        rooms_info[room]['endgame'] = {
            # TODO
        }
    elif challenge == "force_out":
        rooms_info[room]['endgame'] = {
            "challenger": None,
            "writers": rooms_info[room]['players'],
            "nonwriters": [],
            "sider": None,
            "solutions": {},
            "solution_decisions": {},
            "solution_status": {},
            "review_status": {},
        }
    
    rooms_info[room]['endgame']['challenge'] = challenge
    rooms_info[room]['endgame']['last_mover'] = last_mover
    rooms_info[room]['endgame']['endgame_stage'] = "waiting_for_sider"

    for writer in rooms_info[room]['endgame']['writers']:
        rooms_info[room]['endgame']['solution_decisions'][writer] = []
    
    for player in rooms_info[room]['players']:
        # Will track which other players this player has made a decision on, and
        # map (other player) -> accepted, assenting, rejected
        rooms_info[room]['endgame']['review_status'][player] = {}

def handle_challenge(socketid, challenge):
    """Handle a challenge."""
    MapsLock()
    [name, room] = get_name_and_room(socketid)
    print(f"{name} pressed {challenge}")

    assert room in rooms_info
    if rooms_info[room]["challenge"] is not None and challenge != "p_flub":  # TODO can't p flub after 1st minute. TEST!!
        print(f"{name} tried to challenge {challenge} but was too late")
        return

    defender = get_previous_mover(room)
    challenge_message = f"{name} has called {challenge_translation[challenge]}"
    if challenge == "no_goal":
        challenge_message += "!"
    else:
        if not rooms_info[room]['goalset']:
            emit("server_message", "You cannot challenge; the goal has not been set!")
            return

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
        challenge_message += f" {sider} has two minutes to side!"

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

def handle_force_out(room):
    """Force out initiated. Called by next_turn in game_flow."""
    challenge = 'force_out'
    rooms_info[room]['challenge'] = challenge
    initialize_endgame(room, challenge, None, None, None)
    emit("force_out", rooms_info[room]["players"], room=room)

def check_if_ready_to_present(room):
    """Check if solutions are ready to be presented."""
    if rooms_info[room]["endgame"]["sider"] is None and \
            len(rooms_info[room]["endgame"]["solutions"]) == len(rooms_info[room]["endgame"]["writers"]):
        rooms_info[room]["endgame"]["endgame_stage"] = "waiting_for_reviewers"
        review_soln_msg = {
            "solutions": rooms_info[room]["endgame"]["solutions"],
            "players": rooms_info[room]["players"],
        }
        emit("review_solutions", review_soln_msg, room=room)

@equations.socketio.on('sided')
def handle_siding(writing):
    """Player sided."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)

    # Case where perhaps user had two windows open and sided on both.
    # Second click to the siding buttons would trigger this if statement.
    if rooms_info[room]["endgame"]["sider"] == None:
        emit("server_message", "You have already sided. The button you just clicked had no effect.")
        return

    if writing:
        rooms_info[room]["endgame"]["writers"].append(name)
        rooms_info[room]["endgame"]["solution_decisions"][name] = []
    else:
        rooms_info[room]["endgame"]["nonwriters"].append(name)

    rooms_info[room]["endgame"]["sider"] = None
    rooms_info[room]["endgame"]["endgame_stage"] = "waiting_for_solutions"
    
    msg_diff = "" if writing else "not "
    emit("server_message", f"{name} has decided " + msg_diff + "to write a solution!", room=room)
    check_if_ready_to_present(room)

@equations.socketio.on('solution_submitted')
def handle_solution_submit(solution):
    """A player submitted a solution."""
    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)
    if name not in rooms_info[room]["endgame"]["solutions"]:
        rooms_info[room]["endgame"]["solutions"][name] = solution
        check_if_ready_to_present(room)
    else:
        emit("server_message", "You have already submitted a solution. " + 
                               "The solution you just submitted was not counted. ")

# TODO need handle: no goal
def finish_shake(room):
    """Handle when all solutions have been reviewed."""
    rooms_info[room]["endgame"]["endgame_stage"] = "finished"

    players = rooms_info[room]['players']
    challenger = rooms_info[room]['endgame']['challenger']

    solution_statuses = rooms_info[room]['endgame']['solution_status']
    one_writer_correct = True in solution_statuses.values()
    solution_writers = solution_statuses.keys()

    non_writers = [name for name in players if name not in set(solution_writers)]

    shake_scores = {}
    if challenger is None:  # force out
        for player in players:
            assert player in solution_writers   # TODO HANDLE case when no solution submitted when time is implemented
            shake_scores[player] = 4 if solution_statuses[player] else 2

    elif one_writer_correct:
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
        'players': rooms_info[room]['players'],
    }

    for player in shake_scores:
        index = players.index(player)
        converted_shake_scores[f"p{index+1}score"] = shake_scores[player]
    
    for i in range(3):
        rooms_info[room][f"p{i+1}scores"].append(converted_shake_scores[f"p{i+1}score"])

    rooms_info[room]["shake_ongoing"] = False
    shake_finish_msg = {
        "scores": converted_shake_scores, 
        "game_finished": rooms_info[room]["five_minute_warning_called"],
    }
    emit("finish_shake", shake_finish_msg, room=room)

def check_if_shake_finished(room):
    """Check if the shake is finished."""
    if len(rooms_info[room]['endgame']['solution_status']) == len(rooms_info[room]['endgame']['solutions']):
        finish_shake(room)

def track_decided_solution(room, writer, accepted):
    """Track that a solution has been accepted or rejected."""
    rooms_info[room]['endgame']['solution_decisions'][writer].append(accepted)

    # A solution is only considered to be correct if all players have accepted the solution.
    # One rejection with a rejection assent is irreversible.
    if len(rooms_info[room]['endgame']['solution_decisions'][writer]) == len(rooms_info[room]['players']) - 1:
        solution_correct = True if (rooms_info[room]['endgame']['solution_decisions'][writer].count(False) == 0) else False
        rooms_info[room]['endgame']['solution_status'][writer] = solution_correct
        check_if_shake_finished(room)

@equations.socketio.on('decided')
def handle_solution_decision(info):
    """Handle when a player accepts or rejects a solution."""
    writer = info['name']
    accepted = info['accepted']

    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)

    # This is true player cannot decide on a solution but somehow clicks a button to decide.
    # (maybe from a second open window). Clientside should ensure this never happens though...
    # and make buttons that shouldn't be clicked not clickable
    if writer in rooms_info[room]['endgame']['review_status'][name]:
        emit("server_message", "You have already decided on the correctness of this solution. " +
                               "The button you just clicked had no effect.")
        return

    accepted_str = "accepted" if accepted else "rejected"
    emit("server_message", f"{name} " + accepted_str + f" {writer}'s solution!", room=room)

    if not accepted:
        rooms_info[room]['endgame']['review_status'][name][writer] = REVIEWSTATUS_ASSENTING
        emit("rejection_assent", {"rejecter": name, "writer": writer}, room=room)
    else:
        rooms_info[room]['endgame']['review_status'][name][writer] = REVIEWSTATUS_ACCEPTED
        track_decided_solution(room, writer, True)

@equations.socketio.on('assented')
def handle_rejection_assent(info):
    """Handle when a player assents to a rejection."""
    rejecter = info['rejecter']
    assented = info['assented']

    MapsLock()
    [name, room] = get_name_and_room(flask.request.sid)

    if name not in rooms_info[room]['endgame']['review_status'][rejecter] or \
            rooms_info[room]['endgame']['review_status'][rejecter][name] != REVIEWSTATUS_ASSENTING:
        emit("server_message", "You have already accepted whether or not your solution is incorrect. " +
                               "The button you just clicked had no effect.")
        return

    if assented:
        emit("server_message", f"{name} has accepted that his/her solution is incorrect.", room=room)
        rooms_info[room]['endgame']['review_status'][rejecter][name] = REVIEWSTATUS_REJECTED
        track_decided_solution(room, name, False)
        return

    assert name in rooms_info[room]['endgame']['solutions']
    reevaluate_msg = {
        "writer": name,
        "solution": rooms_info[room]['endgame']['solutions'][name],
        "rejecter": rejecter,
    }

    del rooms_info[room]['endgame']['review_status'][rejecter][name]
    emit("reevaluate_solution", reevaluate_msg, room=room)

def clean_up_finished_room(room):
    """Insert into db for room and emit message."""
    if not rooms_info[room]["game_finished"]:
        rooms_info[room]["game_finished"] = True
        db_insert(room, rooms_info[room])
        emit("game_over_clientside", room=room)

@equations.socketio.on("game_over")
def handle_game_over():
    """The game is finished now."""
    MapsLock()
    [_, room] = get_name_and_room(flask.request.sid)
    clean_up_finished_room(room)
