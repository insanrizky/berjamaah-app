/**
 * Simple in-memory cache for query optimization
 * TODO: Replace with Redis in production
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheItem<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - item.timestamp > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache with automatic refresh
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttlSeconds);
    return data;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [, item] of this.cache.entries()) {
      const isExpired = now - item.timestamp > item.ttl;
      if (isExpired) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
    };
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      const isExpired = now - item.timestamp > item.ttl;
      if (isExpired) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Export singleton instance
export const cache = new SimpleCache();

// Cache key generators
export const cacheKeys = {
  programStats: () => 'program:stats',
  programList: (status?: string, category?: string, offset = 0, limit = 20) =>
    `program:list:${status || 'all'}:${category || 'all'}:${offset}:${limit}`,
  programById: (id: string) => `program:${id}`,
  userDonations: (userId: string, limit = 10, cursor?: string) =>
    `user:${userId}:donations:${limit}:${cursor || 'none'}`,
  donationById: (id: string) => `donation:${id}`,
  userList: (page = 1, limit = 10, search = '', status = 'all', role = 'all') =>
    `user:list:${page}:${limit}:${search}:${status}:${role}`,
} as const;

// Cache TTL constants (in seconds)
export const cacheTTL = {
  SHORT: 60,      // 1 minute - for frequently changing data
  MEDIUM: 300,    // 5 minutes - for moderately changing data
  LONG: 1800,     // 30 minutes - for rarely changing data
  HOUR: 3600,     // 1 hour - for static data
} as const;
