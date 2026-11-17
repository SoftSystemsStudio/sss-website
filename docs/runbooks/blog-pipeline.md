# Automated blog pipeline

## How it works

1. `.github/workflows/blog-draft.yml` runs daily at 11:17 UTC and runs `scripts/blog/cli.ts`.
2. An agent researches and picks a topic, a second writes the post, a third reviews it.
3. If the draft passes the checks, the run opens a pull request with the post and a short brief. Core CI runs on it.
4. Austin reads the PR and merges it (or closes it). Merging is the only way a post goes live.
5. `.github/workflows/blog-published.yml` waits for the new page to return 200, then pings IndexNow for `/blog` and the post.

Every outcome (opened, skipped, failed) is logged on the issue titled **Blog pipeline log**.

## Pause and resume

Actions tab, **Blog draft**, **...** menu, **Disable workflow**. Enable it again to resume. To stop for good, delete the `schedule:` block in `blog-draft.yml`.

## Run it manually

Actions tab, **Blog draft**, **Run workflow**. The **Dry run** box is ticked by default: it writes the draft to the `blog-dry-run` artifact (kept 14 days) and changes nothing on GitHub. Check the artifact, then run again with the box unticked for a real run that opens a PR.

## Secrets

Repo Settings, Secrets and variables, Actions:

| Secret              | What                                                                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | Anthropic API key used for the three model calls                                                                                                                                                                                  |
| `BLOG_PR_TOKEN`     | Fine-grained personal access token, this repo only, **Contents**, **Pull requests** and **Issues** set to read and write. A PAT is needed so Core CI runs on the PRs it opens (PRs from `GITHUB_TOKEN` do not trigger workflows). |

To rotate: create the new key or token, paste it over the secret (Settings, Secrets, update), run a dry run, then revoke the old one. `blog-published.yml` needs no secrets.

GitHub disables scheduled workflows after 60 days of repo inactivity; if the daily run stops, re-enable **Blog draft** in the Actions tab. In `blog-published.yml`, posts that are not live within 10 minutes fail the job (red run), but posts that did go live are still sent to IndexNow first.

## Exit codes

`cli.ts` exits 0 for every normal outcome, including skips (no topic, checks failed, a draft PR already open). It exits 1 when something threw (missing secret, API or GitHub error) or when the run could not be written to the log issue. A red run means look at the Actions log and the log issue.

## Skip reasons

A skipped run logs one of these (`SkipReason` in `scripts/blog/types.ts`):

- `gate-full`: three draft PRs are already open; review or close one.
- `no-topic`: the researcher found nothing worth writing about today.
- `reviewer-reject`: the reviewer rejected the draft, or asked for changes twice (one rewrite is allowed). A "pass" with any checklist item false counts as a request for changes.
- `checks-failed`: the draft failed a code check; the detail lists the codes.
- `slug-collision`: a post, an open draft PR or today's branch already uses the slug.

Check codes (`scripts/blog/checks.ts`): `frontmatter`, `word-count`, `banned-phrase` (title, description and body), `raw-html`, `off-source-link` (a body link that is not one of the draft's sources or `/pricing`, `/blog`, `/intake`, a `/web-design/<town>` page; mailto links count), `unknown-token`, `studio-literal` (title, description and body), `unsourced-dollar`, `duplicate`, `copied`, `source-url`.

## Take a post down

Revert the merge commit of the post's PR (PR page, **Revert**, or `git revert -m 1 <merge-sha>` on a `fix/` branch) and merge it. Vercel redeploys without the post. To undo a bad deploy fast, see `docs/runbooks/rollback.md`.

## Cost

Roughly $0.30 to $1 per attempted run, about $10 to $30 a month. Keep a **monthly spend limit** set on the Anthropic key (console, Limits) as the hard cap, and check it once a month. Each model call prints one `blog model call:` line to the Actions log with the role, model and token counts (and web searches), never prompts or outputs.
