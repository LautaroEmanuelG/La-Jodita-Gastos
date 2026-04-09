export const prerender = false;

import type { APIRoute } from 'astro';
import crypto from 'node:crypto';

const MAX_SESSIONS = 20;

// ── Storage helpers (KV en prod, filesystem en local) ─────────────────────────
async function storeSession(id: string, data: string): Promise<void> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv');
    // TTL: 7 días (604800 segundos)
    await kv.set(id, data, { ex: 604800 });
    // Mantener índice para limpiar los más viejos
    await kv.lpush('session-index', id);
    const len = await kv.llen('session-index');
    if (len > MAX_SESSIONS) {
      const old = await kv.rpop('session-index');
      if (old) await kv.del(old as string);
    }
  } else {
    // Desarrollo local: sistema de archivos
    const { default: fs } = await import('node:fs');
    const { default: path } = await import('node:path');
    const dir = path.join(process.cwd(), 'data');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${id}.json`), data, 'utf-8');
    // Limpiar viejos
    const files = fs.readdirSync(dir)
      .filter((f: string) => f.endsWith('.json'))
      .map((f: string) => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs }))
      .sort((a: { mtime: number }, b: { mtime: number }) => b.mtime - a.mtime);
    if (files.length > MAX_SESSIONS) {
      (files as { name: string }[]).slice(MAX_SESSIONS).forEach((f: { name: string }) => fs.unlinkSync(path.join(dir, f.name)));
    }
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();
    let body: unknown;
    try { body = JSON.parse(text); } catch {
      return new Response(JSON.stringify({ error: 'JSON inválido' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const session = body as Record<string, unknown>;
    if (!Array.isArray(session.participants) || !Array.isArray(session.expenses)) {
      return new Response(JSON.stringify({ error: 'Datos de sesión inválidos' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = crypto.randomBytes(6).toString('hex');
    await storeSession(id, JSON.stringify(body));

    return new Response(JSON.stringify({ id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[/api/session POST]', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
