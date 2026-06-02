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
    <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur text-white p-4 rounded-xl border border-white/10 shadow-lg">
      <h3 className="text-sm font-semibold mb-2 text-zinc-300">Tracking Region</h3>
      <select 
        value={selectedRegion}
        onChange={(e) => onRegionChange(e.target.value as RegionId)}
        className="bg-black text-white px-3 py-2 rounded-lg border border-white/20 outline-none focus:border-blue-500 w-full"
      >
        <option value="global">Global (Heavy)</option>
        <option value="europe">Europe</option>
        <option value="north_america">North America</option>
        <option value="asia">Asia</option>
      </select>
    </div>
  );
}
