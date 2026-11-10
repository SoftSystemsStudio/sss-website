#!/usr/bin/env node
/**
 * One-off maintenance script: download the exact Google Fonts files the site
 * used to fetch at build time through `next/font/google`, so they are
 * committed and loaded with `next/font/local`. The build never runs this and
 * never touches the network for fonts (a flaky Google Fonts download broke
 * CI and a production deploy on 2026-11-09).
 *
 * It reuses Next's own helpers to build the same Google Fonts URL and sends
 * the same User-Agent, keeps only the subsets we use, and writes:
 *
 *   src/fonts/<family>/<family>-<subset>-<style>.woff2
 *   src/fonts/<family>/OFL.txt   (license, from github.com/google/fonts)
 *   src/fonts/fallbacks.css      ("<Family> Fallback" faces: local Arial or
 *                                 Times New Roman with the same precomputed
 *                                 size-adjust metrics next/font/google used)
 *
 * then prints the `src` entries for each next/font/local call. Those calls use
 * `adjustFontFallback: false, fallback: ['<Family> Fallback']`, because
 * next/font/local's own fallback metrics differ slightly from Google's and
 * shift glyphs the fonts lack (e.g. arrows) by a pixel.
 *
 * Re-run only when a font, weight, style or subset changes:
 *   node packages/frontend/scripts/fetch-fonts.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const frontend = path.resolve(here, '..');
const require = createRequire(path.join(frontend, 'package.json'));
const googleDir = path.dirname(
  require.resolve('next/dist/compiled/@next/font/dist/google/loader.js'),
);
const { validateGoogleFontFunctionCall } = require(
  path.join(googleDir, 'validate-google-font-function-call.js'),
);
const { getFontAxes } = require(path.join(googleDir, 'get-font-axes.js'));
const { getGoogleFontsUrl } = require(path.join(googleDir, 'get-google-fonts-url.js'));
const { calculateSizeAdjustValues } = require('next/dist/server/font-utils');

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36';

/**
 * Every next/font/google call the site made, options unchanged. Third item:
 * extra subsets to download besides the preloaded `subsets`.
 * Cormorant Garamond is requested at 400-600, the union of the site layout
 * (500, 600) and the Kettle & Grain demo (400, 500, 600); Google serves the
 * same variable file either way.
 */
const FONTS = [
  ['Instrument_Sans', { subsets: ['latin'] }],
  [
    'Cormorant_Garamond',
    { subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'] },
  ],
  ['Manrope', { subsets: ['latin'], weight: ['400', '500', '600', '700'] }],
  ['Archivo', { subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] }],
  ['JetBrains_Mono', { subsets: ['latin'], weight: ['500', '600'] }],
  ['Outfit', { subsets: ['latin'], weight: ['500', '600', '700'] }],
  ['Karla', { subsets: ['latin'], weight: ['400', '500', '700'] }],
  ['Bodoni_Moda', { subsets: ['latin'], style: ['normal', 'italic'] }],
  // latin-ext too: the Mayhaw photo credits use "ş"/"Ş", which Google served from Jost's latin-ext file.
  ['Jost', { subsets: ['latin'] }, ['latin-ext']],
];

async function get(url, binary = false) {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (err) {
      if (attempt >= 3) throw err;
    }
  }
}

const fallbacks = [];
for (const [fn, opts, extraSubsets = []] of FONTS) {
  const v = validateGoogleFontFunctionCall(fn, opts);
  const url = getGoogleFontsUrl(
    v.fontFamily,
    getFontAxes(v.fontFamily, v.weights, v.styles, v.selectedVariableAxes),
    'swap',
  );
  const css = await get(url);
  const slug = v.fontFamily.toLowerCase().replace(/\s+/g, '-');
  const dir = path.join(frontend, 'src', 'fonts', slug);
  await mkdir(dir, { recursive: true });

  // Google's response: a "/* subset */" comment, then one @font-face block.
  const faces = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face \{([^}]+)\}/g)]
    .filter(([, subset]) => [...v.subsets, ...extraSubsets].includes(subset))
    .map(([, subset, body]) => ({
      subset,
      unicodeRange: /unicode-range: ([^;]+);/.exec(body)[1],
      style: /font-style: (\w+)/.exec(body)[1],
      weight: /font-weight: ([\d ]+);/.exec(body)[1],
      src: /src: url\((.+?)\)/.exec(body)[1],
    }));

  const written = new Map();
  console.log(`\n${v.fontFamily}  (${url})`);
  for (const face of faces) {
    if (!written.has(face.src)) {
      // One file per subset+style: Google serves one variable file for every weight.
      const name = `${slug}-${face.subset}-${face.style}.woff2`;
      await writeFile(path.join(dir, name), await get(face.src, true));
      written.set(face.src, name);
    }
    console.log(
      `  [${face.subset}] { path: '${slug}/${written.get(face.src)}', weight: '${face.weight}', style: '${face.style}' }`,
    );
  }
  // Families split across subset files need a unicode-range per next/font/local call.
  for (const s of extraSubsets.length ? [...v.subsets, ...extraSubsets] : []) {
    console.log(`  ${s} unicode-range: ${faces.find((f) => f.subset === s)?.unicodeRange}`);
  }

  // Metric-matched fallback face, with the exact values next/font/google used.
  const m = calculateSizeAdjustValues(v.fontFamily);
  fallbacks.push(
    `@font-face {\n  font-family: '${v.fontFamily} Fallback';\n  src: local('${m.fallbackFont}');\n` +
      `  ascent-override: ${m.ascent}%;\n  descent-override: ${m.descent}%;\n` +
      `  line-gap-override: ${m.lineGap}%;\n  size-adjust: ${m.sizeAdjust}%;\n}\n`,
  );

  const licenseDir = v.fontFamily.toLowerCase().replace(/\s+/g, '');
  await writeFile(
    path.join(dir, 'OFL.txt'),
    await get(`https://raw.githubusercontent.com/google/fonts/main/ofl/${licenseDir}/OFL.txt`),
  );
}

await writeFile(
  path.join(frontend, 'src', 'fonts', 'fallbacks.css'),
  `/* Generated by scripts/fetch-fonts.mjs. Do not edit by hand. */\n\n${fallbacks.join('\n')}`,
);
