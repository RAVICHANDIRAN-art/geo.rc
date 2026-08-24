import * as turf from '@turf/turf';

export function isPolygonValid(coordinates: number[][]): { valid: boolean; reason?: string } {
  if (!coordinates || coordinates.length < 3) {
    return { valid: false, reason: 'At least 3 boundary vertices are required to form a parcel polygon.' };
  }

  const closed = [...coordinates];
  if (closed[0][0] !== closed[closed.length - 1][0] || closed[0][1] !== closed[closed.length - 1][1]) {
    closed.push(closed[0]);
  }

  try {
    const poly = turf.polygon([closed]);
    const kinks = turf.kinks(poly);
    if (kinks.features.length > 0) {
      return { valid: false, reason: 'Polygon boundary self-intersects. Please adjust vertices.' };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: 'Invalid polygon geometry configuration.' };
  }
}
