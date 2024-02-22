import json
import warnings
import pandas as pd
import datetime as dt
import requests as rq
import statsmodels.api as sm
from dateutil import tz
from functions import *
from pyproj import Geod
from shapely.geometry import Polygon
from pandas.tseries.offsets import DateOffset
from flask import Blueprint, jsonify, request

warnings.filterwarnings('ignore')

getCoords = Blueprint("get-coords-data", __name__)
@getCoords.route("/api/v2/get-coords-data", methods=["POST"])
def data_coords():
    data = request.json
    print(data['coords'])
    polygon = data["coords"][0]

    coords_cent = []
    for i in polygon:
        coords_cent.append([i["lat"], i["lng"]])

    centroid = Centroid(coords_cent)
    
    geod = Geod(ellps="WGS84")
    poly = Polygon(coords_cent)
    area = round(abs(geod.geometry_area_perimeter(poly)[0]) / 10000, 2)

    sugarcane = connection()

    query_azucar = f"""
    SELECT *
    FROM (
        SELECT 
            *,
            CASE 
                WHEN ST_Contains(ST_GeomFromText(geometry::text), ST_GeomFromText('POINT({centroid[1]} {centroid[0]})')) THEN 1
                ELSE 0
            END AS is_inside
        FROM cana_azucar
    ) a
    WHERE is_inside = 1
    ORDER BY clusters
    """

    query_panela = f"""
    SELECT *
    FROM (
        SELECT 
            *,
            CASE 
                WHEN ST_Contains(ST_GeomFromText(geometry::text), ST_GeomFromText('POINT({centroid[1]} {centroid[0]})')) THEN 1
                ELSE 0
            END AS is_inside
        FROM cana_panela
    ) a
    WHERE is_inside = 1
    ORDER BY clusters
    """

    data_azucar = getTable(query_azucar, sugarcane)
    data_panela = getTable(query_panela, sugarcane)
    sugarcane.close()

    if (len(data_azucar) == 0) and (len(data_panela) == 0):
        return jsonify(
            {"ok": False, "message": "No hay información para ningún tipo de caña"}
        )
    else:
        base_url = f"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,T2M,RH2M,T2MDEW&community=RE&longitude={centroid[1]}&latitude={centroid[0]}&start={19810101}&end={str(dt.datetime.now(tz=tz.gettz('America/Bogota')).strftime('%Y-%m-%d')).replace('-','')}&format=JSON"
        response = rq.get(url=base_url, verify=True, timeout=30.00)

        data_pw = pd.DataFrame(response.json()["properties"]["parameter"])
        data_pw["fecha"] = data_pw.index
        data_pw.columns = ["prep", "tm", "hr", "pr", "date"]
        data_pw = data_pw[data_pw["prep"] >= 0].reset_index(drop=True)

        data_pw["date"] = pd.to_datetime(data_pw["date"].astype(int), format="%Y%m%d")
        data_pw["date"] = data_pw["date"].dt.strftime("%Y-%m")
        data_g = data_pw.groupby(["date"]).mean().reset_index().round(2)

        tdi = pd.DatetimeIndex(data_g["date"])
        data_g.set_index(tdi, inplace=True) # 
        #print(data_g)

        data_hr = data_g[["hr"]]
        data_pr = data_g[["pr"]]
        data_tm = data_g[["tm"]]
        data_prep = data_g[["prep"]]

        ####################### SARIMAX Humedad Relativa #######################

        model = sm.tsa.statespace.SARIMAX(
            data_hr["hr"], order=(1, 1, 2), seasonal_order=(1, 1, 2, 12)
        )
        results = model.fit(disp=False)

        pred_date = [data_hr.index[-1] + DateOffset(months=x) for x in range(0, 20)]
        pred_date = pd.DataFrame(index=pred_date[1:], columns=data_hr.columns)
        data_hr_final = pd.concat([data_hr, pred_date])
        data_op = results.predict(
            start=(len(data_hr) - 12), end=(len(data_hr) + 20), dynamic=True
        )
        data_forecast = pd.Series(
            data_op.tolist(),
            index=data_hr_final.index[(len(data_hr_final) - len(data_op)) :],
            name="forecast",
        )
        data_hr_final = data_hr_final.join(data_forecast)
        data_hr_final["date"] = data_hr_final.index
        data_hr_final = data_hr_final[data_hr_final["date"] > "2015-01-01"]
        data_hr_final["date"] = data_hr_final["date"].dt.strftime("%Y-%m-%d")

        ####################### SARIMAX Punto de Rocio #######################

        model = sm.tsa.statespace.SARIMAX(
            data_pr["pr"], order=(1, 1, 2), seasonal_order=(1, 1, 2, 12)
        )
        results = model.fit(disp=False)

        pred_date = [data_pr.index[-1] + DateOffset(months=x) for x in range(0, 20)]
        pred_date = pd.DataFrame(index=pred_date[1:], columns=data_pr.columns)
        data_pr_final = pd.concat([data_pr, pred_date])
        data_op = results.predict(
            start=(len(data_pr) - 12), end=(len(data_pr) + 20), dynamic=True
        )
        data_forecast = pd.Series(
            data_op.tolist(),
            index=data_pr_final.index[(len(data_pr_final) - len(data_op)) :],
            name="forecast",
        )
        data_pr_final = data_pr_final.join(data_forecast)

        data_pr_final["date"] = data_pr_final.index
        data_pr_final = data_pr_final[data_pr_final["date"] > "2015-01-01"]
        data_pr_final["date"] = data_pr_final["date"].dt.strftime("%Y-%m-%d")

        ####################### SARIMAX Temperatura #######################

        model = sm.tsa.statespace.SARIMAX(
            data_tm["tm"], order=(1, 1, 2), seasonal_order=(1, 1, 2, 12)
        )
        results = model.fit(disp=False)

        pred_date = [data_tm.index[-1] + DateOffset(months=x) for x in range(0, 20)]
        pred_date = pd.DataFrame(index=pred_date[1:], columns=data_tm.columns)
        data_tm_final = pd.concat([data_tm, pred_date])
        data_op = results.predict(
            start=(len(data_tm) - 12), end=(len(data_tm) + 20), dynamic=True
        )
        data_forecast = pd.Series(
            data_op.tolist(),
            index=data_tm_final.index[(len(data_tm_final) - len(data_op)) :],
            name="forecast",
        )
        data_tm_final = data_tm_final.join(data_forecast)

        data_tm_final["date"] = data_tm_final.index
        data_tm_final = data_tm_final[data_tm_final["date"] > "2015-01-01"]
        data_tm_final["date"] = data_tm_final["date"].dt.strftime("%Y-%m-%d")

        ####################### SARIMAX Precipitacion #######################

        model = sm.tsa.statespace.SARIMAX(
            data_prep["prep"], order=(1, 1, 2), seasonal_order=(1, 1, 2, 12)
        )
        results = model.fit(disp=False)

        pred_date = [data_prep.index[-1] + DateOffset(months=x) for x in range(0, 20)]
        pred_date = pd.DataFrame(index=pred_date[1:], columns=data_pr.columns)
        data_prep_final = pd.concat([data_prep, pred_date])
        data_op = results.predict(
            start=(len(data_prep) - 12), end=(len(data_prep) + 20), dynamic=True
        )
        data_forecast = pd.Series(
            data_op.tolist(),
            index=data_prep_final.index[(len(data_prep_final) - len(data_op)) :],
            name="forecast",
        )
        data_prep_final = data_prep_final.join(data_forecast)

        data_prep_final["date"] = data_prep_final.index
        data_prep_final = data_prep_final[data_prep_final["date"] > "2015-01-01"]
        data_prep_final["date"] = data_prep_final["date"].dt.strftime("%Y-%m-%d")

        if (len(data_azucar) > 0) and (len(data_panela) > 0):
            return jsonify(
                {
                    "ok": True,
                    "variables": 2,
                    "area": area,
                    "prep": json.dumps(json.loads(data_prep_final.to_json(orient="table"))),
                    "temp": json.dumps(json.loads(data_tm_final.to_json(orient="table"))),
                    "hr": json.dumps(json.loads(data_hr_final.to_json(orient="table"))),
                    'pr': json.dumps(json.loads(data_pr.to_json(orient="table")))
                }
            )
        elif (len(data_azucar) == 0) and (len(data_panela) > 0):
            return jsonify(
                {
                    "ok": True,
                    "variables": 1,
                    "cana": 0,
                    "area": area,
                    "prep": json.dumps(json.loads(data_prep_final.to_json(orient="table"))),
                    "temp": json.dumps(json.loads(data_tm_final.to_json(orient="table"))),
                    "hr": json.dumps(json.loads(data_hr_final.to_json(orient="table"))),
                    'pr': json.dumps(json.loads(data_pr.to_json(orient="table")))
                }
            )
        elif (len(data_azucar) > 0) and (len(data_panela) == 0):
            return jsonify(
                {
                    "ok": True,
                    "variables": 1,
                    "cana": 1,
                    "area": area,
                    "prep": json.dumps(json.loads(data_prep_final.to_json(orient="table"))),
                    "temp": json.dumps(json.loads(data_tm_final.to_json(orient="table"))),
                    "hr": json.dumps(json.loads(data_hr_final.to_json(orient="table"))),
                    'pr': json.dumps(json.loads(data_pr.to_json(orient="table")))
                }
            )
