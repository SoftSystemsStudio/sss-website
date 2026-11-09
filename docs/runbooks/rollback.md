# Rolling back a bad sss-website release

Every commit on `main` that passes Core CI is tagged by
`.github/workflows/release.yml` (`v2026.11.09.1`, `.2`, ...) and listed on the
repo's **Releases** page with the pull requests it contains. Vercel deploys the
same commits, so the last good version always has a name and a deployment.

## 1. Stop the bleeding (about a minute)

Use Vercel's **Instant Rollback**, which re-points softsystemsstudiollc.com at
an earlier deployment without rebuilding.

- Dashboard: Vercel → the sss-website project → **Deployments** → find the last
  good one (match the commit SHA from the release) → **⋯** → **Instant Rollback**.
- CLI: `vercel rollback <deployment-url>`

After a rollback Vercel stops auto-promoting new pushes to production until
you promote again (Deployments → **Promote**, or `vercel promote <url>`), so the
next merge can't silently undo the rollback.

## 2. Fix main

The rollback only changes what the domain serves; `main` still has the bad
code. Revert the bad pull request (PR page → **Revert**, or
`git revert -m 1 <merge-sha>` on a `fix/` branch), merge it through CI, then
promote that deployment in Vercel.

## 3. Things a rollback does not undo

- The daily cron (`/api/cron/cleanup-tokens`) follows the deployment, so it
  rolls back with it.
- Emails already sent through Resend, and anything the separate SaaS backend
  (`NEXT_PUBLIC_API_URL`) did, stay done.
- Environment variable changes in the Vercel dashboard are not part of a
  deployment; change them back by hand if they were the cause, then redeploy.

## 4. Afterwards

Note in the revert PR what broke, how it was noticed, and which check would
have caught it. Add that check (the Playwright smoke tests are the usual place).
