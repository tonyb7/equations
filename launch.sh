#!/bin/bash
# Launch script for Heroku

# Create db
bin/equationsdb create

# Launch server
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 equations:app

