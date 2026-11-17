# Automated blog pipeline

## How it works

1. `.github/workflows/blog-draft.yml` runs daily at 11:17 UTC, with backup slots at 14:41 and 19:23 UTC (see **Schedule and the once-a-day gate**), and runs `scripts/blog/cli.ts`.
2. An agent researches and picks a topic and a second writes the post. The free code checks (below) run on the draft first; only a draft that passes them goes to the third agent, the reviewer.
3. One rewrite is allowed per run, shared by both kinds of failure. If the first draft fails the checks, the writer rewrites it once with one `MUST FIX (automatic check): <code>: <message>` note per failure (at most 12 notes of at most 300 characters, built from the checks' own messages); if it passes the checks but the reviewer says `revise`, the writer rewrites it once with the reviewer's notes. The rewrite is checked again (a failure ends the run as `checks-failed`) and then reviewed (anything but `pass` ends it as `reviewer-reject`). A reviewer `reject` on the first draft ends the run at once. Source URLs are checked (and their pages fetched) once per run, before anything is written: a dead source ends the run as `checks-failed` straight away, with no writer call, since no rewrite can fix it. So a run has at most two writer stages and two reviewer stages; each stage may make one extra call when its reply cannot be parsed (so at most 4 calls each), and the reviewer is never called on a draft that fails the code checks.
4. A draft that passes the checks and the review becomes a pull request with the post, a short brief and an SEO scorecard. Core CI runs on it.
5. Austin reads the PR and merges it (or closes it). Merging is the only way a post goes live.
6. `.github/workflows/blog-published.yml` waits for the new page to return 200, then pings IndexNow for `/blog` and the post.

Every outcome (opened, skipped, failed) is logged on the issue titled **Blog pipeline log**, except `already-ran-today` (below), which logs nothing. Real runs also post to Discord (below).

## Schedule and the once-a-day gate

GitHub does not guarantee scheduled runs: it can delay one or skip it entirely. So the workflow has three schedules, all UTC: **11:17** (the main run) and two backups, **14:41** and **19:23**. Scheduled runs (and only they) pass `--daily-gate`. Right after listing the draft PRs, a gated run reads the run log and stops as `already-ran-today`, before any model call and without writing a log entry or sending a notification, when either:

- the log has an entry dated today (UTC, from the run's clock) whose outcome is anything but `error`: a PR or any skip counts, including `gate-full`, so a no-topic or full day is not retried three times, but a run that failed is retried by the next slot; or
- a draft PR was already opened today: an open one on a `blog/<today>-...` branch, or a merged one created today.

**Closing today's draft does not bring a replacement.** The morning run's `pr` log entry already counts as today's run, so the backup slots stop at the gate whether you merge, close or leave the draft (one draft a day, and no reject-then-redraft loop burning model calls). To get another draft the same day, start a manual run: Actions, **Blog draft**, **Run workflow**, untick **Dry run**. Manual runs (dry or real) are never gated, and a dry run is never gated even with the flag.

All three slots share the workflow's concurrency group, so a slot that starts while another is still running waits instead of racing it; it then hits the gate and exits cheaply, costing about a minute of runner time. The group keeps at most one waiting run, and a newer one cancels the older waiting one, so a manual run started while a scheduled slot is waiting can cancel that slot (and the reverse); the later slots cover it.

## Discord notification

When the `DISCORD_WEBHOOK_URL` secret is set, every real run posts one message to that Discord channel (dry runs never post), after the outcome is final and its log entry has been attempted (a notification problem never stops the log entry or undoes a PR):

- a new draft: `New blog draft ready to review: <title> - <PR link> (competition: ..., pillar: ..., SEO checks passed: x/y). Read it in the Vercel preview on the PR, then merge to publish or close to reject.`
- a skipped day: `No blog draft today (<reason>): <detail>`, for every skip reason except `gate-full` (three drafts are already waiting for you) and `already-ran-today`.

Messages are one line of plain text (at most 1,800 characters, title capped at 150 and detail at 200, cut by whole characters). Model-written text cannot ping, link or format: mentions, markdown links, backticks and angle brackets are neutralised, and any `scheme://` or `www.` in it gets an invisible break so Discord does not turn it into a link; only the PR link itself is clickable. Messages are sent with mentions switched off and link previews suppressed. Any red run (exit 1, including a failed notification) or a cancelled one (for example the 20-minute timeout) also posts `Blog draft workflow failed or was cancelled: <run link>` from a final workflow step, for scheduled and manual runs, dry or real.

Why Discord: the bot opens PRs with Austin's own token, so GitHub does not notify him about them.

**Set it up:** in Discord, Server Settings, Integrations, Webhooks, New Webhook, choose the channel, Copy Webhook URL. Then set the secret without pasting it anywhere else (it prompts for the value):

```
gh secret set DISCORD_WEBHOOK_URL --repo SoftSystemsStudio/sss-website
```

Use the plain `https://discord.com/api/webhooks/<id>/<token>` form exactly as Copy Webhook URL gives it (`discordapp.com` and a trailing `?wait=true` are also accepted). The pipeline refuses anything else (a `canary.` or `ptb.` host, `/api/v10/`, `?thread_id=...`) and exits 1 at start, with an error saying what is wrong but never the URL; the failed-run alert step skips such a URL silently. Treat it like a password: anyone holding it can post to the channel. The pipeline never prints it.

**Turn it off:** delete the secret (`gh secret delete DISCORD_WEBHOOK_URL --repo SoftSystemsStudio/sss-website`). The run then prints `Discord notifications are off (DISCORD_WEBHOOK_URL not set)` and carries on.

**Rotate it (or if it leaked):** delete the webhook in Discord (Server Settings, Integrations, Webhooks), which kills the old URL at once, create a new one and set the secret again.

## How topics are picked (SEO)

The site's Domain Rating is about 7, so the researcher only goes after questions it can win: narrow, local, question-form queries a local owner would type, with a town or trade modifier where natural, and tied to what the studio offers. National platform-policy topics (Google Business Profile rules, algorithm updates, "what is SEO") are out.

- **Pillars.** `TOPIC_PILLARS` in `scripts/blog/config.ts` lists 8 content pillars (cost, do-I-need-a-website, a website that brings in nearby customers, websites by trade, mobile and speed, choosing a designer, what a build includes, after-launch care). The order is decided in code (`scripts/blog/pillars.ts`): each draft PR body carries a `**Pillar:**` line, merged and open drafts count as coverage (closed ones do not), the least covered pillars come first, and ties (including no posts yet) rotate by the run date's day of the year. The researcher is told to use the first pillar in that order where it finds a `low` or `medium` topic and never to skip ahead because a later one feels easier; the brief records the pillar actually used. That last step is still the model's choice, so check the pillar in the PR. Published posts carry no pillar in their frontmatter, so only PR history counts. Add or rename a pillar in `config.ts` (keep it on narrow, local questions, not Google Business Profile or review ground); the town and trade modifiers are `TOPIC_TOWNS` and `TOPIC_TRADES`.
- **Search budget.** The researcher has at most 12 web searches (`WEB_SEARCH_MAX_USES` in `scripts/blog/models.ts`) and is told to spend them breadth-first: draft up to 6 candidate queries across at least 3 pillars from the order (at most 2 per pillar, narrow local question-form queries rather than a pillar's head term), check them one at a time in pillar order with at most 2 searches each, stop at the first `low` or `medium` one, and return `none` only after checking at least 3 pillars or running out of budget. A `high` cost query says nothing about the other pillars. A `none` reason names the pillars checked and is capped at 300 characters.
- **Competition.** For each candidate the researcher searches the exact query and rates page one `low` (forums, thin or local pages), `medium` (a mix) or `high` (Google's own docs, national publishers, big agencies, directories, established specialists). The brief carries `competition` and `serpNotes` (who ranks and why). A `high` brief is never written: the run skips it as `no-topic` with a "high competition" detail, logged with the topic so it is not proposed again.
- **Related questions.** The brief may carry up to 5 People-Also-Ask-style `relatedQuestions`; the writer uses them as H2s or a short FAQ.

The PR's **Research brief** section shows the pillar, competition, SERP notes and related questions. The competition gate acts on the model's own rating, so read the SERP notes and close the PR if the call looks wrong.

## SEO scorecard

Every draft PR has an **SEO scorecard** section (`scripts/blog/seo.ts`): title at most 60 characters; description 120 to 155; every significant query word in the title or the first 100 words; the query (or all its words) in the first 100 words; at least 3 H2s; at least 2 internal links; at least 2 external source links; a list or table; a first paragraph of 30 to 70 words; average sentence at most 22 words; no repeated heading. It is advisory: a cross never blocks the draft; tighten that item in the PR (or ignore it) before merging.

## Pause and resume

Actions tab, **Blog draft**, **...** menu, **Disable workflow**. Enable it again to resume. To stop for good, delete the `schedule:` block in `blog-draft.yml`.

## Run it manually

Actions tab, **Blog draft**, **Run workflow**. The **Dry run** box is ticked by default: it writes the draft to the `blog-dry-run` artifact (kept 14 days) and changes nothing on GitHub. A draft that fails the code checks or is rejected by the reviewer is kept there too, as `<slug>.rejected.md`: a comment at the top lists the skip reason, which attempt it is (`first draft` or `rewritten draft`), the failing check codes and messages, the reviewer's verdict and notes (`(not available)` when the draft failed the checks and so was never reviewed) and, last, for a rewrite, the notes that triggered it (the capped `MUST FIX` notes actually sent to the writer, or the reviewer's notes) (the run is still a `skipped` outcome; real runs never write these files). Check the artifact, then run again with the box unticked for a real run that opens a PR.

## Secrets

Repo Settings, Secrets and variables, Actions:

| Secret                | What                                                                                                                                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`   | Anthropic API key used for the model calls                                                                                                                                                                                        |
| `BLOG_PR_TOKEN`       | Fine-grained personal access token, this repo only, **Contents**, **Pull requests** and **Issues** set to read and write. A PAT is needed so Core CI runs on the PRs it opens (PRs from `GITHUB_TOKEN` do not trigger workflows). |
| `DISCORD_WEBHOOK_URL` | Optional. Discord webhook URL that real runs post their outcome to (see **Discord notification**). Not set means no Discord messages.                                                                                             |

To rotate: create the new key or token, paste it over the secret (Settings, Secrets, update), run a dry run, then revoke the old one. `blog-published.yml` needs no secrets.

GitHub disables scheduled workflows after 60 days of repo inactivity; if the daily run stops, re-enable **Blog draft** in the Actions tab. In `blog-published.yml`, posts that are not live within 10 minutes fail the job (red run), but posts that did go live are still sent to IndexNow first.

## Exit codes

`cli.ts` exits 0 for every normal outcome, including skips (no topic, checks failed, a draft PR already open). It exits 1 when something threw (missing secret, an invalid `DISCORD_WEBHOOK_URL`, API or GitHub error), when the run could not be written to the log issue, or when the Discord notification failed (`Discord notification failed: <status>`; the outcome line is printed first and the PR, if any, stays open). If both the log write and the notification fail, both lines are printed. A red run means look at the Actions log and the log issue.

## Skip reasons

A skipped run logs one of these (`SkipReason` in `scripts/blog/types.ts`):

- `gate-full`: three draft PRs are already open; review or close one.
- `no-topic`: the researcher found nothing worth writing about today, or proposed a topic rated `high` competition (the detail starts "high competition for ...").
- `reviewer-reject`: the reviewer rejected the draft, or asked for changes after the run's one rewrite was already used (by its own earlier request or by failed checks). A "pass" with any checklist item false counts as a request for changes.
- `checks-failed`: the draft failed a code check after the run's one rewrite was used, or a source URL is dead (found before writing, so no draft exists and a dry run keeps no `.rejected.md`); the detail lists the codes.
- `slug-collision`: a post, an open draft PR or today's branch already uses the slug.
- `already-ran-today`: a scheduled backup slot found that today already ran (see **Schedule and the once-a-day gate**). Never logged and never notified; only scheduled runs can return it. Today's run counts whatever its outcome (a PR, even one you then closed, or any skip including `gate-full`), except `error`; closing today's draft does not trigger a replacement, so start a manual run (Actions, **Blog draft**, **Run workflow**, **Dry run** unticked) for another draft the same day.

Check codes (`scripts/blog/checks.ts`): `frontmatter`, `word-count`, `banned-phrase` (title, description and body), `raw-html`, `off-source-link` (a body link that is not one of the draft's sources or `/pricing`, `/blog`, `/intake`, a `/web-design/<town>` page, or `/blog/<slug>` for a post already on main; mailto links count), `unknown-token`, `studio-literal` (title, description and body), `unsourced-dollar` (title, description and body), `duplicate`, `copied`, `source-url`.

`studio-literal` keeps the studio's own prices on `{{TOKENS}}` so a post can never contradict `/pricing`. It sorts the studio amounts from `lib/business.ts` into two classes (`STUDIO_DISTINCT_LITERALS` and `STUDIO_LITERALS` in `lib/blog-tokens.ts`). The headline package prices (Starter, Business, Growth) never look like market prices, so typing one fails anywhere, in any form (`$ 997`, `997 dollars`, `US$997`, a range), and a source link never excuses it. Every other studio amount (add-ons, Care Plans, the Custom starting point) is common in market figures, so it fails only when the same paragraph (or the title, or the description) is about the studio, which the check reads from a few narrow signals: any `{{TOKEN}}`, "Soft Systems", "the studio", a capitalised package name followed by "package" or "plan" (`Starter`, `Business`, `Growth`, `Custom`; "the Business plan" counts, "a business plan" does not), or the branded "Care Plan(s)" (capitalised). Everyday words such as "we", "our", "I", "care plans", "add-ons", "retainer" or "hosting plan" are not signals, because market sources use them all the time; first-person price claims are the reviewer's job. Without a signal the amount is an ordinary number: `unsourced-dollar` lets it through only with an http(s) source link in the same paragraph, so "Many agencies quote $500 to $2,000, according to [a source](...)" passes and "Builds start at {{BUILD_FROM}}, and booking adds $250, per [a source](...)" fails. The title and description have no links, so any dollar amount there fails `unsourced-dollar`.

## Take a post down

Revert the merge commit of the post's PR (PR page, **Revert**, or `git revert -m 1 <merge-sha>` on a `fix/` branch) and merge it. Vercel redeploys without the post. To undo a bad deploy fast, see `docs/runbooks/rollback.md`.

## Cost

Roughly $0.30 to $1 per attempted run, about $10 to $30 a month. Worst case for the researcher is 12 web searches at about $0.05 each (about 18k input tokens apiece), roughly $0.60, plus the writer and reviewer calls when a topic is found. The worst case per run is the research, two writer stages (the draft and its one rewrite) and two reviewer stages. Each stage may make one extra call when its reply cannot be parsed (the `blog stage retry` line below), so that is at most 4 writer calls and 4 reviewer calls; the reviewer (the most expensive model) is never called on a draft that fails the code checks, and no model after the researcher is called when a source URL is dead. A skip day still costs the research. Keep a **monthly spend limit** set on the Anthropic key (console, Limits) as the hard cap, and check it once a month. Each model call prints one `blog model call:` line to the Actions log with the role, model and token counts (and web searches), never prompts or outputs. The line also names the stop reason: `stop=pause_turn` followed by a second line for the same role is one long web-search turn being resumed, not a retry. When a stage's reply cannot be parsed or validated it prints one `blog stage retry: role=<role> mode=<full|reformat> reason=<...>` line (the reason is built only from schema field paths and fixed error kinds, never reply text). For the researcher, `mode=reformat` means the model was asked once, with web search off, to re-emit its own draft as valid JSON (cheap, and it may not add a source URL the draft did not have); `mode=full` means the reply had no JSON at all and the research ran again. If the reformat retry also fails, the run fails (exit 1, logged as an error) with no fallback to a full re-research; a repaired brief whose source URL is not exactly one already in the draft counts as a failure.
