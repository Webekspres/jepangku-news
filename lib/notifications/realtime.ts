import { Redis as UpstashRedis } from '@upstash/redis';
import { createClient, type RedisClientType } from 'redis';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export type NotificationRealtimePayload = {
  unreadCount: number;
  at: number;
};

const CHANNEL_PREFIX = 'notif:';
const VERSION_KEY_PREFIX = 'notif:version:';
const SIGNAL_TTL_SECONDS = 300;

type RealtimeBackend = 'upstash' | 'redis' | 'memory';

let backend: RealtimeBackend | null = null;
let upstash: UpstashRedis | null = null;
let redisClient: RedisClientType | null = null;
let redisConnecting: Promise<RedisClientType> | null = null;
const memoryVersions = new Map<string, number>();

function resolveBackend(): RealtimeBackend {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return 'upstash';
  }
  if (process.env.REDIS_URL) {
    return 'redis';
  }
  return 'memory';
}

function getBackend(): RealtimeBackend {
  if (!backend) {
    backend = resolveBackend();
    logger.info('notification.realtime.backend', { backend });
  }
  return backend;
}

function getUpstash(): UpstashRedis {
  if (!upstash) {
    upstash = new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return upstash;
}

function channelFor(userId: string): string {
  return `${CHANNEL_PREFIX}${userId}`;
}

function versionKeyFor(userId: string): string {
  return `${VERSION_KEY_PREFIX}${userId}`;
}

async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient?.isOpen) return redisClient;

  if (!redisConnecting) {
    redisConnecting = (async () => {
      const client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => (retries > 3 ? false : Math.min(retries * 200, 1000)),
        },
      });
      client.on('error', (err) => {
        logger.warn('notification.realtime.redis_error', {
          error: err instanceof Error ? err.message : String(err),
        });
      });
      await client.connect();
      redisClient = client as RedisClientType;
      return redisClient;
    })().catch((err) => {
      redisConnecting = null;
      throw err;
    });
  }

  return redisConnecting;
}

async function resolveUnreadCount(userId: string, unreadCount?: number): Promise<number> {
  if (unreadCount !== undefined) return unreadCount;
  const now = new Date();
  return db.notification.count({
    where: {
      userId,
      readAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  });
}

export async function getNotificationSignalVersion(userId: string): Promise<number> {
  const resolved = getBackend();

  try {
    if (resolved === 'upstash') {
      const value = await getUpstash().get<number>(versionKeyFor(userId));
      return typeof value === 'number' ? value : 0;
    }

    if (resolved === 'redis') {
      const client = await getRedisClient();
      const value = await client.get(versionKeyFor(userId));
      return value ? Number(value) : 0;
    }

    return memoryVersions.get(userId) ?? 0;
  } catch (error) {
    logger.warn('notification.realtime.version_read_failed', {
      userId,
      backend: resolved,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
    return 0;
  }
}

export async function publishNotificationUpdate(
  userId: string,
  unreadCount?: number,
): Promise<void> {
  const count = await resolveUnreadCount(userId, unreadCount);
  const payload: NotificationRealtimePayload = {
    unreadCount: count,
    at: Date.now(),
  };
  const message = JSON.stringify(payload);
  const resolved = getBackend();

  try {
    if (resolved === 'upstash') {
      const redis = getUpstash();
      await redis.incr(versionKeyFor(userId));
      await redis.publish(channelFor(userId), message);
      await redis.expire(versionKeyFor(userId), SIGNAL_TTL_SECONDS);
      return;
    }

    if (resolved === 'redis') {
      const client = await getRedisClient();
      await client.incr(versionKeyFor(userId));
      await client.publish(channelFor(userId), message);
      await client.expire(versionKeyFor(userId), SIGNAL_TTL_SECONDS);
      return;
    }

    memoryVersions.set(userId, (memoryVersions.get(userId) ?? 0) + 1);
  } catch (error) {
    logger.warn('notification.realtime.publish_failed', {
      userId,
      backend: resolved,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  }
}

export function publishNotificationUpdateSafe(
  userId: string,
  unreadCount?: number,
): void {
  void publishNotificationUpdate(userId, unreadCount).catch((error) => {
    logger.warn('notification.realtime.publish_failed', {
      userId,
      errorMessage: error instanceof Error ? error.message : 'unknown',
    });
  });
}
