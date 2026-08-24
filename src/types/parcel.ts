export type FeatureCategory = 'Building' | 'Road' | 'Vegetation' | 'Fence' | 'Driveway' | 'Pool' | 'Shed' | 'Parcel' | 'Verified Boundary';

export type MapMode = 'select' | 'pin' | 'draw' | 'measure_distance' | 'measure_area';

export type MapLayerType = 
  | 'street' 
  | 'google_street' 
  | 'google_satellite' 
  | 'google_hybrid' 
  | 'google_terrain' 
  | 'satellite' 
  | 'terrain';

export interface GeoJSONGeometry {
  type: 'Polygon';
  coordinates: number[][][]; // [[lng, lat], ...]
}

export interface Parcel {
  id: string;
  name: string;
  area_m2: number;
  area_sqft: number;
  area_acres: number;
  area_hectares: number;
  perimeter_m: number;
  confidence: number;
  features: string[];
  latitude: number;
  longitude: number;
  status: 'User Created' | 'AI Detected' | 'Validated';
  geometry: GeoJSONGeometry;
}

export interface PinLocation {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  createdAt: string;
}

export interface MeasurementResult {
  id: string;
  type: 'distance' | 'area';
  points: [number, number][]; // [lat, lng]
  distance_m?: number;
  area_m2?: number;
  area_sqft?: number;
  area_acres?: number;
  area_hectares?: number;
}

export interface FeatureLayerVisibility {
  parcels: boolean;
  buildings: boolean;
  roads: boolean;
  vegetation: boolean;
  verified: boolean;
}

export interface ProcessingStep {
  id: number;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  log: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'processing' | 'success' | 'error';
}

export interface BackendStatus {
  online: boolean;
  service?: string;
  message?: string;
}
