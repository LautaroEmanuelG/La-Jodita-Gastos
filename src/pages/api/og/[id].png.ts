export const prerender = false;

import type { APIRoute } from 'astro';
import { h } from 'preact';
import { ImageResponse } from '@vercel/og';
import { getRedisClient } from '../../../lib/redis';

const WIDTH = 1200;
const HEIGHT = 630;
const VALID_ID_REGEX = /^[a-z0-9]{4,10}$/;
const APP_EMOJI_POOL = ['💸', '🍻', '🧉', '🎉', '😎', '🍕', '🚕', '🏝️'];

const parseMoneyValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return NaN;

  const raw = value.trim();
  if (!raw) return NaN;

  const clean = raw.replace(/[^\d,.-]/g, '');
  if (!clean) return NaN;

  const lastComma = clean.lastIndexOf(',');
  const lastDot = clean.lastIndexOf('.');

  let normalized = clean;
  if (lastComma > -1 && lastDot > -1) {
    const decimalSep = lastComma > lastDot ? ',' : '.';
    const groupSep = decimalSep === ',' ? '.' : ',';
    normalized = clean
      .replace(new RegExp(`\\${groupSep}`, 'g'), '')
      .replace(decimalSep, '.');
  } else if (lastComma > -1) {
    normalized = clean.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = clean.replace(/,/g, '');
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : NaN;
};

const sumExpensesBase = (expenses: unknown): number => {
  if (!Array.isArray(expenses)) return 0;

  return expenses.reduce((acc, expense) => {
    const row = expense as Record<string, unknown>;
    const base = parseMoneyValue(row.amountInBase);
    const amount = parseMoneyValue(row.amount);

    if (Number.isFinite(base)) return acc + base;
    if (Number.isFinite(amount)) return acc + amount;
    return acc;
  }, 0);
};

const getTensionAmount = (value: number): string => {
  const rawDigits = Math.abs(Math.round(value)).toString().replace(/\D/g, '');
  const head = (rawDigits || '0').slice(0, 3).padEnd(3, '0');
  return `${head}...`;
};

const getEmojiTrio = (seedText: string): string[] => {
  const hash = seedText
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const start = hash % APP_EMOJI_POOL.length;
  return [0, 1, 2].map(
    offset => APP_EMOJI_POOL[(start + offset) % APP_EMOJI_POOL.length],
  );
};

const parseSnapshot = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  if (typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return null;
};

const buildImage = (input: { amountLabel: string; emojis: string[] }) => {
  const { amountLabel, emojis } = input;
  const emojiInline = emojis.join(' ');

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
        emojis[0] ?? '💸',
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
          `${amountLabel} :$`,
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
          emojiInline,
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
          'Abri la jodita y agarrate',
        ),
      ),
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
};

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';

  if (!VALID_ID_REGEX.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const redis = await getRedisClient();
    const raw = await redis.get<unknown>(`s:${id}`);
    const parsed = parseSnapshot(raw);

    if (!parsed) {
      const fallbackImage = buildImage({
        amountLabel: '000...',
        emojis: getEmojiTrio(id),
      });
      fallbackImage.headers.set(
        'Cache-Control',
        'public, max-age=300, s-maxage=3600, immutable',
      );
      fallbackImage.headers.set('Content-Type', 'image/png');
      fallbackImage.headers.set('CDN-Cache-Control', 'max-age=3600');
      return fallbackImage;
    }

    const expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
    const total = Math.round(sumExpensesBase(expenses));
    const tensionAmount = getTensionAmount(total);
    const emojis = getEmojiTrio(id);

    const image = buildImage({
      amountLabel: tensionAmount,
      emojis,
    });

    // Optimized cache headers for social platforms
    // max-age: 5 min (browser), s-maxage: 24h (CDN)
    // Vercel caches for 1 year, social platforms re-query after s-maxage
    image.headers.set(
      'Cache-Control',
      'public, max-age=300, s-maxage=86400, immutable',
    );
    image.headers.set('Content-Type', 'image/png');
    image.headers.set('CDN-Cache-Control', 'max-age=86400');

    return image;
  } catch (error) {
    console.error('[GET /api/og/:id.png]', error);
    const fallbackImage = buildImage({
      amountLabel: '000...',
      emojis: getEmojiTrio(id),
    });
    fallbackImage.headers.set(
      'Cache-Control',
      'public, max-age=120, s-maxage=1800, immutable',
    );
    fallbackImage.headers.set('Content-Type', 'image/png');
    fallbackImage.headers.set('CDN-Cache-Control', 'max-age=1800');
    return fallbackImage;
  }
};
