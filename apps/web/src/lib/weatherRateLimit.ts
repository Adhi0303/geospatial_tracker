/**
 * In-Memory Rate Limiter with Sliding Window Algorithm
 * Prevents API abuse by limiting requests per IP per minute
 */

interface RateLimitEntry {
  requests: number[];
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60000; // 1 minute sliding window
const MAX_REQUESTS_PER_WINDOW = 50; // Leave buffer for OWM's 60/min limit

/**
 * Clean up expired entries every 5 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000); // 5 minutes

/**
 * Check if an IP is within rate limits
 * @param ip Client IP address
 * @returns Object with allowed status and retry info
 */
export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
} {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  let entry = rateLimitMap.get(ip);

  if (!entry) {
    // First request from this IP
    entry = {
      requests: [now],
      resetAt: now + WINDOW_MS,
    };
    rateLimitMap.set(ip, entry);

    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetAt: entry.resetAt,
    };
  }

  // Remove requests outside the sliding window
  entry.requests = entry.requests.filter((timestamp) => timestamp > windowStart);

  if (entry.requests.length >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    const oldestRequest = entry.requests[0];
    const retryAfter = Math.ceil((oldestRequest + WINDOW_MS - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestRequest + WINDOW_MS,
      retryAfter,
    };
  }

  // Within limits, record this request
  entry.requests.push(now);
  entry.resetAt = now + WINDOW_MS;

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - entry.requests.length,
    resetAt: entry.resetAt,
  };
}

/**
 * Get current rate limit status for an IP without consuming a request
 */
export function getRateLimitStatus(ip: string): {
  requests: number;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    return {
      requests: 0,
      remaining: MAX_REQUESTS_PER_WINDOW,
      resetAt: now + WINDOW_MS,
    };
  }

  // Count requests in current window
  const activeRequests = entry.requests.filter((timestamp) => timestamp > windowStart);

  return {
    requests: activeRequests.length,
    remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - activeRequests.length),
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for a specific IP (admin function)
 */
export function resetRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

/**
 * Get total number of tracked IPs
 */
export function getTrackedIpCount(): number {
  return rateLimitMap.size;
}
