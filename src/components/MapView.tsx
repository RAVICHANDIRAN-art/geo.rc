import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  CircleMarker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type {
  Parcel,
  PinLocation,
  MapMode,
  MapLayerType,
  FeatureLayerVisibility
} from '../types/parcel';
import type { LandRecord, ChangeReport, MapViewMode } from '../types/changeDetection';
import { calculateParcelMeasurements, calculateLineDistance } from '../utils/area';
import { formatNumber } from '../utils/format';
import { MapPin, Trash2, ArrowUpRight, Check, X, Ruler, RefreshCw } from 'lucide-react';

// Fix Leaflet default marker icon paths in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const customPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const surveyMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  parcels: Parcel[];
  selectedParcel: Parcel | null;
  onSelectParcel: (parcel: Parcel | null) => void;
  pins: PinLocation[];
  onAddPin: (lat: number, lng: number) => void;
  onDeletePin: (id: string) => void;
  onSelectPinLocation: (pin: PinLocation) => void;
  mode: MapMode;
  activeLayer: MapLayerType;
  featureVisibility: FeatureLayerVisibility;
  onSaveCreatedParcel: (parcel: Parcel) => void;
  editingParcel: Parcel | null;
  onUpdateEditingParcel: (updated: Parcel) => void;
  mapCenter: [number, number];
  zoomLevel: number;
  
  // Change Detection & Survey Props
  viewMode: MapViewMode;
  oldRecord: LandRecord | null;
  changeReport: ChangeReport | null;
  surveyLocation: { lat: number; lng: number } | null;
}

const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
};

