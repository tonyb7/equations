#!/bin/bash
# Launch script for Heroku

# Launch server
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 equations:app
