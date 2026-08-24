import React from 'react';
import { Cpu, CheckCircle2, Loader2, Terminal, X } from 'lucide-react';

interface ProcessingPanelProps {
  isOpen: boolean;
  progress: number;
  currentStep: string;
  stepIndex: number;
  logs: string[];
  onClose: () => void;
}

const STAGES = [
  "1. Image Upload Received",
  "2. Image Preprocessing & Contrast Adjustment",
  "3. Orthorectification & Sensor Calibration",
  "4. Orthomosaic Stitching & Tiling",
  "5. SAM / SAM2 Boundary Segmentation",
  "6. Parcel Boundary Extraction",
  "7. YOLOv8 Feature & Infrastructure Detection",
  "8. Cadastral Vector Topology Generation",
  "9. Spatial Geometry & Overlap Validation",
  "10. Final Geospatial Map Layers Rendered"
];

export const ProcessingPanel: React.FC<ProcessingPanelProps> = ({
  isOpen,
  progress,
  currentStep,
  stepIndex,
  logs,
  onClose
}) => {
  if (!isOpen) return null;

  const isCompleted = progress >= 100;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-[#334155] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-[#172033] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                AI CADASTRAL PROCESSING PIPELINE
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
                  AI SIMULATION MODE
                </span>
              </h2>
              <p className="text-xs text-[#94A3B8]">
                SAM2 Boundary Segmentation & YOLOv8 Cadastral Extraction
              </p>
            </div>
          </div>
          {isCompleted && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Progress Bar & Status */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-indigo-400 flex items-center gap-1.5">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                )}
                {currentStep}
              </span>
              <span className="font-mono text-emerald-400 text-sm">{progress}%</span>
            </div>

            <div className="w-full h-3 bg-[#172033] rounded-full overflow-hidden border border-[#334155] p-[2px]">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 rounded-full transition-all duration-300 shadow-md"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 10 Pipeline Stages Checklist */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {STAGES.map((stage, idx) => {
              const isDone = idx < stepIndex || isCompleted;
              const isCurrent = idx === stepIndex && !isCompleted;
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-medium border transition ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : isCurrent
                      ? 'bg-indigo-950/40 border-indigo-600/60 text-white shadow-md'
                      : 'bg-[#172033]/40 border-[#1E293B] text-[#94A3B8]'
                  }`}
                >
                  <span className="truncate">{stage}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#334155] shrink-0"></span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Execution Log Box */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              Live Execution Log
            </div>
            <div className="bg-[#0B1220] border border-[#1E293B] rounded-xl p-3 font-mono text-[11px] text-emerald-400 max-h-28 overflow-y-auto space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="leading-tight">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#172033] border-t border-[#1E293B] flex justify-end">
          <button
            onClick={onClose}
            disabled={!isCompleted}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-[#1E293B] text-[#94A3B8] cursor-not-allowed'
            }`}
          >
            {isCompleted ? 'View Mapped Parcels' : 'Processing Pipeline...'}
          </button>
        </div>
      </div>
    </div>
  );
};
