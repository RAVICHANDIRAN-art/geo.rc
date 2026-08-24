import * as turf from '@turf/turf';

export interface CalculatedMeasurements {
  area_m2: number;
  area_sqft: number;
  area_acres: number;
  area_hectares: number;
  perimeter_m: number;
  center: [number, number]; // [lat, lng]
}

/**
 * Calculates area in m², sq.ft, acres, hectares and perimeter in meters for polygon coordinates
 * Coordinates format: Array of [lng, lat]
 */
export function calculateParcelMeasurements(coordinates: number[][]): CalculatedMeasurements {
  if (!coordinates || coordinates.length < 3) {
    return {
      area_m2: 0,
      area_sqft: 0,
      area_acres: 0,
      area_hectares: 0,
      perimeter_m: 0,
      center: [28.6100, 77.2000]
    };
  }

  // Ensure polygon is closed for Turf
  const closedCoords = [...coordinates];
  const first = closedCoords[0];
  const last = closedCoords[closedCoords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closedCoords.push([first[0], first[1]]);
  }

  try {
    const polygon = turf.polygon([closedCoords]);
    
    // Geodesic area in m²
    const area_m2 = turf.area(polygon);
    
    // Unit conversions
    const area_sqft = area_m2 * 10.7639104167;
    const area_acres = area_m2 / 4046.8564224;
    const area_hectares = area_m2 / 10000.0;
    
    // Geodesic perimeter in meters
    const line = turf.polygonToLine(polygon);
    const perimeter_m = line ? turf.length(line, { units: 'meters' }) : 0;
    
    // Center point
    const centerPoint = turf.centerOfMass(polygon);
    const centerLat = centerPoint.geometry.coordinates[1];
    const centerLng = centerPoint.geometry.coordinates[0];

    return {
      area_m2: Number(area_m2.toFixed(2)),
      area_sqft: Number(area_sqft.toFixed(2)),
      area_acres: Number(area_acres.toFixed(4)),
      area_hectares: Number(area_hectares.toFixed(4)),
      perimeter_m: Number(perimeter_m.toFixed(2)),
      center: [centerLat, centerLng]
    };
  } catch (err) {
    console.error('Error calculating polygon measurements:', err);
    // Fallback estimation if geometry calculation has invalid topology
    return {
      area_m2: 0,
      area_sqft: 0,
      area_acres: 0,
      area_hectares: 0,
      perimeter_m: 0,
      center: [coordinates[0][1], coordinates[0][0]]
    };
  }
}

/**
 * Calculates total geodesic distance along line coordinates [lat, lng][]
 */
export function calculateLineDistance(points: [number, number][]): number {
  if (points.length < 2) return 0;
  
  // Convert [lat, lng] to [lng, lat] for turf
  const lineCoords = points.map(p => [p[1], p[0]]);
  try {
    const line = turf.lineString(lineCoords);
    return turf.length(line, { units: 'meters' });
  } catch (e) {
    return 0;
  }
}
