import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint__8mD6-aD.mjs';
import { manifest } from './manifest_DoY6R8ua.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/session/_id_.astro.mjs');
const _page2 = () => import('./pages/api/session.astro.mjs');
const _page3 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/session/[id].ts", _page1],
    ["src/pages/api/session.ts", _page2],
    ["src/pages/index.astro", _page3]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "48136116-ece6-457a-801a-80c6a6e7d970",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
