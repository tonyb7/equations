# Define schemas for DB tables

import datetime
from equations import db
from sqlalchemy.dialects.postgresql import JSON


def utcnow():
    """Return UTC as a naive value for the existing database columns."""
    return datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)


def _list(value=None):
    return [] if value is None else value


def _dict(value=None):
    return {} if value is None else value


class User(db.Model):
    """Represents a registered user."""
    __tablename__ = 'users'

    username = db.Column(db.String(20), primary_key=True)
    password = db.Column(db.String(), nullable=False)
    created = db.Column(db.DateTime, default=utcnow)

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
    created = db.Column(db.DateTime, default=utcnow)

    def __init__(self, nonce, gametype='eq', division=None, ended=False, tournament=None, players=None, p1scores=None,
                 p2scores=None, p3scores=None, variations_state=None, cube_index=None, onsets_cards=None,
                 onsets_cards_dealt=0, resources=None, goal=None, required=None, permitted=None, forbidden=None,
                 turn=None, last_timer_flip=0):
        self.nonce = nonce
        self.gametype = gametype
        self.division = division
        self.ended = ended
        self.tournament = tournament
        self.players = _list(players)
        self.p1scores = _list(p1scores)
        self.p2scores = _list(p2scores)
        self.p3scores = _list(p3scores)
        self.variations_state = _dict(variations_state)
        self.cube_index = _list(cube_index)
        self.onsets_cards = _list(onsets_cards)
        self.onsets_cards_dealt = onsets_cards_dealt
        self.resources = _list(resources)
        self.goal = _list(goal)
        self.required = _list(required)
        self.permitted = _list(permitted)
        self.forbidden = _list(forbidden)
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
        self.owners = _dict(owners)
        self.players = _dict(players)
        self.tournaments = _dict(tournaments)

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

    def __init__(self, id=None, name=None, group_id=None, table_info=None, groups=None,
                 players=None):
        self.id = id
        self.name = name
        self.group_id = group_id
        self.table_info = _dict(table_info)
        self.groups = _list(groups)
        self.players = _list(players)
    
    def __repr__(self):
        return f"<Tournament {self.id}"
