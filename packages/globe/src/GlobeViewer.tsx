import React, { useEffect } from 'react';
import { Viewer, useCesium } from 'resium';
import { Ion, Viewer as CesiumViewer } from 'cesium';
import { initPrimitiveCollections } from './core/EntityRenderer';
import { startAnimationLoop, stopAnimationLoop } from './core/AnimationLoop';

// Suppress the Ion warning if we don't have a token. 
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4M2ZiZDc2OS1lZGVhLTQ0MzItODVhYy03MjkzYmIzNWIzYjIiLCJpZCI6NDM5NDI5LCJzdWIiOiJBZGFyc2gwMyIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiJnZW9zcGF0aWFsX3ZpZXdlciIsImlhdCI6MTc4MDQwMjI4MH0.RAOe3z_d0_F78gnwqTl446d6fxwHpjSz-hMRtc--Wow';

const PipelineInitializer: React.FC = () => {
  const { viewer } = useCesium();
  useEffect(() => {
    if (viewer && !viewer.isDestroyed()) {
      initPrimitiveCollections(viewer);
      startAnimationLoop(viewer);
      return () => {
        stopAnimationLoop();
      };
    }
  }, [viewer]);
  return null;
};

export const GlobeViewer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  if (typeof window !== 'undefined') {
    (window as any).CESIUM_BASE_URL = '/cesium/';
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* @ts-expect-error resium Viewer types don't explicitly declare children in React 18+ */}
      <Viewer full>
        <PipelineInitializer />
        {children}
      </Viewer>
    </div>
  );
};
