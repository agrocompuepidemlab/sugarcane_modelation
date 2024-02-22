from functions import *
from flask import Blueprint, jsonify, request

savePolygon = Blueprint('user-save-polygon', __name__)

@savePolygon.route('/api/v2/user-save-polygon', methods=['POST'])
def save_polygons():
    
    data = request.json
    login_user = decode_token(token=data['token'])['user']
    namePolygon = data['namePolygon']
    geometry = f"{data['geometry'][0]}"
    
    sugarCane = connection()
    
    query = f"""
    SELECT *
    FROM polygon_users
    WHERE login_user = '{login_user}' AND name_polygon = '{namePolygon}'
    """
    data = getTable(query, sugarCane)
    
    if len(data) > 0:
        return jsonify({'ok':False, 'message':f'El nombre "{namePolygon}" ya está registrado, intenta con otro nombre!'})
    
    cursor = sugarCane.cursor()
    query = """
        INSERT INTO polygon_users (name_polygon, geometry, login_user)
        VALUES (%s, %s, %s)
    """
    try:
        cursor.execute(query, (namePolygon, geometry, login_user))
        sugarCane.commit()
        sugarCane.close()
    
        return jsonify({'ok':True, 'message': 'Polígono guardado correctamente!'})
    except:
        sugarCane.close()
        return jsonify({'ok': False, 'message':'Error al guardar el polígono!'})