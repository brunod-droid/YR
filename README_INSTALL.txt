YVES ROCHER STANDALONE HUB - VERCEL FIX

Your build compiled correctly. The error comes from Vercel Project Settings: Output Directory is set to public.

Do this in Vercel:
1. Open Project Settings.
2. Go to Build & Development Settings.
3. Set Framework Preset to Next.js.
4. Clear Output Directory if possible. It must not be public.
5. Redeploy.

This ZIP also includes vercel.json with outputDirectory set to .next, which should override the wrong public setting.

Pages included:
- /
- /yves-rocher-reporting
- /yves-rocher-reporting/upload
- /yves-rocher-reporting/weekly
- /yves-rocher-reporting/monthly
- /yves-rocher-reporting/history
- /yves-rocher-reporting/settings

Data note:
The app uses localStorage key yr_reports. Data already saved in the old Customer Hub browser will not automatically move to the new domain. Use Export in the old hub, then Import in the new YR hub.
