import datetime as dt
from dateutil import tz
from functions import *
from flask import Blueprint, jsonify, request

register_user = Blueprint('register-user', __name__)

@register_user.route('/api/v2/register-user', methods=['POST'])
def register():
    datos = request.json
    loginUser = datos['loginUser']
    username = datos['username']
    email = datos['email']
    password = datos['password'].encode('utf-8')

    sugarCane = connection()

    check_user_email = getTable(f"SELECT * FROM users WHERE email_user = '{email}'", sugarCane)
    check_user_name = getTable(f"SELECT * FROM users WHERE login_user = '{username}'", sugarCane)

    if len(check_user_email) == 0 and len(check_user_name) == 0:
        hashed_pw = hash_password(password)
        
        cursor = sugarCane.cursor()
        query = """
        INSERT INTO users (login_user, passwd_user, username, email_user, last_login)
        VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(query, (loginUser, hashed_pw, username, email, dt.datetime.now(tz=tz.gettz('America/bogota'))))
        sugarCane.commit()
        sugarCane.close()
        
        token = generate_token(loginUser=loginUser, time=1440) 

        return jsonify({'message': 'Usuario registrado exitosamente', 'ok':True, 'token':token})

    else:
        sugarCane.close()

        if len(check_user_email) > 0:
            return jsonify({'message': 'El correo electrónico ya existe', 'ok':False})
        elif len(check_user_name) > 0:
            return jsonify({'message': 'El nombre de usuario ya existe', 'ok':False})