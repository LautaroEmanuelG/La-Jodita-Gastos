import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

const isTunnel = process.env.npm_lifecycle_event === 'dev:bitrix';

export default defineConfig({
  output: 'static', // Astro 5: rutas con prerender = false se sirven on-demand
  adapter: vercel(),
  // Astro 5 solo confía en X-Forwarded-Host de estos dominios; sin esto
  // Astro.url resuelve a "localhost" en Vercel (rompe og:image y /open-graph).
  security: {
    allowedDomains: [
      { hostname: 'la-jodita.vercel.app', protocol: 'https' },
      { hostname: '*.vercel.app', protocol: 'https' },
    ],
  },
  vite: {
    server: {
      allowedHosts: ['.moreclix.co', '.trycloudflare.com'],
      ...(isTunnel ? { hmr: { clientPort: 443 } } : {}),
    },
  },
});
