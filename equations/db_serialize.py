"""Helper functions to serialize and deserialize input/output to db."""

import json
import equations
from equations.models import Game

def db_insert(room, game_info):
    """Serialize game info and add to DB."""
    print("calling db insert!")

    ended = 1 if game_info["game_finished"] else 0
    assert ended == 1

    games = Game.query.filter_by(nonce=room).all()
    assert len(games) == 1
    game = games[0]

    game.ended = ended
    game.players = game_info["players"]
    game.p1scores = game_info["p1scores"]    
    game.p2scores = game_info["p2scores"]
    game.p3scores = game_info["p3scores"]
    game.cube_index = game_info["cube_index"]
    game.resources = game_info["resources"]
    game.goal = game_info["goal"]
    game.required = game_info["required"]
    game.permitted = game_info["permitted"]
    game.forbidden = game_info["forbidden"]
    game.turn = game_info["turn"]

    equations.db.session.add(game)
    equations.db.session.commit()

def db_deserialize(db_result):
    """Translate db result to game_info dict. Kinda dupe down there."""
    game_info = {
        "game_started": db_result.cube_index is not None,
        "game_finished": db_result.ended,
        "players": db_result.players,
        "spectators": [],
        "sockets": [],
        "p1scores": db_result.p1scores,
        "p2scores": db_result.p2scores,
        "p3scores": db_result.p3scores,
        "starttime": json.dumps(db_result.created, sort_keys=True, default=str),  
        "cube_index": db_result.cube_index,
        "resources":  db_result.resources,
        "goal":  db_result.goal,
        "required":  db_result.required,
        "permitted":  db_result.permitted,
        "forbidden":  db_result.forbidden, 
        "turn":  db_result.turn,
        "goalset": len(db_result.goal) > 0,
        "num_timer_flips": 0,
        "10s_warning_called": False,
        "challenge": None,
        "touched_cube": None,
        "bonus_clicked": False,
        "started_move": False,
        "endgame": None,
        "shake_ongoing": False,
    }

    return game_info
