export { renderers } from '../../../renderers.mjs';

const prerender = false;
async function fetchSession(id) {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get(id);
    return data ?? null;
  } else {
    const { default: fs } = await import('node:fs');
    const { default: path } = await import('node:path');
    const file = path.join(process.cwd(), "data", `${id}.json`);
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file, "utf-8");
  }
}
const GET = async ({ params }) => {
  const id = params.id ?? "";
  if (!/^[\w-]{1,24}$/.test(id)) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const data = await fetchSession(id);
    if (!data) return new Response("Not found", { status: 404 });
    return new Response(typeof data === "string" ? data : JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[/api/session GET]", err);
    return new Response("Error", { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
