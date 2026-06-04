'use client';
import React, { useMemo } from 'react';
import { useTelemetryStore } from '@worldwideview/globe';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

export function LiveTelemetry() {
  const flights = useTelemetryStore(state => state.flights);
  const ships = useTelemetryStore(state => state.ships);
  
  const flightsCount = flights.length;
  const shipsCount = ships.length;

  const altitudeData = useMemo(() => {
    const bins = [0, 2000, 4000, 6000, 8000, 10000, 12000];
    const counts = new Array(bins.length).fill(0);
    
    flights.forEach(f => {
      const alt = f.baro_altitude || 0;
      for (let i = 0; i < bins.length - 1; i++) {
        if (alt >= bins[i] && alt < bins[i+1]) {
          counts[i]++;
          break;
        }
      }
      if (alt >= bins[bins.length - 1]) counts[bins.length - 1]++;
    });

    return bins.map((bin, i) => ({
      name: `${bin/1000}k`,
      count: counts[i]
    }));
  }, [flights]);

  return (
    <div className="absolute bottom-4 left-4 z-50 glass-panel p-4 flex gap-6 items-end bg-black/50 rounded-xl backdrop-blur-md border border-white/10">
      <div className="flex flex-col gap-3 min-w-[150px]">
        <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Global Telemetry</h3>
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
          </div>
          <span className="font-mono text-[13px] text-white tracking-widest">
            FLIGHTS: {flightsCount.toString().padStart(4, '0')}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </div>
          <span className="font-mono text-[13px] text-white tracking-widest">
            SHIPS:   {shipsCount.toString().padStart(4, '0')}
          </span>
        </div>
      </div>
      
      <div className="w-[200px] h-[80px] flex flex-col">
        <h3 className="text-white/50 text-[10px] font-mono mb-1">ALTITUDE PROFILE (m)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={altitudeData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '12px', color: 'white' }}
              itemStyle={{ color: '#10b981' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
            />
            <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
