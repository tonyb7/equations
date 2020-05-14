#!/bin/bash
# Launch script for Heroku

bin/equationsdb create
gunicorn -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker -w 1 equations:app

