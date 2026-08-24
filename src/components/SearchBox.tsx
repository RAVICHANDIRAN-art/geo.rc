import React, { useState } from 'react';
import { Search, MapPin, Loader2, X, Globe, Home, Navigation, Map } from 'lucide-react';

export type LocationCategory =
  | 'State'
  | 'District'
  | 'City / Town'
  | 'Village / Tehsil'
  | 'Street / Road'
  | 'POI / Landmark'
  | 'Postal Code'
  | 'General';

export interface SearchResult {
  place_id: string | number;
  display_name: string;
  short_name: string;
  lat: number;
  lng: number;
  provider: 'Google Maps' | 'OpenStreetMap' | 'Photon OSM';
  categoryType: LocationCategory;
  recommendedZoom: number;
}

interface SearchBoxProps {
  onSelectLocation: (lat: number, lng: number, title: string, zoom?: number) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'VILLAGE' | 'STREET' | 'ADMINISTRATIVE'>('ALL');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Determine Category and Recommended Zoom Level from Geocoding Data
  const classifyLocation = (typeStr: string, classStr: string, name: string, addressObj?: any): { category: LocationCategory; zoom: number } => {
    const t = (typeStr || '').toLowerCase();
    const c = (classStr || '').toLowerCase();
    const nameLower = name.toLowerCase();

    if (t.includes('state') || c.includes('state') || t === 'administrative_area_level_1') {
      return { category: 'State', zoom: 7 };
    }
    if (t.includes('district') || t.includes('county') || t === 'administrative_area_level_2') {
      return { category: 'District', zoom: 10 };
    }
    if (t.includes('city') || t.includes('town') || t.includes('municipality') || t === 'locality') {
      return { category: 'City / Town', zoom: 13 };
    }
    if (
      t.includes('village') ||
      t.includes('hamlet') ||
      t.includes('suburb') ||
      t.includes('neighborhood') ||
      t.includes('tehsil') ||
      t.includes('taluk') ||
      addressObj?.village ||
      addressObj?.hamlet
    ) {
      return { category: 'Village / Tehsil', zoom: 15 };
    }
    if (t.includes('road') || t.includes('street') || t.includes('highway') || t.includes('residential') || c === 'highway') {
      return { category: 'Street / Road', zoom: 17 };
    }
    if (t.includes('postcode') || t.includes('postal') || /^\d{5,6}$/.test(nameLower)) {
      return { category: 'Postal Code', zoom: 14 };
    }
    if (c === 'amenity' || c === 'building' || c === 'tourism' || c === 'shop' || c === 'historic') {
      return { category: 'POI / Landmark', zoom: 18 };
    }

    return { category: 'General', zoom: 15 };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    const cleanQuery = query.trim();

    try {
      let combinedResults: SearchResult[] = [];

      // 1. Try Google Maps Geocoding API if key is available
      if (googleApiKey && googleApiKey.trim() !== '') {
        try {
          const googleRes = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanQuery)}&key=${googleApiKey}`
          );
          if (googleRes.ok) {
            const data = await googleRes.json();
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const googleItems: SearchResult[] = data.results.map((item: any) => {
                const types: string[] = item.types || [];
                const typeFirst = types[0] || '';
                const { category, zoom } = classifyLocation(typeFirst, '', item.formatted_address);

                return {
                  place_id: item.place_id,
                  display_name: item.formatted_address,
                  short_name: item.formatted_address.split(',')[0],
                  lat: item.geometry.location.lat,
                  lng: item.geometry.location.lng,
                  provider: 'Google Maps',
                  categoryType: category,
                  recommendedZoom: zoom
                };
              });
              combinedResults = [...combinedResults, ...googleItems];
            }
          }
        } catch (gErr) {
          console.warn('Google Geocoding error, falling back to OSM:', gErr);
        }
      }

      // 2. OpenStreetMap Nominatim Geocoding API
      if (combinedResults.length === 0) {
        try {
          const osmRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&q=${encodeURIComponent(cleanQuery)}&limit=15`
          );
          if (osmRes.ok) {
            const osmData = await osmRes.json();
            if (Array.isArray(osmData) && osmData.length > 0) {
              const osmItems: SearchResult[] = osmData.map((item: any) => {
                const addr = item.address || {};
                const typeStr = item.type || '';
                const classStr = item.class || '';
                const shortName = item.display_name.split(',')[0];
                const { category, zoom } = classifyLocation(typeStr, classStr, item.display_name, addr);

                return {
                  place_id: item.place_id,
                  display_name: item.display_name,
                  short_name: shortName,
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon),
                  provider: 'OpenStreetMap',
                  categoryType: category,
                  recommendedZoom: zoom
                };
              });
              combinedResults = [...combinedResults, ...osmItems];
            }
          }
        } catch (osmErr) {
          console.warn('Nominatim error, attempting Photon backup:', osmErr);
        }
      }

      // 3. High-speed Photon Komoot OpenStreetMap Backup Geocoder
      if (combinedResults.length === 0) {
        try {
          const photonRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQuery)}&limit=15`
          );
          if (photonRes.ok) {
            const photonData = await photonRes.json();
            if (photonData.features && photonData.features.length > 0) {
              const photonItems: SearchResult[] = photonData.features.map((feat: any, idx: number) => {
                const props = feat.properties || {};
                const coords = feat.geometry.coordinates; // [lng, lat]
                const name = props.name || props.street || props.city || props.state || cleanQuery;
                
                const parts = [
                  name,
                  props.street,
                  props.district || props.suburb,
                  props.city,
                  props.state,
                  props.country
                ].filter(Boolean);
                
                const fullAddress = parts.join(', ');
                const typeStr = props.type || props.osm_value || '';
                const { category, zoom } = classifyLocation(typeStr, props.osm_key || '', fullAddress);

                return {
                  place_id: `photon-${idx}-${props.osm_id || Math.random()}`,
                  display_name: fullAddress,
                  short_name: name,
                  lat: coords[1],
                  lng: coords[0],
                  provider: 'Photon OSM',
                  categoryType: category,
                  recommendedZoom: zoom
                };
              });
              combinedResults = [...combinedResults, ...photonItems];
            }
          }
        } catch (pErr) {
          console.warn('Photon Geocoding error:', pErr);
        }
      }

      if (combinedResults.length === 0) {
        setError(`No location found matching "${cleanQuery}". Try entering State, District, Village or Street name.`);
      } else {
        const filtered = applyCategoryFilter(combinedResults, categoryFilter);
        setResults(filtered.length > 0 ? filtered : combinedResults);
      }
    } catch (err) {
      setError('Temporary location search error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyCategoryFilter = (list: SearchResult[], filter: string) => {
    if (filter === 'VILLAGE') return list.filter((r) => r.categoryType === 'Village / Tehsil' || r.categoryType === 'City / Town');
    if (filter === 'STREET') return list.filter((r) => r.categoryType === 'Street / Road' || r.categoryType === 'POI / Landmark');
    if (filter === 'ADMINISTRATIVE') return list.filter((r) => r.categoryType === 'State' || r.categoryType === 'District');
    return list;
  };

  const handleSelect = (item: SearchResult) => {
    onSelectLocation(item.lat, item.lng, item.display_name, item.recommendedZoom);
    setResults([]);
    setQuery(item.short_name);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return (
    <div className="relative w-full max-w-lg space-y-1">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search State, District, Tehsil, Village, Street, POI, PIN Code..."
          aria-label="Search location"
          className="w-full bg-[#111827]/95 text-white placeholder-[#94A3B8] text-xs font-medium pl-9 pr-16 py-2.5 rounded-xl border border-[#334155] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xl backdrop-blur-md transition"
        />
        <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" />
        
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-12 top-2.5 text-[#94A3B8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="absolute right-1.5 top-1.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white text-xs px-3 py-1 rounded-lg transition font-extrabold shadow cursor-pointer"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
        </button>
      </form>

      {/* Category Chips for Granular Filtering */}
      <div className="flex items-center space-x-1 text-[10px]">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-2.5 py-0.5 rounded-full font-bold transition flex items-center gap-1 ${
            categoryFilter === 'ALL'
              ? 'bg-indigo-600 text-white'
              : 'bg-[#111827]/80 text-[#94A3B8] hover:text-white border border-[#334155]'
          }`}
        >
          <Globe className="w-2.5 h-2.5" />
          All Hierarchy
        </button>

        <button
          onClick={() => setCategoryFilter('ADMINISTRATIVE')}
          className={`px-2.5 py-0.5 rounded-full font-bold transition flex items-center gap-1 ${
            categoryFilter === 'ADMINISTRATIVE'
              ? 'bg-cyan-600 text-white'
              : 'bg-[#111827]/80 text-[#94A3B8] hover:text-white border border-[#334155]'
          }`}
        >
          <Map className="w-2.5 h-2.5" />
          State & District
        </button>

        <button
          onClick={() => setCategoryFilter('VILLAGE')}
          className={`px-2.5 py-0.5 rounded-full font-bold transition flex items-center gap-1 ${
            categoryFilter === 'VILLAGE'
              ? 'bg-emerald-600 text-white'
              : 'bg-[#111827]/80 text-[#94A3B8] hover:text-white border border-[#334155]'
          }`}
        >
          <Home className="w-2.5 h-2.5" />
          Village & Tehsil
        </button>

        <button
          onClick={() => setCategoryFilter('STREET')}
          className={`px-2.5 py-0.5 rounded-full font-bold transition flex items-center gap-1 ${
            categoryFilter === 'STREET'
              ? 'bg-amber-600 text-white'
              : 'bg-[#111827]/80 text-[#94A3B8] hover:text-white border border-[#334155]'
          }`}
        >
          <Navigation className="w-2.5 h-2.5" />
          Street & POI
        </button>
      </div>

      {/* Location Search Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-16 bg-[#111827] border border-[#334155] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-[#1E293B] max-h-72 overflow-y-auto">
          {results.map((item) => (
            <button
              key={item.place_id}
              onClick={() => handleSelect(item)}
              className="w-full text-left px-3.5 py-2.5 text-xs text-[#E5E7EB] hover:bg-[#172033] flex items-start justify-between space-x-2 transition group"
            >
              <div className="flex items-start space-x-2.5 truncate">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="truncate">
                  <div className="font-bold text-white truncate flex items-center gap-1.5">
                    {item.short_name}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] truncate leading-tight">{item.display_name}</div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-0.5 shrink-0">
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  item.categoryType === 'State' || item.categoryType === 'District'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : item.categoryType === 'Village / Tehsil'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : item.categoryType === 'Street / Road'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                }`}>
                  {item.categoryType}
                </span>
                <span className="text-[8px] text-[#94A3B8] font-mono">{item.provider}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute left-0 right-0 top-16 bg-rose-950/90 text-rose-200 border border-rose-800 text-xs px-3 py-2 rounded-xl shadow-lg backdrop-blur-md">
          {error}
        </div>
      )}
    </div>
  );
};
