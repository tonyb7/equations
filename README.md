Online Equations Server
=======================

Academic Games online

https://www.agloa.org/equations/

Instructions for running server
===============================
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

4. Run Flask server
```
./bin/run
```

5. Go to http://localhost:8000 in browser
	
