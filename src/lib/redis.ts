import type { Redis } from '@upstash/redis';

const getRedisEnv = () => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? '';
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? '';

  if (!url || !token) {
    throw new Error(
      'Faltan variables de entorno de Upstash Redis: UPSTASH_REDIS_REST_URL y/o UPSTASH_REDIS_REST_TOKEN',
    );
  }

  return { url, token };
};

export const getRedisClient = async (): Promise<Redis> => {
  const { Redis } = await import('@upstash/redis');
  const { url, token } = getRedisEnv();

  return new Redis({ url, token });
};
