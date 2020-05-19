"""Helper functions to serialize and deserialize input/output to db."""

import equations
import json

def db_insert(room, game_info):
    """Serialize game info and add to DB."""
    print("calling db insert!")

    ended = 1 if game_info["game_finished"] else 0
    assert ended == 1

    players = json.dumps(game_info["players"])
    p1scores = json.dumps(game_info["p1scores"])
    p2scores = json.dumps(game_info["p2scores"])
    p3scores = json.dumps(game_info["p3scores"])
    cube_index = json.dumps(game_info["cube_index"])
    resources = json.dumps(game_info["resources"])
    goal = json.dumps(game_info["goal"])
    required = json.dumps(game_info["required"])
    permitted = json.dumps(game_info["permitted"])
    forbidden = json.dumps(game_info["forbidden"])
    turn = game_info["turn"]

    connection = equations.model.get_db()
    connection.execute(
        "UPDATE games "
        f"SET ended={ended}, players=\'{players}\', p1scores=\'{p1scores}\', "
        f"p2scores=\'{p2scores}\', p3scores=\'{p3scores}\', cube_index=\'{cube_index}\', "
        f"resources=\'{resources}\', goal=\'{goal}\', required=\'{required}\', "
        f"permitted=\'{permitted}\', forbidden=\'{forbidden}\', turn={turn} "
        f"WHERE nonce=\'{room}\'"
    )

def db_deserialize(db_result):
    """Translate db result to game_info dict. Kinda dupe down there."""
    game_info = {
        "game_started": db_result["cube_index"] is not None,
        "game_finished": db_result["ended"],
        "players": json.loads(db_result["players"]),
        "spectators": [],
        "sockets": [],
        "p1scores": json.loads(db_result["p1scores"]),
        "p2scores": json.loads(db_result["p2scores"]),
        "p3scores": json.loads(db_result["p3scores"]),
        "starttime": 0,  # TODO may need to change
        "cube_index": json.loads(db_result["cube_index"]),
        "resources":  json.loads(db_result["resources"]),
        "goal":  json.loads(db_result["goal"]),
        "required":  json.loads(db_result["required"]),
        "permitted":  json.loads(db_result["permitted"]),
        "forbidden":  json.loads(db_result["forbidden"]), 
        "turn":  db_result["turn"],
        "goalset": len(db_result["goal"]) > 0,
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
