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
    tournament = db.Column(db.String())
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

    def __init__(self, nonce, ended=False, tournament=None, players=[], p1scores=[], p2scores=[],
                 p3scores=[], cube_index=[], resources=[], goal=[],
                 required=[], permitted=[], forbidden=[], turn=None):
        self.nonce = nonce
        self.ended = ended
        self.tournament = tournament
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

class Groups(db.Model):
    """A group for tournaments."""
    __tablename__ = 'groups'

    id = db.Column(db.String(), primary_key=True)
    name = db.Column(db.String())
    owners = db.Column(JSON)
    players = db.Column(JSON)
    tournaments = db.Column(JSON)

    def __init__(self, id=None, name=None, owners=None, players=None, tournaments=None):
        self.id = id
        self.name = name
        self.owners = owners
        self.players = players
        self.tournaments = tournaments

    def __repr__(self):
        return f"<Group {self.id}>"
    
class Tournaments(db.Model):
    """Represents a tournament within a group."""
    __tablename__ = 'tournaments'

    id = db.Column(db.String(), primary_key=True)
    name = db.Column(db.String())
    group_id = db.Column(db.String())
    table_info = db.Column(JSON)

    def __init__(self, id=None, name=None, group_id=None, table_info={}):
        self.id = id
        self.name = name
        self.group_id = group_id
        self.table_info = table_info
    
    def __repr__(self):
        return f"<Tournament {self.id}"

