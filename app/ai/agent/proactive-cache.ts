/**
 * Proactive Engine Cache
 * Caches results for 5 minutes to avoid running expensive queries on every request
 */

interface CachedProactiveData {
  events: any[]
  predictions: any
  timestamp: number
}

const cache = new Map<string, CachedProactiveData>()
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes (extended for better performance)

export function getCachedProactiveData(userId: string): CachedProactiveData | null {
  const cached = cache.get(userId)
  if (!cached) return null

  const age = Date.now() - cached.timestamp
  if (age > CACHE_TTL) {
    cache.delete(userId)
    return null
  }

  console.log(`⚡ [CACHE HIT] Proactive data for ${userId} (age: ${Math.round(age / 1000)}s)`)
  return cached
}

export function setCachedProactiveData(
  userId: string,
  events: any[],
  predictions: any
): void {
  cache.set(userId, {
    events,
    predictions,
    timestamp: Date.now()
  })
  console.log(`💾 [CACHE SET] Proactive data for ${userId}`)
}

export function invalidateCache(userId: string): void {
  cache.delete(userId)
  console.log(`🗑️ [CACHE INVALIDATE] Proactive data for ${userId}`)
}

// Clean up old cache entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  let cleaned = 0
  for (const [userId, data] of cache.entries()) {
    if (now - data.timestamp > CACHE_TTL) {
      cache.delete(userId)
      cleaned++
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 [CACHE CLEANUP] Removed ${cleaned} stale entries`)
  }
}, 10 * 60 * 1000)
