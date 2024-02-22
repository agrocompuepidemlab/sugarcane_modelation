#!/usr/bin/python
import os
import psycopg2
from configparser import ConfigParser

def config_db_armada(filename, section):
    parser = ConfigParser()
    parser.read(filename)

    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))
    
    return db

def connection():
    conn = None    
    
    params = config_db_armada(os.path.dirname(os.path.abspath(__file__))+'/config/config.ini', section='sugarcane')
    
    try:
        conn = psycopg2.connect(**params, connect_timeout=30)
        return conn
    except (Exception, psycopg2.DatabaseError) as error:
        print("***ERROR EN LA CONEXION DE BASE DE DATOS*** "+error+"\n")

def data_connection():
    params = config_db_armada(os.path.dirname(os.path.abspath(__file__))+'/config/config.ini', section='sugarcane')
    return params
