import React, { useEffect, useState } from 'react';
import { ImageryLayer } from 'resium';
import { UrlTemplateImageryProvider } from 'cesium';

interface WeatherLayerProps {
  layerId: string | null;
  alpha?: number;
}

export const WeatherLayer: React.FC<WeatherLayerProps> = ({ layerId, alpha = 0.5 }) => {
  const [provider, setProvider] = useState<UrlTemplateImageryProvider | null>(null);

  useEffect(() => {
    if (!layerId || layerId === 'none') {
      setProvider(null);
      return;
    }

    // When the layer changes, create a new UrlTemplateImageryProvider pointing to our proxy
    const newProvider = new UrlTemplateImageryProvider({
      url: `/api/weather/tile/{z}/{x}/{y}?layer=${layerId}`,
      maximumLevel: 18,
      // OpenWeatherMap map layers use standard Web Mercator projection (same as Cesium's default)
    });

    setProvider(newProvider);
  }, [layerId]);

  if (!provider) return null;

  return (
    // @ts-ignore - Resium typings throw an error here but it works as intended
    <ImageryLayer
      key={layerId || 'none'}
      imageryProvider={provider}
      alpha={alpha}
      show={true}
    />
  );
};
