#!/bin/bash

dirpath=$(dirname "$(realpath "$0")")
rootpath=$(dirname "$dirpath")

mkdir -p "$rootpath/var"

export FLASK_DEBUG="${FLASK_DEBUG:-TRUE}"
export FLASK_APP="${FLASK_APP:-equations}"
export EQ_SETTINGS="${EQ_SETTINGS:-config.py}"
export DATABASE_URL="${DATABASE_URL:-sqlite:///$rootpath/var/equations.sqlite3}"
export SECRET_KEY="${SECRET_KEY:-dev-secret-key-change-me}"
