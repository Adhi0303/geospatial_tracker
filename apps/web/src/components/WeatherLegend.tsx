'use client';
import React, { useEffect, useState } from 'react';

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
}

interface WeatherLegendProps {
  layers: string[]; // Active layer IDs
}

export function WeatherLegend({ layers }: WeatherLegendProps) {
  const [metadata, setMetadata] = useState<Record<string, LayerMetadata>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather/metadata')
      .then(res => res.json())
      .then(data => {
        setMetadata(data.layers || {});
        setLoading(false);
      })
      .catch(err => {
        console.error('[WeatherLegend] Failed to load metadata:', err);
        setLoading(false);
      });
  }, []);

  if (loading || layers.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-32 right-6 z-40 flex flex-col gap-3 max-w-[280px]">
      {layers.map(layerId => {
        const layer = metadata[layerId];
        if (!layer) return null;

        // Generate CSS gradient from legend stops
        const gradientStops = layer.legend
          .filter(stop => stop.color !== 'transparent')
          .map(stop => stop.color)
          .join(', ');

        return (
          <div key={layerId} className="glass-panel p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-white">
                {layer.name}
              </h3>
              <span className="text-[10px] text-muted font-mono">{layer.unit}</span>
            </div>
            
            {/* Color gradient bar */}
            <div 
              className="h-2 rounded-full mb-2"
              style={{
                background: `linear-gradient(to right, ${gradientStops})`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
            
            {/* Value labels */}
            <div className="flex justify-between text-[9px] text-muted font-mono">
              <span>{layer.legend[0].label}</span>
              <span>{layer.legend[Math.floor(layer.legend.length / 2)].label}</span>
              <span>{layer.legend[layer.legend.length - 1].label}</span>
            </div>

            {/* Detailed legend (expanded view) */}
            <details className="mt-2">
              <summary className="text-[9px] text-accent-cyan cursor-pointer hover:text-white transition-colors">
                View Scale
              </summary>
              <div className="mt-2 space-y-1">
                {layer.legend.map((stop, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[9px]">
                    <div 
                      className="w-3 h-3 rounded-sm border border-white/20"
                      style={{ backgroundColor: stop.color }}
                    />
                    <span className="text-white/70 font-mono">{stop.value}{layer.unit}</span>
                    <span className="text-muted">{stop.label}</span>
                  </div>
                ))}
              </div>
            </details>
          </div>
        );
      })}
    </div>
  );
}
