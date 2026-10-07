#!/bin/bash
# Launch script for Heroku

# Keep a single worker until live room state is moved out of process memory.
exec gunicorn --bind "0.0.0.0:${PORT:-8000}" --worker-class gevent --workers 1 equations:app
