"""Handle tournament setup."""

import re
import copy
import flask
import equations
from equations.models import Groups, Tournaments, Game, User
from equations.views.index import generate_gameid


@equations.app.route("/create_tournament/<groupid>/", methods=['GET', 'POST'])
def create_tournament(groupid):
    if 'username' not in flask.session:
        flask.flash("Please log in before creating a tournament.")
        return flask.redirect(flask.url_for('show_index'))

    group = Groups.query.filter_by(id=groupid).first()
    if group is None:
        flask.flash(f"Cannot create a tournament for a non-existent group {groupid}!")
        return flask.redirect(flask.url_for('show_index'))
    
    if flask.session['username'] not in group.owners["owners"]:
        flask.flash(f"You must be an owner of the group to create a tournament for {groupid}!")
        return flask.redirect(flask.url_for('show_index'))
    
    context = {
        "groupid": groupid,
        "groupname": group.name
    }

    if flask.request.method == 'POST':
        tourname = flask.request.form['tournamentname']
        tourid = flask.request.form['tournamentid']

        id_pattern = re.compile("^[a-zA-Z0-9-_]+$")
        if id_pattern.match(tourid) is None:
            flask.flash(f"Invalid tournament id ({tourid}) was provided. Please try again.")
            return flask.redirect(flask.url_for('create_tournament', groupid=groupid))
        
        existing_tour = Tournaments.query.filter_by(id=tourid).first()
        if existing_tour is not None:
            flask.flash(f"A tournament with id {tourid} already exists. Please choose another id.")
            return flask.redirect(flask.url_for('create_tournament', groupid=groupid))
        
        new_tour = Tournaments(id=tourid, name=tourname, group_id=groupid)
        equations.db.session.add(new_tour)

        tournament_dict = copy.deepcopy(group.tournaments)
        tournament_dict["tournaments"].append(tourid)
        group.tournaments = tournament_dict
        equations.db.session.commit()

        return flask.redirect(flask.url_for('edit_tournament', tourid=tourid))

    return flask.render_template('create_tournament.html', **context)

def construct_tournament_context(tournament, group, editor):
    context = {
        "tourid": tournament.id,
        "tourname": tournament.name,
        "groupname": group.name,
        "editor": editor,
        "owner": 'username' in flask.session and flask.session['username'] in group.owners["owners"],
        "unassigned": "None",
        "tables": [] if "tables" not in tournament.table_info else tournament.table_info["tables"],
    }

    return context

@equations.app.route("/tournament/<tourid>/edit/", methods=['GET', 'POST'])
def edit_tournament(tourid):
    tournament = Tournaments.query.filter_by(id=tourid).first()
    if tournament is None:
        flask.flash(f"Tournament with id {tourid} doesn't exist")
        return flask.redirect(flask.url_for('show_index'))
    
    group = Groups.query.filter_by(id=tournament.group_id).first()
    assert group is not None

    if 'username' not in flask.session or flask.session['username'] not in group.owners["owners"]:
        flask.flash(f"You cannot edit a tournament if you are not logged in as an owner of the group which created it!")
        return flask.redirect(flask.url_for('show_tournament', tourid=tourid))
    
    if flask.request.method == 'POST':
        inputted_players = [flask.request.form["player1"], flask.request.form["player2"], flask.request.form["player3"]]
        players = []
        for player in inputted_players:
            if not player or player in players:
                continue
            user = User.query.filter_by(username=player).first()
            if user is not None:
                players.append(player)
            
        if len(players) > 0:
            gameid = generate_gameid()

            new_game = Game(nonce=gameid, ended=False, players=players, tournament=tourid)
            equations.db.session.add(new_game)
            
            new_table = {
                "player1": players[0],
                "player2": players[1] if len(players) > 1 else "",
                "player3": players[2] if len(players) > 2 else "",
                "gameid": gameid,
            }

            table_info = copy.deepcopy(tournament.table_info)
            if "tables" not in table_info:
                table_info["tables"] = []

            table_info["tables"].append(new_table)
            tournament.table_info = table_info
            equations.db.session.commit()
    
    context = construct_tournament_context(tournament, group, True)

    player_keys = ["player1", "player2", "player3"]
    assigned = []
    for table in context["tables"]:
        for key in player_keys:
            if len(table[key]) > 0:
                assigned.append(table[key])
    
    unassigned = list(set(group.players["players"]).difference(set(assigned)))
    if len(unassigned) > 0:
        context["unassigned"] = ', '.join(unassigned)

    return flask.render_template('tournament.html', **context)

@equations.app.route("/tournament/<tourid>/", methods=['GET'])
def show_tournament(tourid):
    tournament = Tournaments.query.filter_by(id=tourid).first()
    if tournament is None:
        flask.flash(f"Tournament with id {tourid} doesn't exist")
        return flask.redirect(flask.url_for('show_index'))
    
    group = Groups.query.filter_by(id=tournament.group_id).first()
    assert group is not None

    return flask.render_template('tournament.html', **construct_tournament_context(tournament, group, False))

