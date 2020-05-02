PRAGMA foreign_keys = ON;

CREATE TABLE games(
    nonce VARCHAR(20) NOT NULL, 
    started INTEGER, 
    players TEXT, 
    spectators TEXT,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(nonce)
);

CREATE TABLE states(
    nonce VARCHAR(20) NOT NULL, 
    goal TEXT, 
    variations TEXT, 
    resources TEXT, 
    required TEXT, 
    permitted TEXT, 
    forbidden TEXT, 
    challenge INTEGER,
    turn INTEGER,
    FOREIGN KEY(nonce) REFERENCES games(nonce) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE scores(
    nonce VARCHAR(20) NOT NULL,
    p1score INTEGER,
    p2score INTEGER,
    p3score INTEGER,
    FOREIGN KEY(nonce) REFERENCES games(nonce) ON DELETE CASCADE ON UPDATE CASCADE
);
