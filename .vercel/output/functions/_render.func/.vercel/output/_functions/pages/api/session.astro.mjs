import crypto from 'node:crypto';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const MAX_SESSIONS = 20;
async function storeSession(id, data) {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv');
    await kv.set(id, data, { ex: 604800 });
    await kv.lpush("session-index", id);
    const len = await kv.llen("session-index");
    if (len > MAX_SESSIONS) {
      const old = await kv.rpop("session-index");
      if (old) await kv.del(old);
    }
  } else {
    const { default: fs } = await import('node:fs');
    const { default: path } = await import('node:path');
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${id}.json`), data, "utf-8");
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => ({ name: f, mtime: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.mtime - a.mtime);
    if (files.length > MAX_SESSIONS) {
      files.slice(MAX_SESSIONS).forEach((f) => fs.unlinkSync(path.join(dir, f.name)));
    }
  }
}
const POST = async ({ request }) => {
  try {
    const text = await request.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify({ error: "JSON inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const session = body;
    if (!Array.isArray(session.participants) || !Array.isArray(session.expenses)) {
      return new Response(JSON.stringify({ error: "Datos de sesión inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const id = crypto.randomBytes(6).toString("hex");
    await storeSession(id, JSON.stringify(body));
    return new Response(JSON.stringify({ id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[/api/session POST]", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
