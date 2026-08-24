from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from backend.app.schemas.parcel import ParcelResponse, ParcelCreate, ParcelUpdate, FeatureCollectionGeoJSON
from backend.app.database.database import db

router = APIRouter(prefix="/api", tags=["parcels"])

@router.get("/parcels", response_model=Dict[str, Any])
async def get_parcels():
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
                "features": p["features"],
                "latitude": p["latitude"],
                "longitude": p["longitude"],
                "status": p["status"]
            }
        }
        features.append(feature)
        
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.post("/parcels", response_model=ParcelResponse)
async def create_parcel(parcel: ParcelCreate):
    parcel_id = parcel.id if parcel.id else f"P-{len(db.parcels) + 1:03d}"
    data = parcel.dict()
    data["id"] = parcel_id
    db.parcels[parcel_id] = data
    return ParcelResponse(**data)

@router.put("/parcels/{parcel_id}", response_model=ParcelResponse)
async def update_parcel(parcel_id: str, update_data: ParcelUpdate):
    if parcel_id not in db.parcels:
        raise HTTPException(status_code=404, detail="Parcel not found")
    
    current = db.parcels[parcel_id]
    updates = update_data.dict(exclude_unset=True)
    current.update(updates)
    db.parcels[parcel_id] = current
    return ParcelResponse(**current)

@router.delete("/parcels/{parcel_id}")
async def delete_parcel(parcel_id: str):
    if parcel_id not in db.parcels:
        raise HTTPException(status_code=404, detail="Parcel not found")
    del db.parcels[parcel_id]
    return {"status": "success", "message": f"Parcel {parcel_id} deleted successfully."}
