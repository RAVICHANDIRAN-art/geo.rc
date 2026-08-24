import React from 'react';
import type { PinLocation } from '../types/parcel';
import { MapPin, Trash2, ArrowUpRight } from 'lucide-react';
import { formatCoordinate } from '../utils/format';

interface PinManagerProps {
  pins: PinLocation[];
  onSelectPin: (pin: PinLocation) => void;
  onDeletePin: (id: string) => void;
}

export const PinManager: React.FC<PinManagerProps> = ({
  pins,
  onSelectPin,
  onDeletePin
}) => {
  if (pins.length === 0) return null;

  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          Saved Pins ({pins.length})
        </h3>
      </div>
      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
        {pins.map((pin) => {
          const { latStr, lngStr } = formatCoordinate(pin.latitude, pin.longitude);
          return (
            <div
              key={pin.id}
              className="flex items-center justify-between p-2 rounded-lg bg-[#172033] hover:bg-[#1E293B] border border-[#1E293B] text-xs text-[#E5E7EB] transition group"
            >
              <div className="flex-1 truncate cursor-pointer" onClick={() => onSelectPin(pin)}>
                <div className="font-semibold text-rose-300 truncate">
                  {pin.title || `Pin ${pin.id}`}
                </div>
                <div className="text-[10px] text-[#94A3B8] font-mono">
                  {latStr}, {lngStr}
                </div>
              </div>
              <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100">
                <button
                  onClick={() => onSelectPin(pin)}
                  className="p-1 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 rounded"
                  title="Use Location"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeletePin(pin.id)}
                  className="p-1 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/40 rounded"
                  title="Delete Pin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
