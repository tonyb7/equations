#!/bin/bash

export FLASK_DEBUG=TRUE
export FLASK_APP=equations
export EQ_SETTINGS=config.py
export DATABASE_URL="postgres:///eq_dev"
export SECRET_KEY=$'ND\xc5\xe1\xb4\xaf\xdaG?-`\x19\xd9\xd2\xea\x80<\x10\x89\x12\xba\x0e>u'  # dev secret key

