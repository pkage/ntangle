#!/usr/bin/env python

from setuptools import setup

setup(name='ntangle',
      version='1.0',
      description='remote procedure call library',
      author='Patrick Kage',
      author_email='quadnix1@gmail.com',
      packages=['ntangle'],
      install_requires=['pyzmq', 'msgpack-python', 'termcolor']
     )
