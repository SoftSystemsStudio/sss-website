import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

export function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Soft Systems Studio';
    const subtitle = searchParams.get('subtitle') || 'Websites for Local Businesses';

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#e8ece4',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(95,143,20,0.18), transparent 55%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 72,
            fontSize: 28,
            fontWeight: 700,
            color: '#5f8f14',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Soft Systems Studio
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 900,
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              color: '#141814',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 16,
            }}
          >
            {title}
          </div>
          <div style={{ width: 96, height: 6, backgroundColor: '#5f8f14', marginBottom: 24 }} />
          <div style={{ fontSize: 32, color: '#5c655b' }}>{subtitle}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            right: 72,
            display: 'flex',
            gap: 24,
            color: '#5c655b',
            fontSize: 22,
          }}
        >
          <span>$997 flat build</span>
          <span>·</span>
          <span>Care Plans from $150/mo</span>
        </div>
      </div>,
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e) {
    console.error('OG Image generation failed:', e);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
