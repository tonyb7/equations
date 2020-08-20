"""Handle tournament setup."""

import flask
import equations

@equations.app.route("/create_tournament/<groupid>/", methods=['GET'])
def create_tournament(groupid):
    # TODO
    pass