const MapEventListener: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
  onMouseMove: (lat: number, lng: number) => void;
}> = ({ onMapClick, onMouseMove }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    mousemove(e) {
      onMouseMove(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  parcels,
  selectedParcel,
  onSelectParcel,
  pins,
  onAddPin,
  onDeletePin,
  onSelectPinLocation,
  mode,
  activeLayer,
  featureVisibility,
  onSaveCreatedParcel,
  editingParcel,
  onUpdateEditingParcel,
  mapCenter,
  zoomLevel,
  viewMode,
  oldRecord,
  changeReport,
  surveyLocation
}) => {
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setDrawingPoints([]);
    setMeasurePoints([]);
  }, [mode]);

  const handleMapClick = (lat: number, lng: number) => {
    if (mode === 'pin') {
      onAddPin(lat, lng);
    } else if (mode === 'draw') {
      setDrawingPoints((prev) => [...prev, [lng, lat]]);
    } else if (mode === 'measure_distance' || mode === 'measure_area') {
      setMeasurePoints((prev) => [...prev, [lat, lng]]);
    }
  };

  const handleMouseMove = (lat: number, lng: number) => {
    setCursorCoords({ lat, lng });
  };

  const handleCompleteDrawing = () => {
    if (drawingPoints.length < 3) return;

    const coords = [...drawingPoints];
    coords.push([coords[0][0], coords[0][1]]);

    const metrics = calculateParcelMeasurements(coords);
    const newParcelId = `P-${String(parcels.length + 1).padStart(3, '0')}`;

    const newParcel: Parcel = {
      id: newParcelId,
      name: `User Parcel ${newParcelId}`,
      area_m2: metrics.area_m2,
      area_sqft: metrics.area_sqft,
      area_acres: metrics.area_acres,
      area_hectares: metrics.area_hectares,
      perimeter_m: metrics.perimeter_m,
      confidence: 100.0,
      features: ['User Drawn Boundary'],
      latitude: metrics.center[0],
      longitude: metrics.center[1],
      status: 'User Created',
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    };

    onSaveCreatedParcel(newParcel);
    setDrawingPoints([]);
  };

  const handleDeleteVertex = (vertexIndex: number) => {
    if (!editingParcel) return;
    const coords = [...editingParcel.geometry.coordinates[0]];
    if (coords.length <= 4) {
      alert('A polygon parcel must have at least 3 vertices.');
      return;
    }
    coords.splice(vertexIndex, 1);
    if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
      coords.push([coords[0][0], coords[0][1]]);
    }

    const metrics = calculateParcelMeasurements(coords);
    const updated: Parcel = {
      ...editingParcel,
      area_m2: metrics.area_m2,
      area_sqft: metrics.area_sqft,
      area_acres: metrics.area_acres,
      area_hectares: metrics.area_hectares,
      perimeter_m: metrics.perimeter_m,
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    };
    onUpdateEditingParcel(updated);
  };

  // Ultra-Fast Google Maps & Tile Server Subdomains Configuration
  const googleSubdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
  const googleStreetUrl = 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
  const googleSatUrl = 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
  const googleHybridUrl = 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
  const googleTerrainUrl = 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';

  const satelliteUrl =
    import.meta.env.VITE_SATELLITE_TILE_URL ||
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

  const terrainUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
  const streetUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const liveDrawingMetrics =
    drawingPoints.length >= 3 ? calculateParcelMeasurements(drawingPoints) : null;

  const liveDistanceM =
    measurePoints.length >= 2 ? calculateLineDistance(measurePoints) : 0;

  const liveAreaMetrics =
    measurePoints.length >= 3
      ? calculateParcelMeasurements(measurePoints.map((p) => [p[1], p[0]]))
      : null;

  const toLeafletPositions = (coords: number[][]): [number, number][] => coords.map((pt) => [pt[1], pt[0]]);

  return (
    <div className="relative w-full h-full bg-[#0B1220] overflow-hidden select-none">
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        zoomControl={false}
        preferCanvas={true}
        inertia={true}
        inertiaDeceleration={3000}
        wheelDebounceTime={40}
        className="w-full h-full z-10"
      >
        <MapController center={mapCenter} zoom={zoomLevel} />
        <MapEventListener
          onMapClick={handleMapClick}
          onMouseMove={handleMouseMove}
        />

        {/* High Performance Subdomain Tile Layers with Buffer Preloading */}
        {activeLayer === 'google_street' && (
          <TileLayer
            attribution="&copy; Google Maps"
            url={googleStreetUrl}
            subdomains={googleSubdomains}
            maxZoom={20}
            keepBuffer={6}
            updateWhenIdle={false}
          />
        )}
        {activeLayer === 'google_satellite' && (
          <TileLayer
            attribution="&copy; Google Maps Satellite"
            url={googleSatUrl}
            subdomains={googleSubdomains}
            maxZoom={20}
            keepBuffer={6}
            updateWhenIdle={false}
          />
        )}
        {activeLayer === 'google_hybrid' && (
          <TileLayer
            attribution="&copy; Google Maps Hybrid"
            url={googleHybridUrl}
            subdomains={googleSubdomains}
            maxZoom={20}
            keepBuffer={6}
            updateWhenIdle={false}
          />
        )}
        {activeLayer === 'google_terrain' && (
          <TileLayer
            attribution="&copy; Google Maps Terrain"
            url={googleTerrainUrl}
            subdomains={googleSubdomains}
            maxZoom={20}
            keepBuffer={6}
            updateWhenIdle={false}
          />
        )}
        {activeLayer === 'satellite' && (
          <TileLayer
            attribution="&copy; Esri World Imagery"
            url={satelliteUrl}
            maxZoom={19}
            keepBuffer={6}
            updateWhenIdle={false}
          />
        )}
        {activeLayer === 'terrain' && (
          <TileLayer
            attribution='&copy; OpenTopoMap'
            url={terrainUrl}
            subdomains={['a', 'b', 'c']}
            maxZoom={17}
            keepBuffer={6}
          />
        )}
        {activeLayer === 'street' && (
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url={streetUrl}
            subdomains={['a', 'b', 'c']}
            maxZoom={19}
            keepBuffer={6}
            updateWhenIdle={false}
          />
        )}

        {/* Survey Marker */}
        {surveyLocation && (
          <Marker
            position={[surveyLocation.lat, surveyLocation.lng]}
            icon={surveyMarkerIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-1 text-xs font-sans">
                <div className="font-bold text-purple-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  SURVEY LOCATION (SUR-001)
                </div>
                <div className="font-mono text-[11px] text-gray-700">
                  Lat: {surveyLocation.lat.toFixed(6)}°, Lng: {surveyLocation.lng.toFixed(6)}°
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Saved User Pins */}
        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={customPinIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 space-y-2 text-xs font-sans">
                <div className="font-bold text-rose-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {pin.title || `LOCATION PIN (${pin.id})`}
                </div>
                <div className="font-mono text-[11px] text-gray-700 bg-gray-100 p-1.5 rounded">
                  <div>
                    <strong>Latitude:</strong> {pin.latitude.toFixed(6)}
                  </div>
                  <div>
                    <strong>Longitude:</strong> {pin.longitude.toFixed(6)}
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={() => onSelectPinLocation(pin)}
                    className="flex-1 px-2 py-1 bg-indigo-600 text-white rounded font-semibold text-[10px] flex items-center justify-center gap-1"
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    Use Location
                  </button>
                  <button
                    onClick={() => onDeletePin(pin.id)}
                    className="px-2 py-1 bg-rose-600 text-white rounded font-semibold text-[10px] flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Pin
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Normal Parcels Layer */}
        {viewMode === 'normal' &&
          featureVisibility.parcels &&
          parcels.map((parcel) => {
            const isSelected = selectedParcel?.id === parcel.id;
            const isEditing = editingParcel?.id === parcel.id;
            const positions = toLeafletPositions(parcel.geometry.coordinates[0]);

            let color = '#4F46E5'; // Default Indigo
            if (parcel.features.includes('Building') && featureVisibility.buildings) {
              color = '#FBBF24'; // Amber
            } else if (parcel.features.includes('Road') && featureVisibility.roads) {
              color = '#F87171'; // Red
            } else if (parcel.status === 'Validated' && featureVisibility.verified) {
              color = '#34D399'; // Emerald
            }

            return (
              <React.Fragment key={parcel.id}>
                <Polygon
                  positions={positions}
                  pathOptions={{
                    color: isSelected ? '#38BDF8' : color,
                    fillColor: color,
                    fillOpacity: isSelected ? 0.45 : 0.25,
                    weight: isSelected ? 3.5 : 2,
                    dashArray: isEditing ? '6, 6' : undefined
                  }}
                  eventHandlers={{
                    click: () => onSelectParcel(parcel)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 space-y-1.5 font-sans text-xs">
                      <div className="font-bold text-indigo-700 flex items-center justify-between">
                        <span>{parcel.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                          {parcel.id}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-gray-800">
                        <div>
                          <strong>Area:</strong> {formatNumber(parcel.area_acres, 3)} Acres ({formatNumber(parcel.area_m2, 1)} m²)
                        </div>
                        <div>
                          <strong>Perimeter:</strong> {formatNumber(parcel.perimeter_m, 1)} m
                        </div>
                        <div>
                          <strong>Status:</strong> {parcel.status}
                        </div>
                      </div>
                      <button
                        onClick={() => onSelectParcel(parcel)}
                        className="w-full mt-1 px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold"
                      >
                        Inspect Full Details
                      </button>
                    </div>
                  </Popup>
                </Polygon>

                {isEditing &&
                  positions.slice(0, -1).map((pt, vIdx) => (
                    <CircleMarker
                      key={`vertex-${parcel.id}-${vIdx}`}
                      center={pt}
                      radius={6}
                      pathOptions={{ color: '#FFFFFF', fillColor: '#EF4444', fillOpacity: 1, weight: 2 }}
                      eventHandlers={{ click: () => handleDeleteVertex(vIdx) }}
                    />
                  ))}
              </React.Fragment>
            );
          })}

        {/* Change Detection Map Overlay Layer */}
        {viewMode !== 'normal' && (
          <>
            {oldRecord && (
              <Polygon
                positions={toLeafletPositions(oldRecord.geometry.coordinates[0])}
                pathOptions={{
                  color: '#64748B',
                  fillColor: '#64748B',
                  fillOpacity: 0.15,
                  weight: 3,
                  dashArray: '8, 8'
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-1 text-xs font-sans">
                    <div className="font-bold text-gray-700">OLD REGISTERED LAND RECORD</div>
                    <div className="text-[11px] text-gray-600 font-mono">
                      Area: {formatNumber(oldRecord.area_m2, 1)} m² | Date: {oldRecord.recordDate}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            )}

            {parcels.map((parcel) => (
              <Polygon
                key={`cmp-${parcel.id}`}
                positions={toLeafletPositions(parcel.geometry.coordinates[0])}
                pathOptions={{
                  color: '#10B981',
                  fillColor: '#10B981',
                  fillOpacity: 0.25,
                  weight: 3
                }}
                eventHandlers={{ click: () => onSelectParcel(parcel) }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 space-y-1 text-xs font-sans">
                    <div className="font-bold text-emerald-700">CURRENT DRONE SURVEY ({parcel.id})</div>
                    <div className="text-[11px] font-mono">
                      Area: {formatNumber(parcel.area_m2, 1)} m² | Status: {parcel.status}
                    </div>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {changeReport && changeReport.status === 'CHANGED' && (
              <Polygon
                positions={toLeafletPositions(changeReport.currentGeometry.coordinates[0])}
                pathOptions={{
                  color: '#EF4444',
                  fillColor: '#EF4444',
                  fillOpacity: 0.35,
                  weight: 2,
                  dashArray: '4, 4'
                }}
              />
            )}
          </>
        )}

        {/* Live Polygon Drawing Overlay */}
        {mode === 'draw' && drawingPoints.length > 0 && (
          <>
            {drawingPoints.length === 1 ? (
              <CircleMarker
                center={[drawingPoints[0][1], drawingPoints[0][0]]}
                radius={6}
                pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.8 }}
              />
            ) : drawingPoints.length === 2 ? (
              <Polyline
                positions={drawingPoints.map((pt) => [pt[1], pt[0]])}
                pathOptions={{ color: '#10B981', weight: 3, dashArray: '5, 5' }}
              />
            ) : (
              <Polygon
                positions={drawingPoints.map((pt) => [pt[1], pt[0]])}
                pathOptions={{ color: '#10B981', fillColor: '#10B981', fillOpacity: 0.3, weight: 3, dashArray: '5, 5' }}
              />
            )}
            {drawingPoints.map((pt, idx) => (
              <CircleMarker
                key={`draft-pt-${idx}`}
                center={[pt[1], pt[0]]}
                radius={5}
                pathOptions={{ color: '#FFFFFF', fillColor: '#10B981', fillOpacity: 1 }}
              />
            ))}
          </>
        )}

        {/* Distance Measurement Line Overlay */}
        {mode === 'measure_distance' && measurePoints.length > 0 && (
          <>
            <Polyline positions={measurePoints} pathOptions={{ color: '#F59E0B', weight: 3, dashArray: '6, 6' }} />
            {measurePoints.map((pt, i) => (
              <CircleMarker key={`dist-pt-${i}`} center={pt} radius={5} pathOptions={{ color: '#FFFFFF', fillColor: '#F59E0B', fillOpacity: 1 }} />
            ))}
          </>
        )}

        {/* Area Measurement Overlay */}
        {mode === 'measure_area' && measurePoints.length > 0 && (
          <>
            {measurePoints.length >= 3 ? (
              <Polygon positions={measurePoints} pathOptions={{ color: '#06B6D4', fillColor: '#06B6D4', fillOpacity: 0.3, weight: 3 }} />
            ) : (
              <Polyline positions={measurePoints} pathOptions={{ color: '#06B6D4', weight: 3, dashArray: '4, 4' }} />
            )}
            {measurePoints.map((pt, i) => (
              <CircleMarker key={`area-pt-${i}`} center={pt} radius={5} pathOptions={{ color: '#FFFFFF', fillColor: '#06B6D4', fillOpacity: 1 }} />
            ))}
          </>
        )}
      </MapContainer>

      {/* Floating Change Detection Map Legend in Compare View */}
      {viewMode !== 'normal' && (
        <div className="absolute bottom-4 left-4 z-20 bg-[#111827]/90 border border-emerald-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md text-white text-xs select-none space-y-1.5 min-w-[200px] animate-in fade-in">
          <div className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>CHANGE MAP LEGEND</span>
          </div>
          <div className="space-y-1 text-[11px] font-medium">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded border border-[#64748B] bg-[#64748B]/30 border-dashed"></span>
              <span className="text-[#94A3B8]">OLD RECORD (Dashed Gray)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded border border-emerald-400 bg-emerald-500/30"></span>
              <span className="text-emerald-300">CURRENT SURVEY (Green Solid)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded border border-rose-500 bg-rose-500/40"></span>
              <span className="text-rose-300">CHANGED AREA (Red Highlight)</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Polygon Drawing Action Banner */}
      {mode === 'draw' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#111827]/90 border border-emerald-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 text-white text-xs flex items-center space-x-4 animate-in fade-in slide-in-from-top-4">
          <div>
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Drawing Land Boundary ({drawingPoints.length} Points)
            </div>
            <div className="text-[11px] text-[#94A3B8] mt-0.5 font-mono">
              {liveDrawingMetrics ? (
                <>
                  Area: <strong>{formatNumber(liveDrawingMetrics.area_acres, 3)} Acres</strong> ({formatNumber(liveDrawingMetrics.area_sqft, 0)} sq.ft) | Perim: {formatNumber(liveDrawingMetrics.perimeter_m, 1)} m
                </>
              ) : (
                'Click at least 3 points on the map to form a parcel boundary.'
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCompleteDrawing}
              disabled={drawingPoints.length < 3}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-xs shadow-md transition ${
                drawingPoints.length >= 3
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                  : 'bg-[#1E293B] text-[#94A3B8] cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              Complete Polygon
            </button>
            <button
              onClick={() => setDrawingPoints([])}
              className="p-1.5 bg-[#172033] hover:bg-rose-950/40 text-[#94A3B8] hover:text-rose-400 rounded-lg border border-[#334155]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Distance Measurement HUD */}
      {mode === 'measure_distance' && measurePoints.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#111827]/90 border border-amber-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 text-white text-xs flex items-center space-x-4">
          <div>
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Ruler className="w-4 h-4" />
              Linear Distance Measurement
            </div>
            <div className="text-sm font-bold font-mono text-white mt-0.5">
              Total Distance: <span className="text-amber-300">{formatNumber(liveDistanceM, 2)} meters</span> ({formatNumber(liveDistanceM * 3.28084, 1)} ft)
            </div>
          </div>
          <button
            onClick={() => setMeasurePoints([])}
            className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-600 border border-rose-800 text-white rounded-lg text-xs font-semibold"
          >
            Clear
          </button>
        </div>
      )}

      {/* Area Measurement HUD */}
      {mode === 'measure_area' && measurePoints.length > 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#111827]/90 border border-cyan-500/50 rounded-xl p-3 shadow-2xl backdrop-blur-md z-20 text-white text-xs flex items-center space-x-4">
          <div>
            <div className="font-bold text-cyan-400">Measured Area</div>
            {liveAreaMetrics ? (
              <div className="text-xs font-mono text-white mt-0.5 space-x-2">
                <span className="text-cyan-300 font-bold">{formatNumber(liveAreaMetrics.area_acres, 3)} Acres</span>
                <span>•</span>
                <span>{formatNumber(liveAreaMetrics.area_sqft, 0)} sq.ft</span>
                <span>•</span>
                <span>{formatNumber(liveAreaMetrics.area_m2, 1)} m²</span>
              </div>
            ) : (
              <div className="text-[11px] text-[#94A3B8]">Click at least 3 points for area.</div>
            )}
          </div>
          <button
            onClick={() => setMeasurePoints([])}
            className="px-2.5 py-1.5 bg-rose-950/50 hover:bg-rose-600 border border-rose-800 text-white rounded-lg text-xs font-semibold"
          >
            Clear
          </button>
        </div>
      )}

      {/* Live Mouse Coordinates Bar */}
      {cursorCoords && (
        <div className="absolute bottom-3 right-3 bg-[#111827]/90 border border-[#334155] px-3 py-1 rounded-lg shadow-xl backdrop-blur-md z-20 text-[11px] font-mono text-[#94A3B8] flex items-center space-x-3">
          <span>
            LAT: <strong className="text-white">{cursorCoords.lat.toFixed(6)}°</strong>
          </span>
          <span>
            LNG: <strong className="text-white">{cursorCoords.lng.toFixed(6)}°</strong>
          </span>
        </div>
      )}
    </div>
  );
};
