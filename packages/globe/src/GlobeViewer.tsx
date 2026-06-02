import React from 'react';
import { Viewer } from 'resium';

export const GlobeViewer: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Viewer full />
    </div>
  );
};
