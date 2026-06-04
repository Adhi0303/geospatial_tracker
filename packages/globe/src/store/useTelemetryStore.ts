import { create } from 'zustand';
import type { Flight } from '../FlightLayer';
import type { Ship } from '../MaritimeLayer';

interface TelemetryState {
  flights: Flight[];
  ships: Ship[];
  setFlights: (flights: Flight[]) => void;
  addShips: (ships: Ship[]) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  flights: [],
  ships: [],
  setFlights: (flights) => set({ flights }),
  addShips: (newShips) => set((state) => {
    // AISStream sends partial batches, we merge them
    const newMap = new Map(state.ships.map(s => [s.id, s]));
    newShips.forEach(s => newMap.set(s.id, s));
    
    // Prevent memory leak by capping maximum ships
    let merged = Array.from(newMap.values());
    if (merged.length > 2000) {
      merged = merged.slice(-2000);
    }
    return { ships: merged };
  }),
}));
