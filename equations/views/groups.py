"""Handle groups views."""

import flask
import equations
from equations.models import Groups, Tournaments, User
import copy
import re

@equations.app.route("/groups/", methods=['GET'])
def show_groups():
    """Show a list of all existing groups."""
    if 'username' not in flask.session:
        flask.flash("Please log in before viewing groups.")
        return flask.redirect(flask.url_for('show_index'))

    groups = Groups.query.all()    
    context = {
        "groups": [],
    }

    for group in groups:
        group_dict = {
            "id": group.id,
            "name": group.name,
            "owners": ", ".join(group.owners["owners"])
        }
        context["groups"].append(group_dict)

    return flask.render_template("groups.html", **context)

def construct_group_context(group):
    """Create context var from a group retrieved from db."""
    is_owner = False
    is_player = False
    if 'username' in flask.session:
        is_owner = flask.session['username'] in group.owners["owners"]
        is_player = flask.session['username'] in group.players["players"]

    context = {
        "id": group.id,
        "name": group.name,
        "owners": ", ".join(group.owners["owners"]),
        "players": ", ".join(group.players["players"]),
        "tournaments": [],
        "can_join": not (is_owner or is_player),
        "can_leave": is_player and not is_owner,
        "is_owner": is_owner,
    }

    for tourid in group.tournaments["tournaments"]:
        tournament = Tournaments.query.filter_by(id=tourid).first()
        assert tournament is not None
        tour_dict = {
            "id": tournament.id,
            "name": tournament.name,
        }
        context["tournaments"].append(tour_dict)

    return context

@equations.app.route("/group/<group_id>/", methods=['GET', 'POST'])
def show_group(group_id):
    group = Groups.query.filter_by(id=group_id).first()
    if group is None:
        flask.flash(f"Group with ID {group_id} doesn't exist!")
        return flask.redirect(flask.url_for('show_index'))

    if flask.request.method == 'POST':
        if 'username' in flask.session and flask.session['username'] in group.owners["owners"]:
            new_owner = flask.request.form['new_owner']
            user = User.query.filter_by(username=new_owner).first()
            if user is not None:
                owners = copy.deepcopy(group.owners)
                if new_owner not in owners["owners"]:
                    owners["owners"].append(new_owner)
                group.owners = owners
                equations.db.session.commit()

    return flask.render_template("group.html", **construct_group_context(group))

@equations.app.route("/join_group/", methods=['POST'])
def join_group():
    if 'username' not in flask.session:
        flask.flash("Please log in before joining a group.")
        return flask.redirect(flask.url_for('show_index'))
        
    groupid = flask.request.form['groupid']
    print("Join group called by ", flask.session['username'], " on group ", groupid)

    group = Groups.query.filter_by(id=groupid).first()
    if group is None:
        flask.flash(f"Tried to join group with ID {group_id}, but group doesn't exist!")
        return flask.redirect(flask.url_for('show_index'))
    
    player_dict = copy.deepcopy(group.players)
    player_set = set(player_dict["players"])
    player_set.add(flask.session['username'])
    player_dict["players"] = list(player_set)
    group.players = player_dict

    equations.db.session.commit()

    return flask.redirect(flask.url_for('show_group', group_id=groupid))

@equations.app.route("/leave_group/", methods=['POST'])
def leave_group():
    if 'username' not in flask.session:
        flask.flash("Please log in before leaving a group.")
        return flask.redirect(flask.url_for('show_index'))
    
    groupid = flask.request.form['groupid']
    group = Groups.query.filter_by(id=groupid).first()
    if group is None:
        flask.flash(f"Tried to leave group with ID {group_id}, but group doesn't exist!")
        return flask.redirect(flask.url_for('show_index'))

    player_dict = copy.deepcopy(group.players)
    player_set = set(player_dict["players"])
    player_set.remove(flask.session['username'])
    player_dict["players"] = list(player_set)
    group.players = player_dict
    equations.db.session.commit()
    
    return flask.redirect(flask.url_for('show_group', group_id=groupid))

@equations.app.route("/create_group/", methods=['GET', 'POST'])
def create_group():
    if 'username' not in flask.session:
        flask.flash("Please log in before creating a group.")
        return flask.redirect(flask.url_for('show_index'))

    if flask.request.method == 'POST':
        groupname = flask.request.form['groupname']
        groupid = flask.request.form['groupid']

        id_pattern = re.compile("^[a-zA-Z0-9-_]+$")
        if id_pattern.match(groupid) is None:
            flask.flash(f"Invalid group id ({groupid}) was provided. Please try again.")
            return flask.render_template("create_group.html")
        
        existing_group = Groups.query.filter_by(id=groupid).first()
        if existing_group is not None:
            flask.flash(f"A group with id {groupid} already exists. Please choose another id.")
            return flask.render_template("create_group.html")
        
        owner_json = {
            "owners": [flask.session['username']]
        }
        player_json = {
            "players": []
        }
        tournament_json = {
            "tournaments": []
        }
        new_group = Groups(id=groupid, name=groupname, owners=owner_json, 
                           players=player_json, tournaments=tournament_json)
        equations.db.session.add(new_group)
        equations.db.session.commit()

        return flask.redirect(flask.url_for('show_group', group_id=groupid))

    return flask.render_template("create_group.html")

