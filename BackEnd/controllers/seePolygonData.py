import ast
from functions import *
from flask import Blueprint, jsonify, request

seePolygon = Blueprint('see-polygon-data', __name__)

@seePolygon.route('/api/v2/see-polygon-data', methods=['POST'])
def see_polygons():
    
    data = request.json
    login_user = decode_token(token=data['token'])['user']
    idPolygon = data['id']
    
    sugarCane = connection()
    
    query = f"""
    SELECT *
    FROM polygon_users
    WHERE login_user = '{login_user}' AND id = '{idPolygon}'
    """
    data = getTable(query, sugarCane)
    
    if len(data) == 0:
        return jsonify({'ok':False, 'message':'No se encuentra información del polígono!'})
    
    data['geometry'].iloc[0] = ast.literal_eval(data['geometry'].iloc[0])
    
    return jsonify({'ok':True, 'coords': [data['geometry'].iloc[0]]})