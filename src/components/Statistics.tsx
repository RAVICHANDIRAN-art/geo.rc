import React from 'react';
import { Layers, Home, Navigation, Map, ShieldCheck } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface StatisticsProps {
  parcelCount: number;
  buildingCount: number;
  roadCount: number;
  totalAreaHa: number;
  avgConfidence: number;
}

export const Statistics: React.FC<StatisticsProps> = ({
  parcelCount,
  buildingCount,
  roadCount,
  totalAreaHa,
  avgConfidence
}) => {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 shadow-xl space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Cadastral Detection Stats
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Parcels Count */}
        <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#94A3B8] font-medium block">Parcels</span>
            <span className="text-base font-extrabold text-indigo-400 font-mono">
              {parcelCount}
            </span>
          </div>
          <Layers className="w-4 h-4 text-indigo-400/60" />
        </div>

        {/* Buildings Count */}
        <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#94A3B8] font-medium block">Buildings</span>
            <span className="text-base font-extrabold text-amber-400 font-mono">
              {buildingCount}
            </span>
          </div>
          <Home className="w-4 h-4 text-amber-400/60" />
        </div>

        {/* Roads Count */}
        <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#94A3B8] font-medium block">Roads</span>
            <span className="text-base font-extrabold text-rose-400 font-mono">
              {roadCount}
            </span>
          </div>
          <Navigation className="w-4 h-4 text-rose-400/60" />
        </div>

        {/* Total Area */}
        <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#94A3B8] font-medium block">Total Area</span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              {formatNumber(totalAreaHa, 1)} ha
            </span>
          </div>
          <Map className="w-4 h-4 text-emerald-400/60" />
        </div>
      </div>

      {/* Avg Confidence bar */}
      <div className="p-2.5 bg-[#172033] rounded-xl border border-[#1E293B] space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-[#94A3B8] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Average Confidence
          </span>
          <span className="text-emerald-400 font-mono">{formatNumber(avgConfidence, 1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#0B1220] rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, avgConfidence))}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
