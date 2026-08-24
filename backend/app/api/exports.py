from fastapi import APIRouter
from fastapi.responses import Response, JSONResponse
import json
import csv
import io
from backend.app.database.database import db

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/geojson")
async def export_geojson():
    features = []
    for pid, p in db.parcels.items():
        feature = {
            "type": "Feature",
            "geometry": p["geometry"],
            "properties": {
                "id": p["id"],
                "name": p["name"],
                "area_m2": p["area_m2"],
                "area_sqft": p["area_sqft"],
                "area_acres": p["area_acres"],
                "area_hectares": p["area_hectares"],
                "perimeter_m": p["perimeter_m"],
                "confidence": p["confidence"],
                "features": ", ".join(p["features"]) if isinstance(p["features"], list) else str(p["features"]),
                "latitude": p["latitude"],
                "longitude": p["longitude"],
                "status": p["status"]
            }
        }
        features.append(feature)
        
    data = {
        "type": "FeatureCollection",
        "name": "Urban_Parcel_Mapper_Cadastral_Export",
        "features": features
    }
    
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=urban_parcels.geojson"}
    )

@router.get("/csv")
async def export_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Name", "Area_m2", "Area_sqft", "Area_acres", "Area_hectares",
        "Perimeter_m", "Confidence", "Features", "Latitude", "Longitude", "Status"
    ])
    
    for pid, p in db.parcels.items():
        writer.writerow([
            p["id"],
            p["name"],
            p["area_m2"],
            p["area_sqft"],
            p["area_acres"],
            p["area_hectares"],
            p["perimeter_m"],
            p["confidence"],
            ", ".join(p["features"]) if isinstance(p["features"], list) else str(p["features"]),
            p["latitude"],
            p["longitude"],
            p["status"]
        ])
        
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=urban_parcels.csv"}
    )

@router.get("/shapefile")
async def export_shapefile():
    # Return GeoJSON bundle packaged as Shapefile GeoPackage export representation
    features = []
    for pid, p in db.parcels.items():
        features.append({
            "type": "Feature",
            "geometry": p["geometry"],
            "properties": {
                "ID": p["id"],
                "NAME": p["name"],
                "AREA_M2": p["area_m2"],
                "AREA_AC": p["area_acres"],
                "PERIM_M": p["perimeter_m"],
                "STATUS": p["status"]
            }
        })
    data = {"type": "FeatureCollection", "features": features}
    return Response(
        content=json.dumps(data, indent=2),
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=urban_parcels_shapefile.json"}
    )
