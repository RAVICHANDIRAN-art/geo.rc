import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MapView } from './components/MapView';
import { MapToolbar } from './components/MapToolbar';
import { SearchBox } from './components/SearchBox';
import { ParcelDetails } from './components/ParcelDetails';
import { ProcessingPanel } from './components/ProcessingPanel';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';
import { Legend } from './components/Legend';
import { ChangeReportCard } from './components/ChangeReportCard';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminConsole } from './components/AdminConsole';
import type { Parcel, PinLocation, LogEntry, MapMode, MapLayerType, FeatureLayerVisibility } from './types/parcel';
import type { SurveyInfo, LandRecord, ChangeReport, ChangeThresholds, MapViewMode } from './types/changeDetection';
import type { UserProfile } from './types/auth';
import { DEMO_PARCELS } from './data/demoData';
import { DEFAULT_THRESHOLDS, SAMPLE_OLD_RECORD } from './utils/changeAnalysis';
import { checkBackendHealth, fetchParcelsFromBackend } from './services/api';
import { exportToGeoJSON, exportToCSV } from './services/export';
import { getCurrentUserFromStorage, setCurrentUserInStorage, updateUserLastActive } from './services/authService';
import { logUserActivity } from './services/activityService';

export const App: React.FC = () => {
  // Navigation & Authentication View State: 'map' | 'login' | 'register' | 'admin'
  const [currentView, setCurrentView] = useState<'map' | 'login' | 'register' | 'admin'>('map');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUserFromStorage());

  // Heartbeat session tracking (updates lastActive every 60s)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      updateUserLastActive(currentUser.uid);
    }, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Core Application State
  const [parcels, setParcels] = useState<Parcel[]>(() => {
    const saved = localStorage.getItem('urban_mapper_parcels');
    return saved ? JSON.parse(saved) : DEMO_PARCELS;
  });

  const [pins, setPins] = useState<PinLocation[]>(() => {
    const saved = localStorage.getItem('urban_mapper_pins');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [editingParcel, setEditingParcel] = useState<Parcel | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [mapMode, setMapMode] = useState<MapMode>('select');
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('street');
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6100, 77.2000]);
  const [zoomLevel, setZoomLevel] = useState<number>(15);

  const [featureVisibility, setFeatureVisibility] = useState<FeatureLayerVisibility>({
    parcels: true,
    buildings: true,
    roads: true,
    vegetation: true,
    verified: true
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Upgrade Modules State: Survey, Location Picker, Change Detection
  const [surveyLocationFromMap, setSurveyLocationFromMap] = useState<{ lat: number; lng: number } | null>(null);
  const [surveyInfo, setSurveyInfo] = useState<SurveyInfo | null>(null);
  const [isPickingLocationFromMap, setIsPickingLocationFromMap] = useState<boolean>(false);

  const [viewMode, setViewMode] = useState<MapViewMode>('normal');
  const [oldRecord, setOldRecord] = useState<LandRecord | null>(SAMPLE_OLD_RECORD);
  const [activeReport, setActiveReport] = useState<ChangeReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [thresholds, setThresholds] = useState<ChangeThresholds>(DEFAULT_THRESHOLDS);

  // AI Pipeline State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineCurrentStep, setPipelineCurrentStep] = useState<string>('');
  const [pipelineStepIndex, setPipelineStepIndex] = useState<number>(0);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState<boolean>(false);

  const addLog = useCallback((text: string, type: 'info' | 'processing' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp,
      text,
      type
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
  }, []);

  useEffect(() => {
    localStorage.setItem('urban_mapper_parcels', JSON.stringify(parcels));
  }, [parcels]);

  useEffect(() => {
    localStorage.setItem('urban_mapper_pins', JSON.stringify(pins));
  }, [pins]);

  useEffect(() => {
    addLog('System initialized.', 'info');
    addLog('Interactive Leaflet map engine active.', 'info');

    const checkHealth = async () => {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);
      if (isOnline) {
        addLog('Connected to FastAPI backend at http://127.0.0.1:8000', 'success');
        const remoteParcels = await fetchParcelsFromBackend();
        if (remoteParcels.length > 0) {
          setParcels(remoteParcels);
        }
      } else {
        addLog('Backend offline. Operating in local simulation mode.', 'processing');
      }
    };
    checkHealth();
  }, [addLog]);

  const handleLogout = () => {
    if (currentUser) {
      logUserActivity(currentUser, 'LOGOUT', 'User logged out of session.');
    }
    setCurrentUser(null);
    setCurrentUserInStorage(null);
    setCurrentView('login');
    addLog('User logged out.', 'info');
  };

  const handleLoadDemoData = () => {
    setParcels(DEMO_PARCELS);
    setMapCenter([28.6100, 77.2000]);
    setZoomLevel(15);
    addLog('Loaded 12 sample parcels, 9 buildings, and 3 road segments around New Delhi (28.61° N, 77.20° E).', 'success');
  };

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to clear local storage data?')) {
      localStorage.removeItem('urban_mapper_parcels');
      localStorage.removeItem('urban_mapper_pins');
      setParcels([]);
      setPins([]);
      setSelectedParcel(null);
      setEditingParcel(null);
      setActiveReport(null);
      addLog('Local stored parcels and pins cleared.', 'info');
    }
  };

  const handleSelectLocation = (lat: number, lng: number, title: string, zoom?: number) => {
    setMapCenter([lat, lng]);
    setZoomLevel(zoom || 15);
    const newPin: PinLocation = {
      id: Math.random().toString(36).substring(2, 7).toUpperCase(),
      latitude: lat,
      longitude: lng,
      title: title.split(',')[0] || title,
      createdAt: new Date().toISOString()
    };
    setPins((prev) => [newPin, ...prev]);
    logUserActivity(currentUser, 'PIN_CREATED', `Searched & pinned location: '${title.split(',')[0]}' (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    addLog(`Searched & pinned location: '${title.split(',')[0]}' (${lat.toFixed(4)}, ${lng.toFixed(4)})`, 'success');
  };

  const handleAddPin = (lat: number, lng: number) => {
    if (isPickingLocationFromMap) {
      setSurveyLocationFromMap({ lat, lng });
      setIsPickingLocationFromMap(false);
      setMapMode('select');
      addLog(`Selected survey location on map: ${lat.toFixed(6)}°, ${lng.toFixed(6)}°`, 'success');
      return;
    }

    const newPin: PinLocation = {
      id: Math.random().toString(36).substring(2, 7).toUpperCase(),
      latitude: lat,
      longitude: lng,
      createdAt: new Date().toISOString()
    };
    setPins((prev) => [newPin, ...prev]);
    logUserActivity(currentUser, 'PIN_CREATED', `Created a map pin at ${lat.toFixed(6)}°, ${lng.toFixed(6)}°`);
    addLog(`Dropped new location pin at ${lat.toFixed(6)}°, ${lng.toFixed(6)}°`, 'info');
  };

  const handleDeletePin = (id: string) => {
    setPins((prev) => prev.filter((p) => p.id !== id));
    addLog(`Deleted pin ${id}`, 'info');
  };

  const handleSelectPinLocation = (pin: PinLocation) => {
    setMapCenter([pin.latitude, pin.longitude]);
    setZoomLevel(17);
    addLog(`Panned map to pin ${pin.id}`, 'info');
  };

  const handleSaveCreatedParcel = (newParcel: Parcel) => {
    setParcels((prev) => [newParcel, ...prev]);
    setSelectedParcel(newParcel);
    setMapMode('select');
    logUserActivity(currentUser, 'PARCEL_CREATED', `Created parcel ${newParcel.id} (${newParcel.name})`);
    addLog(`Created new parcel '${newParcel.name}' with area ${newParcel.area_acres} Acres.`, 'success');
  };

  const handleSaveParcel = (updated: Parcel) => {
    setParcels((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedParcel(updated);
    setEditingParcel(null);
    addLog(`Saved updates for parcel ${updated.id}`, 'success');
  };

  const handleConfirmDeleteParcel = () => {
    if (!deleteTargetId) return;
    setParcels((prev) => prev.filter((p) => p.id !== deleteTargetId));
    if (selectedParcel?.id === deleteTargetId) setSelectedParcel(null);
    if (editingParcel?.id === deleteTargetId) setEditingParcel(null);
    addLog(`Deleted parcel ${deleteTargetId}`, 'info');
    setDeleteTargetId(null);
  };

  const handleStartAIAnalysis = async (info: SurveyInfo) => {
    setSurveyInfo(info);
    setIsProcessing(true);
    setIsPipelineModalOpen(true);
    setPipelineProgress(5);
    setPipelineStepIndex(0);
    setPipelineCurrentStep('Uploading imagery...');
    setPipelineLogs([`[${new Date().toLocaleTimeString()}] Drone survey '${info.surveyId}' started with ${info.images.length} images.`]);
    logUserActivity(currentUser, 'AI_ANALYSIS', `Started AI analysis for Survey ID ${info.surveyId}`);
    addLog(`Started AI drone survey analysis pipeline for Survey ID ${info.surveyId}`, 'processing');

    try {
      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep += 1;
        const progress = Math.min(100, Math.round(((currentStep + 1) / 11) * 100));
        setPipelineProgress(progress);
        setPipelineStepIndex(currentStep);

        const STAGES = [
          "Uploading imagery",
          "Image preprocessing",
          "Orthomosaic preparation",
          "Parcel segmentation",
          "Boundary extraction",
          "Building detection",
          "Road detection",
          "Vegetation detection",
          "Cadastral feature extraction",
          "Geometry validation",
          "Map generation"
        ];

        const stageName = STAGES[Math.min(currentStep, STAGES.length - 1)];
        setPipelineCurrentStep(stageName);
        setPipelineLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Step ${currentStep + 1}/11: ${stageName} completed.`]);

        if (currentStep >= 10 || progress >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setParcels(DEMO_PARCELS);
          if (info.location) {
            setMapCenter([info.location.latitude, info.location.longitude]);
          }
          setZoomLevel(15);
          addLog('AI Survey analysis completed! Mapped 12 parcels, 9 buildings, 3 roads, 12 boundaries, 7 vegetation areas.', 'success');
        }
      }, 1000);
    } catch (e) {
      setIsProcessing(false);
      addLog('Error executing AI analysis pipeline.', 'error');
    }
  };

  const handleRunComparison = (oldRec: LandRecord, report: ChangeReport) => {
    setOldRecord(oldRec);
    setActiveReport(report);
    setViewMode('compare_overlay');
    setIsReportModalOpen(true);
    logUserActivity(currentUser, 'CHANGE_DETECTION', `Compared old land record with current survey. Status: ${report.status}`);
    addLog(`Executed Change Detection comparison: Overall status ${report.status}`, report.status === 'CHANGED' ? 'processing' : 'success');
  };

  // View Routing: Login Page
  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'ADMIN') {
            setCurrentView('admin');
          } else {
            setCurrentView('map');
          }
        }}
        onGoToRegister={() => setCurrentView('register')}
      />
    );
  }

  // View Routing: Registration Page
  if (currentView === 'register') {
    return (
      <RegisterPage
        onRegisterSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView('map');
        }}
        onGoToLogin={() => setCurrentView('login')}
      />
    );
  }

  // View Routing: Admin Console Page
  if (currentView === 'admin' && currentUser && currentUser.role === 'ADMIN') {
    return (
      <AdminConsole
        currentUser={currentUser}
        onLogout={handleLogout}
        onGoToMap={() => setCurrentView('map')}
      />
    );
  }

  // Default View: Interactive GIS Map
  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B1220] overflow-hidden text-white font-sans">
      <Header
        backendOnline={backendOnline}
        isDemoMode={!backendOnline}
        onLoadDemoData={handleLoadDemoData}
        onClearLocalData={handleClearLocalData}
      />

      <div className="flex-1 flex relative overflow-hidden">
        <Sidebar
          parcels={parcels}
          pins={pins}
          logs={logs}
          isProcessing={isProcessing}
          isOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onStartAIAnalysis={handleStartAIAnalysis}
          onEnableMapLocationPicker={() => {
            setIsPickingLocationFromMap(true);
            setMapMode('pin');
            addLog('Click anywhere on the map to pick the survey location.', 'info');
          }}
          selectedLocationFromMap={surveyLocationFromMap}
          onSelectPin={handleSelectPinLocation}
          onDeletePin={handleDeletePin}
          onClearLogs={() => setLogs([])}
          onRunComparison={handleRunComparison}
          onOpenReportModal={(r) => {
            setActiveReport(r);
            setIsReportModalOpen(true);
          }}
          activeReport={activeReport}
          thresholds={thresholds}
          onUpdateThresholds={(t) => {
            setThresholds(t);
            addLog(`Updated change detection thresholds: Area ${t.areaChangePercentThreshold}%, Shift ${t.boundaryShiftMetersThreshold}m`, 'info');
          }}
        />

        <main className="flex-1 relative h-full w-full overflow-hidden">
          {/* Top Search & Toolbar & Auth Route Actions */}
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pointer-events-none">
            <div className="pointer-events-auto">
              <SearchBox onSelectLocation={handleSelectLocation} />
            </div>

            <div className="pointer-events-auto flex items-center space-x-2">
              <MapToolbar
                currentMode={mapMode}
                onSelectMode={setMapMode}
                activeLayer={activeLayer}
                onSelectLayer={setActiveLayer}
                onClearActiveDrawing={() => {
                  setMapMode('select');
                  addLog('Cleared drawing tool.', 'info');
                }}
                viewMode={viewMode}
                onSelectViewMode={(vm) => {
                  setViewMode(vm);
                  addLog(`Switched map view mode to '${vm}'`, 'info');
                }}
              />

              {/* User Account / Admin Console Top Trigger */}
              {currentUser ? (
                <div className="flex items-center space-x-1.5 p-1.5 bg-[#111827]/90 border border-[#334155] rounded-xl shadow-2xl backdrop-blur-md text-xs">
                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="px-2.5 py-1 bg-rose-950/80 text-rose-300 hover:bg-rose-600 hover:text-white rounded-lg font-bold text-[11px] transition border border-rose-800"
                    >
                      Admin Console
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-2.5 py-1 bg-[#172033] hover:bg-rose-950/40 text-[#94A3B8] hover:text-rose-400 rounded-lg text-[11px] font-semibold transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xl transition"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>

          <MapView
            parcels={parcels}
            selectedParcel={selectedParcel}
            onSelectParcel={(p) => setSelectedParcel(p)}
            pins={pins}
            onAddPin={handleAddPin}
            onDeletePin={handleDeletePin}
            onSelectPinLocation={handleSelectPinLocation}
            mode={mapMode}
            activeLayer={activeLayer}
            featureVisibility={featureVisibility}
            onSaveCreatedParcel={handleSaveCreatedParcel}
            editingParcel={editingParcel}
            onUpdateEditingParcel={(updated) => {
              setEditingParcel(updated);
              setParcels((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }}
            mapCenter={mapCenter}
            zoomLevel={zoomLevel}
            viewMode={viewMode}
            oldRecord={oldRecord}
            changeReport={activeReport}
            surveyLocation={surveyInfo?.location ? { lat: surveyInfo.location.latitude, lng: surveyInfo.location.longitude } : null}
          />

          <div className="absolute bottom-4 left-4 z-20 hidden sm:block">
            <Legend
              visibility={featureVisibility}
              onToggleLayer={(layerKey) => {
                setFeatureVisibility((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
              }}
            />
          </div>

          {selectedParcel && (
            <div className="absolute top-20 right-4 z-30">
              <ParcelDetails
                parcel={selectedParcel}
                onClose={() => {
                  setSelectedParcel(null);
                  setEditingParcel(null);
                }}
                onSaveParcel={handleSaveParcel}
                onDeleteParcelRequest={(id) => setDeleteTargetId(id)}
                onStartEditing={(p) => {
                  setEditingParcel(p);
                  addLog(`Started vertex editing mode for parcel ${p.id}`, 'info');
                }}
              />
            </div>
          )}
        </main>
      </div>

      <ProcessingPanel
        isOpen={isPipelineModalOpen}
        progress={pipelineProgress}
        currentStep={pipelineCurrentStep}
        stepIndex={pipelineStepIndex}
        logs={pipelineLogs}
        onClose={() => setIsPipelineModalOpen(false)}
      />

      <DeleteConfirmationModal
        isOpen={deleteTargetId !== null}
        parcelId={deleteTargetId}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDeleteParcel}
      />

      {isReportModalOpen && (
        <ChangeReportCard
          report={activeReport}
          onClose={() => setIsReportModalOpen(false)}
          onExportGeoJSON={() => {
            exportToGeoJSON(parcels);
            logUserActivity(currentUser, 'EXPORT', 'Exported GeoJSON spatial dataset.');
          }}
          onExportCSV={() => {
            exportToCSV(parcels);
            logUserActivity(currentUser, 'EXPORT', 'Exported CSV land area metrics report.');
          }}
        />
      )}
    </div>
  );
};

export default App;
