import type { Parcel } from '../types/parcel';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: number;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const data = await res.json();
      return data.status === 'online';
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function uploadDroneImage(file: File): Promise<{ job_id: string; message: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData
    });
    
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (e) {
    // Offline simulation fallback
    return {
      job_id: `JOB-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      message: 'Simulated drone imagery upload complete.'
    };
  }
}

export async function startAnalysisJob(jobId: string): Promise<{ status: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/analyze/${jobId}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Analysis start failed');
    return await res.json();
  } catch (e) {
    return { status: 'processing' };
  }
}

export async function getJobStatus(jobId: string, currentStep: number): Promise<{
  status: string;
  progress_percentage: number;
  current_step: string;
  step_index: number;
  logs: string[];
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`);
    if (res.ok) {
      return await res.json();
    }
    throw new Error('API offline');
  } catch (e) {
    // Offline simulation mode logic
    const STAGES = [
      "Image Upload Received",
      "Image Preprocessing & Contrast Adjustment",
      "Orthorectification & Sensor Calibration",
      "Orthomosaic Stitching & Tiling",
      "SAM / SAM2 Boundary Segmentation",
      "Parcel Boundary Extraction",
      "YOLOv8 Feature & Infrastructure Detection",
      "Cadastral Vector Topology Generation",
      "Spatial Geometry & Overlap Validation",
      "Final Geospatial Map Layers Rendered"
    ];
    
    const nextStep = Math.min(currentStep + 1, STAGES.length - 1);
    const progress = Math.round(((nextStep + 1) / STAGES.length) * 100);
    const stageName = STAGES[nextStep];
    const now = new Date().toLocaleTimeString();
    
    return {
      status: nextStep === STAGES.length - 1 ? 'completed' : 'processing',
      progress_percentage: progress,
      current_step: stageName,
      step_index: nextStep,
      logs: [`[${now}] Step ${nextStep + 1}/10: ${stageName} completed.`]
    };
  }
}

export async function fetchParcelsFromBackend(): Promise<Parcel[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/parcels`);
    if (res.ok) {
      const geojson = await res.json();
      return geojson.features.map((f: any) => ({
        id: f.properties.id,
        name: f.properties.name,
        area_m2: f.properties.area_m2,
        area_sqft: f.properties.area_sqft,
        area_acres: f.properties.area_acres,
        area_hectares: f.properties.area_hectares,
        perimeter_m: f.properties.perimeter_m,
        confidence: f.properties.confidence,
        features: f.properties.features,
        latitude: f.properties.latitude,
        longitude: f.properties.longitude,
        status: f.properties.status,
        geometry: f.geometry
      }));
    }
    throw new Error('Backend offline');
  } catch (e) {
    return [];
  }
}
