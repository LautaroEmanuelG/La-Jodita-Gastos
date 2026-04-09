export const prerender = false;

import type { APIRoute } from 'astro';
import { getRedisClient, getSessionTtlSeconds } from '../../../lib/redis';

const shortId = () => {
  return Math.random().toString(36).slice(2, 8); // ~6 chars base36
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: 'JSON inválido' }, 400);
    }
    const s = body as Record<string, unknown>;
    if (!Array.isArray(s.participants) || !Array.isArray(s.expenses)) {
      return json({ error: 'Datos inválidos' }, 400);
    }

    const redis = await getRedisClient();

    const id = shortId();
    await redis.set(`s:${id}`, text, { ex: getSessionTtlSeconds() });

    return json({ id });
  } catch (err) {
    console.error('[POST /api/s]', err);
    const message = err instanceof Error ? err.message : String(err);
    const status = message.includes('UPSTASH_REDIS_REST_') ? 503 : 500;
    return json({ error: message }, status);
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
