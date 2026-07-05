Yves Rocher Reporting V2 Patch

Install:
1. Upload/replace these files in GitHub, preserving the exact paths.
2. Commit to your reporting branch.
3. Deploy on Vercel.
4. In Vercel, make sure Supabase env vars are configured (the local build fails without them, but the code compiled successfully before page-data collection).

What is included:
- New Monthly Business Review page.
- New H1 2026 Executive Review page.
- New KPI Dictionary page.
- New real finance model:
  - Notch actual invoices Jan-Jun 2026.
  - Philippines costs Apr-Jun 2026.
  - Canada messages x $2.30 before April.
- Enhanced Shopify order parsing:
  - total orders
  - paid orders
  - cancelled orders
  - refunded orders
  - partially refunded orders
  - fraud orders
  - revenue
  - refunded amount
- Monthly Upload now accepts CSV, XLSX and ZIP files.
- Monthly metrics now show source/formula for explainability.

Important:
- For order-based KPIs, denominator = paid Shopify orders only.
- For H1, upload Jan-Jun monthly reports or upload H1 as monthly data per month if available.
- Notch invoices are hardcoded for Jan-Jun based on the uploaded invoices.
- Action Items and Strategy are placeholders in Monthly for now; use the existing Developments / Future Plans / Risks pages for CRUD tracking.
