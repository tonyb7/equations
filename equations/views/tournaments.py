"""Handle tournament setup."""

import re
import copy
import flask
import equations
from equations.models import Groups, Tournaments


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

@equations.app.route("/tournament/<tourid>/edit/", methods=['GET', 'POST'])
def edit_tournament(tourid):

    # TODO Implement a page for a coach to be able to assign tables
    
    return flask.render_template('edit_tournament.html', **{"tourname": tourid})

@equations.app.route("/tournament/<tourid>/", methods=['GET'])
def show_tournament(tourid):

    # TODO Implement a page where a tournament's information can be viewed
    # The table assignments, a button to view the game of each table, etc.

    tournament = Tournaments.query.filter_by(id=tourid).first()
    if tournament is None:
        flask.flash(f"Tournament with id {tourid} doesn't exist")
        return flask.redirect(flask.url_for('show_index'))
    
    return flask.render_template('tournament.html', **{"tourname": tournament.name})

