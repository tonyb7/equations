import os
import tempfile
import unittest


_db_dir = tempfile.TemporaryDirectory()
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ["DATABASE_URL"] = "sqlite:///" + os.path.join(_db_dir.name, "equations.sqlite3")

import equations  # noqa: E402
from equations import db  # noqa: E402
from equations.data import rooms_info, socket_info, user_info  # noqa: E402
from equations.models import Game, Tournaments  # noqa: E402


class AppSmokeTest(unittest.TestCase):
    def test_postgres_url_uses_installed_driver(self):
        from equations.config import normalize_database_url
        for prefix in ("postgres://", "postgresql://"):
            self.assertEqual(normalize_database_url(prefix + "localhost/db"), "postgresql+psycopg2://localhost/db")

    @classmethod
    def setUpClass(cls):
        equations.app.config.update(TESTING=True)
        with equations.app.app_context():
            db.drop_all()
            db.create_all()

    def setUp(self):
        rooms_info.clear()
        socket_info.clear()
        user_info.clear()

    @classmethod
    def tearDownClass(cls):
        with equations.app.app_context():
            db.drop_all()
        _db_dir.cleanup()

    def test_homepage_loads(self):
        with equations.app.test_client() as client:
            response = client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Academic Games", response.data)

    def test_socket_handshake_accepts_https_origin_behind_proxy(self):
        import importlib.metadata
        version = importlib.metadata.version("python-engineio")
        eio = "4" if int(version.split(".")[0]) >= 4 else "3"
        with equations.app.test_client() as client:
            response = client.get(
                "/socket.io/?EIO=" + eio + "&transport=polling",
                base_url="http://equations-online.herokuapp.com",
                headers={
                    "Origin": "https://equations-online.herokuapp.com",
                    "X-Forwarded-Proto": "https",
                },
            )
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'"sid"', response.data)

    def test_socket_handshake_rejects_unrelated_origin(self):
        with equations.app.test_client() as client:
            response = client.get(
                "/socket.io/?EIO=4&transport=polling",
                base_url="http://equations-online.herokuapp.com",
                headers={"Origin": "https://example.com", "X-Forwarded-Proto": "https"},
            )
        self.assertEqual(response.status_code, 400)

    def test_healthcheck_verifies_database(self):
        with equations.app.test_client() as client:
            response = client.get("/healthz")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"database": "ok", "status": "ok"})

    def test_create_account_logs_user_in(self):
        with equations.app.test_client() as client:
            response = client.post(
                "/create_account/",
                data={"username": "smoke_user", "password": "correct horse"},
                follow_redirects=True,
            )

            self.assertEqual(response.status_code, 200)
            self.assertIn(b"smoke_user", response.data)

    def test_create_equations_game_from_homepage_button_value(self):
        with equations.app.test_client() as client:
            client.post(
                "/create_account/",
                data={"username": "game_creator", "password": "secret"},
                follow_redirects=True,
            )
            response = client.post(
                "/create/",
                data={"create": "Create Equations Game"},
                follow_redirects=True,
            )

        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Equations Game Room", response.data)

    def test_equations_and_onsets_game_forms(self):
        for action, heading in [("Without Restrictions", b"On-Sets Game Room"),
                                ("With Restrictions", b"On-Sets Game Room")]:
            with self.subTest(action=action), equations.app.test_client() as client:
                with client.session_transaction() as session:
                    session["username"] = "game_creator"
                response = client.post("/create/", data={"create": action}, follow_redirects=True)
                self.assertEqual(response.status_code, 200)
                self.assertIn(heading, response.data)

    def test_socket_client_can_register_for_a_game(self):
        with equations.app.app_context():
            db.session.add(Game(nonce="LIVE", gametype="eq", players=["socket_user"]))
            db.session.commit()

        client = equations.socketio.test_client(equations.app)
        self.assertTrue(client.is_connected())

        client.emit("register_client", {"name": "socket_user", "room": "LIVE"})
        event_names = {event["name"] for event in client.get_received()}

        self.assertIn("render_player_state", event_names)
        self.assertIn("new_player", event_names)

        client.emit("start_game")
        messages = [
            event["args"][0]
            for event in client.get_received()
            if event["name"] == "server_message"
        ]
        self.assertTrue(any("2 or 3 players" in message for message in messages))
        client.disconnect()

    def test_model_defaults_are_independent(self):
        first_game = Game("AAAA")
        second_game = Game("BBBB")
        first_game.players.append("alice")

        first_tournament = Tournaments("one")
        second_tournament = Tournaments("two")
        first_tournament.groups.append("group-a")

        self.assertEqual(second_game.players, [])
        self.assertEqual(second_tournament.groups, [])

    def test_two_players_can_chat_and_start_game(self):
        with equations.app.app_context():
            db.session.add(Game(nonce="PAIR", gametype="eq", players=["alice", "bob"]))
            db.session.commit()
        clients = [equations.socketio.test_client(equations.app) for _ in range(2)]
        try:
            for client, name in zip(clients, ["alice", "bob"]):
                client.emit("register_client", {"name": name, "room": "PAIR"})
            for client in clients:
                client.get_received()
            clients[0].emit("new_message", {"name": "alice", "message": "hello"})
            for client in clients:
                messages = [event for event in client.get_received() if event["name"] == "message"]
                self.assertEqual(messages[0]["args"], {"name": "alice", "message": "hello"})
            clients[0].emit("start_game")
            for client in clients:
                self.assertIn("begin_game", {event["name"] for event in client.get_received()})
            self.assertTrue(rooms_info["PAIR"]["game_started"])
        finally:
            for client in clients:
                client.disconnect()
