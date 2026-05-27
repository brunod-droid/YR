YVES ROCHER STANDALONE HUB

This is a standalone Next.js hub for Yves Rocher Customer Care Reporting.

Install:
1. Copy these files into the new GitHub repo.
2. Run: npm install
3. Run locally: npm run dev
4. Deploy on Vercel.

Data migration:
- Old hub data was stored in browser localStorage under key yr_reports.
- In the old hub browser, export or copy localStorage. In Chrome console:
  copy(localStorage.getItem('yr_reports'))
- In this new hub, go to History and paste/import the JSON.

Included routes:
/                         Home
/yves-rocher-reporting    Home alias
/yves-rocher-reporting/upload
/yves-rocher-reporting/weekly
/yves-rocher-reporting/monthly
/yves-rocher-reporting/history
/yves-rocher-reporting/settings
