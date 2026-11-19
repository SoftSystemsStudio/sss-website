/* eslint-disable security/detect-non-literal-fs-filename -- fixed path under public/ */
import fs from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getAllPosts } from '@/lib/blog';
import { knownOgTitles, resolveOgTitle } from '@/lib/og-titles';

// Node, not edge: the allowlist includes blog post titles, read from content/blog.
export const runtime = 'nodejs';

let known: Set<string> | undefined;
let logo: string | undefined;

/**
 * The header logo as a data URI, read once from public/. The Node runtime's
 * ImageResponse refuses to fetch images from private addresses (SSRF guard),
 * so the old same-origin URL broke locally; reading the file is also one less
 * round trip in production. Traced into the function by next.config.mjs.
 */
function logoDataUri(): string {
  if (!logo) {
    const svg = fs.readFileSync(
      path.join(process.cwd(), 'public/images/brand/logo-compact-color.svg'),
    );
    logo = `data:image/svg+xml;base64,${svg.toString('base64')}`;
  }
  return logo;
}

/** The allowlist, built once per server instance (posts only change with a deploy). */
function knownTitles(): Set<string> {
  if (!known) {
    let postTitles: string[] = [];
    try {
      postTitles = getAllPosts().map((post) => post.title);
    } catch (e) {
      // A broken post fails the build elsewhere; here, keep serving the other cards.
      console.error('OG: could not read blog posts:', e);
    }
    known = knownOgTitles(postTitles);
  }
  return known;
}

const INK = '#17312B';
const INK_SOFT = '#3F4B46';
const BRASS = '#A8834B';
const PAPER = '#F7F7F3';
const BRASS_WASH = 'rgba(168, 131, 75, 0.38)';

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
    // Only titles the site itself links to are drawn; anything else gets the default card.
    const title = resolveOgTitle(searchParams.get('title'), knownTitles());
    const line1 = title ?? 'You built the business.';
    const line2 = title ? '' : 'I’ll build the website.';
    const footer = 'Austin Hodges · Websites for local businesses · Smiths Station, AL';

    // Subset fonts only cover the characters they were fetched for, so it's all
    // or nothing: a partial set would mix typefaces glyph by glyph.
    const [serif, serifItalic, sans] = await Promise.all([
      loadFont('Cormorant+Garamond:wght@500', line1),
      line2 ? loadFont('Cormorant+Garamond:ital,wght@1,500', line2) : Promise.resolve(null),
      loadFont('Instrument+Sans:wght@500', footer),
    ]);
    const fonts =
      serif && sans && (serifItalic || !line2)
        ? [
            { name: 'Sans', data: sans, style: 'normal' as const, weight: 500 as const },
            { name: 'Serif', data: serif, style: 'normal' as const, weight: 500 as const },
            ...(serifItalic
              ? [
                  {
                    name: 'Serif',
                    data: serifItalic,
                    style: 'italic' as const,
                    weight: 500 as const,
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
        <img src={logoDataUri()} alt="Soft Systems Studio" width={261} height={71} />

        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'Serif' }}>
          <div style={{ display: 'flex', fontSize: 112, lineHeight: 1, letterSpacing: '-0.01em' }}>
            {line1}
          </div>
          {line2 && (
            <div
              style={{
                display: 'flex',
                fontSize: 112,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                fontStyle: 'italic',
                marginTop: 8,
              }}
            >
              I’ll build the
              <span
                style={{
                  marginLeft: 26,
                  backgroundImage: `linear-gradient(transparent 72%, ${BRASS_WASH} 72%, ${BRASS_WASH} 92%, transparent 92%)`,
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
            borderTop: `2px solid ${BRASS}`,
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
