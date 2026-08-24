import type { GeoJSONGeometry } from './parcel';

export interface SurveyLocation {
  latitude: number;
  longitude: number;
  accuracy?: number; // meters
  source: 'gps' | 'map_click' | 'preset';
}

export interface SurveyInfo {
  surveyId: string;
  location: SurveyLocation | null;
  images: { name: string; size: number; format: string }[];
  status: 'Pending Location & Images' | 'Ready for Analysis' | 'Analysis Completed';
  createdAt: string;
}

export interface LandRecord {
  id: string;
  parcelId: string;
  name: string;
  recordDate: string; // e.g. "2024-01-01"
  area_m2: number;
  area_sqft: number;
  area_acres: number;
  area_hectares: number;
  perimeter_m: number;
  buildingsCount: number;
  features: string[];
  geometry: GeoJSONGeometry;
}

export type ChangeStatusType = 'CHANGED' | 'NO CHANGE';

export interface ChangeReport {
  id: string;
  surveyId: string;
  parcelId: string;
  oldRecordDate: string;
  currentSurveyDate: string;
  status: ChangeStatusType;
  
  // Area Metrics
  oldArea_m2: number;
  currentArea_m2: number;
  areaDiff_m2: number;
  areaDiffPercentage: number;
  
  // Boundary Metrics
  boundaryChanged: boolean;
  maxBoundaryShift_m: number;
  
  // Feature Changes
  newBuildingsCount: number;
  removedBuildingsCount: number;
  roadChanged: boolean;
  vegetationChanged: boolean;
  
  confidence: number;
  summaryText: string;
  
  // Geospatial Diff Geometries
  oldGeometry: GeoJSONGeometry;
  currentGeometry: GeoJSONGeometry;
  changedAreaGeometry?: GeoJSONGeometry;
}

export interface ChangeThresholds {
  areaChangePercentThreshold: number; // e.g., 5.0 (%)
  boundaryShiftMetersThreshold: number; // e.g., 3.0 (meters)
  flagNewBuildings: boolean;
  flagRemovedBuildings: boolean;
}

export type MapViewMode = 'normal' | 'compare_split' | 'compare_overlay';
