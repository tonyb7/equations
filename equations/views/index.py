"""Show the homepage."""

import flask
import equations
import uuid

@equations.app.route("/", methods=['GET'])
def show_index():
    """Show homepage."""
    if flask.request.method == 'POST':
        name = flask.request.form['name']
        room = flask.request.form['room']

        connection = equations.model.get_db()
        game_nonce_dict = connection.execute(
            "SELECT nonce FROM games "
            f"WHERE nonce=\'{room}\'"
        ).fetchone()

        game_nonce = None
        if game_nonce_dict is None:
            game_nonce = room
        else:
            game_nonce = game_nonce_dict['nonce']
        
        return flask.redirect(flask.url_for('show_game', nonce=game_nonce))

    return flask.render_template("index.html")

@equations.app.route("/create/", methods=['POST'])
def create_game():
    """Create a new game."""
    name = flask.request.form['name']
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

    connection.execute(
        "INSERT INTO games(nonce, started, players) "
        f"VALUES(\'{game_nonce}\', 0, \'{name}\');"
    )

    return flask.redirect(flask.url_for('show_game', nonce=game_nonce, name=name))

@equations.app.route("/join/", methods=['POST'])
def join_game():
    """Join an existing game."""
    name = flask.request.form['name']
    room_id = flask.request.form['room']
    connection = equations.model.get_db()

    game_info = connection.execute(
        "SELECT * FROM games "
        f"WHERE nonce=\'{room_id}\'"
    ).fetchone()

    if game_info is None:
        return flask.render_template("bad_join.html", room_id=room_id)

    return flask.redirect(flask.url_for('show_game', nonce=room_id, name=name))

@equations.app.route("/game/<nonce>/", methods=['GET'])
def show_game(nonce):
    """Show the game with nonce nonce."""
    base_url = equations.app.config["BASE_URL"]

    context = {
        "nonce": nonce,
        "name": flask.request.args.get('name'),
        "shareable_url": base_url + "/game/" + nonce,
    }

    return flask.render_template("game.html", **context)
