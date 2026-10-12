Academic Games Server
============================

Academic Games online

https://www.agloa.org/equations/

https://www.agloa.org/on-sets/

# Local development

```bash
python3 -m venv env
source env/bin/activate
pip install -e .
npm install
npm test
npm start
```

The default development database is `var/equations.sqlite3`, so a local
PostgreSQL server is no longer required just to start the app. Set
`DATABASE_URL` before `npm start` if you want to use Postgres.

# Status

The original deployment was https://equations-online.herokuapp.com/. This repo
has local smoke tests and a production health check. After deploying, verify the
web process, database, and Engine.IO handshake with:

```bash
./bin/smoke-deployment https://equations-online.herokuapp.com
```

The server intentionally runs one Gunicorn worker because active game-room state
is held in process memory. Moving that state to Redis is required before scaling
to multiple workers or dynos.

# Contributing
See [`CONTRIBUTING.md`](https://github.com/tonyb7/equations/blob/master/CONTRIBUTING.md) for a summary of this project's technology stack and steps for setting up the server for development.

# iPhone and iPad

The native SwiftUI app lives in [`ios/`](ios/README.md). Open
`ios/AcademicGames.xcodeproj` with full Xcode to run it in Simulator or on an
iPhone. It includes online multiplayer through the existing game server and
native offline arithmetic practice. The iOS guide covers testing, TestFlight,
and the remaining App Store release requirements.
