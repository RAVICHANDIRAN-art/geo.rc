# PostGIS / Database SQL & Pydantic Data Models representation
from typing import Dict, Any, List

class ParcelModel:
    def __init__(self, id: str, name: str, area_m2: float, area_sqft: float, area_acres: float, 
                 area_hectares: float, perimeter_m: float, confidence: float, features: List[str],
                 latitude: float, longitude: float, status: str, geometry: Dict[str, Any]):
        self.id = id
        self.name = name
        self.area_m2 = area_m2
        self.area_sqft = area_sqft
        self.area_acres = area_acres
        self.area_hectares = area_hectares
        self.perimeter_m = perimeter_m
        self.confidence = confidence
        self.features = features
        self.latitude = latitude
        self.longitude = longitude
        self.status = status
        self.geometry = geometry

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "area_m2": self.area_m2,
            "area_sqft": self.area_sqft,
            "area_acres": self.area_acres,
            "area_hectares": self.area_hectares,
            "perimeter_m": self.perimeter_m,
            "confidence": self.confidence,
            "features": self.features,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "status": self.status,
            "geometry": self.geometry
        }
