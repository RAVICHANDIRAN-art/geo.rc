from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]]

class FeatureSchema(BaseModel):
    id: str
    parcel_id: str
    feature_type: str  # Building, Road, Vegetation, Fence, Driveway, Pool, Shed
    confidence: float
    geometry: Optional[GeoJSONGeometry] = None

class ParcelBase(BaseModel):
    name: str = "Parcel"
    area_m2: float
    area_sqft: float
    area_acres: float
    area_hectares: float
    perimeter_m: float
    confidence: float = 100.0
    features: List[str] = Field(default_factory=list)
    latitude: float
    longitude: float
    status: str = "User Created"  # User Created, AI Detected, Validated

class ParcelCreate(ParcelBase):
    id: Optional[str] = None
    geometry: GeoJSONGeometry

class ParcelUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    geometry: Optional[GeoJSONGeometry] = None
    features: Optional[List[str]] = None
    area_m2: Optional[float] = None
    area_sqft: Optional[float] = None
    area_acres: Optional[float] = None
    area_hectares: Optional[float] = None
    perimeter_m: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ParcelResponse(ParcelBase):
    id: str
    geometry: GeoJSONGeometry

    class Config:
        from_attributes = True

class FeatureCollectionGeoJSON(BaseModel):
    type: str = "FeatureCollection"
    features: List[Dict[str, Any]]
