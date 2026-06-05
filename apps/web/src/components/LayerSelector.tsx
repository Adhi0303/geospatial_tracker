'use client';
import React from 'react';

const WEATHER_LAYERS = [
  { id: 'clouds_new', name: 'Clouds', icon: '☁️' },
  { id: 'precipitation_new', name: 'Precipitation', icon: '🌧️' },
  { id: 'temp_new', name: 'Temperature', icon: '🌡️' },
  { id: 'wind_new', name: 'Wind', icon: '💨' },
  { id: 'pressure_new', name: 'Pressure', icon: '🌀' },
];

export function LayerSelector({ 
  showFlights, 
  setShowFlights,
  showShips,
  setShowShips,
  weatherLayers,
  setWeatherLayers,
  weatherOpacity,
  setWeatherOpacity,
}: { 
  showFlights: boolean;
  setShowFlights: (show: boolean) => void;
  showShips: boolean;
  setShowShips: (show: boolean) => void;
  weatherLayers: string[];
  setWeatherLayers: (layers: string[]) => void;
  weatherOpacity: number;
  setWeatherOpacity: (opacity: number) => void;
}) {
  const handleWeatherToggle = (layerId: string) => {
    setWeatherLayers(
      weatherLayers.includes(layerId)
        ? weatherLayers.filter(l => l !== layerId)
        : [...weatherLayers, layerId]
    );
  };

  return (
    <div className="absolute top-28 left-4 z-50 glass-panel p-4 min-w-[240px]">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-3">Visible Layers</h3>
      
      <div className="flex flex-col gap-3">
        {/* Flight Layer */}
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

        {/* Maritime Layer */}
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

        {/* Weather Layers Section */}
        <div className="mt-2 pt-3 border-t border-white/10">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-3">Weather Layers</h3>
          
          <div className="flex flex-col gap-2">
            {WEATHER_LAYERS.map(layer => (
              <label key={layer.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input 
                    type="checkbox" 
                    checked={weatherLayers.includes(layer.id)}
                    onChange={() => handleWeatherToggle(layer.id)}
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
                  <span className="text-sm">{layer.icon}</span>
                  {layer.name}
                </span>
              </label>
            ))}
          </div>

          {/* Opacity Slider - Only show when at least one weather layer is active */}
          {weatherLayers.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-2 block">
                Weather Opacity
              </label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={weatherOpacity} 
                onChange={(e) => setWeatherOpacity(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
                style={{
                  background: `linear-gradient(to right, var(--color-accent-cyan) 0%, var(--color-accent-cyan) ${weatherOpacity}%, rgba(255,255,255,0.1) ${weatherOpacity}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-[10px] text-muted mt-1.5">
                <span>Transparent</span>
                <span className="text-accent-cyan font-mono">{weatherOpacity}%</span>
                <span>Opaque</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
