"""
Equations python package configuration.

Tony Bai <bait@umich.edu>
"""

from setuptools import find_packages, setup

setup(
    name='equations',
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    python_requires='>=3.12',
    install_requires=[
        'Flask==3.1.2',
        'Flask-Migrate==4.1.0',
        'Flask-SocketIO==5.5.1',
        'Flask-SQLAlchemy==3.1.1',
        'gevent==25.9.1',
        'gunicorn==23.0.0',
        'psycopg2-binary==2.9.10',
    ],
)
