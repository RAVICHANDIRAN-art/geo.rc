import React from 'react';
import type { ChangeReport } from '../types/changeDetection';
import { X, FileText, Download, AlertCircle, FileSpreadsheet, FileJson } from 'lucide-react';
import { formatNumber } from '../utils/format';

interface ChangeReportCardProps {
  report: ChangeReport | null;
  onClose: () => void;
  onExportGeoJSON: () => void;
  onExportCSV: () => void;
}

export const ChangeReportCard: React.FC<ChangeReportCardProps> = ({
  report,
  onClose,
  onExportGeoJSON,
  onExportCSV
}) => {
  if (!report) return null;

  const isChanged = report.status === 'CHANGED';

  const downloadTextReport = () => {
    const reportText = `
==================================================
URBAN PARCEL MAPPER - CHANGE DETECTION REPORT
==================================================
Survey ID:           ${report.surveyId}
Target Parcel ID:    ${report.parcelId}
Old Record Date:     ${report.oldRecordDate}
Current Survey Date: ${report.currentSurveyDate}
Overall Status:      ${report.status}

--------------------------------------------------
GEOMETRY & LAND AREA COMPARISON
--------------------------------------------------
Old Registered Area:  ${formatNumber(report.oldArea_m2, 2)} m²
Current Drone Area:   ${formatNumber(report.currentArea_m2, 2)} m²
Area Difference:      ${report.areaDiff_m2 > 0 ? '+' : ''}${report.areaDiff_m2} m²
Area Change %:        ${report.areaDiffPercentage > 0 ? '+' : ''}${report.areaDiffPercentage}%
Max Boundary Shift:   ${report.maxBoundaryShift_m} meters
Boundary Status:      ${report.boundaryChanged ? 'Changed (Exceeds Threshold)' : 'No Significant Shift'}

--------------------------------------------------
FEATURE EXTRACTION DIFFERENCES
--------------------------------------------------
New Buildings:        ${report.newBuildingsCount}
Removed Buildings:    ${report.removedBuildingsCount}
Road Alignment:       ${report.roadChanged ? 'Modified' : 'No Change'}
Vegetation Cover:     ${report.vegetationChanged ? 'Modified' : 'No Change'}
AI Confidence Score:  ${report.confidence}%

--------------------------------------------------
EXECUTIVE SUMMARY
--------------------------------------------------
${report.summaryText}

--------------------------------------------------
LEGAL DISCLAIMER
--------------------------------------------------
Change detection provides automated visual and geospatial comparison for preliminary planning.
Official cadastral changes must be verified using authorized government records and certified surveyor data.
==================================================
    `.trim();

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Change_Report_${report.parcelId}_${report.surveyId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#334155] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#172033] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${
              isChanged ? 'bg-rose-950/60 text-rose-400 border-rose-800' : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
                CHANGE DETECTION REPORT
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isChanged ? 'bg-rose-950 text-rose-300 border border-rose-700' : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                }`}>
                  {isChanged ? '🔴 CHANGED' : '🟢 NO CHANGE'}
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8] font-mono">
                Survey ID: {report.surveyId} | Parcel ID: {report.parcelId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto divide-y divide-[#1E293B] text-xs">
          {/* Executive Summary */}
          <div className="p-3 bg-[#172033] rounded-xl border border-[#1E293B] space-y-1">
            <div className="text-[10px] font-bold text-[#94A3B8] uppercase">Summary</div>
            <p className="text-white text-xs leading-relaxed">{report.summaryText}</p>
          </div>

          {/* Dates & Reference */}
          <div className="pt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 bg-[#0B1220] rounded-lg border border-[#1E293B]">
              <span className="text-[#94A3B8] block text-[10px]">Old Land Record Date</span>
              <span className="font-bold text-indigo-300">{report.oldRecordDate}</span>
            </div>
            <div className="p-2 bg-[#0B1220] rounded-lg border border-[#1E293B]">
              <span className="text-[#94A3B8] block text-[10px]">Current Drone Survey</span>
              <span className="font-bold text-emerald-300">{report.currentSurveyDate}</span>
            </div>
          </div>

          {/* Metrics Comparison Table */}
          <div className="pt-3 space-y-2">
            <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
              Land Metric Comparison
            </div>
            <div className="bg-[#0B1220] rounded-xl border border-[#1E293B] overflow-hidden divide-y divide-[#1E293B] text-[11px] font-mono">
              <div className="p-2 flex justify-between">
                <span className="text-[#94A3B8]">Old Registered Area:</span>
                <span className="font-bold text-white">{formatNumber(report.oldArea_m2, 1)} m²</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-[#94A3B8]">Current AI Survey Area:</span>
                <span className="font-bold text-white">{formatNumber(report.currentArea_m2, 1)} m²</span>
              </div>
              <div className="p-2 flex justify-between font-bold bg-[#172033]">
                <span className="text-[#94A3B8]">Area Difference:</span>
                <span className={report.areaDiff_m2 > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                  {report.areaDiff_m2 > 0 ? '+' : ''}{report.areaDiff_m2} m² ({report.areaDiffPercentage > 0 ? '+' : ''}{report.areaDiffPercentage}%)
                </span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-[#94A3B8]">Boundary Status:</span>
                <span className={report.boundaryChanged ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  {report.boundaryChanged ? `Shifted (${report.maxBoundaryShift_m} m)` : 'Aligned'}
                </span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-[#94A3B8]">Building Structures:</span>
                <span className={report.newBuildingsCount > 0 ? 'text-amber-400 font-bold' : 'text-white'}>
                  {report.newBuildingsCount > 0 ? `+${report.newBuildingsCount} New Building` : 'No Change'}
                </span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="text-[#94A3B8]">AI Confidence Score:</span>
                <span className="text-emerald-400 font-bold">{report.confidence}%</span>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="pt-3">
            <div className="p-2.5 bg-[#0B1220] border border-[#1E293B] rounded-xl text-[10px] text-[#94A3B8] flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-tight">
                <strong>Survey Disclaimer:</strong> Change detection provides automated visual/geospatial comparison. Official cadastral changes must be verified using authorized records and professional surveying procedures.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#172033] border-t border-[#1E293B] grid grid-cols-3 gap-2">
          <button
            onClick={onExportGeoJSON}
            className="px-2 py-2 bg-[#0B1220] hover:bg-[#1E293B] border border-[#334155] rounded-xl text-white font-semibold text-[11px] flex items-center justify-center space-x-1 transition"
          >
            <FileJson className="w-3.5 h-3.5 text-indigo-400" />
            <span>GeoJSON</span>
          </button>

          <button
            onClick={onExportCSV}
            className="px-2 py-2 bg-[#0B1220] hover:bg-[#1E293B] border border-[#334155] rounded-xl text-white font-semibold text-[11px] flex items-center justify-center space-x-1 transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>CSV Report</span>
          </button>

          <button
            onClick={downloadTextReport}
            className="px-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[11px] flex items-center justify-center space-x-1 transition shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Text Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
