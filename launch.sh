#!/bin/bash
# Launch script for Heroku

bin/equationsdb create
gunicorn -b localhost:8000 -w 2 -D equations:app
