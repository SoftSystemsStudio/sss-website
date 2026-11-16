/**
 * Daily blog draft run. From the repo root:
 *
 *   pnpm exec tsx scripts/blog/cli.ts            # opens a draft PR (or logs a skip)
 *   pnpm exec tsx scripts/blog/cli.ts --dry-run  # writes blog-dry-run/<slug>.md and .pr.md instead
 *
 * Env: ANTHROPIC_API_KEY (required), BLOG_PR_TOKEN and GITHUB_REPOSITORY (owner/name;
 * required for a real run; optional on a dry run, which then reads no GitHub history).
 * Exit 0 on any outcome, including skips; exit 1 when the run throws.
 */
import { fileURLToPath } from 'node:url';
import { clip, createGitHubClient, type GitHubClient } from './github';
import { createAnthropicCallModel } from './models';
import { loadExistingPosts, runPipeline } from './run';

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

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const unknown = args.filter((a) => a !== '--dry-run');
  if (unknown.length) throw new Error(`unknown argument(s): ${unknown.join(' ')}`);
  const dryRun = args.includes('--dry-run');

  const call = createAnthropicCallModel(required('ANTHROPIC_API_KEY'));
  const token = process.env.BLOG_PR_TOKEN;
  let gh: GitHubClient;
  if (token) gh = createGitHubClient(token, required('GITHUB_REPOSITORY'));
  else if (dryRun) gh = offlineGitHub;
  else throw new Error('BLOG_PR_TOKEN is not set');

  const outcome = await runPipeline({
    call,
    gh,
    fetchFn: fetch,
    now: () => new Date(),
    existingPosts: loadExistingPosts(CONTENT_DIR),
    dryRun,
  });
  console.log(JSON.stringify(outcome));
}

main().then(
  () => {
    process.exitCode = 0;
  },
  (err: unknown) => {
    const msg = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error(`blog pipeline failed: ${clip(msg, 1000)}`);
    process.exitCode = 1;
  },
);
