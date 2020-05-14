#!/bin/bash
# Launch script for Heroku

# Create db only first time
# bin/equationsdb create

# Launch server
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 equations:app

