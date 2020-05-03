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
        'click==7.1.2',
        'Flask==1.1.1',     
        'Flask-SocketIO==4.3.0',
        'itsdangerous==1.1.0',
        'Jinja2==2.11.2',
        'MarkupSafe==1.1.1',
        'python-engineio==3.12.1',
        'python-socketio==4.5.1',
        'six==1.14.0',
        'Werkzeug==1.0.1',
    ],
)

