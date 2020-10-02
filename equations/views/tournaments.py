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
        
        new_tour = Tournaments(id=tourid, name=tourname, group_id=groupid, groups=[groupid])
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
        "unassigned": [],
        "tables": [] if "tables" not in tournament.table_info else tournament.table_info["tables"],
        "can_register": False if tournament.players is None else 
            'username' in flask.session and flask.session['username'] not in tournament.players,
        "can_deregister": False if tournament.players is None else 
            'username' in flask.session and flask.session['username'] in tournament.players,
    }

    return context

def create_table(tourid, tournament, players, new_table):
    gameid = generate_gameid()
    new_table["gameid"] = gameid

    new_game = Game(nonce=gameid, ended=False, players=players, tournament=tourid)
    equations.db.session.add(new_game)

    table_info = copy.deepcopy(tournament.table_info)
    print("table info: ", table_info)
    if "tables" not in table_info:
        table_info["tables"] = []
    
    print("here 1")

    table_info["tables"].append(new_table)
    tournament.table_info = table_info

    print("here 2")

    equations.db.session.commit()

    print("here 3")


def update_table(tourid, tournament, players, updated_table, gameid):
    game = Game.query.filter_by(nonce=gameid).first()
    assert game is not None

    if len(game.cube_index) > 0: # game has started
        return False
    
    game.players = players

    updated_table["gameid"] = gameid
    table_info = copy.deepcopy(tournament.table_info)
    for i, table in enumerate(table_info["tables"]):
        if table["gameid"] == gameid:
            table_info["tables"][i] = updated_table
            break
    tournament.table_info = table_info

    equations.db.session.commit()
    return True

def delete_table(tourid, tournament, players, gameid):
    game = Game.query.filter_by(nonce=gameid).first()
    assert game is not None

    if len(game.cube_index) > 0: # game has started
        return False
    
    equations.db.session.delete(game)

    table_info = copy.deepcopy(tournament.table_info)
    table_info["tables"] = [table for table in table_info["tables"] if table["gameid"] != gameid]
    tournament.table_info = table_info

    equations.db.session.commit()
    return True

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
            table_info = {
                "player1": players[0],
                "player2": players[1] if len(players) > 1 else "",
                "player3": players[2] if len(players) > 2 else "",
                "gameid": None,
            }

            if "create_table" in flask.request.form:
                create_table(tourid, tournament, players, table_info)
                flask.flash("Successfully created a new table!")
            elif "update_table" in flask.request.form:
                if not update_table(tourid, tournament, players, table_info, flask.request.form["gameid"]):
                    flask.flash(f"Could not update players for game {flask.request.form['gameid']} since that game has started!")
                else:
                    flask.flash(f"Successfully updated players for game {flask.request.form['gameid']}")
            elif "delete_table" in flask.request.form:
                if not delete_table(tourid, tournament, players, flask.request.form["gameid"]):
                    flask.flash(f"Could not delete game {flask.request.form['gameid']} since that game has started!")
                else:
                    flask.flash(f"Successfully deleted game {flask.request.form['gameid']}")
    
    context = construct_tournament_context(tournament, group, True)

    # The rest of this function is code to generate unassigned messages to help the 
    # tournament editor see who is yet to be assigned from which group, and
    # whether that player has registered for the tournament or not.

    player_keys = ["player1", "player2", "player3"]
    assigned = []
    for table in context["tables"]:
        for key in player_keys:
            if len(table[key]) > 0:
                assigned.append(table[key])
    
    assigned_set = set(assigned)
    registered_set = set(tournament.players)

    assignment_info = []
    for tournament_group_id in tournament.groups:
        tournament_group = Groups.query.filter_by(id=tournament_group_id).first()
        if tournament_group is None:
            continue
        
        unassigned_from_group = set(tournament_group.players["players"]).difference(assigned_set)
        unregistered_unassigned = unassigned_from_group.difference(registered_set)
        registered_unassigned = unassigned_from_group.difference(unregistered_unassigned)
        
        registered_info = {
            "label": f"Unassigned registered players from {tournament_group.name}",
            "unassigned": ', '.join(list(registered_unassigned)) if len(registered_unassigned) > 0 else 'None',    
        }
        assignment_info.append(registered_info)

        unregistered_info = {
            "label": f"Unassigned unregistered players from {tournament_group.name}",
            "unassigned": ', '.join(list(unregistered_unassigned)) if len(unregistered_unassigned) > 0 else 'None',    
        }
        assignment_info.append(unregistered_info)

    context["unassigned"] = assignment_info

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

