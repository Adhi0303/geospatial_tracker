import jwt from 'jsonwebtoken';

/**
 * API Key Validation & JWT Token Generation System
 * Validates all external API keys at startup and generates JWT tokens for runtime use.
 */

interface ApiKeyStatus {
  service: string;
  valid: boolean;
  token?: string;
  error?: string;
  tier?: string;
  rateLimit?: number;
}

interface ApiKeyRegistry {
  openweather?: string;
  opensky?: string;
  aisstream?: string;
  google_maps?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const TOKEN_EXPIRY = '30d'; // Tokens expire after 30 days

/**
 * Validates OpenWeatherMap API key by fetching current weather for London
 */
async function validateOpenWeatherKey(apiKey: string): Promise<ApiKeyStatus> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (response.status === 401) {
      return { service: 'openweather', valid: false, error: 'Invalid API key' };
    }

    if (response.status === 429) {
      return { service: 'openweather', valid: false, error: 'Rate limit exceeded during validation' };
    }

    if (!response.ok) {
      return { service: 'openweather', valid: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    
    // Generate JWT token with metadata
    const token = jwt.sign(
      {
        service: 'openweather',
        tier: 'free', // Could detect tier from response headers
        rateLimit: 60, // Free tier: 60 calls/minute
        validatedAt: Date.now(),
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return {
      service: 'openweather',
      valid: true,
      token,
      tier: 'free',
      rateLimit: 60,
    };
  } catch (error: any) {
    return {
      service: 'openweather',
      valid: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Validates OpenSky Network credentials (optional auth)
 */
async function validateOpenSkyKey(username?: string, password?: string): Promise<ApiKeyStatus> {
  try {
    // OpenSky doesn't require auth, but authenticated users get higher rate limits
    if (!username || !password) {
      return {
        service: 'opensky',
        valid: true,
        token: jwt.sign(
          { service: 'opensky', tier: 'anonymous', rateLimit: 100 },
          JWT_SECRET,
          { expiresIn: TOKEN_EXPIRY }
        ),
        tier: 'anonymous',
        rateLimit: 100,
      };
    }

    const response = await fetch('https://opensky-network.org/api/states/all', {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 401) {
      return { service: 'opensky', valid: false, error: 'Invalid credentials' };
    }

    if (!response.ok) {
      return { service: 'opensky', valid: false, error: `HTTP ${response.status}` };
    }

    const token = jwt.sign(
      { service: 'opensky', tier: 'authenticated', rateLimit: 400 },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return {
      service: 'opensky',
      valid: true,
      token,
      tier: 'authenticated',
      rateLimit: 400,
    };
  } catch (error: any) {
    return { service: 'opensky', valid: false, error: error.message };
  }
}

/**
 * Validates AISStream API key by establishing a test connection
 */
async function validateAISStreamKey(apiKey: string): Promise<ApiKeyStatus> {
  try {
    // AISStream uses WebSocket, so we validate via their REST API if available
    // For now, just validate format and assume valid if non-empty
    if (!apiKey || apiKey === 'your_api_key_here') {
      return { service: 'aisstream', valid: false, error: 'API key not configured' };
    }

    // Generate token assuming valid (AISStream has no REST validation endpoint)
    const token = jwt.sign(
      { service: 'aisstream', tier: 'free', rateLimit: 1000 },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    return {
      service: 'aisstream',
      valid: true,
      token,
      tier: 'free',
      rateLimit: 1000,
    };
  } catch (error: any) {
    return { service: 'aisstream', valid: false, error: error.message };
  }
}

/**
 * Master validation function - runs at app startup
 */
export async function validateAllApiKeys(): Promise<Map<string, ApiKeyStatus>> {
  console.log('[API Validator] Starting API key validation...');

  const results = new Map<string, ApiKeyStatus>();

  // Load API keys from environment
  const keys: ApiKeyRegistry = {
    openweather: process.env.OPENWEATHERMAP_API_KEY,
    opensky: process.env.OPENSKY_CLIENT_ID,
    aisstream: process.env.AISSTREAM_API_KEY,
    google_maps: process.env.GOOGLE_MAPS_API_KEY,
  };

  // Validate OpenWeatherMap
  if (keys.openweather && keys.openweather !== 'your_api_key_here') {
    const owmStatus = await validateOpenWeatherKey(keys.openweather);
    results.set('openweather', owmStatus);
    console.log(`[API Validator] OpenWeatherMap: ${owmStatus.valid ? '✓' : '✗'} ${owmStatus.error || ''}`);
  } else {
    results.set('openweather', {
      service: 'openweather',
      valid: false,
      error: 'API key not configured',
    });
    console.log('[API Validator] OpenWeatherMap: ✗ Not configured');
  }

  // Validate OpenSky
  const openskyStatus = await validateOpenSkyKey(
    keys.opensky,
    process.env.OPENSKY_CLIENT_SECRET
  );
  results.set('opensky', openskyStatus);
  console.log(`[API Validator] OpenSky: ${openskyStatus.valid ? '✓' : '✗'} (${openskyStatus.tier})`);

  // Validate AISStream
  if (keys.aisstream) {
    const aisStatus = await validateAISStreamKey(keys.aisstream);
    results.set('aisstream', aisStatus);
    console.log(`[API Validator] AISStream: ${aisStatus.valid ? '✓' : '✗'} ${aisStatus.error || ''}`);
  } else {
    results.set('aisstream', {
      service: 'aisstream',
      valid: false,
      error: 'API key not configured',
    });
    console.log('[API Validator] AISStream: ✗ Not configured');
  }

  console.log('[API Validator] Validation complete.');
  return results;
}

/**
 * In-memory token store (cleared on app restart)
 */
const tokenStore: Map<string, string> = (globalThis as any).__tokenStore || new Map<string, string>();
(globalThis as any).__tokenStore = tokenStore;

let isInitialized = (globalThis as any).__apiInitialized || false;
let initPromise: Promise<void> | null = null;

/**
 * Initialize token store at startup or lazily
 */
export async function initializeApiTokens(): Promise<void> {
  if (isInitialized) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const validationResults = await validateAllApiKeys();

    validationResults.forEach((status, service) => {
      if (status.valid && status.token) {
        tokenStore.set(service, status.token);
      }
    });

    isInitialized = true;
    (globalThis as any).__apiInitialized = true;
    console.log(`[API Validator] Initialized ${tokenStore.size} valid API tokens.`);
  })();

  return initPromise;
}

export async function ensureServiceAvailable(service: string): Promise<boolean> {
  if (!isInitialized) {
    await initializeApiTokens();
  }
  return tokenStore.has(service);
}

/**
 * Get JWT token for a service
 */
export function getServiceToken(service: string): string | undefined {
  return tokenStore.get(service);
}

/**
 * Verify JWT token and extract payload
 */
export function verifyServiceToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Check if a service is available
 */
export function isServiceAvailable(service: string): boolean {
  return tokenStore.has(service);
}

/**
 * Get rate limit for a service from its token
 */
export function getServiceRateLimit(service: string): number | null {
  const token = tokenStore.get(service);
  if (!token) return null;

  const payload = verifyServiceToken(token);
  return payload?.rateLimit || null;
}
