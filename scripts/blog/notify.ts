/**
 * Discord notification for each real run: a draft PR is ready, or why there is none
 * today. The webhook URL is a secret (anyone holding it can post to the channel), so
 * nothing here ever logs it or puts it, or any part of it, in an error.
 */
import type { RunOutcome, SkipReason } from './types';

export type NotifyEvent =
  | {
      kind: 'pr';
      url: string;
      title: string;
      competition?: string;
      pillar?: string;
      seoOk?: number;
      seoTotal?: number;
    }
  | { kind: 'skipped'; reason: SkipReason; detail: string };

export type Notify = (event: NotifyEvent) => Promise<void>;

/** Longest message sent (Discord's own limit is 2,000). */
export const MAX_CONTENT = 1800;
const TITLE_MAX = 150;
const DETAIL_MAX = 200;
const SHORT_MAX = 40;
const TIMEOUT_MS = 10_000;
/** Longest Discord-requested wait (429 retry_after) we honour before the one retry. */
const MAX_RETRY_AFTER_MS = 5_000;
/** Wait before the one retry after a network error or a 5xx. */
const BACKOFF_MS = 1_000;
const USERNAME = 'Blog pipeline';

const PR_URL_RE = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/\d+$/;
const WEBHOOK_HOSTS = new Set(['discord.com', 'discordapp.com']);
const WEBHOOK_PATH_RE = /^\/api\/webhooks\/\d{1,25}\/[A-Za-z0-9_-]{1,200}$/;

/**
 * Thrown when a notification could not be delivered. Carries only the HTTP status (or
 * `network error` / `timeout`) and a fixed message: never the URL, the response body or
 * the underlying error. When runPipeline throws it, `outcome` is set and already final
 * (a PR it opened stays open), and `logFailure` is set when the run-log write failed too.
 */
export class NotifyError extends Error {
  constructor(
    readonly status: NotifyStatus,
    readonly outcome?: RunOutcome,
    readonly logFailure?: Error,
  ) {
    super(`Discord notification failed: ${status}`);
    this.name = 'NotifyError';
  }
}

export type NotifyStatus = number | 'network error' | 'timeout' | 'invalid event' | 'error';

/**
 * One line of plain text that cannot ping, link or format: whitespace collapsed,
 * backticks, angle brackets (`<@id>`, `<#id>`, `<url>`) and square brackets (masked
 * links) swapped for look-alikes, and `@` followed by a zero-width space.
 */
