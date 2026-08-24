import type { Parcel } from '../types/parcel';

export function exportToGeoJSON(parcels: Parcel[]) {
  const features = parcels.map(p => ({
    type: 'Feature',
    geometry: p.geometry,
    properties: {
      id: p.id,
      name: p.name,
      area_m2: p.area_m2,
      area_sqft: p.area_sqft,
      area_acres: p.area_acres,
      area_hectares: p.area_hectares,
      perimeter_m: p.perimeter_m,
      confidence: p.confidence,
      features: p.features.join(', '),
      latitude: p.latitude,
      longitude: p.longitude,
      status: p.status
    }
  }));

  const geojson = {
    type: 'FeatureCollection',
    name: 'Urban_Parcel_Mapper_Export',
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features
  };

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'urban_parcels.geojson');
}

export function exportToCSV(parcels: Parcel[]) {
  const headers = [
    'ID', 'Name', 'Area_m2', 'Area_sqft', 'Area_acres', 'Area_hectares',
    'Perimeter_m', 'Confidence', 'Features', 'Latitude', 'Longitude', 'Status'
  ];

  const rows = parcels.map(p => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    p.area_m2,
    p.area_sqft,
    p.area_acres,
    p.area_hectares,
    p.perimeter_m,
    p.confidence,
    `"${p.features.join(', ')}"`,
    p.latitude,
    p.longitude,
    `"${p.status}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, 'urban_parcels.csv');
}

export function exportToShapefile(parcels: Parcel[]) {
  const features = parcels.map(p => ({
    type: 'Feature',
    geometry: p.geometry,
    properties: {
      PARCEL_ID: p.id,
      NAME: p.name,
      AREA_M2: p.area_m2,
      AREA_AC: p.area_acres,
      PERIM_M: p.perimeter_m,
      STATUS: p.status
    }
  }));

  const shapefileBundle = {
    type: 'FeatureCollection',
    metadata: {
      format: 'ESRI Shapefile GeoPackage Json',
      srid: 4326
    },
    features
  };

  const blob = new Blob([JSON.stringify(shapefileBundle, null, 2)], { type: 'application/json' });
  downloadBlob(blob, 'urban_parcels_shapefile.json');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
