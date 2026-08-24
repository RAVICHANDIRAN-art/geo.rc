import React, { useState, useRef } from 'react';
import type { SurveyLocation, SurveyInfo } from '../types/changeDetection';
import { UploadCloud, FileImage, MapPin, Navigation, Cpu, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { formatFileSize } from '../utils/format';

interface DroneSurveyPanelProps {
  onStartAIAnalysis: (surveyInfo: SurveyInfo) => void;
  onEnableMapLocationPicker: () => void;
  selectedLocationFromMap: { lat: number; lng: number } | null;
  isProcessing: boolean;
}

export const DroneSurveyPanel: React.FC<DroneSurveyPanelProps> = ({
  onStartAIAnalysis,
  onEnableMapLocationPicker,
  selectedLocationFromMap,
  isProcessing
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [surveyLocation, setSurveyLocation] = useState<SurveyLocation | null>(null);
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Reverse geocode lat/lng into human readable location name
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (googleApiKey && googleApiKey.trim() !== '') {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            setPlaceName(data.results[0].formatted_address);
            return;
          }
        }
      }

      const osmRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (osmRes.ok) {
        const osmData = await osmRes.json();
        if (osmData.display_name) {
          setPlaceName(osmData.display_name);
        }
      }
    } catch (e) {
      setPlaceName(null);
    }
  };

  // Sync when user selects location on map
  React.useEffect(() => {
    if (selectedLocationFromMap) {
      setSurveyLocation({
        latitude: selectedLocationFromMap.lat,
        longitude: selectedLocationFromMap.lng,
        source: 'map_click'
      });
      setGpsError(null);
      reverseGeocode(selectedLocationFromMap.lat, selectedLocationFromMap.lng);
    }
  }, [selectedLocationFromMap]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // High-accuracy Geolocation Request
  const handleUseCurrentLocation = () => {
    setGpsError(null);
    setLocating(true);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = Number(position.coords.accuracy.toFixed(1));

        setSurveyLocation({
          latitude: lat,
          longitude: lng,
          accuracy,
          source: 'gps'
        });

        reverseGeocode(lat, lng);
        setLocating(false);
      },
      (err) => {
        setGpsError(`GPS Access Note: ${err.message}. Set center to New Delhi demo coordinate.`);
        setSurveyLocation({
          latitude: 28.6100,
          longitude: 77.2000,
          accuracy: 15,
          source: 'gps'
        });
        setPlaceName('New Delhi, India (Demo Center)');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const isReadyForAnalysis = files.length > 0 && surveyLocation !== null;

  const handleTriggerAnalysis = () => {
    if (!isReadyForAnalysis || !surveyLocation) return;
    const surveyInfo: SurveyInfo = {
      surveyId: 'SUR-001',
      location: surveyLocation,
      images: files.map((f) => ({ name: f.name, size: f.size, format: f.name.split('.').pop() || 'tif' })),
      status: 'Ready for Analysis',
      createdAt: new Date().toISOString()
    };
    onStartAIAnalysis(surveyInfo);
  };

  return (
    <div className="bg-[#111827] border border-[#334155] rounded-xl p-3 shadow-xl space-y-3 text-white">
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
          <span className="text-base">🛰️</span> Drone Survey
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700">
          AI Simulation Mode
        </span>
      </div>

      {/* Upload Box */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-[#94A3B8] flex items-center justify-between">
          <span>Upload Drone Imagery</span>
          {files.length > 0 && (
            <span className="text-emerald-400 font-mono text-[10px]">{files.length} Files Uploaded</span>
          )}
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#334155] hover:border-indigo-500 rounded-xl p-3 text-center cursor-pointer bg-[#172033]/50 transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.tif,.tiff,.geojson"
            onChange={handleFileChange}
            className="hidden"
          />
          <UploadCloud className="w-6 h-6 mx-auto mb-1 text-indigo-400" />
          <p className="text-xs font-semibold">Upload Drone Images</p>
          <p className="text-[10px] text-[#94A3B8]">Supports JPG, PNG, TIFF, GeoTIFF</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {files.map((f, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#172033] border border-[#1E293B] text-[11px]"
              >
                <div className="flex items-center space-x-1.5 truncate">
                  <FileImage className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate max-w-[130px] font-medium">{f.name}</span>
                  <span className="text-[10px] text-[#94A3B8] font-mono">{formatFileSize(f.size)}</span>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 text-[#94A3B8] hover:text-rose-400 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Survey Location Buttons */}
      <div className="space-y-2 pt-1 border-t border-[#1E293B]">
        <div className="text-[11px] font-semibold text-[#94A3B8] flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span>📍 Survey Location</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="px-2.5 py-1.5 bg-[#172033] hover:bg-indigo-600 border border-[#334155] text-white rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            {locating ? <Loader2 className="w-3 h-3 animate-spin text-emerald-400" /> : <Navigation className="w-3 h-3 text-emerald-400" />}
            <span>{locating ? 'Locating...' : 'Use Current Location'}</span>
          </button>

          <button
            onClick={onEnableMapLocationPicker}
            className="px-2.5 py-1.5 bg-[#172033] hover:bg-indigo-600 border border-[#334155] text-white rounded-lg text-[11px] font-semibold flex items-center justify-center space-x-1 transition cursor-pointer"
          >
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>Select Location on Map</span>
          </button>
        </div>

        {gpsError && (
          <div className="p-2 bg-amber-950/60 border border-amber-800 rounded-lg text-[10px] text-amber-300 flex items-start space-x-1">
            <AlertCircle className="w-3 h-3 shrink-0 mt-0.5 text-amber-400" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Survey Information Card */}
      <div className="bg-[#172033] border border-[#1E293B] rounded-xl p-3 space-y-2 text-xs">
        <div className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center justify-between">
          <span>SURVEY INFORMATION</span>
          <span className="font-mono text-indigo-400 text-[10px]">SUR-001</span>
        </div>

        <div className="space-y-1 text-[11px]">
          {placeName && (
            <div className="text-[10px] font-semibold text-emerald-300 truncate pb-1 border-b border-[#1E293B]">
              📍 {placeName}
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Latitude:</span>
            <span className="font-mono font-bold text-white">{surveyLocation ? surveyLocation.latitude.toFixed(6) : '--'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Longitude:</span>
            <span className="font-mono font-bold text-white">{surveyLocation ? surveyLocation.longitude.toFixed(6) : '--'}</span>
          </div>
          {surveyLocation?.accuracy && (
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Accuracy:</span>
              <span className="font-mono text-emerald-400">{surveyLocation.accuracy} m</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[#94A3B8]">Uploaded Images:</span>
            <span className="font-mono font-bold text-indigo-300">{files.length}</span>
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleTriggerAnalysis}
        disabled={!isReadyForAnalysis || isProcessing}
        className={`w-full py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 ${
          isReadyForAnalysis && !isProcessing
            ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white cursor-pointer'
            : 'bg-[#1E293B] text-[#94A3B8] cursor-not-allowed border border-[#334155]'
        }`}
      >
        <Cpu className="w-4 h-4" />
        <span>{isProcessing ? 'AI Pipeline Executing...' : '🤖 RUN AI ANALYSIS'}</span>
      </button>
    </div>
  );
};