function neutral(s: string, max: number): string {
  const one = String(s)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/`/g, "'")
    .replace(/</g, '‹')
    .replace(/>/g, '›')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')')
    .replace(/@/g, '@​');
  return one.length <= max ? one : `${one.slice(0, max - 1)}…`;
}

function count(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n >= 0;
}

/** The message for an event. Throws when a pr event's URL is not a GitHub PR URL. */
export function formatNotification(event: NotifyEvent): { content: string } {
  let content: string;
  if (event.kind === 'pr') {
    if (typeof event.url !== 'string' || !PR_URL_RE.test(event.url)) {
      throw new Error('notification rejected: not a GitHub pull request URL');
    }
    const parts: string[] = [];
    if (event.competition) parts.push(`competition: ${neutral(event.competition, SHORT_MAX)}`);
    if (event.pillar) parts.push(`pillar: ${neutral(event.pillar, SHORT_MAX)}`);
    if (count(event.seoOk) && count(event.seoTotal) && event.seoOk <= event.seoTotal) {
      parts.push(`SEO checks passed: ${event.seoOk}/${event.seoTotal}`);
    }
    const title = neutral(event.title, TITLE_MAX) || '(untitled)';
    content =
      `New blog draft ready to review: ${title} - ${event.url}` +
      (parts.length ? ` (${parts.join(', ')})` : '') +
      '. Read it in the Vercel preview on the PR, then merge to publish or close to reject.';
  } else {
    content = `No blog draft today (${neutral(event.reason, SHORT_MAX)}): ${neutral(event.detail, DETAIL_MAX)}`;
  }
  return { content: content.slice(0, MAX_CONTENT) };
}

const INVALID_URL =
  'DISCORD_WEBHOOK_URL is not a valid Discord webhook URL (expected https://discord.com/api/webhooks/<id>/<token>)';

/** True for https://discord(app).com/api/webhooks/<digits>/<token>[?wait=true], nothing else. */
function isWebhookUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false; // the URL constructor's message quotes the input: never rethrow it
  }
  return (
    u.protocol === 'https:' &&
    WEBHOOK_HOSTS.has(u.hostname) &&
    u.port === '' &&
    u.username === '' &&
    u.password === '' &&
    WEBHOOK_PATH_RE.test(u.pathname) &&
    (u.search === '' || u.search === '?wait=true') &&
    u.hash === '' &&
    !raw.includes('#')
  );
}

export interface NotifierOptions {
  /** Per-attempt timeout; 10 s by default. */
  timeoutMs?: number;
  /** Injected for tests. */
  sleep?: (ms: number) => Promise<void>;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Seconds from a 429 body's `retry_after` (or the Retry-After header), in ms; null if absent. */
async function retryAfterMs(res: Response): Promise<number | null> {
  try {
    const json = (await res.json()) as unknown;
    if (json && typeof json === 'object' && 'retry_after' in json) {
      const s = Number(json.retry_after);
      if (Number.isFinite(s) && s >= 0) return Math.ceil(s * 1000);
    }
  } catch {
    // not JSON: fall through to the header
  }
  const h = Number(res.headers.get('retry-after'));
  return Number.isFinite(h) && h >= 0 && res.headers.has('retry-after')
    ? Math.ceil(h * 1000)
    : null;
}

/**
 * A notifier that posts to the Discord webhook at `webhookUrl`. Throws at once (with a
 * message that does not contain the URL) when the URL is not a Discord webhook URL.
 * Each call makes at most two attempts: one retry after a network error, a timeout, a
 * 5xx, or a 429 whose retry_after is at most 5 s. Any other failure throws NotifyError.
 */
export function createDiscordNotifier(
  webhookUrl: string,
  fetchFn: typeof fetch = fetch,
  opts: NotifierOptions = {},
): Notify {
  if (typeof webhookUrl !== 'string' || !isWebhookUrl(webhookUrl)) throw new Error(INVALID_URL);
  const url = webhookUrl;
  const timeoutMs = opts.timeoutMs ?? TIMEOUT_MS;
  const sleep = opts.sleep ?? realSleep;

  return async (event) => {
    let content: string;
    try {
      content = formatNotification(event).content;
    } catch {
      throw new NotifyError('invalid event');
    }
    const body = JSON.stringify({
      username: USERNAME,
      content,
      allowed_mentions: { parse: [] },
    });

    for (let attempt = 1; ; attempt++) {
      let res: Response;
      try {
        res = await fetchFn(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (err) {
        const name = (err as { name?: unknown } | null)?.name;
        const status =
          name === 'TimeoutError' || name === 'AbortError' ? 'timeout' : 'network error';
        if (attempt === 1) {
          await sleep(BACKOFF_MS);
          continue;
        }
        throw new NotifyError(status);
      }
      if (res.ok) {
        await res.body?.cancel().catch(() => undefined);
        return;
      }
      if (attempt === 1 && res.status === 429) {
        // No retry_after at all: a short backoff. More than 5 s: a retry would fail too.
        const wait = (await retryAfterMs(res)) ?? BACKOFF_MS;
        if (wait <= MAX_RETRY_AFTER_MS) {
          await sleep(wait);
          continue;
        }
      } else if (attempt === 1 && res.status >= 500) {
        await res.body?.cancel().catch(() => undefined);
        await sleep(BACKOFF_MS);
        continue;
      }
      await res.body?.cancel().catch(() => undefined);
      throw new NotifyError(res.status);
    }
  };
}
