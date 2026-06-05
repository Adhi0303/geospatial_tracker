import { NextRequest, NextResponse } from 'next/server';
import { ensureServiceAvailable } from '@/lib/apiKeyValidator';

import { checkRateLimit } from '@/lib/weatherRateLimit';
import { logWeatherTileError, logWeatherTileSuccess, logRateLimitEvent } from '@/lib/logger';

/**
 * Request deduplication map: prevents duplicate concurrent requests
 * Key: "layer:z:x:y", Value: Promise<Response>
 */
const inflightRequests = new Map<string, Promise<Response>>();

function getTileKey(layer: string, z: string, x: string, y: string): string {
  return `${layer}:${z}:${x}:${y}`;
}

/**
 * Get client IP from request headers (supports proxies)
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

/**
 * Generate cache headers for weather tiles
 * Weather data updates every 3 hours, so we can cache aggressively
 */
function getCacheHeaders(layer: string): Record<string, string> {
  const maxAge = 10800; // 3 hours in seconds
  const timestamp = Math.floor(Date.now() / (maxAge * 1000)); // Round to 3-hour blocks

  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    'ETag': `"${layer}-${timestamp}"`,
    'Vary': 'Accept-Encoding',
  };
}

/**
 * Fetch weather tile from OpenWeatherMap with timeout
 */
async function fetchWeatherTile(
  layer: string,
  z: string,
  x: string,
  y: string
): Promise<Response> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  const owmUrl = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`;

  try {
    const response = await fetch(owmUrl, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
      cache: 'force-cache',
      next: { revalidate: 10800 }, // Cache for 3 hours
    });

    return response;
  } catch (error: any) {
    throw new Error(`OWM fetch failed: ${error.message}`);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const startTime = Date.now();
  const ip = getClientIp(request);
  const { z, x, y } = await params;
  const searchParams = request.nextUrl.searchParams;
  const layer = searchParams.get('layer');

  // Validate parameters
  if (!layer || !z || !x || !y) {
    return NextResponse.json(
      { error: 'Missing required parameters: layer, z, x, y' },
      { status: 400 }
    );
  }

  // Validate layer name (prevent injection attacks)
  const validLayers = ['clouds_new', 'precipitation_new', 'pressure_new', 'wind_new', 'temp_new'];
  if (!validLayers.includes(layer)) {
    logWeatherTileError({
      ip,
      layer,
      z,
      x,
      y,
      status: 400,
      error: 'Invalid layer name',
    });
    return NextResponse.json({ error: 'Invalid layer name' }, { status: 400 });
  }

  // Check if OpenWeatherMap service is available (validated at startup or lazily)
  if (!(await ensureServiceAvailable('openweather'))) {
    logWeatherTileError({
      ip,
      layer,
      z,
      x,
      y,
      status: 503,
      error: 'OpenWeatherMap service not available or API key invalid',
    });
    return NextResponse.json(
      { error: 'Weather service temporarily unavailable' },
      { status: 503 }
    );
  }

  // Rate limiting
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    logRateLimitEvent({
      ip,
      requests: 50,
      retryAfter: rateLimit.retryAfter || 60,
    });
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: rateLimit.retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.retryAfter || 60),
          'X-RateLimit-Limit': '50',
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
        },
      }
    );
  }

  // Request deduplication: if same tile is already being fetched, wait for that request
  const tileKey = getTileKey(layer, z, x, y);
  const existingRequest = inflightRequests.get(tileKey);
  
  if (existingRequest) {
    try {
      const cachedResponse = await existingRequest;
      const duration = Date.now() - startTime;
      logWeatherTileSuccess({ ip, layer, z, x, y, cached: true, duration });
      
      // Clone the response to avoid consuming the original
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        headers: {
          ...Object.fromEntries(cachedResponse.headers.entries()),
          'X-Cache': 'HIT-INFLIGHT',
        },
      });
    } catch (error) {
      // If the inflight request failed, fall through to retry
      inflightRequests.delete(tileKey);
    }
  }

  // Create new fetch request and store it for deduplication
  const fetchPromise = fetchWeatherTile(layer, z, x, y);
  inflightRequests.set(tileKey, fetchPromise);

  try {
    const owmResponse = await fetchPromise;

    // Clear from inflight map after completion
    inflightRequests.delete(tileKey);

    // Handle OWM errors
    if (owmResponse.status === 401) {
      logWeatherTileError({
        ip,
        layer,
        z,
        x,
        y,
        status: 401,
        error: 'OWM API key invalid',
      });
      return NextResponse.json(
        { error: 'Weather service authentication failed' },
        { status: 503 }
      );
    }

    if (owmResponse.status === 429) {
      logWeatherTileError({
        ip,
        layer,
        z,
        x,
        y,
        status: 429,
        error: 'OWM rate limit exceeded',
      });
      return NextResponse.json(
        { error: 'Weather service rate limit exceeded' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }

    if (owmResponse.status === 404) {
      // Tile doesn't exist (out of bounds or no data), return transparent 1x1 PNG
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      return new Response(transparentPng, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          ...getCacheHeaders(layer),
          'X-Tile-Status': 'no-data',
        },
      });
    }

    if (!owmResponse.ok) {
      logWeatherTileError({
        ip,
        layer,
        z,
        x,
        y,
        status: owmResponse.status,
        error: `OWM returned ${owmResponse.status}`,
      });
      return NextResponse.json(
        { error: 'Weather tile unavailable' },
        { status: 502 }
      );
    }

    // Success: stream the tile image back to client
    const duration = Date.now() - startTime;
    logWeatherTileSuccess({ ip, layer, z, x, y, cached: false, duration });

    const imageBuffer = await owmResponse.arrayBuffer();
    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        ...getCacheHeaders(layer),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    inflightRequests.delete(tileKey);
    
    logWeatherTileError({
      ip,
      layer,
      z,
      x,
      y,
      status: 500,
      error: error.message || 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to fetch weather tile' },
      { status: 500 }
    );
  }
}
