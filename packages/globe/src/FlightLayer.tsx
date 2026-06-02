import React from 'react';
import { Entity, PointGraphics, ModelGraphics } from 'resium';
import { Cartesian3, Color, DistanceDisplayCondition, HeadingPitchRoll, Transforms } from 'cesium';

export interface Flight {
  id: string;
  callsign: string;
  country: string;
  longitude: number;
  latitude: number;
  baro_altitude: number;
  heading: number;
  velocity: number;
}

interface FlightLayerProps {
  flights: Flight[];
}

// DistanceDisplayCondition avoids crashing the browser with thousands of 3D models
const pointDisplayCondition = new DistanceDisplayCondition(50000.0, Number.MAX_VALUE);
const modelDisplayCondition = new DistanceDisplayCondition(0.0, 50000.0);

export const FlightLayer: React.FC<FlightLayerProps> = ({ flights }) => {
  return (
    <>
      {flights.map((flight) => {
        if (!flight.longitude || !flight.latitude) return null;
        
        const position = Cartesian3.fromDegrees(
          flight.longitude,
          flight.latitude,
          flight.baro_altitude || 10000
        );
        
        const heading = flight.heading ? flight.heading * (Math.PI / 180) : 0;
        const hpr = new HeadingPitchRoll(heading, 0, 0);
        // Using Property wrapper pattern for resium orientation would be proper, but simple assignment works
        const orientation = Transforms.headingPitchRollQuaternion(position, hpr) as any;

        return (
          <Entity
            key={flight.id}
            position={position}
            orientation={orientation}
            name={flight.callsign || flight.id}
            description={`Altitude: ${flight.baro_altitude}m\nSpeed: ${flight.velocity}m/s`}
          >
            <PointGraphics 
              pixelSize={5} 
              color={Color.YELLOW} 
              distanceDisplayCondition={pointDisplayCondition} 
            />
            <ModelGraphics 
              uri="https://raw.githubusercontent.com/CesiumGS/cesium/main/Apps/SampleData/models/CesiumAir/Cesium_Air.glb" 
              minimumPixelSize={64}
              maximumScale={20000}
              distanceDisplayCondition={modelDisplayCondition}
            />
          </Entity>
        );
      })}
    </>
  );
};
