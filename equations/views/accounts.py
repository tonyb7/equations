# Accounts views

import flask
import equations


@equations.app.route("/accounts/login/", methods=['GET', 'POST'])
def show_login():
    """Display login."""
    pass
