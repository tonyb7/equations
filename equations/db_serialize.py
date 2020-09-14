"""Helper functions to serialize and deserialize input/output to db."""

import json
import equations
from equations.models import Game

def db_insert(room, game_info):
    """Serialize game info and add to DB."""
    print("calling db insert!")

    ended = 1 if game_info["game_finished"] else 0

    games = Game.query.filter_by(nonce=room).all()
    assert len(games) == 1
    game = games[0]

    game.ended = ended
    game.tournament = game_info["tournament"]
    game.players = game_info["players"]
    game.p1scores = game_info["p1scores"] if "p1scores" in game_info else []
    game.p2scores = game_info["p2scores"] if "p2scores" in game_info else []
    game.p3scores = game_info["p3scores"] if "p3scores" in game_info else []
    game.variations_state = game_info["variations_state"] if "variations_state" in game_info else []
    game.cube_index = game_info["cube_index"] if "cube_index" in game_info else []
    game.resources = game_info["resources"] if "resources" in game_info else []
    game.goal = game_info["goal"] if "goal" in game_info else []
    game.required = game_info["required"] if "required" in game_info else []
    game.permitted = game_info["permitted"] if "permitted" in game_info else []
    game.forbidden = game_info["forbidden"] if "forbidden" in game_info else []
    game.turn = game_info["turn"] if "turn" in game_info else None
    game.last_timer_flip = game_info["last_timer_flip"] if "last_timer_flip" in game_info else 0

    equations.db.session.add(game)
    equations.db.session.commit()

def db_deserialize(db_result):
    """Translate db result to game_info dict. Kinda dupe down there."""
    game_info = {
        "game_started": len(db_result.cube_index) > 0,
        "game_finished": db_result.ended,
        "tournament": db_result.tournament,
        "players": db_result.players,
        "spectators": [],
        "sockets": [],
        "p1scores": db_result.p1scores,
        "p2scores": db_result.p2scores,
        "p3scores": db_result.p3scores,
        "variations_state": db_result.variations_state,
        "starttime": json.dumps(db_result.created, sort_keys=True, default=str),  
        "last_timer_flip": db_result.last_timer_flip if db_result.last_timer_flip != 0 else None,
        "cube_index": db_result.cube_index,
        "resources":  db_result.resources,
        "goal":  db_result.goal,
        "required":  db_result.required,
        "permitted":  db_result.permitted,
        "forbidden":  db_result.forbidden, 
        "turn":  db_result.turn,
        "goalset": False if db_result.goal is None else len(db_result.goal) > 0,
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
