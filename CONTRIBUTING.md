Rules of Equations
==================
https://www.agloa.org/eq-docs/

https://agloa.org/wp-content/uploads/EqsTourRules19-20.pdf

Technology Stack
================
Server Side
- Python Flask for routing requests/serving various pages on the site
- [`flask-socketio`](https://github.com/miguelgrinberg/Flask-SocketIO) for networking (receiving messages from clients)
- See [`equations/`](https://github.com/tonyb7/equations/tree/master/equations) and [`equations/views/`](https://github.com/tonyb7/equations/tree/master/equations/views)
- See [`setup.py`](https://github.com/tonyb7/equations/blob/master/setup.py) for full list of dependencies

Client Side
- Jinja for HTML templating (see [`/equations/templates/`](https://github.com/tonyb7/equations/tree/master/equations/templates))
- CSS (see [`equations/static/css/`](https://github.com/tonyb7/equations/tree/master/equations/static/css))
- JavaScript with [socket.io](https://socket.io) ([`src/client/`](https://github.com/tonyb7/equations/tree/master/src/client))
- See [`package.json`](https://github.com/tonyb7/equations/blob/master/package.json) for full list of dependencies

Running the server
================
1. Download this repo
```
git clone https://github.com/tonyb7/equations.git
```

2. Set up a Python virtual environment (https://eecs485staff.github.io/p1-insta485-static/setup_virtual_env.html)
```
cd equations 
python3 -m venv env 
source env/bin/activate
```

3. Install Equations package
```
pip install -e .
```

4. Compile JavaScript bundle
```
npm install .
npm run build
```
 
4. Run Flask server
```
npm start # (or equivalently, ./bin/run)
```

5. Go to http://localhost:8000 in browser

# Other
If you gonna deploy this, don't forget to generate a new bytestring to replace the Flask secret key.
```
python3 -c "import os; print(os.urandom(24))"
```

	
