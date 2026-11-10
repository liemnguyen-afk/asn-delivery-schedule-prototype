# ASN at PO Delivery Schedule Line Level (R48) — clickable prototype

A static, clickable prototype of the end-to-end flow: a **supplier** creates an Advance Ship Notice (ASN) from PO lines **and their delivery schedule lines** in the Coupa Supplier Portal, and a **buyer** receives that ASN and sees the schedule line on receipts.

Design source: Figma file [544 ASN at PO Delivery Schedule Line Level (INV-CORE)](https://www.figma.com/design/yB6ufERH4q4Ei3aTW4eXMa/544-ASN-at-PO-Delivery-Schedule-Line-Level-INV-CORE?node-id=1-5855) — sections *Supplier - Flip to ASN* (`1:5855`) and *Buyer - ASN Receipt* (`157:57010`). Requirements: Confluence [[R48] ASN at PO Delivery Schedule Line Level](https://coupadev.atlassian.net/wiki/spaces/PM/pages/18012833129).

**▶ View the live prototype: https://liemnguyen-afk.github.io/asn-delivery-schedule-prototype/**

To run it locally, open [`index.html`](index.html). No build step: plain HTML, CSS and JavaScript. It opens on the supplier's **Orders** page. Dates are MM/DD/YYYY; "today" is 11/10/2026.

## Supplier flow (Coupa Supplier Portal)

| # | Screen | Route | What you can do |
| --- | --- | --- | --- |
| 1 | Purchase Orders | `#/csp/orders` | Orders data table with the Clarity 1 action icons. The **Flip to ASN** icon (document with signature) opens the line picker for that PO. |
| 2 | Flip to ASN — Select lines | `#/csp/flip/3627` | PO lines are parent rows; **delivery schedule lines** are child rows (caret to expand / collapse, *Expand all*, *Collapse all*). The flipped PO is listed first and pre-selected; other open POs follow. Checking a PO line selects and locks its schedule lines. Checking individual schedule lines makes the parent indeterminate. Fully shipped schedule lines are disabled. Search, *Select all*, *Clear selection*. The footer says how many ASN lines will be created. |
| 2a | PO Line or Schedule Lines? | (dialog) | Shown on **Create ASN** when every open schedule line of a PO line was picked one by one: **Schedule Lines** = one ASN line per schedule line, **PO Line** = one ASN line covering them. |
| 3 | Create Advance Ship Notice (Draft ASN) | `#/csp/asn/new` | Only the selected lines. Each line card shows PO #, PO Line, Po Line Quantity, **PO Line Need By**, and the new row **Delivery Schedules** (count, or the Schedule Line #), **Schedule Line Qty**, **Schedule Line Need By** (None when there is no schedule). Edit Shipped Qty, remove lines. **Submit** checks ASN # and that total shipped qty ≤ PO line qty (no schedule-level validation, per the PRD). |
| 4 | Manage / Add PO line # | `#/csp/manage` | Same picker, with the lines already on the ASN checked. **Update ASN** applies the changes. |
| 5 | Advance Ship Notices | `#/csp/asns` | Success banner; the new ASN is first (Pending Receipt, PO numbers, line count). Submitting also records shipped quantities, so flipping again shows updated Shipped / Remaining. |

## Buyer flow (Coupa · Inventory)

| # | Screen | Route | What you can do |
| --- | --- | --- | --- |
| 6 | Receive › ASN Lines | `#/buyer/receive` | 990px container with the data table expanded (blue **⟩⟨** button collapses it into the container with horizontal scroll). Submitted ASN lines come first with **Schedule Line #** and **Schedule Line Need By** next to PO Line. **Quick Receipts**: type a quantity or tick *All* (or the header checkbox), then **Receive**. The yellow box icon opens the detailed receipt. |
| 7 | ASN Detailed Receipt | `#/buyer/receive/detail/…` | Quantity, Receipt Date, Action (Receive to inventory needs a **Warehouse**). The **ASN Line** table shows Schedule Line # and Schedule Line Need By. **Submit** creates the receipt. |
| 8 | View Receipts | `#/buyer/receipts` | New receipts first. **Schedule Line #** sits next to Order Line Number (default view); *None* when there is no schedule. The Created Date link opens the receipt. |
| 9 | View Receipt | `#/buyer/receipts/<id>` | Receipt details and the **PO Line** reference table with **Schedule Line #**. |

## Prototype menu

The **Prototype ▾** button (bottom left) is a reviewer tool, not product UI: jump to any screen, **Load sample ASN** (ASN-3627-01 with 5 lines, already submitted, opens the buyer's Receive page) and **Reset prototype** (clears `localStorage` key `asnds.state.v1`). Direct links: `#/proto/draft` (Draft ASN with 5 lines), `#/proto/sample`, `#/proto/reset`.

## Files

| File | Contents |
| --- | --- |
| `index.html` | Page shell |
| `css/styles.css` | Classic Coupa / CSP (Clarity 1) styles |
| `js/data.js` | Sample PO lines and delivery schedule lines, orders, ASNs, ASN lines to receive, receipts |
| `js/icons.js` | Clarity 1 icons exported from Figma (Create Invoice, Create Credit Note, asnFlip, cog_go, Edit, Delete, Void, package_add, calendar, inventoryReturn) and the Coupa logo |
| `js/app.js` | Hash router, state, screens and interactions |

Placeholder values not defined in the Figma file (supplier "Tech Supplies Co.", receiver "Maya Wong", item numbers, prices, receipt IDs, the 3625 schedule quantities) are sample data only.
