import os
import jwt
import bcrypt
import dotenv
import warnings
import numpy as np
import datetime as dt
import pandas.io.sql as sqlio
from config import *
from dateutil import tz

dotenv.load_dotenv()

warnings.filterwarnings("ignore")


def getTable(sql, connection):
    return sqlio.read_sql_query(sql, connection)

def Centroid(array):
    array = np.array(array)
    length = array.shape[0]
    sum_x = np.sum(array[:, 0])
    sum_y = np.sum(array[:, 1])
    return sum_x/length, sum_y/length


def hash_password(password):
    hashed_password = bcrypt.hashpw(password, bcrypt.gensalt()).decode("utf-8")
    return hashed_password


def check_password(password, hashed_password):
    return bcrypt.checkpw(password, hashed_password)


def generate_token(loginUser, time):
    token = jwt.encode(
        {
            "user": loginUser,
            "exp": dt.datetime.now(tz=tz.gettz("America/Bogota")) + dt.timedelta(minutes=time),
        },
        os.getenv("SECRET_KEY"),
        algorithm = "HS256"
    )
    return token


def decode_token(token):
    return jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
