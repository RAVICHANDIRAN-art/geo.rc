import React, { useState, useRef } from 'react';
import type { LandRecord, ChangeReport, ChangeThresholds } from '../types/changeDetection';
import type { Parcel } from '../types/parcel';
import { compareLandRecordWithSurvey, SAMPLE_OLD_RECORD } from '../utils/changeAnalysis';
import { RefreshCw, FileText, Settings, Sliders } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface ChangeDetectionPanelProps {
  currentParcels: Parcel[];
  onRunComparison: (oldRecord: LandRecord, report: ChangeReport) => void;
  onOpenReportModal: (report: ChangeReport) => void;
  activeReport: ChangeReport | null;
  thresholds: ChangeThresholds;
  onUpdateThresholds: (t: ChangeThresholds) => void;
}

export const ChangeDetectionPanel: React.FC<ChangeDetectionPanelProps> = ({
  currentParcels,
  onRunComparison,
  onOpenReportModal,
  activeReport,
  thresholds,
  onUpdateThresholds
}) => {
  const [oldRecord, setOldRecord] = useState<LandRecord>(SAMPLE_OLD_RECORD);
  const [showSettings, setShowSettings] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.type === 'FeatureCollection' && json.features.length > 0) {
            const feat = json.features[0];
            const uploadedRecord: LandRecord = {
              id: feat.properties.id || 'REC-UPLOADED',
              parcelId: feat.properties.parcelId || 'P-001',
              name: feat.properties.name || file.name,
              recordDate: feat.properties.recordDate || '2024-01-01',
              area_m2: feat.properties.area_m2 || 1240.0,
              area_sqft: feat.properties.area_sqft || 13347.25,
              area_acres: feat.properties.area_acres || 0.3064,
              area_hectares: feat.properties.area_hectares || 0.124,
              perimeter_m: feat.properties.perimeter_m || 142.50,
              buildingsCount: feat.properties.buildingsCount || 1,
              features: feat.properties.features ? String(feat.properties.features).split(',') : ['Building'],
              geometry: feat.geometry
            };
            setOldRecord(uploadedRecord);
          }
        } catch (err) {
          alert('Error parsing uploaded GeoJSON record. Using default sample record.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteCompare = () => {
    if (currentParcels.length === 0) {
      alert('Please run AI Survey Analysis or load demo parcels before running change detection comparison.');
      return;
    }

    setIsComparing(true);
    const targetParcel = currentParcels.find((p) => p.id === 'P-001') || currentParcels[0];

    setTimeout(() => {
      const report = compareLandRecordWithSurvey(oldRecord, targetParcel, thresholds);
      setIsComparing(false);
      onRunComparison(oldRecord, report);
    }, 1000);
  };

  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 shadow-xl space-y-3 text-white">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          🔄 Change Detection
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#172033] rounded-lg transition border border-[#334155]"
          title="Configure Change Thresholds"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-[#172033] border border-indigo-500/40 rounded-xl p-3 space-y-2 text-xs animate-in fade-in duration-150">
          <div className="font-bold text-indigo-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <Settings className="w-3.5 h-3.5" />
            Configurable Threshold Settings
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="text-[#94A3B8] block mb-1 font-medium">Area Change (%):</label>
              <input
                type="number"
                step="0.5"
                value={thresholds.areaChangePercentThreshold}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    areaChangePercentThreshold: parseFloat(e.target.value) || 5.0
                  })
                }
                className="w-full bg-[#0B1220] border border-[#334155] rounded px-2 py-1 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[#94A3B8] block mb-1 font-medium">Shift Limit (m):</label>
              <input
                type="number"
                step="0.5"
                value={thresholds.boundaryShiftMetersThreshold}
                onChange={(e) =>
                  onUpdateThresholds({
                    ...thresholds,
                    boundaryShiftMetersThreshold: parseFloat(e.target.value) || 3.0
                  })
                }
                className="w-full bg-[#0B1220] border border-[#334155] rounded px-2 py-1 text-white font-mono font-bold"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#172033] border border-[#1E293B] rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">OLD LAND RECORD</span>
          <div className="font-bold text-white text-[11px] truncate">{oldRecord.name}</div>
          <div className="text-[10px] text-[#94A3B8] font-mono">Date: {oldRecord.recordDate}</div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-1 px-2 py-1 bg-[#0B1220] hover:bg-[#1E293B] border border-[#334155] rounded text-[10px] font-semibold text-indigo-300 transition"
          >
            Upload GeoJSON Record
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.geojson"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div className="bg-[#172033] border border-[#1E293B] rounded-xl p-2.5 space-y-1.5">
          <span className="text-[10px] font-bold text-[#94A3B8] uppercase block">CURRENT DRONE SURVEY</span>
          <div className="font-bold text-emerald-400 text-[11px] truncate">Current AI Analysis</div>
          <div className="text-[10px] text-[#94A3B8] font-mono">Parcels Mapped: {currentParcels.length}</div>
          <div className="text-[10px] text-emerald-300 italic pt-1">Active AI Data Ready</div>
        </div>
      </div>

      <button
        onClick={handleExecuteCompare}
        disabled={isComparing}
        className="w-full py-2.5 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-lg transition active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
      >
        <RefreshCw className={`w-4 h-4 ${isComparing ? 'animate-spin' : ''}`} />
        <span>{isComparing ? 'Comparing Geometries...' : '🔄 COMPARE OLD VS CURRENT'}</span>
      </button>

      {activeReport && (
        <div className="bg-[#172033] border border-[#334155] rounded-xl p-3 space-y-2.5 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase">CHANGE DETECTION RESULT</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1 ${
                activeReport.status === 'CHANGED'
                  ? 'bg-rose-950 text-rose-300 border border-rose-700'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
              }`}
            >
              {activeReport.status === 'CHANGED' ? '🔴 CHANGED' : '🟢 NO CHANGE'}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Old Area:</span>
              <span className="text-white">{formatNumber(activeReport.oldArea_m2, 1)} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Current Area:</span>
              <span className="text-white">{formatNumber(activeReport.currentArea_m2, 1)} m²</span>
            </div>
            <div className="flex justify-between font-bold border-t border-[#1E293B] pt-1">
              <span className="text-[#94A3B8]">Area Delta:</span>
              <span className={activeReport.areaDiff_m2 > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                {activeReport.areaDiff_m2 > 0 ? '+' : ''}{activeReport.areaDiff_m2} m² ({activeReport.areaDiffPercentage > 0 ? '+' : ''}{activeReport.areaDiffPercentage}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Boundary Shift:</span>
              <span className="text-amber-300">{activeReport.maxBoundaryShift_m} m</span>
            </div>
            {activeReport.newBuildingsCount > 0 && (
              <div className="flex justify-between text-amber-400 font-bold">
                <span>New Structure:</span>
                <span>+{activeReport.newBuildingsCount} Building Detected</span>
              </div>
            )}
          </div>

          <button
            onClick={() => onOpenReportModal(activeReport)}
            className="w-full py-1.5 px-2 bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white rounded-lg font-bold text-[11px] flex items-center justify-center space-x-1 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Full Change Report</span>
          </button>
        </div>
      )}
    </div>
  );
};
