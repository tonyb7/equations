"""Show the homepage."""

import os
import uuid
import flask
import equations
from equations.data import rooms_info, user_info, MapsLock
from equations.db_serialize import db_deserialize

@equations.app.route("/favicon.ico")
def show_favicon():
    """Deliver the favicon asset."""
    return flask.send_from_directory(os.path.join(
        equations.app.root_path, 'static', 'images'), 'favicon.ico')

@equations.app.route("/", methods=['GET'])
def show_index():
    """Show homepage."""
    context = {
        "logged_in": False,
        "username": '',
        "gamerooms": [],
    }

    if "username" in flask.session:
        context['logged_in'] = True
        context['username'] = flask.session['username']

    MapsLock()
    if context['username'] in user_info:
        gamerooms = user_info[context['username']]["gamerooms"]
        for gameroom in gamerooms:
            if gameroom in rooms_info and rooms_info[gameroom]["game_started"] \
                    and not rooms_info[gameroom]["game_finished"]:
                context["gamerooms"].append(gameroom)

    return flask.render_template("index.html", **context)    

@equations.app.route("/create/", methods=['POST'])
def create_game():
    """Create a new game."""
    if 'username' not in flask.session:
        flask.flash("Please log in before creating a game.")
        return flask.redirect(flask.url_for('show_index'))

    name = flask.session['username']
    connection = equations.model.get_db()

    # This is ugly and might break if enough games are played
    game_nonce = None
    while game_nonce is None:
        # Warning/Notice: Only 36^4 (about 1.68 million) unique game 
        # nonces under this scheme
        proposed_nonce = str(uuid.uuid4()).replace('-', '')[:4].upper()
        game_nonce_dict = connection.execute(
            "SELECT nonce FROM games "
            f"WHERE nonce=\'{proposed_nonce}\'"
        ).fetchone()

        if game_nonce_dict is None:
            game_nonce = proposed_nonce

    connection.execute(
        "INSERT INTO games(nonce, ended) "
        f"VALUES(\'{game_nonce}\', 0);"
    )

    # This is a new game room and players joins as player by default
    assert game_nonce not in rooms_info
    rooms_info[game_nonce] = {
        "game_started": False,
        "game_finished": False,
        "players": [name],
        "spectators": [],
        "sockets": [],
    }

    if name not in user_info:
        user_info[name] = {
            "latest_socketids": {},
            "gamerooms": set(),
            "room_modes": {},
        }
    else:
        assert game_nonce not in user_info[name]["latest_socketids"].keys()
        assert game_nonce not in user_info[name]['gamerooms']
        assert game_nonce not in user_info[name]["room_modes"].keys()
    
    user_info[name]["latest_socketids"][game_nonce] = []
    user_info[name]['gamerooms'].add(game_nonce)
    user_info[name]['room_modes'][game_nonce] = equations.data.PLAYER_MODE

    return flask.redirect(flask.url_for('show_game', nonce=game_nonce))

def get_game_from_db(room_id):
    """Helper function to get a game from the DB and do checks on it.
    Returns whether game was found."""
    connection = equations.model.get_db()
    game_info = connection.execute(
        "SELECT * FROM games "
        f"WHERE nonce=\'{room_id}\'"
    ).fetchone()

    if game_info is None:
        return False

    if game_info['ended'] and room_id not in rooms_info:
        rooms_info[room_id] = db_deserialize(game_info)

    return True

@equations.app.route("/join/", methods=['POST'])
def join_game():
    """Join an existing game."""
    if 'username' not in flask.session:
        flask.flash("Please log in before creating a game.")
        return flask.redirect(flask.url_for('show_index'))

    name = flask.session['username']
    room = flask.request.form['room']

    MapsLock()
    if not get_game_from_db(room):
        flask.flash(f"The Room ID you entered ({room}) does not exist!")
        return flask.redirect(flask.url_for('show_index'))

    if flask.request.form['join'] == "Join as Player":
        if not (name in rooms_info[room]["players"] and not rooms_info[room]["game_finished"]):
            if rooms_info[room]["game_started"] or len(rooms_info[room]["players"]) >= 3:
                flask.flash(f"You cannot join as a player in that room ({room}) "
                         "because either the game has started, the game has ended, "
                         "or there are already 3 players in it.")
                return flask.redirect(flask.url_for('show_index'))
    else:
        assert flask.request.form['join'] == "Join as Spectator"
        if name in rooms_info[room]["players"] and not rooms_info[room]["game_finished"]:
            flask.flash(f"You cannot join as a spectator in that room ({room}) "
                         "because that game has not finished and you are a player "
                         "in that room. Please join the room as a player.")
            return flask.redirect(flask.url_for('show_index'))

    if name not in user_info:
        user_info[name] = {
            "latest_socketids": {},
            "gamerooms": set(),
            "room_modes": {},
        }

    if room not in user_info[name]["latest_socketids"]: 
        user_info[name]["latest_socketids"][room] = []

    # This if is true when game_info['ended'] is 0. If the game has started, then
    # if the room is not in the rooms_info map, then by invariant the game must
    # have ended (see on_disconnect in connections.py).
    if room not in rooms_info:
        rooms_info[room] = {
            "game_started": False,
            "game_finished": False,
            "players": [],
            "spectators": [],
            "sockets": [],
        }

    if flask.request.form['join'] == "Join as Player":
        if name in rooms_info[room]["players"] and not rooms_info[room]["game_finished"]:
            user_info[name]["room_modes"][room] = equations.data.REJOINED_MODE

        elif rooms_info[room]["game_started"] or len(rooms_info[room]["players"]) >= 3:
            assert False

        else:
            assert name not in rooms_info[room]["players"]
            rooms_info[room]["players"].append(name)
            user_info[name]["room_modes"][room] = equations.data.PLAYER_MODE
        
        user_info[name]["gamerooms"].add(room)
        
    else:
        if name in rooms_info[room]["players"] and not rooms_info[room]["game_finished"]:
            assert False
    
        rooms_info[room]["spectators"].append(name)
        user_info[name]["room_modes"][room] = equations.data.SPECTATOR_MODE

    return flask.redirect(flask.url_for('show_game', nonce=room))

@equations.app.route("/game/<nonce>/", methods=['GET'])
def show_game(nonce):
    """Show the game with nonce nonce."""
    if not flask.request.referrer:
        flask.flash("Please join a game by clicking \"Join Existing Game\"")
        return flask.redirect(flask.url_for('show_index'))

    # When a spectator spectates a finished game and the last socket connection 
    # disconnects, on_disconnect in connections.py deletes the room from the room_info,
    # and then a refresh bypasses join_game in index.py and goes directly to show_game
    # See Issue #18 on GitHub
    MapsLock()
    if nonce not in rooms_info:
        if not get_game_from_db(nonce):
            flask.flash(f"The Room you tried to visit (ID of {nonce}) does not exist!")
            return flask.redirect(flask.url_for('show_index'))

    context = {
        "nonce": nonce,
        "name": flask.session['username'],
    }

    return flask.render_template("game.html", **context)
