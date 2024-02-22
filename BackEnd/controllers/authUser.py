import datetime as dt
from dateutil import tz
from functions import *
from flask import Blueprint, jsonify, request

login = Blueprint('login-user', __name__)

@login.route('/api/v2/login-user', methods=['POST'])
def user_login():
    datos = request.json
    username = datos['loginUser']
    password = datos['password'].encode('utf-8')

    sugarCane = connection()
    data = getTable(f"SELECT * FROM users WHERE login_user = '{username}'", sugarCane)

    if len(data) == 0:
        sugarCane.close()
        return jsonify({'message': 'El usuario no está registrado!', 'ok':False})
    else:
        check_pw = check_password(password=password, hashed_password=data['passwd_user'].iloc[0].encode('utf-8'))
        if check_pw:
            query = f"UPDATE users SET last_login = '{dt.datetime.now(tz=tz.gettz('America/Bogota'))}' WHERE login_user = '{username}'"
            cursor = sugarCane.cursor()
            cursor.execute(query)
            sugarCane.commit()
            sugarCane.close()
            
            token = generate_token(loginUser=username, time=1440)
            
            return jsonify({'message': 'Usuario registrado', 'ok':True, 'token': token})
        else:
            sugarCane.close()
            return jsonify({'message': 'Contraseña erronea', 'ok': False})