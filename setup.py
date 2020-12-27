"""
Equations python package configuration.

Tony Bai <bait@umich.edu>
"""

from setuptools import setup

setup(
    name='equations',
    version='0.1.0',
    packages=['equations'],
    include_package_data=True,
    install_requires=[
        'alembic==1.4.2',
        'click==7.1.2',
        'Flask==1.1.1',     
        'Flask-Migrate==2.5.3',
        'Flask-SocketIO==4.3.0',
        'Flask-SQLAlchemy==2.4.1',
        'gevent==20.5.0',
        'gevent-websocket==0.10.1',
        'greenlet==0.4.15',
        'gunicorn==20.0.4',
        'itsdangerous==1.1.0',
        'Jinja2==2.11.2',
        'Mako==1.1.2',
        'MarkupSafe==1.1.1',
        'psycopg2==2.8.5',
        'python-dateutil==2.8.1',
        'python-editor==1.0.4',
        'python-engineio==3.12.1',
        'python-socketio==4.5.1',
        'pytz==2020.1',
        'six==1.14.0',
        'SQLAlchemy==1.3.17',
        'Werkzeug==1.0.1',
        'wheel==0.35.1',
    ],
)

