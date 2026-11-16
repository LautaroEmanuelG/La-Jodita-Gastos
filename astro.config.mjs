import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

const isTunnel = process.env.npm_lifecycle_event === 'dev:bitrix';

export default defineConfig({
  output: 'static', // Astro 5: rutas con prerender = false se sirven on-demand
  adapter: vercel(),
  vite: {
    server: {
      allowedHosts: ['.moreclix.co', '.trycloudflare.com'],
      ...(isTunnel ? { hmr: { clientPort: 443 } } : {}),
    },
  },
});
