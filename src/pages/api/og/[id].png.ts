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

const buildImage = (input: {
  amountLabel: string;
  emojis: string[];
  iconUrl: string;
}) => {
  const { amountLabel, emojis, iconUrl } = input;
  const emojiInline = emojis.join(' ');

  return new ImageResponse(
    h(
      'div',
      {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background:
            'radial-gradient(circle at 15% 20%, #ffffff 0%, #f1eeff 40%, #e9e3ff 100%)',
          color: '#1e1b3a',
          fontFamily:
            'ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, Inter, sans-serif',
          padding: '52px',
          overflow: 'hidden',
        },
      },
      h('div', {
        style: {
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: 'rgba(108, 92, 231, 0.18)',
        },
      }),
      h('div', {
        style: {
          position: 'absolute',
          bottom: '-140px',
          left: '-120px',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'rgba(162, 155, 254, 0.22)',
        },
      }),
      h(
        'div',
        {
          style: {
            zIndex: 2,
            width: '100%',
            borderRadius: '34px',
            border: '2px solid #e4e0f8',
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 18px 42px rgba(108,92,231,0.18)',
            display: 'flex',
            flexDirection: 'column',
            padding: '36px 42px',
            justifyContent: 'center',
            gap: '28px',
          },
        },
        h(
          'div',
          { style: { display: 'flex', alignItems: 'center', gap: '16px' } },
          h('img', {
            src: iconUrl,
            width: '72',
            height: '72',
            style: { borderRadius: '20px', border: '2px solid #d6cffb' },
          }),
          h(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              },
            },
            h(
              'div',
              {
                style: {
                  fontSize: '54px',
                  fontWeight: 700,
                  color: '#1e1b3a',
                  letterSpacing: '-1px',
                },
              },
              'La jodita',
            ),
          ),
        ),
        h(
          'div',
          {
            style: {
              fontSize: '62px',
              color: '#5a4fcc',
              fontWeight: 800,
              letterSpacing: '-1px',
            },
          },
          `${amountLabel} :$ ${emojiInline}`,
        ),
      ),
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    },
  );
};

export const GET: APIRoute = async ({ params, url }) => {
  const id = params.id ?? '';

  if (!VALID_ID_REGEX.test(id)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    const redis = await getRedisClient();
    const raw = await redis.get<string>(`s:${id}`);

    if (!raw) {
      return new Response('Not found', { status: 404 });
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const expenses = Array.isArray(parsed.expenses) ? parsed.expenses : [];
    const total = Math.round(sumExpensesBase(expenses));
    const tensionAmount = getTensionAmount(total);
    const emojis = getEmojiTrio(id);
    const iconUrl = `${url.origin}/icon/la-jodita.svg`;

    const image = buildImage({
      amountLabel: tensionAmount,
      emojis,
      iconUrl,
    });

    image.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    return image;
  } catch (error) {
    console.error('[GET /api/og/:id.png]', error);
    return new Response('Error', { status: 500 });
  }
};
