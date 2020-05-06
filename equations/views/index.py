"""Show the homepage."""

import os
import flask
import equations
from equations.data import can_create_room, rooms_info
import uuid
from equations.views.networking import can_create_room

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
    }

    if "username" in flask.session:
        context['logged_in'] = True
        context['username'] = flask.session['username']

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
        proposed_nonce = str(uuid.uuid4())[:12]
        game_nonce_dict = connection.execute(
            "SELECT nonce FROM games "
            f"WHERE nonce=\'{proposed_nonce}\'"
        ).fetchone()

        if game_nonce_dict is None:
            game_nonce = proposed_nonce

    if not can_create_room(name):
        flask.flash("You are already in a game, so you cannot create another.")
        return flask.redirect(flask.url_for('show_index'))

    connection.execute(
        "INSERT INTO games(nonce, ended) "
        f"VALUES(\'{game_nonce}\', 0);"
    )

    return flask.redirect(flask.url_for('show_game', nonce=game_nonce, name=name))

@equations.app.route("/join/", methods=['POST'])
def join_game():
    """Join an existing game."""
    if 'username' not in flask.session:
        flask.flash("Please log in before creating a game.")
        return flask.redirect(flask.url_for('show_index'))
        
    name = flask.session['username']
    room_id = flask.request.form['room']
    connection = equations.model.get_db()

    game_info = connection.execute(
        "SELECT * FROM games "
        f"WHERE nonce=\'{room_id}\'"
    ).fetchone()

    if game_info is None:
        flask.flash(f"The Room ID you entered ({room_id}) does not exist!")
        return flask.redirect(flask.url_for('show_index'))

    if game_info['ended'] and room_id not in rooms_info:
        rooms_info[room_id] = { 
            # TODO parse game_info
        }

    return flask.redirect(flask.url_for('show_game', nonce=room_id, name=name))

@equations.app.route("/game/<nonce>/", methods=['GET'])
def show_game(nonce):
    """Show the game with nonce nonce."""
    if not flask.request.referrer:
        flask.flash("Please join a game by clicking \"Join Existing Game\"")
        return flask.redirect(flask.url_for('show_index'))

    base_url = equations.app.config["BASE_URL"]
    context = {
        "nonce": nonce,
        "name": flask.session['username'],
        "shareable_url": base_url + "/game/" + nonce,
    }

    return flask.render_template("game.html", **context)
