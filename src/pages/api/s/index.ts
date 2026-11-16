export const prerender = false;

import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { getRedisClient } from '../../../lib/redis';

const MAX_BODY_BYTES = 200_000;
const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 8; // 36^8 ≈ 2.8e12 combinaciones

const shortId = () => {
  const bytes = randomBytes(ID_LENGTH);
  let id = '';
  for (const b of bytes) id += ID_ALPHABET[b % ID_ALPHABET.length];
  return id;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return json({ error: 'Sesión demasiado grande' }, 413);
    }
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      return json({ error: 'JSON inválido' }, 400);
    }
    const s = body as Record<string, unknown>;
    if (!s || !Array.isArray(s.participants) || !Array.isArray(s.expenses)) {
      return json({ error: 'Datos inválidos' }, 400);
    }

    const redis = await getRedisClient();

    // Sin TTL: los links no vencen. NX evita pisar una sesión existente si hubiera colisión de ID
    for (let attempt = 0; attempt < 3; attempt++) {
      const id = shortId();
      const ok = await redis.set(`s:${id}`, text, { nx: true });
      if (ok) return json({ id });
    }
    return json({ error: 'No se pudo generar un ID único' }, 500);
  } catch (err) {
    console.error('[POST /api/s]', err);
    const message = err instanceof Error ? err.message : String(err);
    const unavailable =
      message.includes('UPSTASH_REDIS_REST_') || message.includes('fetch failed');
    return json(
      { error: unavailable ? 'Almacenamiento no disponible' : 'Error interno' },
      unavailable ? 503 : 500,
    );
  }
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
