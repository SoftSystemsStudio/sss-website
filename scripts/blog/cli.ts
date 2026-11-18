/**
 * Daily blog draft run. From the repo root:
 *
 *   pnpm exec tsx scripts/blog/cli.ts            # opens a draft PR (or logs a skip)
 *   pnpm exec tsx scripts/blog/cli.ts --dry-run  # writes blog-dry-run/<slug>.md and .pr.md instead
 *   pnpm exec tsx scripts/blog/cli.ts --daily-gate  # scheduled runs: stop if today already ran
 *
 * Env: ANTHROPIC_API_KEY (required), BLOG_PR_TOKEN and GITHUB_REPOSITORY (owner/name;
 * required for a real run; optional on a dry run, which then reads no GitHub history),
 * DISCORD_WEBHOOK_URL (optional secret: real runs post the outcome there).
 * Exit 0 on any outcome, including skips; exit 1 when the run throws, or when the
 * run-log write or the Discord notification failed (the outcome is printed first).
 */
import { fileURLToPath } from 'node:url';
import { createGitHubClient, type GitHubClient } from './github';
import { createAnthropicCallModel } from './models';
import { createDiscordNotifier, type Notify } from './notify';
import { loadExistingPosts, reportRun, runPipeline } from './run';
import type { RunOutcome } from './types';

const CONTENT_DIR = fileURLToPath(new URL('../../packages/frontend/content/blog', import.meta.url));

/** Dry run without a token: no history, and any write is a bug. */
const offlineGitHub: GitHubClient = {
  listDraftPrs: async () => [],
  readLog: async () => [],
  branchExists: async () => false,
  closeStale: async () => {
    throw new Error('offline GitHub client cannot write');
  },
  createDraftPr: async () => {
    throw new Error('offline GitHub client cannot write');
  },
  appendLog: async () => {
    throw new Error('offline GitHub client cannot write');
  },
};

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

async function main(): Promise<RunOutcome> {
  const args = process.argv.slice(2);
  const unknown = args.filter((a) => a !== '--dry-run' && a !== '--daily-gate');
  if (unknown.length) throw new Error(`unknown argument(s): ${unknown.join(' ')}`);
  const dryRun = args.includes('--dry-run');
  const dailyGate = args.includes('--daily-gate');

  // Built first so a bad URL fails before any paid call. Its error never quotes the URL.
  const webhook = process.env.DISCORD_WEBHOOK_URL?.trim();
  let notify: Notify | undefined;
  if (webhook) notify = createDiscordNotifier(webhook);
  else console.error('Discord notifications are off (DISCORD_WEBHOOK_URL not set)');

  const call = createAnthropicCallModel(required('ANTHROPIC_API_KEY'));
  const token = process.env.BLOG_PR_TOKEN;
  let gh: GitHubClient;
  if (token) gh = createGitHubClient(token, required('GITHUB_REPOSITORY'));
  else if (dryRun) gh = offlineGitHub;
  else throw new Error('BLOG_PR_TOKEN is not set');

  return runPipeline({
    call,
    gh,
    fetchFn: fetch,
    now: () => new Date(),
    existingPosts: loadExistingPosts(CONTENT_DIR),
    dryRun,
    dailyGate,
    notify,
  });
}

// Exit 0 on any outcome; 1 on a thrown error, a failed run-log write or a failed
// notification (outcome printed first).
void reportRun(main).then((code) => {
  process.exitCode = code;
});
