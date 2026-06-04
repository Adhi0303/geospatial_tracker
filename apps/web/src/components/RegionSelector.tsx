'use client';
import React from 'react';

export const REGIONS = {
  global: { lomin: -180, lamin: -90, lomax: 180, lamax: 90 },
  europe: { lomin: -10, lamin: 35, lomax: 30, lamax: 60 },
  north_america: { lomin: -125, lamin: 25, lomax: -65, lamax: 50 },
  asia: { lomin: 60, lamin: 0, lomax: 150, lamax: 60 },
} as const;

export type RegionId = keyof typeof REGIONS;

export function RegionSelector({ 
  selectedRegion, 
  onRegionChange 
}: { 
  selectedRegion: RegionId, 
  onRegionChange: (region: RegionId) => void 
}) {
  return (
    <div className="absolute top-4 left-4 z-50 glass-panel p-4 min-w-[200px]">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted mb-3">Tracking Region</h3>
      <div className="relative">
        <select 
          value={selectedRegion}
          onChange={(e) => onRegionChange(e.target.value as RegionId)}
          className="glass-button text-white px-3 py-2 outline-none w-full appearance-none bg-transparent cursor-pointer hover:shadow-glow-cyan focus:shadow-glow-cyan"
        >
          <option value="global" className="bg-[#171717]">Global (Heavy)</option>
          <option value="europe" className="bg-[#171717]">Europe</option>
          <option value="north_america" className="bg-[#171717]">North America</option>
          <option value="asia" className="bg-[#171717]">Asia</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/50">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
}
