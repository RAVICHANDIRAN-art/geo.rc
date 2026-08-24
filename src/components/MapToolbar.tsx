import React from 'react';
import type { MapMode, MapLayerType } from '../types/parcel';
import type { MapViewMode } from '../types/changeDetection';
import { MousePointer, MapPin, Square, Ruler, Layers, Trash2, RefreshCw, Eye } from 'lucide-react';

interface MapToolbarProps {
  currentMode: MapMode;
  onSelectMode: (mode: MapMode) => void;
  activeLayer: MapLayerType;
  onSelectLayer: (layer: MapLayerType) => void;
  onClearActiveDrawing: () => void;
  
  viewMode: MapViewMode;
  onSelectViewMode: (vm: MapViewMode) => void;
}

export const MapToolbar: React.FC<MapToolbarProps> = ({
  currentMode,
  onSelectMode,
  activeLayer,
  onSelectLayer,
  onClearActiveDrawing,
  viewMode,
  onSelectViewMode
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#111827]/90 border border-[#334155] rounded-xl shadow-2xl backdrop-blur-md text-white text-xs z-30 select-none">
      {/* View Mode Split/Compare Switcher */}
      <div className="flex items-center space-x-1 border-r border-[#334155] pr-2">
        <button
          onClick={() => onSelectViewMode('normal')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
            viewMode === 'normal'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
        >
          <Eye className="w-3 h-3" />
          <span>Normal Map</span>
        </button>

        <button
          onClick={() => onSelectViewMode('compare_overlay')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
            viewMode !== 'normal'
              ? 'bg-emerald-600 text-white shadow-md animate-pulse'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
          title="Compare Old Land Record vs Current Drone Survey"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Compare View</span>
        </button>
      </div>

      {/* Mode Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onSelectMode('select')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentMode === 'select'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
          title="Inspect & select parcels"
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span>Select</span>
        </button>

        <button
          onClick={() => onSelectMode('pin')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentMode === 'pin'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
          title="Click anywhere to drop location pin"
        >
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>Drop Pin</span>
        </button>

        <button
          onClick={() => onSelectMode('draw')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentMode === 'draw'
              ? 'bg-indigo-600 text-white shadow-md animate-pulse'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
          title="Click multiple points to draw land boundary"
        >
          <Square className="w-3.5 h-3.5 text-emerald-400" />
          <span>Draw Parcel</span>
        </button>

        <button
          onClick={() => onSelectMode('measure_distance')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentMode === 'measure_distance'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
          title="Measure linear distance between points"
        >
          <Ruler className="w-3.5 h-3.5 text-amber-400" />
          <span>Distance</span>
        </button>

        <button
          onClick={() => onSelectMode('measure_area')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
            currentMode === 'measure_area'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-white'
          }`}
          title="Measure temporary area"
        >
          <Square className="w-3.5 h-3.5 text-cyan-400" />
          <span>Measure Area</span>
        </button>

        <button
          onClick={onClearActiveDrawing}
          className="p-1.5 text-[#94A3B8] hover:text-rose-400 hover:bg-[#1E293B] rounded-lg transition"
          title="Clear current drawing or measurement"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Layer Switcher Dropdown */}
      <div className="flex items-center space-x-1 border-l border-[#334155] pl-2">
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <select
          value={activeLayer}
          onChange={(e) => onSelectLayer(e.target.value as MapLayerType)}
          className="bg-[#0B1220] text-white text-[11px] font-semibold border border-[#334155] rounded-md px-2 py-1 focus:outline-none cursor-pointer"
        >
          <option value="street">OpenStreetMap</option>
          <option value="google_street">Google Maps Streets</option>
          <option value="google_satellite">Google Maps Satellite</option>
          <option value="google_hybrid">Google Maps Hybrid</option>
          <option value="google_terrain">Google Maps Terrain</option>
          <option value="satellite">Esri World Imagery</option>
          <option value="terrain">OpenTopoMap</option>
        </select>
      </div>
    </div>
  );
};
