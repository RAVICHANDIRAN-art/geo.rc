import React, { useState } from 'react';
import type { Parcel } from '../types/parcel';
import { formatNumber } from '../utils/format';
import { X, Edit2, Save, Trash2, MapPin, Home, AlertCircle } from 'lucide-react';

interface ParcelDetailsProps {
  parcel: Parcel;
  onClose: () => void;
  onSaveParcel: (updated: Parcel) => void;
  onDeleteParcelRequest: (id: string) => void;
  onStartEditing: (parcel: Parcel) => void;
}

export const ParcelDetails: React.FC<ParcelDetailsProps> = ({
  parcel,
  onClose,
  onSaveParcel,
  onDeleteParcelRequest,
  onStartEditing
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(parcel.name);

  const handleSaveName = () => {
    onSaveParcel({
      ...parcel,
      name: name.trim() || parcel.name
    });
    setIsEditingName(false);
  };

  return (
    <div className="w-96 bg-[#111827] border border-[#334155] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="p-4 bg-[#172033] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-2 truncate">
          <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="truncate">
            {isEditingName ? (
              <div className="flex items-center space-x-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0B1220] border border-indigo-500 rounded px-2 py-1 text-xs text-white"
                />
                <button
                  onClick={handleSaveName}
                  className="p-1 bg-emerald-600 text-white rounded"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <h2 className="font-extrabold text-sm text-white truncate flex items-center gap-1.5">
                {parcel.name}
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-[#94A3B8] hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </h2>
            )}
            <p className="text-xs text-[#94A3B8] font-mono">Parcel ID: {parcel.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-y-auto divide-y divide-[#1E293B] text-xs">
        {/* Status Badge */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase">STATUS & CONFIDENCE</span>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
              {parcel.status}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              {parcel.confidence}% Match
            </span>
          </div>
        </div>

        {/* Location Context (Village / Street / District) */}
        <div className="pt-3 space-y-1.5">
          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            Street & Village Location Context
          </div>
          <div className="p-2.5 bg-[#0B1220] rounded-xl border border-[#1E293B] space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Latitude:</span>
              <span className="text-white font-bold">{parcel.latitude.toFixed(6)}° N</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Longitude:</span>
              <span className="text-white font-bold">{parcel.longitude.toFixed(6)}° E</span>
            </div>
            <div className="flex justify-between border-t border-[#1E293B] pt-1">
              <span className="text-[#94A3B8]">Spatial Feature:</span>
              <span className="text-indigo-300 font-semibold">{parcel.features.join(', ') || 'Cadastral Parcel'}</span>
            </div>
          </div>
        </div>

        {/* Area & Perimeter Measurement Cards */}
        <div className="pt-3 space-y-2">
          <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
            Geodesic Area & Perimeter
          </div>
          <div className="grid grid-cols-2 gap-2 text-center font-mono">
            <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B]">
              <span className="text-[10px] text-[#94A3B8] uppercase block">Acres</span>
              <span className="text-base font-extrabold text-indigo-400">{formatNumber(parcel.area_acres, 3)}</span>
            </div>
            <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B]">
              <span className="text-[10px] text-[#94A3B8] uppercase block">Sq. Feet</span>
              <span className="text-base font-extrabold text-emerald-400">{formatNumber(parcel.area_sqft, 0)}</span>
            </div>
            <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B]">
              <span className="text-[10px] text-[#94A3B8] uppercase block">Square Meters</span>
              <span className="text-sm font-bold text-white">{formatNumber(parcel.area_m2, 1)} m²</span>
            </div>
            <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B]">
              <span className="text-[10px] text-[#94A3B8] uppercase block">Hectares</span>
              <span className="text-sm font-bold text-white">{formatNumber(parcel.area_hectares, 3)} ha</span>
            </div>
          </div>

          <div className="p-2 bg-[#0B1220] rounded-xl border border-[#1E293B] text-center font-mono text-xs">
            <span className="text-[#94A3B8]">Total Perimeter: </span>
            <strong className="text-amber-400">{formatNumber(parcel.perimeter_m, 1)} meters</strong>
          </div>
        </div>

        {/* Legal Boundary Disclaimer */}
        <div className="pt-3">
          <div className="p-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-[10px] text-[#94A3B8] flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Cadastral Disclaimer:</strong> Area and perimeter calculations are geodesic approximations based on vector geometries. This tool does not establish legal land ownership boundaries.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-[#172033] border-t border-[#1E293B] grid grid-cols-2 gap-2">
        <button
          onClick={() => onStartEditing(parcel)}
          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition shadow"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Vertices</span>
        </button>

        <button
          onClick={() => onDeleteParcelRequest(parcel.id)}
          className="px-3 py-2 bg-rose-950/60 hover:bg-rose-600 border border-rose-800 text-rose-300 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Parcel</span>
        </button>
      </div>
    </div>
  );
};
