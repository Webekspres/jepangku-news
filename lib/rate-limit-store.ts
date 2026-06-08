import { Redis as UpstashRedis } from '@upstash/redis';
import { createClient, type RedisClientType } from 'redis';
import { logger } from './logger';

export type RateLimitConsumeOptions = {
  max: number;
  windowMs: number;
};

export type RateLimitConsumeResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

export interface RateLimitStore {
  consume(key: string, options: RateLimitConsumeOptions): Promise<RateLimitConsumeResult>;
}

const INCR_WITH_EXPIRE_LUA = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return count
`;

class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async consume(key: string, { max, windowMs }: RateLimitConsumeOptions): Promise<RateLimitConsumeResult> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || existing.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    }

    const nextCount = existing.count + 1;
    if (nextCount > max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      };
    }

    this.store.set(key, { count: nextCount, resetAt: existing.resetAt });
    return { allowed: true };
  }
}

class UpstashRateLimitStore implements RateLimitStore {
  private redis: UpstashRedis;

  constructor() {
    this.redis = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  async consume(key: string, { max, windowMs }: RateLimitConsumeOptions): Promise<RateLimitConsumeResult> {
    const redisKey = `ratelimit:${key}`;
    const count = (await this.redis.eval(
      INCR_WITH_EXPIRE_LUA,
      [redisKey],
      [windowMs],
    )) as number;

    if (count > max) {
      const ttlMs = await this.redis.pttl(redisKey);
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(Math.max(ttlMs, 1000) / 1000),
      };
    }

    return { allowed: true };
  }
}

class RedisUrlRateLimitStore implements RateLimitStore {
  private client: RedisClientType | null = null;
  private connecting: Promise<RedisClientType> | null = null;

  private async getClient(): Promise<RedisClientType> {
    if (this.client?.isOpen) {
      return this.client;
    }

    if (!this.connecting) {
      this.connecting = (async () => {
        const client = createClient({ url: process.env.REDIS_URL });
        client.on('error', (err) => {
          logger.warn('rate_limit.redis_client_error', {
            error: err instanceof Error ? err.message : String(err),
          });
        });
        await client.connect();
        this.client = client as RedisClientType;
        return this.client;
      })();
    }

    return this.connecting;
  }

  async consume(key: string, { max, windowMs }: RateLimitConsumeOptions): Promise<RateLimitConsumeResult> {
    const client = await this.getClient();
    const redisKey = `ratelimit:${key}`;

    const count = (await client.eval(INCR_WITH_EXPIRE_LUA, {
      keys: [redisKey],
      arguments: [String(windowMs)],
    })) as number;

    if (count > max) {
      const ttlMs = await client.pTTL(redisKey);
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(Math.max(ttlMs, 1000) / 1000),
      };
    }

    return { allowed: true };
  }
}

export type RateLimitBackend = 'upstash' | 'redis' | 'memory';

let primaryStore: RateLimitStore | null = null;
let backend: RateLimitBackend = 'memory';
const memoryFallback = new InMemoryRateLimitStore();

function resolveBackend(): RateLimitBackend {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return 'upstash';
  }
  if (process.env.REDIS_URL) {
    return 'redis';
  }
  return 'memory';
}

function createPrimaryStore(resolved: RateLimitBackend): RateLimitStore {
  switch (resolved) {
    case 'upstash':
      return new UpstashRateLimitStore();
    case 'redis':
      return new RedisUrlRateLimitStore();
    default:
      return memoryFallback;
  }
}

export function getRateLimitBackend(): RateLimitBackend {
  if (!primaryStore) {
    backend = resolveBackend();
    primaryStore = createPrimaryStore(backend);
    logger.info('rate_limit.backend', { backend });
  }
  return backend;
}

export async function consumeRateLimit(
  key: string,
  options: RateLimitConsumeOptions,
): Promise<RateLimitConsumeResult> {
  getRateLimitBackend();

  if (backend === 'memory') {
    return memoryFallback.consume(key, options);
  }

  try {
    return await primaryStore!.consume(key, options);
  } catch (err) {
    logger.warn('rate_limit.redis_fallback', {
      backend,
      error: err instanceof Error ? err.message : String(err),
    });
    return memoryFallback.consume(key, options);
  }
}
