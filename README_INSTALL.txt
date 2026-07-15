YVES ROCHER STANDALONE HUB - COMPLETE V2

Includes:
- Home
- Reporting dashboard
- CSV upload
- Weekly report
- Monthly report
- History
- Settings
- Migration / Import Export page

Vercel fix:
- Project Settings > Build & Development Settings
- Framework Preset: Next.js
- Output Directory: leave empty OR set to .next

Important about data:
Existing YR data was stored in the old browser/domain localStorage under yr_reports.
It cannot be included inside a GitHub zip unless exported first.
Use /yves-rocher-reporting/migration to copy/paste the old data.
