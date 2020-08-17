"""Handle groups views."""

import flask
import equations
from equations.models import Groups

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

@equations.app.route("/group/<group_id>/", methods=['GET', 'POST'])
def show_group(group_id):
    group_info = Groups.query.filter_by(id=group_id).first()
    if group_info is None:
        flask.flash(f"Group with ID {group_id} doesn't exist!")
        return flask.redirect(flask.url_for('show_index'))
    
    context = {
        "id": group_info.id,
        "name": group_info.name,
        "owners": ", ".join(group_info.owners["owners"]),
        "players": ", ".join(group_info.players["players"]),
        "tournaments": ", ".join(group_info.tournaments["tournaments"]),
    }

    return flask.render_template("group.html", **context)