@equations.app.route("/tournament_register/", methods=['POST'])
def tournament_register():
    if 'username' not in flask.session:
        flask.flash("Please log in before registering for a tournament.")
        return flask.redirect(flask.url_for('show_index'))
        
    tourid = flask.request.form['tourid']

    tournament = Tournaments.query.filter_by(id=tourid).first()
    if tournament is None:
        flask.flash(f"Tried to register for tournament with ID {tourid}, but tournament doesn't exist!")
        return flask.redirect(flask.url_for('show_index'))

    player_list = copy.deepcopy(tournament.players)
    if flask.session['username'] not in player_list:
        player_list.append(flask.session['username'])
    tournament.players = player_list

    equations.db.session.commit()

    return flask.redirect(flask.url_for('show_tournament', tourid=tourid))

@equations.app.route("/tournament_deregister/", methods=['POST'])
def tournament_deregister():
    if 'username' not in flask.session:
        flask.flash("Please log in before deregistering from a tournament.")
        return flask.redirect(flask.url_for('show_index'))

    tourid = flask.request.form['tourid']
    
    tournament = Tournaments.query.filter_by(id=tourid).first()
    if tournament is None:
        flask.flash(f"Tried to deregister from tournament with ID {tourid}, but tournament doesn't exist!")
        return flask.redirect(flask.url_for('show_index'))

    player_list = copy.deepcopy(tournament.players)
    player_list.remove(flask.session['username'])
    tournament.players = player_list

    equations.db.session.commit()
    
    return flask.redirect(flask.url_for('show_tournament', tourid=tourid))

@equations.app.route("/modify_tournament_groups/", methods=['POST'])
def modify_tournament_groups():
    tourid = flask.request.form['tourid']
    tournament = Tournaments.query.filter_by(id=tourid).first()
    if tournament is None: 
        flask.flash(f"Tried to add or remove groups from tournament with ID {tourid}, tournament doesn't exist!")
        return flask.redirect(flask.url_for('show_index'))

    group = Groups.query.filter_by(id=tournament.group_id).first()
    assert group is not None

    if 'username' not in flask.session or flask.session['username'] not in group.owners['owners']:
        flask.flash("You must be logged in as an owner of the group which owns the tournament to add or remove groups")
        return flask.redirect(flask.url_for('show_tournament', tourid=tourid))
    
    groupid = flask.request.form['groupid']
    group_to_modify = Groups.query.filter_by(id=groupid).first()
    if group_to_modify is None:
        flask.flash(f"You tried to add or remove a group with ID {groupid} to tournament "
                    f"{tourid} but a group with that ID doesn't exist!")
        return flask.redirect(flask.url_for('edit_tournament', tourid=tourid))

    group_list = copy.deepcopy(tournament.groups)
    if 'add_group' in flask.request.form:
        if groupid not in group_list:
            group_list.append(groupid)
        flask.flash(f"Successfully added group {groupid} to this tournament")
    elif 'remove_group' in flask.request.form:
        group_list.remove(groupid)
        flask.flash(f"Successfully removed group {groupid} from this tournament")
    tournament.groups = group_list
    
    equations.db.session.commit()

    return flask.redirect(flask.url_for('edit_tournament', tourid=tourid))

