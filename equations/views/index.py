"""Show the homepage."""

import os
import uuid
import copy
import flask
import equations
from equations.data import rooms_info, user_info, MapsLock
from equations.models import Game


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

    # Generate a list of the rooms a user is currently in.
    MapsLock()
    if context['username'] in user_info:
        gamerooms = list(user_info[context['username']]["latest_socketids"].keys())
        print(f"Rooms user {context['username']} is currently in: ", gamerooms)

        for gameroom in gamerooms:
            if gameroom in rooms_info and rooms_info[gameroom]["game_started"] \
                    and not rooms_info[gameroom]["game_finished"] \
                    and context['username'] in rooms_info[gameroom]['players']:
                context["gamerooms"].append(gameroom)

    return flask.render_template("index.html", **context)

def generate_gameid():
    # Generate a unique game id
    game_nonce = None
    while game_nonce is None:
        # Warning/Notice: Only 36^4 (about 1.68 million) unique game 
        # nonces under this scheme
        proposed_nonce = str(uuid.uuid4()).replace('-', '')[:4].upper()

        conflicting_games = Game.query.filter_by(nonce=proposed_nonce).all()
        if len(conflicting_games) == 0:
            game_nonce = proposed_nonce
    assert game_nonce not in rooms_info

    return game_nonce

@equations.app.route("/create/", methods=['POST'])
def create_game():
    """Create a new game."""
    if 'username' not in flask.session:
        flask.flash("Please log in before creating a game.")
        return flask.redirect(flask.url_for('show_index'))

    name = flask.session['username']
    game_nonce = generate_gameid()

    # TODO: These if-elif statements are kind of ugly, but not sure how else to
    # encode info from the forms
    gametype = None
    division = None
    if flask.request.form['create'] == "Create Equations Game":
        gametype = 'eq'
    elif flask.request.form['create'] == "Without Restrictions": 
        gametype = 'os'
        division = 'Basic'
    elif flask.request.form['create'] == "With Restrictions":
        gametype = 'os'
    else:
        flask.flash("Tried to create an invalid type of game (type must be Equations or On-Sets)")
        return flask.redirect(flask.url_for('show_index'))

    # Commit the game to the database
    print(f"ADDING GAME {game_nonce} TO THE DATABASE")
    new_game = Game(nonce=game_nonce, gametype=gametype, division=division, ended=False, players=[name])
    equations.db.session.add(new_game)
    equations.db.session.commit()

    return flask.redirect(flask.url_for('show_game', nonce=game_nonce))

@equations.app.route("/join/", methods=['POST'])
def join_game():
    """Join an existing game."""
    if 'username' not in flask.session:
        flask.flash("Please log in before joining a game.")
        return flask.redirect(flask.url_for('show_index'))
    
    name = flask.session['username']
    room = flask.request.form['room'].upper()

    game_info = Game.query.filter_by(nonce=room).first()
    if game_info is None:
        flask.flash(f"A room with the ID you entered ({room}) does not exist!")
        return flask.redirect(flask.url_for('show_index'))
    
    # Perform checks to see if it is possible to join as a player
    if flask.request.form['join'] == "Join as Player":
        if name not in game_info.players:
            if game_info.tournament is not None:
                flask.flash(f"The room you tried to join ({room}) is part of a tournament, "
                            " so you cannot join as player!")
                return flask.redirect(flask.url_for('show_index'))

            game_started = len(game_info.cube_index) > 0

            if game_started or game_info.ended or len(game_info.players) >= 3:
                flask.flash(f"You cannot join as a player in that room ({room}) "
                         "because either the game has started, the game has ended,  "
                         "or there are already 3 players in it.")
                return flask.redirect(flask.url_for('show_index'))
            
            # At this point, it is possible to join as a player. 
            # Add this user as a player in this game, and commit to the database.
            player_list = copy.deepcopy(game_info.players)
            player_list.append(name)
            game_info.players = player_list
            equations.db.session.commit()
    
    return flask.redirect(flask.url_for('show_game', nonce=room))

@equations.app.route("/game/<nonce>/", methods=['GET'])
def show_game(nonce):
    """Show the game with nonce nonce."""
    if 'username' not in flask.session:
        flask.flash("Please log in before joining a game.")
        return flask.redirect(flask.url_for('show_index'))
    
    name = flask.session['username']
    room = nonce

    # Ensure that the game exists
    game_info = Game.query.filter_by(nonce=room).first()
    if game_info is None:
        flask.flash(f"The Room you tried to visit (ID of {room}) does not exist!")
        return flask.redirect(flask.url_for('show_index'))
    
    context = {
        "nonce": nonce,
        "name": name,
        "division": game_info.division if game_info.division else '',
    }

    if game_info.gametype is None or game_info.gametype == 'eq':
        return flask.render_template("game.html", **context)
    if game_info.gametype == 'os':
        return flask.render_template("game_onsets.html", **context)
        
    flask.flash("Tried to visit a game of invalid type (type must be eq or os)")
    return flask.redirect(flask.url_for('show_index')) 

