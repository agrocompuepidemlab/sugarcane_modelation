from flask import Flask
from flask_cors import CORS

from controllers.seeTif import seeTif
from controllers.authUser import login
from controllers.getCoords import getCoords
from controllers.savePolygon import savePolygon
from controllers.seePolygonData import seePolygon
from controllers.userPolygons import userPolygons
from controllers.registerUser import register_user

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False
app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

app.register_blueprint(login)
app.register_blueprint(seeTif)
app.register_blueprint(getCoords)
app.register_blueprint(seePolygon)
app.register_blueprint(savePolygon)
app.register_blueprint(userPolygons)
app.register_blueprint(register_user)


if "__main__" == __name__:
    app.run(
        debug=False,
        host='0.0.0.0',
        port=5000
    )
