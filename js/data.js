/* Sample data — mirrors the Figma file "544 ASN at PO Delivery Schedule Line Level", sections
   "Supplier - Flip to ASN" (1:5855) and "Buyer - ASN Receipt" (157:57010). Dates are MM/DD/YYYY. */
window.DATA = {
  today: '11/10/2026',
  customer: 'inventory-master',
  supplierName: 'Tech Supplies Co.',
  receiver: 'Maya Wong',
  shipTo: { warehouse: 'Main Warehouse - SF', address: ['150 Main Street', 'San Francisco, CA 94450', 'United States', 'Location Code: 12345', 'Attn: hello'] },

  /* Open PO lines offered in Flip to ASN / Manage PO Lines. Delivery schedule lines are children. */
  poLines: [
    { po: '3627', line: 1, item: 'Office Kits', qty: 20, shipped: 0, uom: 'Each', needBy: '11/30/2026', price: 20, spn: 'INP1234', aux: 'INAPM1234', itemNo: 'OFK-1001',
      sch: [ { ref: 'SL-10', qty: 10, shipped: 0, needBy: '11/15/2026' }, { ref: 'SL-20', qty: 10, shipped: 0, needBy: '11/30/2026' } ] },
    { po: '3627', line: 2, item: 'Wireless Keyboard and Mouse', qty: 12, shipped: 0, uom: 'Box', needBy: '11/30/2026', price: 45, spn: 'INP5678', aux: 'INAPM5678', itemNo: 'WKM-2002', sch: [] },
    { po: '3626', line: 1, item: 'Dell Laptop High End Model', qty: 20, shipped: 0, uom: 'Each', needBy: '12/15/2026', price: 300, spn: 'INP5671', aux: 'INAPM5671', itemNo: 'DLHM64',
      sch: [ { ref: 'SL-10', qty: 10, shipped: 0, needBy: '12/01/2026' }, { ref: 'SL-20', qty: 10, shipped: 0, needBy: '12/15/2026' } ] },
    { po: '3626', line: 2, item: 'Dell Laptop High End Model', qty: 20, shipped: 0, uom: 'Each', needBy: '12/15/2026', price: 300, spn: 'INP5671', aux: 'INAPM5671', itemNo: 'DLHM64', sch: [] },
    { po: '3625', line: 1, item: 'Laptops', qty: 100, shipped: 0, uom: 'Each', needBy: '12/31/2026', price: 1000, spn: 'INP5680', aux: 'INAPM5680', itemNo: 'LPT-100', collapsed: true,
      sch: [ { ref: 'SL-10', qty: 30, shipped: 0, needBy: '12/10/2026' }, { ref: 'SL-20', qty: 30, shipped: 0, needBy: '12/20/2026' }, { ref: 'SL-30', qty: 40, shipped: 0, needBy: '12/31/2026' } ] },
    { po: '3624', line: 1, item: 'item1', qty: 1, shipped: 0, uom: 'Each', needBy: '11/30/2026', price: 110, spn: 'INP0001', aux: 'INAPM0001', itemNo: 'ITM-1', sch: [] },
    { po: '3623', line: 1, item: 'item 1', qty: 88, shipped: 40, uom: 'Each', needBy: '12/20/2026', price: 60, spn: 'INP0002', aux: 'INAPM0002', itemNo: 'ITM-1B',
      sch: [ { ref: 'SL-10', qty: 40, shipped: 40, needBy: '11/20/2026' }, { ref: 'SL-20', qty: 48, shipped: 0, needBy: '12/20/2026' } ] },
  ],

  /* CSP Orders data table */
  orders: [
    { po: '3627', date: '11/02/2026', items: ['20 Each of Office Kits', '12 Box of Wireless Keyboard and Mouse'], total: '6,000.00 USD', flip: true },
    { po: '3626', date: '11/02/2026', items: ['20 Each of Dell Laptop High End Model', '20 Each of Dell Laptop High End Model'], total: '6,000.00 USD', flip: true },
    { po: '3625', date: '11/01/2026', items: ['Laptops'], total: '100,000.00 USD' },
    { po: '3624', date: '11/01/2026', items: ['item1'], total: '110.00 USD' },
    { po: '3623', date: '11/01/2026', items: ['88 Each of item 1'], total: '5,280.00 USD', flip: true },
    { po: '3622', date: '11/01/2026', items: ['66 Each of item1', '66 Each of item2'], total: '5,280.00 USD', cog: true },
    { po: '3621', date: '11/01/2026', items: ['66 Each of item1', '66 Each of item2'], total: '9,240.00 USD', flip: true },
    { po: '3620', date: '10/30/2026', items: ['200 Each of Dell Laptop High End Model', '200 Each of Laptops'], total: '60,000.00 USD', flip: true },
    { po: '3619', date: '10/29/2026', items: ['100 Each of Dell Laptop High End Model'], total: '20,000.00 USD', flip: true },
    { po: '3618', date: '10/28/2026', items: ['10 Each of CD-621630 synchronous receipt test 20261028'], total: '10.00 USD', flip: true },
    { po: '3617', date: '10/27/2026', items: ['10 Each of CD-621630 receiving walkthrough 20261028'], total: '10.00 USD', flip: true },
    { po: '3616', date: '10/27/2026', items: ['10 Each of Dell Laptop High End Model'], total: '2,000.00 USD', flip: true },
  ],

  /* CSP ASN list (existing rows) */
  asns: [
    { no: 'None', status: 'Draft', ship: 'None', att: 'pep user', updated: '03/10/2025', lines: 1, po: ['6551'] },
    { no: 'None', status: 'Draft', ship: 'None', att: 'pep user', updated: '03/11/2025', lines: 1, po: ['6599'] },
    { no: 'Qty_Check', status: 'Pending Receipt', ship: '06/30/2026', att: 'pep user', updated: '06/30/2026', lines: 1, po: ['6599'] },
    { no: 'ASN3', status: 'Received', ship: '03/10/2025', att: 'pep user', updated: '03/10/2025', lines: 1, po: ['6555'] },
    { no: 'ASN2', status: 'Received', ship: '03/10/2025', att: 'Aniket Tiwari', updated: '03/10/2025', lines: 1, po: ['6558'] },
    { no: 'None', status: 'Draft', ship: 'None', att: 'Aniket Tiwari', updated: '03/10/2025', lines: 1, po: ['6543'] },
    { no: '24', status: 'Pending Receipt', ship: '11/10/2026', att: 'pep_user', updated: '11/10/2026', lines: 4, po: ['PO-email-template1', 'Test PO2', '8765'] },
    { no: 'None', status: 'Draft', ship: 'None', att: 'pep user', updated: '03/10/2025', lines: 1, po: ['6551'] },
    { no: 'None', status: 'Draft', ship: 'None', att: 'Aniket Tiwari', updated: '03/10/2025', lines: 1, po: ['6543'] },
    { no: 'None', status: 'Draft', ship: 'None', att: 'pep_user', updated: '03/02/2025', lines: 1, po: ['6516'] },
    { no: 'PO_Qty', status: 'Pending Receipt', ship: '06/30/2026', att: 'pep user', updated: '06/30/2026', lines: 1, po: ['6551'] },
    { no: 'None', status: 'Draft', ship: 'None', att: 'Aniket Tiwari', updated: '03/10/2025', lines: 1, po: ['6559'] },
  ],

  /* Buyer Receive › ASN Lines (existing rows) */
  receiveRows: [
    { asn: 'ASn4567', ln: 1, item: 'cars', po: '8736', poLine: 1, supplier: 'scc_sup', qty: 30, uom: 'Box', needBy: 'None', received: 0, approval: 'Yes' },
    { asn: 'ASN-1234', ln: 1, item: 'ASN Item', po: '8705', poLine: 1, supplier: 'SCC External 4', qty: 5, uom: 'Each', needBy: 'None', received: 0, approval: 'Yes' },
    { asn: '6551_qtycheck', ln: 1, item: 'car_light', po: '6551', poLine: 1, supplier: 'scc_sup', qty: 90, uom: 'Box', needBy: '03/04/2025', received: 0, approval: 'Yes' },
    { asn: 'ASN_TOTQTY1', ln: 1, item: 'scc_item1', po: '7638', poLine: 1, supplier: 'scc_sup', qty: 5, uom: 'Box', needBy: 'None', received: 0, approval: 'Yes' },
    { asn: 'ASN_for_SMO', ln: 1, item: 'Lenovo ThinkPad X61 Tablet', po: '8577', poLine: 1, supplier: 'scc_sup', qty: 10, uom: 'Each', needBy: 'None', received: 0, approval: 'Yes' },
    { asn: 'track1', ln: 1, item: 'Keyboards', po: '8474', poLine: 1, supplier: 'SCC External 4', qty: 10, uom: 'Each', needBy: '04/30/2026', received: 5, approval: 'No' },
    { asn: 'track1', ln: 2, item: 'Mouse', po: '8474', poLine: 2, supplier: 'SCC External 4', qty: 10, uom: 'Each', needBy: '04/30/2026', received: 0, approval: 'No' },
    { asn: 'ASN_8542', ln: 4, item: 'Test1', po: '8542', poLine: 4, supplier: 'SCC External 4', qty: 2, uom: 'Box', needBy: '05/30/2026', received: 0, approval: 'No' },
    { asn: 'ASN_8542', ln: 3, item: 'Test1', po: '8542', poLine: 3, supplier: 'SCC External 4', qty: 1, uom: 'Box', needBy: '05/30/2026', received: 0, approval: 'No' },
  ],

  /* Buyer View Receipts (existing rows) */
  receipts: [
    { id: '15330', date: '11/08/2026', type: 'Consumption', po: '3600', poLine: 1, item: 'Dell Laptop High End Model', supplier: 'Inv Ext 1', receiver: 'R.V. Amudha', qty: 7, uom: 'Each', price: 108, actions: 2 },
    { id: '15301', date: '11/05/2026', type: 'Consumption', po: '3862', poLine: 2, item: 'Desktops', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: null, uom: 'None', price: 20000, total: 20000, actions: 1 },
    { id: '15298', date: '11/05/2026', type: 'Consumption', po: '3863', poLine: 1, item: 'Dell Laptop High End Model', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: 20, uom: 'Each', price: 200, actions: 2 },
    { id: '15297', date: '11/05/2026', type: 'Consumption', po: '3863', poLine: 2, item: 'Dell Laptop High End Model', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: 20, uom: 'Each', price: 100, actions: 2 },
    { id: '15295', date: '11/05/2026', type: 'Consumption', po: '3864', poLine: 1, item: 'Dell Laptop High End Model', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: 14, uom: 'Each', price: 300, actions: 2 },
    { id: '15290', date: '11/05/2026', type: 'Consumption', po: '3869', poLine: 2, item: 'Test line 2', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: 100, uom: 'Each', price: 100, actions: 2 },
    { id: '15289', date: '11/05/2026', type: 'Consumption', po: '3869', poLine: 1, item: 'Test line 1', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: 10, uom: 'Each', price: 500, actions: 2 },
    { id: '15284', date: '11/05/2026', type: 'Consumption', po: '3867', poLine: 2, item: 'Dell Laptop High End Model', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: 5, uom: 'Each', price: 200, actions: 2 },
    { id: '15281', date: '11/05/2026', type: 'Consumption', po: '3865', poLine: 1, item: 'Dell Laptop High End Model', supplier: 'Inv Ext 1', receiver: 'Ashok Pusarla', qty: 5, uom: 'Each', price: 300, actions: 2 },
    { id: '15270', date: '11/04/2026', type: 'Return to Supplier', po: '3864', poLine: 2, item: 'Dell Laptop High End Model', supplier: 'Inv Ext 1', receiver: 'Mary Caraman', qty: 5, uom: 'Each', price: 100, actions: 0 },
  ],
};
