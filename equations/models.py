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
    gametype = db.Column(db.String()) # Options: eq, os,
    division = db.Column(db.String()) # Currently 'Basic' used for os. None by default.
    ended = db.Column(db.Boolean, nullable=False)
    tournament = db.Column(db.String())
    players = db.Column(JSON)
    p1scores = db.Column(JSON)
    p2scores = db.Column(JSON)
    p3scores = db.Column(JSON)
    variations_state = db.Column(JSON) # variations of the most recent shake
    cube_index = db.Column(JSON)
    onsets_cards = db.Column(JSON)
    onsets_cards_dealt = db.Column(db.Integer)
    resources = db.Column(JSON)
    goal = db.Column(JSON)
    required = db.Column(JSON)
    permitted = db.Column(JSON)
    forbidden = db.Column(JSON)
    turn = db.Column(db.Integer)
    last_timer_flip = db.Column(db.Float)
    created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def __init__(self, nonce, gametype='eq', division=None, ended=False, tournament=None, players=[], p1scores=[], p2scores=[],
                 p3scores=[], variations_state = {}, cube_index=[], onsets_cards=[], onsets_cards_dealt=0, resources=[], goal=[],
                 required=[], permitted=[], forbidden=[], turn=None, last_timer_flip=0):
        self.nonce = nonce
        self.gametype = gametype
        self.division = division
        self.ended = ended
        self.tournament = tournament
        self.players = players
        self.p1scores = p1scores
        self.p2scores = p2scores
        self.p3scores = p3scores
        self.variations_state = variations_state
        self.cube_index = cube_index
        self.onsets_cards = onsets_cards
        self.onsets_cards_dealt = onsets_cards_dealt
        self.resources = resources
        self.goal = goal
        self.required = required
        self.permitted = permitted
        self.forbidden = forbidden
        self.turn = turn
        self.last_timer_flip = last_timer_flip

    def __repr__(self):
        return f"<Game {self.nonce}>"

class Groups(db.Model):
    """A group describes a set of players under a number of coaches. For example,
    there can be a Tappan AG group, or a Nationals 2021 group. Tournaments right
    now can only be created under a group. For example, for a Saturday tournament, 
    a coach can create a group named 'Region B Middle' and create a tournament 
    within that group called 'December Saturday Tournament'."""
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
    """Represents a tournament within a group. Tournaments are created by the 
    group's owners. Only members of a group can participate in a group's 
    tournament. Database describes information about the tournament's id, name, 
    and group, as well as the tables and games within the tournament."""
    __tablename__ = 'tournaments'

    id = db.Column(db.String(), primary_key=True)
    name = db.Column(db.String())
    group_id = db.Column(db.String())
    table_info = db.Column(JSON)
    groups = db.Column(JSON) # ids of groups included in this tournament
    players = db.Column(JSON) # players who have signed up

    def __init__(self, id=None, name=None, group_id=None, table_info={}, groups=[],
                 players = []):
        self.id = id
        self.name = name
        self.group_id = group_id
        self.table_info = table_info
        self.groups = groups
        self.players = players
    
    def __repr__(self):
        return f"<Tournament {self.id}"

