"""Helper functions to serialize and deserialize input/output to db."""

import equations

def db_insert(room, game_info):
    """Serialize game info and add to DB."""
    ended = 1 if game_info["game_finished"] else 0
    assert ended == 1

    players = ",".join(game_info["players"])
    p1scores = ",".join(game_info["p1scores"])
    p2scores = ",".join(game_info["p2scores"])
    p3scores = ",".join(game_info["p3scores"])
    cube_index = ",".join(game_info["cube_index"])
    resources = ",".join(game_info["resources"])
    goal = ",".join(game_info["goal"])
    required = ",".join(game_info["required"])
    permitted = ",".join(game_info["permitted"])
    forbidden = ",".join(game_info["forbidden"])
    turn = game_info["turn"]

    connection = equations.model.get_db()
    connection.execute(
        "INSERT INTO games(nonce, ended, players, p1scores, p2scores, p3scores, "
        "cube_index, resources, goal, required, permitted, forbidden, turn) "
        f"VALUES(\'{room}\', {ended}, \'{players}\', \'{p1scores}\', \'{p2scores}\', "
        f"\'{p3scores}\',  \'{cube_index}\', \'{resources}\', \'{goal}\', "
        f"\'{required}\', \'{permitted}\', \'{forbidden}\', {turn});"
    )

def db_deserialize(db_result):
    """Translate db result to game_info dict."""
    
    game_info = {
        "game_started": len(db_result["cube_index"]) > 0,
        "game_finished": db_result["ended"],
        "players": db_result["players"].split(","),
        "spectators": [],
        "sockets": [],
        "p1scores": db_result["p1scores"].split(","),
        "p2scores": db_result["p2scores"].split(","),
        "p3scores": db_result["p3scores"].split(","),
        "starttime": 0,  # TODO may need to change
        "cube_index": db_result["cube_index"].split(","),
        "resources":  db_result["resources"].split(","),
        "goal":  db_result["goal"].split(","),
        "required":  db_result["required"].split(","),
        "permitted":  db_result["permitted"].split(","),
        "forbidden":  db_result["forbidden"].split(","),
        "turn":  db_result["turn"],
        "touched_cube": None,
        "goalset": len(db_result["goal"]) > 0,
        "num_timer_flips": 0,
        "10s_warning_called": False,
    }

    return game_info
