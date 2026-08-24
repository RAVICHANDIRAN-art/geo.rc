import React from 'react';
import type { FeatureLayerVisibility } from '../types/parcel';
import { Eye, EyeOff, Layers } from 'lucide-react';

interface LegendProps {
  visibility: FeatureLayerVisibility;
  onToggleLayer: (layer: keyof FeatureLayerVisibility) => void;
}

export const Legend: React.FC<LegendProps> = ({ visibility, onToggleLayer }) => {
  const items: { key: keyof FeatureLayerVisibility; label: string; color: string; bg: string; border: string }[] = [
    { key: 'parcels', label: 'Cadastral Parcels', color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500' },
    { key: 'buildings', label: 'Buildings', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-400' },
    { key: 'roads', label: 'Road Networks', color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-400' },
    { key: 'vegetation', label: 'Vegetation', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-400' },
    { key: 'verified', label: 'Verified Boundary', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-400' }
  ];

  return (
    <div className="bg-[#111827]/90 border border-[#334155] rounded-xl p-2.5 shadow-2xl backdrop-blur-md text-white text-xs select-none space-y-1.5 min-w-[180px]">
      <div className="flex items-center space-x-1 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
        <Layers className="w-3.5 h-3.5 text-indigo-400" />
        <span>Feature Layers</span>
      </div>

      <div className="space-y-1">
        {items.map((item) => {
          const isVisible = visibility[item.key];
          return (
            <button
              key={item.key}
              onClick={() => onToggleLayer(item.key)}
              className={`w-full flex items-center justify-between px-2 py-1 rounded-md transition ${
                isVisible ? 'bg-[#172033] hover:bg-[#1E293B]' : 'opacity-50 bg-[#0B1220]'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`w-3 h-3 rounded-sm ${item.bg} border ${item.border}`}></span>
                <span className={`text-[11px] font-medium ${isVisible ? 'text-white' : 'text-[#94A3B8]'}`}>
                  {item.label}
                </span>
              </div>
              {isVisible ? (
                <Eye className="w-3 h-3 text-indigo-400" />
              ) : (
                <EyeOff className="w-3 h-3 text-[#64748B]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
