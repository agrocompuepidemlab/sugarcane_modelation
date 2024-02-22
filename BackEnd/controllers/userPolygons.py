from functions import *
from flask import Blueprint, jsonify, request

userPolygons = Blueprint('user-data-polygons', __name__)

@userPolygons.route('/api/v2/user-data-polygons', methods=['GET'])
def user_polygons():
    token = request.args.get('token')
    login_user = decode_token(token=token)['user']
    
    query = f"""
    SELECT *
    FROM polygon_users
    WHERE login_user = '{login_user}'
    """
    
    sugarcane = connection()
    data = getTable(query, sugarcane)
    sugarcane.close()
    
    if len(data) > 0:
        return jsonify({'ok':True, 'data': data.to_dict(orient='records')})
    else:
        return jsonify({'ok':False, 'message': 'No tiene infromación de polígonos guardados!'})