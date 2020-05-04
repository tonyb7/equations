Online Equations Server
=======================

Academic Games online

https://www.agloa.org/equations/

Running server
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
If you gonna deploy this, don't forget to generate and replace the Flask secret key in `/equations/config.py`.
```
python3 -c "import os; print(os.urandom(24))"
```
