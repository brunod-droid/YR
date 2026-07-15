# Yves Rocher Hub - cleaned deployment version

## What was fixed

- Removed the invalid `pnpm-lock.yaml` (it contained shell commands, not a lockfile).
- Removed the pnpm configuration.
- Kept Node.js 24, which is compatible with the current Vercel project and Supabase.
- Pinned all dependency versions to prevent unexpected upgrades.
- Forced npm 10.9.2 during Vercel installation and used an isolated temporary npm cache.
- Reworked login to validate the password through `/api/login` at runtime.
- Login accepts either `YR_PASSWORD` (recommended) or the existing `NEXT_PUBLIC_YR_PASSWORD`.
- Kept the static June report in `public/monthly/june2026.html`.

## Vercel environment variable

Recommended:

- Name: `YR_PASSWORD`
- Value: your password
- Environments: Production and Preview

The old `NEXT_PUBLIC_YR_PASSWORD` still works as a fallback, but `YR_PASSWORD` is safer.

## Vercel settings

- Node.js: 24.x
- Build command: default (`npm run build`)
- Install command: leave the UI override empty if possible. `vercel.json` contains the install command.
- Redeploy with `Use existing Build Cache` OFF.

Expected install log:

`npx --yes npm@10.9.2 install --no-audit --no-fund --legacy-peer-deps`

## Static June report URL

`/monthly/june2026.html`
