# File to test how to interact with the MongoDB with Python
import pymongo
import getpass
from flask import current_app, g
from flask_pymongo import PyMongo

def get_db():
  """
  Configuration method to return db instance
  """
  db = getattr(g, "_database", None)

  if db is None:
    db = g._database = PyMongo(current_app).db

  return db

def close_db(e=None):
  """If this request connected to the database, close the
  connection.
  """
  db = g.pop("db", None)

  if db is not None:
    db.close()
