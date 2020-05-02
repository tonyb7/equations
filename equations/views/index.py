"""Show the homepage."""

import flask
import equations

@equations.app.route("/", methods=['GET', 'POST'])
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

@equations.app.route("/game/<nonce>/", methods=['GET'])
def show_game(nonce):
    """Show the game with nonce nonce."""
    context = {
        "nonce": nonce
    }

    return flask.render_template("game.html", **context)
