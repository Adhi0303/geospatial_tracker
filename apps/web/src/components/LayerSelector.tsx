'use client';
import React, { useState, useEffect } from 'react';

export function LayerSelector({ 
  showFlights, 
  setShowFlights,
  showShips,
  setShowShips,
  weatherLayer,
  setWeatherLayer
}: { 
  showFlights: boolean;
  setShowFlights: (show: boolean) => void;
  showShips: boolean;
  setShowShips: (show: boolean) => void;
  weatherLayer: string;
  setWeatherLayer: (layer: string) => void;
}) {
  const [draftWeatherLayer, setDraftWeatherLayer] = useState(weatherLayer);

  // Sync draft with external state changes
  useEffect(() => {
    setDraftWeatherLayer(weatherLayer);
  }, [weatherLayer]);

  const hasUnsavedChanges = draftWeatherLayer !== weatherLayer;

  return (
    <div className="absolute top-28 left-4 z-50 glass-panel p-4 min-w-[220px]">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-3">Visible Layers</h3>
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center w-5 h-5">
            <input 
              type="checkbox" 
              checked={showFlights}
              onChange={(e) => setShowFlights(e.target.checked)}
              className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-transparent checked:bg-accent-cyan checked:border-accent-cyan transition-all cursor-pointer"
            />
            <svg 
              className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 w-3 h-3 text-bg-primary transition-opacity" 
              viewBox="0 0 14 10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[13px] text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
            <span className="w-2 h-2 inline-block bg-[#0088ff] rounded-full"></span>
            Airplanes
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center w-5 h-5">
            <input 
              type="checkbox" 
              checked={showShips}
              onChange={(e) => setShowShips(e.target.checked)}
              className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-transparent checked:bg-accent-cyan checked:border-accent-cyan transition-all cursor-pointer"
            />
            <svg 
              className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 w-3 h-3 text-bg-primary transition-opacity" 
              viewBox="0 0 14 10" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-[13px] text-white/80 group-hover:text-white transition-colors flex items-center gap-2">
            <span className="w-2 h-2 inline-block bg-[#ff2222] rounded-full"></span>
            Maritime
          </span>
        </label>

        <div className="mt-2 pt-3 border-t border-white/10 flex flex-col gap-2">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-1">Weather Map</h3>
          <select 
            value={draftWeatherLayer}
            onChange={(e) => setDraftWeatherLayer(e.target.value)}
            className="w-full bg-bg-secondary text-[13px] text-white/90 border border-white/20 rounded px-2 py-1.5 focus:outline-none focus:border-accent-cyan transition-colors"
          >
            <option value="none" className="bg-[#1a1a1a] text-white">No Weather (Clear)</option>
            <option value="clouds_new" className="bg-[#1a1a1a] text-white">Global Cloud Cover</option>
            <option value="precipitation_new" className="bg-[#1a1a1a] text-white">Precipitation (Rain/Snow)</option>
            <option value="pressure_new" className="bg-[#1a1a1a] text-white">Sea Level Pressure</option>
            <option value="wind_new" className="bg-[#1a1a1a] text-white">Wind Speed & Direction</option>
            <option value="temp_new" className="bg-[#1a1a1a] text-white">Global Temperature</option>
          </select>
          <button 
            onClick={() => setWeatherLayer(draftWeatherLayer)}
            disabled={!hasUnsavedChanges}
            className={`w-full py-1.5 text-[12px] font-medium rounded transition-colors ${
              hasUnsavedChanges 
                ? 'bg-accent-cyan text-bg-primary hover:bg-accent-cyan/90 cursor-pointer' 
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            Apply Weather
          </button>
        </div>
      </div>
    </div>
  );
}
