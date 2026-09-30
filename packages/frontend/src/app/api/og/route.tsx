import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { BUILD_FEE, RETAINER_MIN } from '@/lib/business';

export const runtime = 'edge';

const INK = '#17312B';
const INK_SOFT = '#3F4B46';
const INK_MUTED = '#5C6762';
const PAPER = '#F7F7F3';
const SUN = '#F2C230';

const EYEBROW = 'Soft Systems Studio';

/**
 * Fetch a Google Font subset to exactly the characters we draw.
 * Returns null on any failure.
 */
async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');
    const line1 = title ?? 'You built the business.';
    const line2 = title ? '' : 'I’ll build the website.';
    const footer = `${BUILD_FEE} flat build · Care Plans from ${RETAINER_MIN}/mo · Based in Smiths Station, AL`;

    // Subset fonts only cover the characters they were fetched for, so it's all
    // or nothing: a partial set would mix typefaces glyph by glyph.
    const [serif, serifItalic, sans] = await Promise.all([
      loadFont('Instrument+Serif', line1),
      line2 ? loadFont('Instrument+Serif:ital@1', line2) : Promise.resolve(null),
      loadFont('Instrument+Sans:wght@500', `${EYEBROW.toUpperCase()}${footer}`),
    ]);
    const fonts =
      serif && sans && (serifItalic || !line2)
        ? [
            { name: 'Sans', data: sans, style: 'normal' as const, weight: 500 as const },
            { name: 'Serif', data: serif, style: 'normal' as const, weight: 400 as const },
            ...(serifItalic
              ? [
                  {
                    name: 'Serif',
                    data: serifItalic,
                    style: 'italic' as const,
                    weight: 400 as const,
                  },
                ]
              : []),
          ]
        : undefined;

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: PAPER,
          padding: '64px 80px',
          color: INK,
          fontFamily: 'Sans',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.14em',
            color: INK_MUTED,
          }}
        >
          {EYEBROW.toUpperCase()}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Serif' }}>
          <div style={{ display: 'flex', fontSize: 104, lineHeight: 1, letterSpacing: '-0.015em' }}>
            {line1}
          </div>
          {line2 && (
            <div
              style={{
                display: 'flex',
                fontSize: 104,
                lineHeight: 1,
                letterSpacing: '-0.015em',
                fontStyle: 'italic',
                marginTop: 8,
              }}
            >
              I’ll build the
              <span
                style={{
                  marginLeft: 26,
                  backgroundImage: `linear-gradient(transparent 60%, ${SUN} 60%, ${SUN} 88%, transparent 88%)`,
                }}
              >
                website.
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            borderTop: `2px solid ${INK}`,
            paddingTop: 24,
            fontSize: 24,
            color: INK_SOFT,
          }}
        >
          {footer}
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
        fonts,
      },
    );
  } catch (e) {
    console.error('OG Image generation failed:', e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
