import { createClient, type RedisClientType } from 'redis';

// Redis connection configuration for BullMQ
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // BullMQ requires null
  retryDelayOnFailover: 100,
};

// Redis client for direct use
const redis: RedisClientType = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
  password: redisConfig.password,
});

redis.on('error', (err: Error) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));

// Safely connect without unhandled rejection if Redis is unavailable during boot/build
if (!redis.isOpen) {
  redis.connect().catch((err: Error) => {
    console.warn('[Redis] Initial connection deferred or failed:', err.message);
  });
}

export default redis;
