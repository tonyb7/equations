"""Helper functions to serialize and deserialize input/output to db."""

import equations

def db_insert(room, game_info):
    """Serialize game info and add to DB."""
    print("calling db insert!")

    ended = 1 if game_info["game_finished"] else 0
    assert ended == 1

    players = ",".join(game_info["players"])
    p1scores = ",".join(str(x) for x in game_info["p1scores"])
    p2scores = ",".join(str(x) for x in game_info["p2scores"])
    p3scores = ",".join(str(x) for x in game_info["p3scores"])
    cube_index = ",".join(str(x) for x in game_info["cube_index"])
    resources = ",".join(str(x) for x in game_info["resources"])
    goal = ",".join(str(x) for x in game_info["goal"])
    required = ",".join(str(x) for x in game_info["required"])
    permitted = ",".join(str(x) for x in game_info["permitted"])
    forbidden = ",".join(str(x) for x in game_info["forbidden"])
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

def split_string_by_comma(string):
    """Split a string by commas."""
    l = None
    if len(string) == 0:
        l = []
    else:
        l = string.split(",")
    return l

def db_deserialize(db_result):
    """Translate db result to game_info dict. Kinda dupe down there."""
    game_info = {
        "game_started": len(db_result["cube_index"]) > 0,
        "game_finished": db_result["ended"],
        "players": split_string_by_comma(db_result["players"]),
        "spectators": [],
        "sockets": [],
        "p1scores": [int(x) for x in split_string_by_comma(db_result["p1scores"])],
        "p2scores": [int(x) for x in split_string_by_comma(db_result["p2scores"])],
        "p3scores": [int(x) for x in split_string_by_comma(db_result["p3scores"])],
        "starttime": 0,  # TODO may need to change
        "cube_index": [int(x) for x in split_string_by_comma(db_result["cube_index"])],
        "resources":  [int(x) for x in split_string_by_comma(db_result["resources"])],
        "goal":  [int(x) for x in split_string_by_comma(db_result["goal"])],
        "required":  [int(x) for x in split_string_by_comma(db_result["required"])],
        "permitted":  [int(x) for x in split_string_by_comma(db_result["permitted"])],
        "forbidden":  [int(x) for x in split_string_by_comma(db_result["forbidden"])], 
        "turn":  db_result["turn"],
        "touched_cube": None,
        "goalset": len(db_result["goal"]) > 0,
        "num_timer_flips": 0,
        "10s_warning_called": False,
    }

    return game_info
