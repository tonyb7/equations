Rules of Equations
==================
https://www.agloa.org/eq-docs/

https://agloa.org/wp-content/uploads/EqsTourRules19-20.pdf

Technology Stack
================
Server Side
- Python Flask for routing requests/serving various pages on the site
- [`flask-socketio`](https://github.com/miguelgrinberg/Flask-SocketIO) for networking (receiving messages from clients)
- See [`equations/`](https://github.com/tonyb7/equations/tree/master/equations) and [`equations/views/`](https://github.com/tonyb7/equations/tree/master/equations/views) and [`equations/networking/`](https://github.com/tonyb7/equations/tree/master/equations/networking)
- See [`setup.py`](https://github.com/tonyb7/equations/blob/master/setup.py) for full list of dependencies

Client Side
- Jinja for HTML templating (see [`/equations/templates/`](https://github.com/tonyb7/equations/tree/master/equations/templates))
- CSS (see [`equations/static/css/`](https://github.com/tonyb7/equations/tree/master/equations/static/css))
- JavaScript with [socket.io](https://socket.io) ([`src/client/`](https://github.com/tonyb7/equations/tree/master/src/client))
- See [`package.json`](https://github.com/tonyb7/equations/blob/master/package.json) for full list of dependencies

Database
- [PostgreSQL](https://www.heroku.com/postgres)
- [`Flask-SQLAlchemy`](https://flask-sqlalchemy.palletsprojects.com/en/2.x/)
- [`Flask-Migrate`](https://flask-migrate.readthedocs.io/en/latest/)

Deployment
- [Heroku](https://www.heroku.com)

Prerequisites for setup
==================
### Windows
On Windows, it is recommended that you install Windows Subsystem for Linux (WSL) for development. A Unix-shell is needed for the commands in the rest of this guide to work. A great tutorial for downloading WSL can be found [here](https://eecs280staff.github.io/p1-stats/setup_wsl.html).

### Windows and Linux
In your Linux shell, install the prerequisite software:
```
sudo apt-get install git python3 python3-venv postgresql libpq-dev python3-dev
```


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

3. Install Equations package. If you are using Windows Subsystem for Linux and this step fails, see the [PostgreSQL Setup](#postgresql-setup) section.
```
pip install -e .
```

4. Compile JavaScript bundle
```
npm install .
npm run build
```

5. Set up the database. Please read the [PostgreSQL Setup](#postgresql-setup) section for instructions. Once the database is set up, run the following script:
```
./bin/setupdb
```

7. Run Flask server
```
npm start # (or equivalently, ./bin/run)
```

8. Go to http://localhost:8000 in browser

# PostgreSQL Setup
These set up steps are tailored most specifically towards Windows Subsystem for Linux (WSL) users. Many of these steps apply to Linux users as well. Mac users might be able to skip some of the steps in this section, but they should at least read the comments in the [`bin/run`](https://github.com/tonyb7/equations/blob/master/bin/setupdb) file for setup directions. The end result should be to have a PostgreSQL server listening on port 5432, and to have a database called `eq_dev` created.

1. The first step which might fail for WSL users is the `pip install -e .` command (step 3 in [Running the server](#running-the-server)). To fix this, try changing the line in `setup.py` that says `'psycopg2==2.8.5',` to `'psycopg2-binary==2.8.5',`.  

2. Next, before we install `postgresql`, if you had previously installed a version of `postgresql` from the internet, please uninstall it. On Windows, you can do this by finding going to your `Program Files` folder, navigating into the `PostgreSQL` directories, and then running the uninstaller application.

3. Now that we have a clean start, install `postgresql` with the following command:
```
sudo apt-get install postgresql
```

4. Check the status of the `postgresql` service, as well as the port that it is listening on with this command:
```
sudo service postgresql status
```
You should see something like `10/main (port 5432): down`. If the port is not `5432`, then you need to edit the file `/etc/postgresql/*/main/postgresql.conf` (where `*` could be any number, depending on what your version of `postgresql` is) so that `port = 5432`. 

5. Now that you have confirmed that the port is correct, start the `postgresql` service with the following command:
```
sudo service postgresql start
```
If this step fails, that means another process is listening to port 5432 on your computer. If this happens, the problem is likely due to another version of Postgres you have running on your computer, so make sure you've completed Step 2. 

If this step succeeded, then after running `sudo service postgresql status` again, you should see a message like: `10/main (port 5432): online`.

6. Now we need to make `postgresql` recognize your Linux user. To do this, first run `echo $USER` to get your Linux username. Remember this. Then, log in to a new shell as the postgres user with:
```
sudo -iu postgres
```

7. You should see a new shell pop up. Now run:
```
createuser --interactive
```
When it asks for a name, name the user with the same name as your Linux username (which we remember from Step 6). Say no to superuser rights, but say yes to every other prompt.

8. While still in this new shell, run `psql`.

9. A new prompt should have opened. In this prompt, run `create database <linux username>;` (this is the same Linux username as from Step 6; don't forget the semicolon at the end).
 
10. Quit the psql shell with `\q`, and then exit the new shell we created with `exit`.

11. Now that we are back to our normal shell, we should be able to run `psql` and it should work! So run `psql`, and then while in the psql prompt, run 
```
create database eq_dev;
```
Then quit the psql prompt with `\q` again.

12. If all of these steps succeeded, you should be ready to pick back up from Step 5 of [Running the server](#running-the-server) by running the `setupdb` script!

# Other
If you gonna deploy this, don't forget to generate a new bytestring to replace the Flask secret key.
```
python3 -c "import os; print(os.urandom(24))"
```
