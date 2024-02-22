import io
import base64
import matplotlib.pyplot as plt
from functions import *
from rasterio.io import MemoryFile
from flask import Blueprint, jsonify, request

seeTif = Blueprint("see-tif", __name__)


@seeTif.route("/api/v2/see-tif", methods=["POST"])
def data():
    
    if 'files[]' not in request.files:
        return jsonify({'ok': False, 'message': 'No has ingresado archivos'})
    
    files = request.files.getlist('files[]')
    for file in files:
        with MemoryFile(file) as memfile:
            with memfile.open() as dataset:
                
                fig, ax = plt.subplots(1, figsize=(12, 20))
                ax.imshow(dataset.read(1, masked=True), cmap="RdYlGn_r")
                plt.axis("off")
                fig.subplots_adjust(
                    top=1.0, bottom=0.0, left=0.0, right=1.0, hspace=0.2, wspace=0.2
                )

                buffer = io.BytesIO()

                fig.savefig(buffer, format="png")
                buffer.seek(0)
                image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
                
                print(dataset.meta)
    
    return jsonify({'ok':True, "image": image_base64})
