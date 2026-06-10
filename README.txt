YR Monthly Insights Management V2 Patch

Goal:
Make Monthly Insights management-friendly and readable.
No data is deleted.

Replace/add:
- lib/yr-reporting/MonthlyInsightsPanel.js
- lib/yr-reporting/monthlyInsightsStorage.js
- pages/yves-rocher-reporting/monthly-insights.js

Supabase:
Run this SQL once:
- supabase/yr_monthly_insights_v2_text_fields.sql

Monthly page:
In pages/yves-rocher-reporting/monthly.js, make sure you have:

import MonthlyInsightsPanel from "../../lib/yr-reporting/MonthlyInsightsPanel";

And inside the metrics display:
<MonthlyInsightsPanel month={month} metrics={metrics} />

This patch changes the admin page to 8 large free-text fields.
