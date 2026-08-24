import React from 'react';
import { MapPin, RefreshCw, Database, AlertCircle, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  backendOnline: boolean;
  isDemoMode: boolean;
  onLoadDemoData: () => void;
  onClearLocalData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendOnline,
  onLoadDemoData,
  onClearLocalData
}) => {
  return (
    <header className="h-16 bg-[#111827] border-b border-[#1E293B] px-4 flex items-center justify-between text-white select-none z-30 shadow-md">
      {/* Brand Title */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[2px] shadow-lg flex items-center justify-center">
          <div className="w-full h-full bg-[#0B1220] rounded-[6px] flex items-center justify-center">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
            URBAN PARCEL MAPPER
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
              v2.4 Enterprise GIS
            </span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium hidden sm:block">
            AI-Powered Urban Land Mapping & Cadastral Feature Extraction
          </p>
        </div>
      </div>

      {/* Center Status & Actions */}
      <div className="flex items-center space-x-3">
        {/* Backend / Offline Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
          backendOnline
            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
            : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          {backendOnline ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              SYSTEM ONLINE
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Demo Mode — Backend Offline
            </span>
          )}
        </div>

        {/* Demo Data Button */}
        <button
          onClick={onLoadDemoData}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-sm active:scale-95 cursor-pointer"
          title="Load 12 sample parcels, 9 buildings & 3 roads around New Delhi"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Load Demo Data</span>
        </button>

        {/* Reset Local Data Button */}
        <button
          onClick={onClearLocalData}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-md bg-[#172033] hover:bg-[#1E293B] text-[#94A3B8] hover:text-white text-xs font-medium border border-[#334155] transition"
          title="Clear local storage data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Clear Local</span>
        </button>
      </div>
    </header>
  );
};
