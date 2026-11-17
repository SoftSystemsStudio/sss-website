import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOPIC_PILLARS, TOPIC_PILLAR_IDS, type TopicPillarId } from './config';
import { pillarCounts, pillarLine, pillarOf, pillarOrder } from './pillars';

const ids = TOPIC_PILLAR_IDS;
const zero = () => Object.fromEntries(ids.map((id) => [id, 0])) as Record<TopicPillarId, number>;
const day = (iso: string) => new Date(`${iso}T11:17:00Z`);

test('pillarOrder returns every pillar exactly once', () => {
  const order = pillarOrder(zero(), day('2026-11-16'));
  assert.deepEqual([...order].sort(), [...ids].sort());
});

test('with zero posts, the first pillar rotates with the run date (not always the first one)', () => {
  const firsts = new Set<string>();
  for (let d = 1; d <= 8; d++) {
    firsts.add(pillarOrder(zero(), day(`2026-12-0${d}`))[0]);
  }
  assert.equal(
    firsts.size,
    ids.length,
    'eight consecutive days start with eight different pillars',
  );
});

test('the same date always gives the same order (no randomness)', () => {
  const a = pillarOrder(zero(), day('2026-11-16'));
  const b = pillarOrder(zero(), day('2026-11-16'));
  assert.deepEqual(a, b);
});

test('all-equal counts on different dates give different first pillars', () => {
  const counts = Object.fromEntries(ids.map((id) => [id, 2])) as Record<TopicPillarId, number>;
  assert.notEqual(
    pillarOrder(counts, day('2026-11-16'))[0],
    pillarOrder(counts, day('2026-11-17'))[0],
  );
});

test('least covered first; a heavily covered pillar goes to the end', () => {
  const counts = { ...zero(), cost: 9, need: 1 };
  for (const iso of ['2026-11-16', '2026-11-17', '2027-03-01']) {
    const order = pillarOrder(counts, day(iso));
    assert.equal(order[order.length - 1], 'cost', iso);
    assert.equal(order[order.length - 2], 'need', iso);
    assert.ok(!['cost', 'need'].includes(order[0]), iso);
  }
});

test('pillarOf reads only a strict Pillar line with a known id', () => {
  assert.equal(pillarOf(`x\n${pillarLine('trades')}\ny`), 'trades');
  for (const body of [
    '',
    null,
    undefined,
    '- **Pillar:** Website cost and pricing',
    '- **Pillar:** Crypto (`crypto`)',
    '- **Pillar:** Website cost and pricing (`cost`) and also (`need`)',
    'text - **Pillar:** Do I need a website (`need`)',
    '- **Pillar:**(`need`)x',
  ]) {
    assert.equal(pillarOf(body), '', String(body));
  }
});

test('pillarLine shows the label and the id', () => {
  const p = TOPIC_PILLARS.find((x) => x.id === 'hiring')!;
  assert.equal(pillarLine('hiring'), `- **Pillar:** ${p.label} (\`hiring\`)`);
});

test('pillarCounts counts merged and open drafts only, ignoring unknown pillars', () => {
  const counts = pillarCounts([
    { pillar: 'cost', state: 'closed', merged: true },
    { pillar: 'cost', state: 'open', merged: false },
    { pillar: 'need', state: 'closed', merged: false }, // rejected: not coverage
    { pillar: '', state: 'open', merged: false },
    { pillar: 'nope', state: 'closed', merged: true },
  ]);
  assert.equal(counts.cost, 2);
  assert.equal(counts.need, 0);
  assert.equal(
    Object.values(counts).reduce((a, b) => a + b, 0),
    2,
  );
});

test('no pillar points the researcher at Google Business Profile or local-SEO specialist ground', () => {
  for (const p of TOPIC_PILLARS) {
    const text = `${p.label} ${p.examples}`.toLowerCase();
    for (const bad of [
      'google',
      'business profile',
      'review',
      'citation',
      'listing',
      'seo',
      'rank',
      'algorithm',
    ]) {
      assert.equal(text.includes(bad), false, `${p.id} mentions "${bad}"`);
    }
  }
});
