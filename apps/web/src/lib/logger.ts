/**
 * Structured Logger for Weather Tile System
 * Provides consistent logging format with optional external service integration
 */

interface WeatherTileErrorMeta {
  ip: string;
  layer: string;
  z: string;
  x: string;
  y: string;
  status: number;
  error: string;
  timestamp?: number;
}

/**
 * Log weather tile errors with structured format
 */
export function logWeatherTileError(meta: WeatherTileErrorMeta): void {
  const timestamp = meta.timestamp || Date.now();
  const logEntry = {
    timestamp: new Date(timestamp).toISOString(),
    service: 'weather-tile-proxy',
    level: 'error',
    ip: meta.ip,
    layer: meta.layer,
    coordinates: `${meta.z}/${meta.x}/${meta.y}`,
    status: meta.status,
    error: meta.error,
  };

  console.error('[WeatherTileProxy]', JSON.stringify(logEntry));

  // Optional: Send to external logging service
  if (process.env.SENTRY_DSN) {
    // Sentry.captureMessage(meta.error, { extra: logEntry });
  }

  if (process.env.LOGTAIL_TOKEN) {
    // Send to Logtail/BetterStack
    // Not implementing now, but hook is ready
  }
}

/**
 * Log successful weather tile requests (for analytics)
 */
export function logWeatherTileSuccess(meta: {
  ip: string;
  layer: string;
  z: string;
  x: string;
  y: string;
  cached: boolean;
  duration: number;
}): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[WeatherTileProxy] ${meta.cached ? '⚡ CACHE' : '🌐 FETCH'} ${meta.layer} ${meta.z}/${meta.x}/${meta.y} (${meta.duration}ms)`
    );
  }

  // In production, could aggregate metrics and send to analytics service
}

/**
 * Log rate limit events
 */
export function logRateLimitEvent(meta: {
  ip: string;
  requests: number;
  retryAfter: number;
}): void {
  console.warn(
    `[WeatherTileProxy] Rate limit exceeded for ${meta.ip} (${meta.requests} req/min, retry after ${meta.retryAfter}s)`
  );
}
