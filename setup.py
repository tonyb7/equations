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
        'Flask==1.1.1',     
    ],
)

