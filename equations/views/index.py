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
    print("HELLO 1")
    if context['username'] in user_info:
        print("HELLO 2")
        gamerooms = user_info[context['username']]["gamerooms"]
        print("GAMEROOMS: ", gamerooms)
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

    return flask.redirect(flask.url_for('show_game', nonce=game_nonce, name=name))

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
    room_id = flask.request.form['room']

    MapsLock()
    if not get_game_from_db(room_id):
        flask.flash(f"The Room ID you entered ({room_id}) does not exist!")
        return flask.redirect(flask.url_for('show_index'))

    return flask.redirect(flask.url_for('show_game', nonce=room_id, name=name))

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
