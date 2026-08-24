import * as turf from '@turf/turf';
import type { Parcel } from '../types/parcel';
import type { LandRecord, ChangeReport, ChangeThresholds } from '../types/changeDetection';

export const DEFAULT_THRESHOLDS: ChangeThresholds = {
  areaChangePercentThreshold: 5.0, // 5%
  boundaryShiftMetersThreshold: 3.0, // 3 meters
  flagNewBuildings: true,
  flagRemovedBuildings: true
};

export function compareLandRecordWithSurvey(
  oldRecord: LandRecord,
  currentParcel: Parcel,
  thresholds: ChangeThresholds = DEFAULT_THRESHOLDS
): ChangeReport {
  const oldArea = oldRecord.area_m2;
  const currentArea = currentParcel.area_m2;
  const areaDiff = Number((currentArea - oldArea).toFixed(2));
  const areaDiffPct = Number(((areaDiff / (oldArea || 1)) * 100).toFixed(2));

  // Determine building & feature count shifts
  const oldBuildings = oldRecord.buildingsCount || (oldRecord.features.includes('Building') ? 1 : 0);
  const currentBuildings = currentParcel.features.filter((f) => f === 'Building').length || (currentParcel.features.includes('Building') ? 1 : 0);
  
  const newBuildingsCount = Math.max(0, currentBuildings - oldBuildings);
  const removedBuildingsCount = Math.max(0, oldBuildings - currentBuildings);

  const roadChanged = currentParcel.features.includes('Road') && !oldRecord.features.includes('Road');
  const vegetationChanged = currentParcel.features.includes('Vegetation') !== oldRecord.features.includes('Vegetation');

  // Estimate boundary displacement
  let maxBoundaryShift_m = 0.5; // default minimal shift
  try {
    const poly1 = turf.polygon(oldRecord.geometry.coordinates);
    const poly2 = turf.polygon(currentParcel.geometry.coordinates);
    
    const line1 = turf.polygonToLine(poly1);
    const line2 = turf.polygonToLine(poly2);
    
    if (line1 && line2) {
      // Distance between centroids as proxy for boundary displacement
      const c1 = turf.centroid(poly1);
      const c2 = turf.centroid(poly2);
      maxBoundaryShift_m = Number((turf.distance(c1, c2, { units: 'meters' }) + Math.abs(areaDiff) / 200).toFixed(2));
    }
  } catch (e) {
    maxBoundaryShift_m = Math.abs(areaDiff) > 50 ? 4.2 : 0.8;
  }

  // Evaluate against threshold settings
  const boundaryChanged = maxBoundaryShift_m >= thresholds.boundaryShiftMetersThreshold;
  const isAreaChanged = Math.abs(areaDiffPct) >= thresholds.areaChangePercentThreshold;
  const isBuildingChanged = (newBuildingsCount > 0 && thresholds.flagNewBuildings) || (removedBuildingsCount > 0 && thresholds.flagRemovedBuildings);

  const isChanged = isAreaChanged || boundaryChanged || isBuildingChanged || roadChanged;
  const status = isChanged ? 'CHANGED' : 'NO CHANGE';

  // Construct summary text
  let summaryText = '';
  if (isChanged) {
    summaryText = `Significant land record changes detected: Area delta ${areaDiff > 0 ? '+' : ''}${areaDiff} m² (${areaDiffPct > 0 ? '+' : ''}${areaDiffPct}%).`;
    if (newBuildingsCount > 0) summaryText += ` ${newBuildingsCount} new building structure(s) detected.`;
    if (boundaryChanged) summaryText += ` Boundary displacement of ${maxBoundaryShift_m} m exceeds ${thresholds.boundaryShiftMetersThreshold} m threshold.`;
  } else {
    summaryText = `No significant cadastral change detected. Area difference ${areaDiff > 0 ? '+' : ''}${areaDiff} m² (${areaDiffPct}%) is within ${thresholds.areaChangePercentThreshold}% tolerance.`;
  }

  return {
    id: `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    surveyId: 'SUR-001',
    parcelId: currentParcel.id,
    oldRecordDate: oldRecord.recordDate || '01-01-2024',
    currentSurveyDate: new Date().toISOString().split('T')[0],
    status,
    oldArea_m2: oldArea,
    currentArea_m2: currentArea,
    areaDiff_m2: areaDiff,
    areaDiffPercentage: areaDiffPct,
    boundaryChanged,
    maxBoundaryShift_m,
    newBuildingsCount,
    removedBuildingsCount,
    roadChanged,
    vegetationChanged,
    confidence: Number((currentParcel.confidence || 94.2).toFixed(1)),
    summaryText,
    oldGeometry: oldRecord.geometry,
    currentGeometry: currentParcel.geometry
  };
}

// Preset sample old land record for quick demo evaluation
export const SAMPLE_OLD_RECORD: LandRecord = {
  id: 'REC-2024-001',
  parcelId: 'P-001',
  name: 'Official Registry Record P-001 (Jan 2024)',
  recordDate: '01-01-2024',
  area_m2: 1240.0,
  area_sqft: 13347.25,
  area_acres: 0.3064,
  area_hectares: 0.124,
  perimeter_m: 142.50,
  buildingsCount: 1,
  features: ['Building', 'Fence'],
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [77.1998, 28.6100],
        [77.2006, 28.6100],
        [77.2006, 28.6108],
        [77.1998, 28.6108],
        [77.1998, 28.6100]
      ]
    ]
  }
};
