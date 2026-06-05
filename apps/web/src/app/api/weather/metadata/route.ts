import { NextResponse } from 'next/server';

/**
 * Weather Layer Metadata API
 * Provides human-readable information about each weather layer
 * including units, descriptions, and color scale legends
 */

interface LegendStop {
  value: number;
  color: string;
  label: string;
}

interface LayerMetadata {
  name: string;
  unit: string;
  description: string;
  colorScale: string;
  legend: LegendStop[];
  updateFrequency?: string;
  source?: string;
}

type WeatherMetadata = {
  [key: string]: LayerMetadata;
};

const WEATHER_METADATA: WeatherMetadata = {
  clouds_new: {
    name: 'Cloud Coverage',
    unit: '%',
    description: 'Percentage of sky covered by clouds',
    colorScale: 'grayscale',
    updateFrequency: '3 hours',
    source: 'OpenWeatherMap',
    legend: [
      { value: 0, color: '#000000', label: 'Clear Sky' },
      { value: 25, color: '#404040', label: 'Scattered' },
      { value: 50, color: '#808080', label: 'Broken' },
      { value: 75, color: '#c0c0c0', label: 'Mostly Cloudy' },
      { value: 100, color: '#ffffff', label: 'Overcast' },
    ],
  },
  
  precipitation_new: {
    name: 'Precipitation',
    unit: 'mm/hr',
    description: 'Rain and snow intensity',
    colorScale: 'blue-gradient',
    updateFrequency: '3 hours',
    source: 'OpenWeatherMap',
    legend: [
      { value: 0, color: 'transparent', label: 'None' },
      { value: 0.5, color: '#b3e0ff', label: 'Drizzle' },
      { value: 2, color: '#66c2ff', label: 'Light Rain' },
      { value: 10, color: '#0080ff', label: 'Moderate Rain' },
      { value: 25, color: '#0040ff', label: 'Heavy Rain' },
      { value: 50, color: '#ff00ff', label: 'Extreme' },
    ],
  },
  
  temp_new: {
    name: 'Temperature',
    unit: '°C',
    description: 'Air temperature at 2 meters above ground',
    colorScale: 'thermal',
    updateFrequency: '3 hours',
    source: 'OpenWeatherMap',
    legend: [
      { value: -40, color: '#000080', label: 'Freezing' },
      { value: -20, color: '#0000ff', label: 'Very Cold' },
      { value: 0, color: '#00ffff', label: 'Cold' },
      { value: 10, color: '#00ff00', label: 'Cool' },
      { value: 20, color: '#ffff00', label: 'Mild' },
      { value: 30, color: '#ff8000', label: 'Warm' },
      { value: 40, color: '#ff0000', label: 'Hot' },
    ],
  },
  
  wind_new: {
    name: 'Wind Speed',
    unit: 'm/s',
    description: 'Wind velocity at 10 meters above ground',
    colorScale: 'velocity',
    updateFrequency: '3 hours',
    source: 'OpenWeatherMap',
    legend: [
      { value: 0, color: '#ffffff', label: 'Calm' },
      { value: 2, color: '#d0f0ff', label: 'Light Air' },
      { value: 5, color: '#80d0ff', label: 'Gentle Breeze' },
      { value: 10, color: '#40a0ff', label: 'Moderate' },
      { value: 15, color: '#ff8000', label: 'Strong' },
      { value: 20, color: '#ff0000', label: 'Gale' },
      { value: 30, color: '#800000', label: 'Storm' },
    ],
  },
  
  pressure_new: {
    name: 'Air Pressure',
    unit: 'hPa',
    description: 'Atmospheric pressure at sea level',
    colorScale: 'pressure',
    updateFrequency: '3 hours',
    source: 'OpenWeatherMap',
    legend: [
      { value: 960, color: '#ff0000', label: 'Very Low' },
      { value: 980, color: '#ff8000', label: 'Low' },
      { value: 1000, color: '#ffff00', label: 'Below Normal' },
      { value: 1013, color: '#00ff00', label: 'Normal' },
      { value: 1025, color: '#00ffff', label: 'Above Normal' },
      { value: 1040, color: '#0000ff', label: 'High' },
    ],
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    layers: WEATHER_METADATA,
    timestamp: new Date().toISOString(),
  });
}
