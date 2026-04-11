export const prerender = false;

import type { APIRoute } from 'astro';
import { h } from 'preact';
import { ImageResponse } from '@vercel/og';

const WIDTH = 1200;
const HEIGHT = 630;
const DEFAULT_AMOUNT = '150...';
const DEFAULT_EMOJIS = '💸 🍻 🧉';

const buildDefaultImage = () => {
  return new ImageResponse(
    h(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background:
            'linear-gradient(135deg, #f0eeff 0%, #ece9fd 52%, #ddd7ff 100%)',
          color: '#1e1b3a',
          fontFamily:
            'ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Inter, sans-serif',
          overflow: 'hidden',
        },
      },
      h('div', {
        style: {
          background:
            'radial-gradient(circle at 10% 10%, rgba(108,92,231,0.1) 0%, rgba(108,92,231,0) 40%), radial-gradient(circle at 90% 90%, rgba(162,155,254,0.15) 0%, rgba(162,155,254,0) 40%)',
          inset: '0',
          position: 'absolute',
        },
      }),
      h(
        'div',
        {
          style: {
            fontSize: '430px',
            position: 'absolute',
            right: '-20px',
            transform: 'translateY(14%)',
            opacity: 0.22,
            filter: 'saturate(0.9)',
          },
        },
        '💸',
      ),
      h(
        'div',
        {
          style: {
            background: 'rgba(255,255,255,0.9)',
            border: '2px solid #e4e0f8',
            borderRadius: '34px',
            boxShadow: '0 18px 44px rgba(108,92,231,0.2)',
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'center',
            padding: '56px 64px',
            position: 'relative',
            width: '78%',
            alignItems: 'center',
            gap: '24px',
          },
        },
        h(
          'div',
          {
            style: {
              fontSize: '112px',
              fontWeight: 900,
              letterSpacing: '-3px',
              color: '#6c5ce7',
            },
          },
          `${DEFAULT_AMOUNT} :$`,
        ),
        h(
          'div',
          {
            style: {
              fontSize: '66px',
              fontWeight: 800,
              color: '#1e1b3a',
              letterSpacing: '-1px',
            },
          },
          DEFAULT_EMOJIS,
        ),
        h(
          'div',
          {
            style: {
              fontSize: '34px',
              fontWeight: 800,
              color: '#6c5ce7',
              letterSpacing: '-0.6px',
              background: '#ece9fd',
              border: '2px solid #d6cffb',
              borderRadius: '16px',
              padding: '10px 18px',
            },
          },
          'Abrí La Jodita y saldá ahora',
        ),
      ),
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
};

export const GET: APIRoute = async () => {
  try {
    const image = buildDefaultImage();

    // Cache headers: 7 days in CDN
    image.headers.set(
      'Cache-Control',
      'public, max-age=600, s-maxage=604800, immutable',
    );
    image.headers.set('Content-Type', 'image/png');
    image.headers.set('CDN-Cache-Control', 'max-age=604800');

    return image;
  } catch (error) {
    console.error('[GET /api/og/default.png]', error);
    return new Response('Error', { status: 500 });
  }
};
