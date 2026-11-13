#!/usr/bin/env node
// Tell Bing (and other IndexNow engines) which pages changed.
// Usage: node scripts/indexnow.mjs            -> submits every URL in the live sitemap
//        node scripts/indexnow.mjs /pricing   -> submits just those paths
// The key file lives in packages/frontend/public/<key>.txt and is public by design.
import { readdirSync, readFileSync } from 'node:fs';

const HOST = 'softsystemsstudiollc.com';
const publicDir = new URL('../packages/frontend/public/', import.meta.url);
const keyFile = readdirSync(publicDir).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file in packages/frontend/public');
const key = keyFile.replace('.txt', '');
if (readFileSync(new URL(keyFile, publicDir), 'utf8').trim() !== key) {
  throw new Error('Key file content must equal its filename');
}

const paths = process.argv.slice(2);
let urlList;
if (paths.length) {
  urlList = paths.map((p) => `https://${HOST}${p.startsWith('/') ? p : `/${p}`}`);
} else {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${keyFile}`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} (${urlList.length} URLs)`);
if (!res.ok && res.status !== 202) process.exit(1);
