import React, { useState, useRef } from 'react';
import { UploadCloud, FileImage, Trash2, Cpu } from 'lucide-react';
import { formatFileSize } from '../utils/format';

interface UploadPanelProps {
  onStartAnalysis: (files: File[]) => void;
  isProcessing: boolean;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onStartAnalysis, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTriggerAnalysis = () => {
    if (files.length === 0) return;
    onStartAnalysis(files);
  };

  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <UploadCloud className="w-4 h-4 text-indigo-400" />
          Drone Imagery Upload
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 flex items-center gap-1">
          <Cpu className="w-3 h-3 text-indigo-400" />
          AI Simulation Mode
        </span>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
          dragOver
            ? 'border-indigo-500 bg-indigo-950/30'
            : 'border-[#334155] hover:border-indigo-500/50 bg-[#172033]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.tif,.tiff,.geojson"
          onChange={handleFileChange}
          className="hidden"
        />
        <FileImage className="w-7 h-7 mx-auto mb-1 text-indigo-400" />
        <p className="text-xs font-semibold text-white">
          Click or drop drone imagery here
        </p>
        <p className="text-[10px] text-[#94A3B8] mt-0.5">
          Supports JPG, PNG, TIFF, GeoTIFF (Max 500MB)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-[#172033] border border-[#1E293B] text-xs text-white"
            >
              <div className="flex items-center space-x-2 truncate">
                <FileImage className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="truncate max-w-[140px] font-medium">{file.name}</span>
                <span className="text-[10px] text-[#94A3B8] font-mono">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                onClick={() => removeFile(idx)}
                className="p-1 text-[#94A3B8] hover:text-rose-400 hover:bg-rose-950/30 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Run Analysis Action Button */}
      <button
        onClick={handleTriggerAnalysis}
        disabled={files.length === 0 || isProcessing}
        className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 ${
          files.length === 0 || isProcessing
            ? 'bg-[#1E293B] text-[#94A3B8] cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white cursor-pointer'
        }`}
      >
        <Cpu className="w-4 h-4" />
        <span>{isProcessing ? 'AI Processing In Progress...' : 'Run AI Analysis'}</span>
      </button>
    </div>
  );
};
