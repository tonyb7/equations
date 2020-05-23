# Define schemas for DB tables

import datetime
from equations import db
from sqlalchemy.dialects.postgresql import JSON

class User(db.Model):
    """Represents a registered user."""
    __tablename__ = 'users'

    username = db.Column(db.String(20), primary_key=True)
    password = db.Column(db.String(), nullable=False)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __init__(self, username, password):
        self.username = username
        self.password = password

    def __repr__(self):
        return f"<User {self.username}>"

class Game(db.Model):
    """Represents a created game."""
    __tablename__ = 'games'

    nonce = db.Column(db.String(), primary_key=True)
    ended = db.Column(db.Boolean, nullable=False)
    players = db.Column(JSON)
    p1scores = db.Column(JSON)
    p2scores = db.Column(JSON)
    p3scores = db.Column(JSON)
    cube_index = db.Column(JSON)
    resources = db.Column(JSON)
    goal = db.Column(JSON)
    required = db.Column(JSON)
    permitted = db.Column(JSON)
    forbidden = db.Column(JSON)
    turn = db.Column(db.Integer)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __init__(self, nonce, ended=False, players=None, p1scores=None, p2scores=None,
                 p3scores=None, cube_index=None, resources=None, goal=None,
                 required=None, permitted=None, forbidden=None, turn=None):
        self.nonce = nonce
        self.ended = ended
        self.players = players
        self.p1scores = p1scores
        self.p2scores = p2scores
        self.p3scores = p3scores
        self.cube_index = cube_index
        self.resources = resources
        self.goal = goal
        self.required = required
        self.permitted = permitted
        self.forbidden = forbidden
        self.turn = turn

    def __repr__(self):
        return f"<Game {nonce}>"
