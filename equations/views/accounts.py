# Accounts views

import uuid
import hashlib
import flask
import equations
from equations.models import User


def compute_hashed_password(salt, password):
    """Will return hashed password given the salt and raw password."""
    algorithm = 'sha512'
    hash_obj = hashlib.new(algorithm)
    salted_password = salt + password
    hash_obj.update(salted_password.encode('utf-8'))
    return hash_obj.hexdigest()


def password_correct(stored_pw_hash, password):
    """Check the given password against the stored hashed pw for username."""
    pw_parts = stored_pw_hash.split('$')
    salt = pw_parts[1]
    hashed_pw = pw_parts[2]
    entered_final_pw_hash = compute_hashed_password(salt, password)
    if entered_final_pw_hash != hashed_pw:
        return False
    return True


@equations.app.route('/login/', methods=['GET', 'POST'])
def show_login():
    """Display /login/ route."""
    if flask.request.method == 'POST':
        user = flask.request.form['username']
        password = flask.request.form['password']

        users = User.query.filter_by(username=user).all()
        if len(users) == 0:
            flask.flash(f"User with name {user} not found!")
            return flask.render_template("login.html")
        
        assert len(users) == 1
        stored_pw_hash = users[0].password

        if not password_correct(stored_pw_hash, password):
            flask.flash("Incorrect password!")
            return flask.render_template("login.html")

        flask.session['username'] = flask.request.form['username']

    if 'username' in flask.session:
        return flask.redirect(flask.url_for('show_index'))

    return flask.render_template("login.html")


@equations.app.route('/logout/')
def show_logout():
    """Display /logout/ route."""
    flask.session.clear()
    return flask.redirect(flask.url_for('show_index'))


@equations.app.route('/create_account/', methods=['GET', 'POST'])
def show_create():
    """Display /create_account/ route."""
    if 'username' in flask.session:
        return flask.redirect(flask.url_for('show_index'))

    if flask.request.method == 'POST':
        username = flask.request.form['username']
        if len(username) == 0:
            flask.flash("Username cannot be empty!")
            return flask.render_template("create.html")
        
        if ' ' in username:
            flask.flash("Username cannot have spaces!")
            return flask.render_template("create.html")
        
        if len(username) > 20:
            flask.flash("Username cannot be longer tahn than 20 characters.")
            return flask.render_template("create.html")

        password = flask.request.form['password']
        if not password:
            flask.flash("You must provide a password!")
            return flask.render_template("create.html")

        conflicting_users = User.query.filter_by(username=username).all()
        if len(conflicting_users) > 0:
            flask.flash("A user with that username already exists!")
            return flask.render_template("create.html")

        # Compute Password Hash
        salt = uuid.uuid4().hex
        password_hash = compute_hashed_password(salt, password)
        password_db_string = "$".join(['sha512', salt, password_hash])

        new_user = User(username=username, password=password_db_string)
        equations.db.session.add(new_user)
        equations.db.session.commit()

        flask.session['username'] = username
        return flask.redirect(flask.url_for('show_index'))
    
    return flask.render_template("create.html")
