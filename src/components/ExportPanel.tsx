import React from 'react';
import type { Parcel } from '../types/parcel';
import { Download, FileJson, FileSpreadsheet, FileArchive } from 'lucide-react';
import { exportToGeoJSON, exportToCSV, exportToShapefile } from '../services/export';

interface ExportPanelProps {
  parcels: Parcel[];
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ parcels }) => {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 shadow-xl space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5 text-indigo-400" />
          Export Spatial Data
        </h3>
        <span className="text-[10px] text-[#94A3B8] font-mono">
          {parcels.length} Items
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <button
          onClick={() => exportToGeoJSON(parcels)}
          disabled={parcels.length === 0}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#172033] hover:bg-indigo-600 border border-[#1E293B] hover:border-indigo-500 text-white transition text-[11px] font-semibold group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export standard GIS GeoJSON format"
        >
          <FileJson className="w-4 h-4 mb-1 text-indigo-400 group-hover:text-white" />
          <span>GeoJSON</span>
        </button>

        <button
          onClick={() => exportToCSV(parcels)}
          disabled={parcels.length === 0}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#172033] hover:bg-emerald-600 border border-[#1E293B] hover:border-emerald-500 text-white transition text-[11px] font-semibold group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export CSV dataset with all land metrics"
        >
          <FileSpreadsheet className="w-4 h-4 mb-1 text-emerald-400 group-hover:text-white" />
          <span>CSV</span>
        </button>

        <button
          onClick={() => exportToShapefile(parcels)}
          disabled={parcels.length === 0}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-[#172033] hover:bg-amber-600 border border-[#1E293B] hover:border-amber-500 text-white transition text-[11px] font-semibold group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export Shapefile GeoPackage structure"
        >
          <FileArchive className="w-4 h-4 mb-1 text-amber-400 group-hover:text-white" />
          <span>Shapefile</span>
        </button>
      </div>
    </div>
  );
};
