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
    if string is None:
        l = []
    else:
        l = string.split(",")
    return l

def str_to_num_list(strarray):
    """Convert list of strings to list of ints."""
    ans = None
    try:
        ans = [int(x) for x in split_string_by_comma(strarray)]
    except:
        ans = []
    return ans

def db_deserialize(db_result):
    """Translate db result to game_info dict. Kinda dupe down there."""
    game_info = {
        "game_started": db_result["cube_index"] is not None,
        "game_finished": db_result["ended"],
        "players": split_string_by_comma(db_result["players"]),
        "spectators": [],
        "sockets": [],
        "p1scores": str_to_num_list(db_result["p1scores"]),
        "p2scores": str_to_num_list(db_result["p2scores"]),
        "p3scores": str_to_num_list(db_result["p3scores"]),
        "starttime": 0,  # TODO may need to change
        "cube_index": str_to_num_list(db_result["cube_index"]),
        "resources":  str_to_num_list(db_result["resources"]),
        "goal":  str_to_num_list(db_result["goal"]),
        "required":  str_to_num_list(db_result["required"]),
        "permitted":  str_to_num_list(db_result["permitted"]),
        "forbidden":  str_to_num_list(db_result["forbidden"]), 
        "turn":  db_result["turn"],
        "goalset": len(db_result["goal"]) > 0,
        "num_timer_flips": 0,
        "10s_warning_called": False,
        "challenge": None,
        "touched_cube": None,
        "bonus_clicked": False,
        "started_move": False,
        "endgame": None,
    }

    return game_info
