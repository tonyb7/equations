PRAGMA foreign_keys = ON;

CREATE TABLE users(
	username VARCHAR(20) NOT NULL,
	password VARCHAR(256) NOT NULL,
	created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(username)
);

CREATE TABLE games(
    nonce VARCHAR(20) NOT NULL,
    ended INTEGER,
    players TEXT, 
    p1scores TEXT,
    p2scores TEXT,
    p3scores TEXT,
    cube_index TEXT,
    resources TEXT,
    goal TEXT,
    required TEXT,
    permitted TEXT,
    forbidden TEXT,
    turn TEXT,
    created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(nonce)
);
