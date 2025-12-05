/**
 * Simple in-memory rate limiting utility
 * For production, consider using Redis or a dedicated rate limiting service
 */

type RateLimitEntry = {
  count: number
  resetAt: number
}

const rateLimits = new Map<string, RateLimitEntry>()

/**
 * Check if a request is within rate limits
 * @param key - Unique identifier for the rate limit (e.g., user ID)
 * @param maxRequests - Maximum number of requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false otherwise
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now()
  const limit = rateLimits.get(key)

  // No previous requests or window expired
  if (!limit || now > limit.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  // Exceeded limit
  if (limit.count >= maxRequests) {
    return false
  }

  // Increment counter
  limit.count++
  return true
}

/**
 * Clear expired entries from the rate limit map (cleanup)
 * Call this periodically to prevent memory leaks
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetAt) {
      rateLimits.delete(key)
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
