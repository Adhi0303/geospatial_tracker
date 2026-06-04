import React, { useEffect } from 'react';
import { useCesium } from 'resium';
import { Cartesian3, Color, PointPrimitiveCollection, DistanceDisplayCondition, NearFarScalar, BlendOption } from 'cesium';
import { useTelemetryStore } from './store/useTelemetryStore';

export interface Ship {
  id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  navStatus: number;
}

export const MaritimeLayer: React.FC = () => {
  const { viewer } = useCesium();

  useEffect(() => {
    if (!viewer) return;

    // Use low-level primitive collection
    const points = new PointPrimitiveCollection();
    points.blendOption = BlendOption.OPAQUE; // Opaque blending optimization
    
    viewer.scene.primitives.add(points);

    // Subscribe to Zustand store changes directly
    const unsubscribe = useTelemetryStore.subscribe((state) => {
      const ships = state.ships;
      
      points.removeAll();
      
      // LoD configurations
      const distanceDisplayCondition = new DistanceDisplayCondition(0.0, Number.MAX_VALUE);
      // Keep points visible even when zoomed far out
      const scaleByDistance = new NearFarScalar(1.5e2, 1.5, 5.0e7, 0.3);
      const translucencyByDistance = new NearFarScalar(1.5e2, 1.0, 5.0e7, 0.8);

      for (let i = 0; i < ships.length; i++) {
        const ship = ships[i];
        points.add({
          position: Cartesian3.fromDegrees(
            ship.longitude,
            ship.latitude,
            0 // Sea level
          ),
          color: Color.DEEPSKYBLUE,
          outlineColor: Color.WHITE,
          outlineWidth: 1,
          pixelSize: 6,
          distanceDisplayCondition,
          scaleByDistance,
          translucencyByDistance
        });
      }
      
      viewer.scene.requestRender();
    });

    return () => {
      unsubscribe();
      if (viewer && !viewer.isDestroyed()) {
        viewer.scene.primitives.remove(points);
      }
    };
  }, [viewer]);

  // Return null to bypass React DOM
  return null;
};
