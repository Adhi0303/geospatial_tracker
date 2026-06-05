import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Instrumentation is stable in Next 15+ and enabled by default or at the top level
  
  // Suppress Cesium build warnings
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      'cesium': 'Cesium',
    });
    return config;
  },
};

export default nextConfig;
