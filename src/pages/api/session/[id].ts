export const prerender = false;

import type { APIRoute } from 'astro';

async function fetchSession(id: string): Promise<string | null> {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get<string>(id);
    return data ?? null;
  } else {
    const { default: fs } = await import('node:fs');
    const { default: path } = await import('node:path');
    const file = path.join(process.cwd(), 'data', `${id}.json`);
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file, 'utf-8');
  }
}

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  if (!/^[\w-]{1,24}$/.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const data = await fetchSession(id);
    if (!data) return new Response('Not found', { status: 404 });

    return new Response(typeof data === 'string' ? data : JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[/api/session GET]', err);
    return new Response('Error', { status: 500 });
  }
};
