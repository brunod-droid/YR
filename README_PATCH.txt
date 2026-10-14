YVES ROCHER WEEKLY - PATCH FOR THE USER'S ACTUAL YR-main (10).zip

Files changed:
- lib/yr-reporting/parser.js: recognizes performance_ticket_attributes_intents_table, preserves new Gorgias overview export types, adds intents storage key.
- pages/yves-rocher-reporting/upload.js: recognizes the updated formats via parser, refuses duplicate types in one upload batch, updates import error text, and changes manual Shopify order wording to total orders.

INSTALL:
1. Back up your GitHub repository.
2. Copy these two files to the SAME paths in the repository, replacing existing files.
3. Commit to main and wait for Vercel deployment to finish.
4. Reopen /yves-rocher-reporting/upload, choose the correct week, upload that week's exports.
5. Enter the total Shopify orders manually.

IMPORTANT:
- The provided source ALREADY recognizes most new performance_overview_* files. The screenshot showing 'Unknown file type' indicates the deployed version is older/different. Redeploying these files is essential.
- This patch STORES the intents table but does NOT add a Contact Drivers chart to the Weekly UI. That requires separate dashboard wiring.
- Do not import tickets_by_ticket_status as individual tickets. It has its own dataset type.
- Only import one detailed tickets CSV per reporting week; previous uploads may require deleting/rebuilding the affected week if wrong data was stored.
- Validate weekly figures against Gorgias (Oct 4-10: created 746, sent 1291, CSAT 4.21).
- 'Messages sent / order' uses the manual total orders count; chat-normalized interactions/order is a distinct KPI not added here.
- Existing reports with manually entered paid orders are not automatically reinterpreted as total orders; re-enter the correct count.
