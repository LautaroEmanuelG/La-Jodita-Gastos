export const prerender = false;

import type { APIRoute } from 'astro';
import { getRedisClient } from '../../../lib/redis';

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  if (!/^[a-z0-9]{4,10}$/.test(id)) {
    return new Response('Not found', { status: 404 });
  }
  try {
    const redis = await getRedisClient();

    const data = await redis.get<string>(`s:${id}`);
    if (!data) return new Response('Not found', { status: 404 });

    const body = typeof data === 'string' ? data : JSON.stringify(data);
    return new Response(body, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[GET /api/s]', err);
    const message = err instanceof Error ? err.message : 'Error';
    const status = message.includes('UPSTASH_REDIS_REST_') ? 503 : 500;
    return new Response(message, { status });
  }
};
