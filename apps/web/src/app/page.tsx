'use client';

import React, { useEffect, useState } from "react";
// Dynamic import is needed for Cesium components in Next.js to avoid SSR issues
import dynamic from 'next/dynamic';
import { RegionSelector, RegionId } from "../components/RegionSelector";
import { io, Socket } from "socket.io-client";
import type { Flight } from "@worldwideview/globe";

// Dynamically import globe components to prevent "window is not defined" error during SSR
const GlobeViewer = dynamic(() => import("@worldwideview/globe").then(mod => mod.GlobeViewer), { ssr: false });
const FlightLayer = dynamic(() => import("@worldwideview/globe").then(mod => mod.FlightLayer), { ssr: false });

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [region, setRegion] = useState<RegionId>('europe');

  useEffect(() => {
    // Connect to WebSocket Gateway
    const socket: Socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to WebSocket Gateway');
    });

    socket.on('flights', (data: Flight[]) => {
      if (Array.isArray(data)) {
        setFlights(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // When Region changes, ideally we'd tell the backend via socket.emit('region:change', region)
  // For now, it will just update the UI state. We will implement the backend region filtering later.

  return (
    <main className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-black">
      <RegionSelector selectedRegion={region} onRegionChange={setRegion} />
      
      <div className="absolute inset-0">
        <GlobeViewer>
           <FlightLayer flights={flights} />
        </GlobeViewer>
      </div>
      
      <div className="absolute bottom-4 left-4 z-50 bg-black/80 backdrop-blur text-white p-3 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>Live Flights: {flights.length}</span>
        </div>
      </div>
    </main>
  );
}
