import React, { useState } from 'react';
import type { Parcel, PinLocation, LogEntry } from '../types/parcel';
import type { SurveyInfo, LandRecord, ChangeReport, ChangeThresholds } from '../types/changeDetection';
import { DroneSurveyPanel } from './DroneSurveyPanel';
import { ChangeDetectionPanel } from './ChangeDetectionPanel';
import { Statistics } from './Statistics';
import { ProcessingLog } from './ProcessingLog';
import { ExportPanel } from './ExportPanel';
import { PinManager } from './PinManager';
import { LegalDisclaimer } from './LegalDisclaimer';
import { Layers, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface SidebarProps {
  parcels: Parcel[];
  pins: PinLocation[];
  logs: LogEntry[];
  isProcessing: boolean;
  isOpen: boolean;
  onToggleSidebar: () => void;
  onStartAIAnalysis: (surveyInfo: SurveyInfo) => void;
  onEnableMapLocationPicker: () => void;
  selectedLocationFromMap: { lat: number; lng: number } | null;
  onSelectPin: (pin: PinLocation) => void;
  onDeletePin: (id: string) => void;
  onClearLogs: () => void;
  
  // Change Detection props
  onRunComparison: (oldRecord: LandRecord, report: ChangeReport) => void;
  onOpenReportModal: (report: ChangeReport) => void;
  activeReport: ChangeReport | null;
  thresholds: ChangeThresholds;
  onUpdateThresholds: (t: ChangeThresholds) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  parcels,
  pins,
  logs,
  isProcessing,
  isOpen,
  onToggleSidebar,
  onStartAIAnalysis,
  onEnableMapLocationPicker,
  selectedLocationFromMap,
  onSelectPin,
  onDeletePin,
  onClearLogs,
  onRunComparison,
  onOpenReportModal,
  activeReport,
  thresholds,
  onUpdateThresholds
}) => {
  const [activeTab, setActiveTab] = useState<'survey' | 'change' | 'stats'>('survey');

  // Compute aggregated stats
  const parcelCount = parcels.length;
  const buildingCount = parcels.filter((p) => p.features.includes('Building')).length;
  const roadCount = parcels.filter((p) => p.features.includes('Road')).length;
  const totalAreaHa = parcels.reduce((sum, p) => sum + p.area_hectares, 0);
  const avgConfidence =
    parcels.length > 0
      ? parcels.reduce((sum, p) => sum + (p.confidence || 95), 0) / parcels.length
      : 0;

  return (
    <>
      {/* Toggle button when closed on desktop/mobile */}
      <button
        onClick={onToggleSidebar}
        className={`fixed left-0 top-20 z-40 p-2 bg-[#111827] border border-l-0 border-[#334155] text-indigo-400 hover:text-white rounded-r-xl shadow-2xl transition ${
          isOpen ? 'hidden md:flex md:left-[330px]' : 'flex'
        }`}
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full w-[330px] bg-[#111827] border-r border-[#1E293B] z-30 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 bg-[#172033] border-b border-[#1E293B] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">GIS DASHBOARD</h2>
              <span className="text-[10px] text-[#94A3B8]">Urban Cadastral & Drone Survey</span>
            </div>
          </div>
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1 text-[#94A3B8] hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="grid grid-cols-3 bg-[#0B1220] border-b border-[#1E293B] p-1 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('survey')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'survey' ? 'bg-indigo-600 text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            🛰️ Survey
          </button>

          <button
            onClick={() => setActiveTab('change')}
            className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
              activeTab === 'change' ? 'bg-emerald-600 text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            <span>Change</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`py-1.5 rounded-lg transition ${
              activeTab === 'stats' ? 'bg-indigo-600 text-white shadow-md' : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {/* Scrollable Dashboard Sections */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 divide-y divide-[#1E293B]">
          {activeTab === 'survey' && (
            <div className="space-y-3">
              <DroneSurveyPanel
                onStartAIAnalysis={onStartAIAnalysis}
                onEnableMapLocationPicker={onEnableMapLocationPicker}
                selectedLocationFromMap={selectedLocationFromMap}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {activeTab === 'change' && (
            <div className="space-y-3">
              <ChangeDetectionPanel
                currentParcels={parcels}
                onRunComparison={onRunComparison}
                onOpenReportModal={onOpenReportModal}
                activeReport={activeReport}
                thresholds={thresholds}
                onUpdateThresholds={onUpdateThresholds}
              />
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-3">
              <Statistics
                parcelCount={parcelCount}
                buildingCount={buildingCount}
                roadCount={roadCount}
                totalAreaHa={totalAreaHa}
                avgConfidence={avgConfidence}
              />
            </div>
          )}

          {/* Persistent Pin Manager if pins present */}
          {pins.length > 0 && (
            <div className="pt-3">
              <PinManager pins={pins} onSelectPin={onSelectPin} onDeletePin={onDeletePin} />
            </div>
          )}

          {/* Live Processing Console Log */}
          <div className="pt-3">
            <ProcessingLog logs={logs} onClearLogs={onClearLogs} />
          </div>

          {/* Export Panel */}
          <div className="pt-3">
            <ExportPanel parcels={parcels} />
          </div>

          {/* Legal Disclaimer */}
          <div className="pt-3">
            <LegalDisclaimer />
          </div>
        </div>
      </aside>
    </>
  );
};
