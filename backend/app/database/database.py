"""
Database Manager for Urban Parcel Mapper
Supports PostGIS table structure & in-memory demo persistence.
"""
from typing import Dict, List, Optional
import json

POSTGIS_SCHEMA_SQL = """
-- PostGIS Cadastral Database Schema Definition
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS parcels (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    area_m2 DOUBLE PRECISION NOT NULL,
    area_sqft DOUBLE PRECISION NOT NULL,
    area_acres DOUBLE PRECISION NOT NULL,
    area_hectares DOUBLE PRECISION NOT NULL,
    perimeter_m DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION DEFAULT 100.0,
    status VARCHAR(64) DEFAULT 'User Created',
    features JSONB DEFAULT '[]',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    geometry GEOMETRY(Polygon, 4326) NOT NULL
);

CREATE INDEX IF NOT EXISTS parcels_geometry_idx ON parcels USING GIST (geometry);

CREATE TABLE IF NOT EXISTS features (
    id VARCHAR(64) PRIMARY KEY,
    parcel_id VARCHAR(64) REFERENCES parcels(id) ON DELETE CASCADE,
    feature_type VARCHAR(64) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    geometry GEOMETRY(Geometry, 4326)
);
"""

class InMemoryDB:
    def __init__(self):
        self.parcels: Dict[str, Dict] = {}
        self.jobs: Dict[str, Dict] = {}
        self._init_demo_data()

    def _init_demo_data(self):
        # Initial 12 sample parcels centered at 28.6100° N, 77.2000° E
        sample_parcels = [
            {
                "id": "P-001", "name": "Residential Plot A1", "area_m2": 1240.0, "area_sqft": 13347.25,
                "area_acres": 0.306, "area_hectares": 0.124, "perimeter_m": 142.5, "confidence": 96.4,
                "features": ["Building", "Fence"], "latitude": 28.6105, "longitude": 77.2002,
                "status": "Validated",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2000, 28.6100], [77.2004, 28.6100], [77.2004, 28.6110], [77.2000, 28.6110], [77.2000, 28.6100]]]
                }
            },
            {
                "id": "P-002", "name": "Commercial Lot B2", "area_m2": 1580.0, "area_sqft": 17007.0,
                "area_acres": 0.390, "area_hectares": 0.158, "perimeter_m": 165.2, "confidence": 94.1,
                "features": ["Building", "Driveway"], "latitude": 28.6115, "longitude": 77.2012,
                "status": "AI Detected",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2010, 28.6110], [77.2015, 28.6110], [77.2015, 28.6120], [77.2010, 28.6120], [77.2010, 28.6110]]]
                }
            },
            {
                "id": "P-003", "name": "Garden Estate C3", "area_m2": 1100.0, "area_sqft": 11840.3,
                "area_acres": 0.272, "area_hectares": 0.110, "perimeter_m": 134.0, "confidence": 97.2,
                "features": ["Building", "Garden"], "latitude": 28.6095, "longitude": 77.2022,
                "status": "Validated",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2020, 28.6090], [77.2025, 28.6090], [77.2025, 28.6100], [77.2020, 28.6100], [77.2020, 28.6090]]]
                }
            },
            {
                "id": "P-004", "name": "Parcel D4", "area_m2": 1420.0, "area_sqft": 15284.7,
                "area_acres": 0.351, "area_hectares": 0.142, "perimeter_m": 155.0, "confidence": 93.8,
                "features": ["Building", "Garage"], "latitude": 28.6085, "longitude": 77.1992,
                "status": "AI Detected",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.1990, 28.6080], [77.1995, 28.6080], [77.1995, 28.6090], [77.1990, 28.6090], [77.1990, 28.6080]]]
                }
            },
            {
                "id": "P-005", "name": "Villa Lot E5", "area_m2": 1200.0, "area_sqft": 12916.7,
                "area_acres": 0.297, "area_hectares": 0.120, "perimeter_m": 139.8, "confidence": 95.5,
                "features": ["Building", "Pool"], "latitude": 28.6125, "longitude": 77.2032,
                "status": "Validated",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2030, 28.6120], [77.2035, 28.6120], [77.2035, 28.6130], [77.2030, 28.6130], [77.2030, 28.6120]]]
                }
            },
            {
                "id": "P-006", "name": "Parcel F6", "area_m2": 1360.0, "area_sqft": 14638.9,
                "area_acres": 0.336, "area_hectares": 0.136, "perimeter_m": 150.0, "confidence": 92.7,
                "features": ["Building", "Fence"], "latitude": 28.6075, "longitude": 77.2012,
                "status": "AI Detected",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2010, 28.6070], [77.2015, 28.6070], [77.2015, 28.6080], [77.2010, 28.6080], [77.2010, 28.6070]]]
                }
            },
            {
                "id": "P-007", "name": "Outbuilding Plot G7", "area_m2": 1180.0, "area_sqft": 12701.4,
                "area_acres": 0.292, "area_hectares": 0.118, "perimeter_m": 138.0, "confidence": 94.9,
                "features": ["Building", "Shed"], "latitude": 28.6135, "longitude": 77.1982,
                "status": "Validated",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.1980, 28.6130], [77.1985, 28.6130], [77.1985, 28.6140], [77.1980, 28.6140], [77.1980, 28.6130]]]
                }
            },
            {
                "id": "P-008", "name": "Compact Lot H8", "area_m2": 980.0, "area_sqft": 10548.6,
                "area_acres": 0.242, "area_hectares": 0.098, "perimeter_m": 126.0, "confidence": 91.3,
                "features": ["Building"], "latitude": 28.6065, "longitude": 77.2032,
                "status": "AI Detected",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2030, 28.6060], [77.2035, 28.6060], [77.2035, 28.6070], [77.2030, 28.6070], [77.2030, 28.6060]]]
                }
            },
            {
                "id": "P-009", "name": "Courtyard Parcel I9", "area_m2": 1050.0, "area_sqft": 11302.1,
                "area_acres": 0.259, "area_hectares": 0.105, "perimeter_m": 130.0, "confidence": 93.6,
                "features": ["Building", "Garden"], "latitude": 28.6145, "longitude": 77.2002,
                "status": "Validated",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2000, 28.6140], [77.2005, 28.6140], [77.2005, 28.6150], [77.2000, 28.6150], [77.2000, 28.6140]]]
                }
            },
            {
                "id": "P-010", "name": "Access Road Segment R1", "area_m2": 320.0, "area_sqft": 3444.5,
                "area_acres": 0.079, "area_hectares": 0.032, "perimeter_m": 210.0, "confidence": 88.4,
                "features": ["Road"], "latitude": 28.6105, "longitude": 77.2008,
                "status": "AI Detected",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2004, 28.6100], [77.2006, 28.6100], [77.2006, 28.6120], [77.2004, 28.6120], [77.2004, 28.6100]]]
                }
            },
            {
                "id": "P-011", "name": "Main Road Corridor R2", "area_m2": 280.0, "area_sqft": 3013.9,
                "area_acres": 0.069, "area_hectares": 0.028, "perimeter_m": 185.0, "confidence": 89.1,
                "features": ["Road"], "latitude": 28.6115, "longitude": 77.1998,
                "status": "AI Detected",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.1995, 28.6110], [77.1997, 28.6110], [77.1997, 28.6130], [77.1995, 28.6130], [77.1995, 28.6110]]]
                }
            },
            {
                "id": "P-012", "name": "Service Alley R3", "area_m2": 240.0, "area_sqft": 2583.3,
                "area_acres": 0.059, "area_hectares": 0.024, "perimeter_m": 160.0, "confidence": 87.5,
                "features": ["Road"], "latitude": 28.6085, "longitude": 77.2018,
                "status": "AI Detected",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[77.2015, 28.6080], [77.2017, 28.6080], [77.2017, 28.6100], [77.2015, 28.6100], [77.2015, 28.6080]]]
                }
            }
        ]
        for p in sample_parcels:
            self.parcels[p["id"]] = p

db = InMemoryDB()
