'use client';

import React, { useEffect, useState } from "react";
// Dynamic import is needed for Cesium components in Next.js to avoid SSR issues
import dynamic from 'next/dynamic';
import { RegionSelector, RegionId } from "../components/RegionSelector";
import { LayerSelector } from "../components/LayerSelector";
import { LiveTelemetry } from "../components/LiveTelemetry";
import { WeatherLegend } from "../components/WeatherLegend";
import { io, Socket } from "socket.io-client";
import type { Flight, Ship } from "@worldwideview/globe";

// Dynamically import globe components to prevent "window is not defined" error during SSR
const GlobeViewer = dynamic(() => import("@worldwideview/globe").then(mod => mod.GlobeViewer), { ssr: false });
const WeatherLayer = dynamic(() => import("@worldwideview/globe").then(mod => mod.WeatherLayer), { ssr: false });

import { useTelemetryStore, dataBus } from "@worldwideview/globe";

export default function Home() {
  const [region, setRegion] = useState<RegionId>('europe');
  const [showFlights, setShowFlights] = useState(true);
  const [showShips, setShowShips] = useState(true);
  const [weatherLayers, setWeatherLayers] = useState<string[]>([]);
  const [weatherOpacity, setWeatherOpacity] = useState(50);

  useEffect(() => {
    // Connect to WebSocket Gateway
    const socket: Socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Connected to WebSocket Gateway');
    });

    socket.on('flights', (data: Flight[]) => {
      if (Array.isArray(data)) {
        // Direct non-reactive store writes!
        useTelemetryStore.getState().setFlights(data);
      }
    });

    socket.on('ships', (data: Ship[]) => {
      if (Array.isArray(data)) {
        // Direct non-reactive store writes!
        useTelemetryStore.getState().addShips(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Unified Renderer Sync: Reads the active toggles and pushes to the 3D globe pipeline.
  // This completely eliminates the flickering/wipeout bug by always merging the datasets!
  useEffect(() => {
    const pushToGlobe = (flights: Flight[], ships: Ship[]) => {
      const entities: any[] = [];
      
      if (showFlights) {
        entities.push(...flights.map(f => ({
          id: f.id,
          type: 'flight' as const,
          layerId: 'flights',
          latitude: f.latitude,
          longitude: f.longitude,
          altitude: f.baro_altitude || 10000,
          heading: f.heading || 0,
          speed: f.velocity || 0,
          timestamp: Date.now()
        })));
      }
      
      if (showShips) {
        entities.push(...ships.map(s => ({
          id: s.id,
          type: 'maritime' as const,
          layerId: 'ships',
          latitude: s.latitude,
          longitude: s.longitude,
          altitude: 0,
          heading: s.heading || 0,
          speed: s.speed || 0,
          timestamp: Date.now()
        })));
      }
      
      dataBus.emit('dataUpdated', { pluginId: 'core', entities });
    };

    // Immediate sync on toggle change
    const state = useTelemetryStore.getState();
    pushToGlobe(state.flights, state.ships);

    // Subscribe to future socket updates arriving in the store
    const unsubscribe = useTelemetryStore.subscribe((state) => {
      pushToGlobe(state.flights, state.ships);
    });

    return () => {
      unsubscribe();
    };
  }, [showFlights, showShips]);

  // When Region changes, ideally we'd tell the backend via socket.emit('region:change', region)
  // For now, it will just update the UI state. We will implement the backend region filtering later.

  return (
    <main className="w-screen h-screen m-0 p-0 overflow-hidden relative bg-bg-primary">
      <RegionSelector selectedRegion={region} onRegionChange={setRegion} />
      <LayerSelector 
        showFlights={showFlights} setShowFlights={setShowFlights}
        showShips={showShips} setShowShips={setShowShips}
        weatherLayers={weatherLayers} setWeatherLayers={setWeatherLayers}
        weatherOpacity={weatherOpacity} setWeatherOpacity={setWeatherOpacity}
      />
      
      <div className="absolute inset-0 z-0">
        <GlobeViewer>
          {weatherLayers.map(layerId => (
            <WeatherLayer key={layerId} layerId={layerId} alpha={weatherOpacity / 100} />
          ))}
        </GlobeViewer>
      </div>
      
      <LiveTelemetry />
      <WeatherLegend layers={weatherLayers} />
    </main>
  );
}
