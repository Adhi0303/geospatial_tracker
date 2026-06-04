import { create } from 'zustand';
import type { GeoEntity } from '@worldwideview/wwv-plugin-sdk';

interface GlobeState {
  entities: Map<string, GeoEntity>;
  selectedEntity: GeoEntity | null;
  isPlaybackMode: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  currentTime: Date;
  timeRange: { start: Date; end: Date };
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: Date) => void;
  setSelectedEntity: (entity: GeoEntity | null) => void;
  setEntities: (entities: GeoEntity[]) => void;
}

export const useStore = create<GlobeState>((set) => ({
  entities: new Map(),
  selectedEntity: null,
  isPlaybackMode: false,
  isPlaying: false,
  playbackSpeed: 1,
  currentTime: new Date(),
  timeRange: { start: new Date(), end: new Date() },
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),
  setEntities: (newEntities) => set((state) => {
    const nextMap = new Map(state.entities);
    for (const e of newEntities) {
      nextMap.set(e.id, e);
    }
    return { entities: nextMap };
  }),
}));
