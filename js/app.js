/* ASN at PO Delivery Schedule Line Level — clickable prototype (supplier CSP flow + buyer receiving flow) */
(() => {
  const D = window.DATA, I = window.ICONS;
  const KEY = 'asnds.state.v1';
  const $app = document.getElementById('app');
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const q1 = n => Number(n).toFixed(1);
  const q4 = n => Number(n).toFixed(4);
  const none = v => (v === undefined || v === null || v === '' || v === 'None') ? '<span class="none">None</span>' : esc(v);

  // ---------------------------------------------------------------- state
  const fresh = () => ({ sel: {}, exp: {}, picker: null, confirm: null, draft: null, asns: [], receipts: [], shipped: {}, rcv: {}, banner: null, xp: { receive: true, receipts: true }, nextReceipt: 15412, errors: {} });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (e) { S = fresh(); }
  const save = () => localStorage.setItem(KEY, JSON.stringify(S));
  const lk = l => `${l.po}-${l.line}`;
  const sk = (l, s) => `${l.po}-${l.line}-${s.ref}`;
  const getLine = (po, line) => D.poLines.find(l => l.po === po && l.line === +line);
  const lineRem = l => l.qty - l.shipped - (S.shipped[lk(l)] || 0);
  const schRem = (l, s) => s.qty - s.shipped - (S.shipped[sk(l, s)] || 0);
  const openSch = l => l.sch.filter(s => schRem(l, s) > 0);
  const earliest = arr => arr.slice().sort((a, b) => new Date(a) - new Date(b))[0];

  // ---------------------------------------------------------------- shells
  const NAV_CSP = ['Invoices', 'Orders', 'Business Profile', 'Payments', 'Service Sheets', 'Items', 'ASN', 'Sourcing', 'Forecasts', 'Catalogs', 'Setup', 'More...'];
  const SUB_CSP = ['Orders', 'Order Lines', 'Returns', 'Order Changes', 'Order Line Changes', 'Order Confirmations', 'Order Confirmation Lines', 'Delivery Schedule', 'Shipments'];
  const cspHeader = () => `
    <div class="hdr-top">${I.logo}<span class="prod">Supplier Portal</span><span class="sp"></span>
      <span class="upg">Upgrade</span><span class="hcirc">TT</span><span class="hcirc">${I.bell}</span><span class="hcirc">${I.cart}</span><span class="hcirc">${I.check}</span><span class="hcirc">${I.help}</span></div>
    <div class="nav"><span class="nv" data-a="go" data-to="#/csp/orders" style="cursor:pointer">${I.home}</span>${NAV_CSP.map(n => `<span class="nv ${n === 'Orders' ? 'on' : ''}" ${n === 'ASN' ? 'data-a="go" data-to="#/csp/asns" style="cursor:pointer"' : ''}>${n}</span>`).join('')}</div>
    <div class="subnav">${SUB_CSP.map(n => `<span class="sb ${n === 'Orders' ? 'on go' : ''}" ${n === 'Orders' ? 'data-a="go" data-to="#/csp/orders"' : ''}>${n}</span>`).join('')}</div>
    <div class="custbar"><span>Select customer</span><select class="inp" style="width:206px"><option>${D.customer}</option></select><span class="btn primary sm">Upload Invoice</span><span class="beta">Beta</span></div>
    <div class="custbar" style="padding-top:4px"><span style="font-size:11px">10 Free Uploads Remaining | <span class="lnk">Share Feedback</span></span></div>`;
  const NAV_B = ['Requests', 'Orders', 'Invoices', 'Payments', 'Inventory', 'Suppliers', 'Reports', 'Items', 'Setup'];
  const SUB_B = ['Overview', 'Workbench', 'On-Hand Balances', 'Optimization Scheduler', 'Fulfillment', 'Pick Lists', 'Receive', 'View Receipts', 'Unreceived Orders', 'Adjustments & Transfers', 'Cycle Counts', 'Lots', 'Asset Tags', 'ASNs', 'More...'];
  const buyerHeader = active => `
    <div class="hdr-top">${I.logo}<span class="gsrch">${I.searchGrey}<span>What do you need?</span></span><span class="sp"></span>
      <span class="hcirc av">JM</span><span class="hcirc">${I.bell}</span><span class="hcirc">${I.cart}</span><span class="hcirc">${I.help}</span></div>
    <div class="nav buyer"><span class="nv">${I.home}</span>${NAV_B.map(n => `<span class="nv ${n === 'Inventory' ? 'on' : ''}">${n}</span>`).join('')}</div>
    <div class="subnav">${SUB_B.map(n => { const to = n === 'Receive' ? '#/buyer/receive' : n === 'View Receipts' ? '#/buyer/receipts' : ''; return `<span class="sb ${n === active ? 'on' : ''} ${to ? 'go' : ''}" ${to ? `data-a="go" data-to="${to}"` : ''}>${n}</span>`; }).join('')}</div>`;
  const cspFooter = `<div class="foot">English (US) <span class="lnk">Terms of Use</span> <span class="lnk">Privacy Policy</span> © 2006-2026 Coupa Software Incorporated</div>`;
  const buyerFooter = `<div class="foot buyer">Total Spend Management - Make Margins Multiply &nbsp;•&nbsp; English (United States) &nbsp;•&nbsp; Accessibility &nbsp;•&nbsp; <span class="lnk">Coupa Cares</span></div>`;
  const pager = (n = 3) => `<div class="pager"><div class="pp">Per page <b>15</b> | <b>45</b> | <b>90</b></div><div class="pn"><span class="dis">Prev</span><span class="cur">1</span>${n > 1 ? '<span>2</span>' : ''}${n > 2 ? '<span>3</span><span>…</span>' : ''}<span>Next</span></div></div>`;
  const dateInp = (val, f) => `<span class="date"><input ${f ? `data-f="${f}"` : ''} placeholder="mm/dd/yyyy" value="${esc(val || '')}">${I.calendar}</span>`;

  // ================================================================ SUPPLIER: Orders
  function vOrders() {
    const rows = D.orders.map(o => `<tr>
      <td><span class="lnk po-link">${o.po}</span></td><td>${o.date}</td><td>Issued</td><td>None</td><td>${o.items.join('<br>')}</td><td>No</td><td class="r">${o.total}</td><td>None</td>
      <td><span class="acts"><span class="ico" data-tip="Create Invoice">${I.invoice}</span><span class="ico" data-tip="Create Credit Note">${I.creditNote}</span>${o.flip ? `<span class="ico" data-tip="Flip to ASN" data-a="flip" data-po="${o.po}">${I.asnFlip}</span>` : ''}${o.cog ? `<span class="ico" data-tip="Service">${I.cog}</span>` : ''}</span></td></tr>`).join('');
    return cspHeader() + `<div class="page">
      <div class="ptrow" style="margin-top:20px"><h1>Purchase Orders</h1><span class="sp"></span><span class="ghost">Return to classic experience</span></div>
      <div class="hint">Click the ${I.invoice} Action to Invoice from a Purchase Order</div>
      <div class="card"><div class="views"><span class="v1">☰ Views</span><span class="v2">All</span></div>
        <div class="srow"><span class="search"><input placeholder="Search">${I.searchGrey}</span><span class="kebab">⋮</span></div>
        <table class="t"><thead><tr><th>PO Number</th><th>Order Date</th><th>Status</th><th>Acknowledged At</th><th>Items</th><th>Unanswered Comments</th><th class="r">Total</th><th>Assigned To</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div><span class="navi">${I.sparkle}</span>` + cspFooter;
  }

  // ================================================================ SUPPLIER: line picker (Flip to ASN / Manage PO Lines)
  function pickerLines() {
    const p = S.picker; const first = p.firstPo;
    let ls = D.poLines.filter(l => lineRem(l) > 0);
    ls = ls.filter(l => l.po === first).concat(ls.filter(l => l.po !== first));
    const q = (p.q || '').trim().toLowerCase();
    if (q) ls = ls.filter(l => [l.po, l.item, ...l.sch.map(s => s.ref)].join(' ').toLowerCase().includes(q));
    return ls;
  }
  const pSel = l => !!S.sel['P:' + lk(l)];
  const cSel = (l, s) => pSel(l) || !!S.sel['S:' + sk(l, s)];
  function parentState(l) {
    if (pSel(l)) return 'on';
    const o = openSch(l); if (!o.length) return 'off';
    const n = o.filter(s => S.sel['S:' + sk(l, s)]).length;
    return n === 0 ? 'off' : (n === o.length ? 'on' : 'mix');
  }
  function counts() {
    let total = 0, sel = 0;
    for (const l of D.poLines.filter(l => lineRem(l) > 0)) {
      const o = openSch(l); total += 1 + o.length;
      if (pSel(l)) sel += 1 + o.length; else { const n = o.filter(s => S.sel['S:' + sk(l, s)]).length; sel += n + (o.length && n === o.length ? 1 : 0); }
    }
    return { total, sel };
  }
  function buildLines() { // ASN lines from current selection (picker order)
    const out = [];
    for (const l of pickerLinesAll()) {
      if (pSel(l)) { const o = openSch(l); out.push({ id: 'P:' + lk(l), po: l.po, line: l.line, kind: 'po', refs: o.map(s => s.ref), qty: lineRem(l) }); continue; }
      for (const s of openSch(l)) if (S.sel['S:' + sk(l, s)]) out.push({ id: 'S:' + sk(l, s), po: l.po, line: l.line, kind: 'sch', refs: [s.ref], qty: schRem(l, s) });
    }
    return out;
  }
  function pickerLinesAll() { const first = S.picker ? S.picker.firstPo : '3627'; const ls = D.poLines.filter(l => lineRem(l) > 0); return ls.filter(l => l.po === first).concat(ls.filter(l => l.po !== first)); }

  function vPicker() {
    const p = S.picker; if (!p) return '';
    const ls = pickerLines(); const c = counts(); const lines = buildLines();
    const withRef = lines.filter(x => x.kind === 'sch').length;
    const rows = ls.map(l => {
      const st = parentState(l); const o = openSch(l); const exp = S.exp[lk(l)] !== undefined ? S.exp[lk(l)] : !l.collapsed;
      const hasS = l.sch.length > 0;
      const prow = `<tr class="p ${st !== 'off' ? 'sel' : ''}">
        <td><span class="cb ${st === 'on' ? 'on' : st === 'mix' ? 'mix' : ''}" data-a="selP" data-k="${lk(l)}"></span></td>
        <td><span class="tw">${hasS ? `<span class="caret" data-a="exp" data-k="${lk(l)}">${exp ? I.caretDown : I.caretRight}</span>` : '<span class="caret"></span>'}${l.po}</span></td>
        <td>${l.line}</td><td><b>${esc(l.item)}</b></td>
        <td>${hasS ? `<span class="chip">${I.schedule}${l.sch.length} schedule lines</span>` : '<span class="none">No schedule lines</span>'}</td>
        <td class="r">${l.qty}</td><td class="r">${l.qty - lineRem(l)}</td><td class="r"><b>${lineRem(l)}</b></td><td>${l.uom}</td><td>${l.needBy}</td></tr>`;
      const crows = (hasS && exp) ? l.sch.map(s => {
        const rem = schRem(l, s); const full = rem <= 0; const on = !full && cSel(l, s); const locked = pSel(l);
        return `<tr class="c ${full ? 'dis' : ''} ${on ? 'sel' : ''}">
          <td><span class="cb ${on ? 'on' : ''} ${locked && !full ? 'locked' : ''} ${full ? 'dis' : ''}" ${full || locked ? '' : `data-a="selS" data-k="${sk(l, s)}"`}></span></td>
          <td><span class="elbow">${I.elbow}</span></td><td></td>
          <td><b>${s.ref}</b>${full ? ' <span class="none">· Fully shipped</span>' : ''}</td>
          <td>Need by ${s.needBy}</td><td class="r">${s.qty}</td><td class="r">${s.qty - rem}</td><td class="r"><b>${rem}</b></td><td>${l.uom}</td><td>${s.needBy}</td></tr>`;
      }).join('') : '';
      return prow + crows;
    }).join('');
    const isFlip = p.mode === 'flip';
    const title = isFlip ? 'Flip to ASN — Select lines' : 'Manage PO Lines — ASN draft';
    const hasFirst = D.poLines.some(l => l.po === p.firstPo && lineRem(l) > 0);
    const sub = isFlip ? `${hasFirst ? `Purchase Order #${p.firstPo} first, then other open POs` : `PO #${p.firstPo} has no lines left to ship · other open POs`} · ${D.customer} · Ship to 150 Main Street, San Francisco` : 'Lines on this ASN are checked · uncheck to remove, check to add';
    const foot = isFlip ? `${lines.length} ASN line${lines.length === 1 ? '' : 's'} will be created${lines.length ? ` · ${withRef} referring to a single schedule line` : ''}` : `${lines.length} line${lines.length === 1 ? '' : 's'} on this ASN · changes are applied when you click Update ASN`;
    const allState = c.sel === 0 ? '' : (c.sel === c.total ? 'on' : 'mix');
    return `<div class="scrim"><div class="modal">
      <div class="modal-h">${title}<span class="x" data-a="closePicker">${I.close}</span></div>
      <div class="modal-b">
        <div class="m-top"><span>${sub}</span><span class="sp"></span><span class="lnkb" data-a="expAll">Expand all</span><span class="lnkb" data-a="colAll">Collapse all</span>
          <span class="search"><input data-f="pq" placeholder="Search item, PO, schedule #" value="${esc(p.q || '')}">${I.searchGrey}</span></div>
        <div class="selbar"><span class="cb ${allState}" data-a="selAll"></span><span><b>Select all</b> · ${c.sel} of ${c.total} selectable lines selected</span><span class="lnkb" data-a="clearSel">Clear selection</span></div>
        <table class="tree"><thead><tr><th style="width:34px"></th><th style="width:92px">PO #</th><th style="width:48px">Line</th><th>Item / Schedule Line #</th><th style="width:170px">Delivery schedule</th><th class="r" style="width:120px">Line / Sched. Qty</th><th class="r" style="width:70px">Shipped</th><th class="r" style="width:86px">Remaining</th><th style="width:60px">UOM</th><th style="width:96px">Need By</th></tr></thead><tbody>${rows || '<tr><td colspan="10" class="none" style="padding:20px">No lines match your search.</td></tr>'}</tbody></table>
      </div>
      <div class="modal-f"><span class="sum">${foot}</span><span class="sp"></span><span class="btn outline" data-a="closePicker">Cancel</span><button class="btn primary" data-a="pickerOk" ${lines.length || !isFlip ? '' : 'disabled'}>${isFlip ? 'Create ASN' : 'Update ASN'}</button></div>
    </div></div>` + vConfirm();
  }
  function vConfirm() {
    const c = S.confirm; if (!c) return '';
    const ls = c.keys.map(k => { const [po, line] = k.split('-'); return getLine(po, line); });
    return `<div class="scrim" style="z-index:40;background:rgba(0,0,0,.25);padding-top:160px"><div class="modal dlg">
      <div class="modal-h">How should these lines be added to the ASN?<span class="x" data-a="confirmCancel">${I.close}</span></div>
      <div class="modal-b" style="padding:18px 20px">
        <p style="margin:0 0 14px;font-size:13px">All schedule lines are selected for ${ls.map(l => `<b>PO ${l.po} · Line ${l.line} (${esc(l.item)})</b>`).join(', ')}. Do you want the ASN line to refer to the PO line or to each schedule line?</p>
        <div class="opt ${c.choice === 'sch' ? 'on' : ''}" data-a="confirmPick" data-v="sch"><input type="radio" ${c.choice === 'sch' ? 'checked' : ''}><div><div class="opt-t">Schedule Lines</div>One ASN line per delivery schedule line, each with its Schedule Line #, quantity and need-by date.</div></div>
        <div class="opt ${c.choice === 'po' ? 'on' : ''}" data-a="confirmPick" data-v="po"><input type="radio" ${c.choice === 'po' ? 'checked' : ''}><div><div class="opt-t">PO Line</div>One ASN line for the PO line. It covers all its schedule lines (shown as a count).</div></div>
      </div>
      <div class="modal-f"><span class="sp"></span><span class="btn outline" data-a="confirmCancel">Back</span><span class="btn primary" data-a="confirmOk">Continue</span></div>
    </div></div>`;
  }
  function openPicker(mode, firstPo) {
    S.sel = {}; S.exp = {};
    if (mode === 'flip') { for (const l of D.poLines) if (l.po === firstPo && lineRem(l) > 0) S.sel['P:' + lk(l)] = true; }
    else { for (const x of (S.draft ? S.draft.lines : [])) S.sel[x.id] = true; }
    S.picker = { mode, firstPo: firstPo || (S.draft && S.draft.lines[0] ? S.draft.lines[0].po : '3627'), q: '' };
    save(); render();
  }
  function pickerOk() {
    // lines whose every open schedule line was picked one by one → ask PO Line vs Schedule Lines
    const keys = pickerLinesAll().filter(l => !pSel(l) && openSch(l).length && openSch(l).every(s => S.sel['S:' + sk(l, s)])).map(lk);
    if (keys.length && !S.confirm) { S.confirm = { keys, choice: 'sch' }; save(); render(); return; }
    finishPicker();
  }
  function finishPicker() {
    const lines = buildLines();
    const prev = {}; if (S.draft) for (const x of S.draft.lines) prev[x.id] = x.qty;
    for (const x of lines) if (prev[x.id] !== undefined) x.qty = prev[x.id];
    if (!S.draft) S.draft = { asnNo: '', gross: '', shipDate: D.today, expDate: '', att: 'hello', tracking: '', carrier: '', lines: [] };
    S.draft.lines = lines; S.picker = null; S.confirm = null; S.errors = {}; save();
    location.hash = '#/csp/asn/new'; render();
  }

  // ================================================================ SUPPLIER: Draft ASN
  function vDraft() {
    const d = S.draft;
    if (!d) return cspHeader() + `<div class="asn-page"><h1>Create Advance Ship Notice</h1><p class="alert-info" style="margin-top:20px">No ASN draft yet. Go to <span class="lnk" data-a="go" data-to="#/csp/orders">Orders</span> and use <b>Flip to ASN</b> on a PO.</p></div>` + cspFooter;
    const E = S.errors || {};
    const fr = (label, ctrl, req) => `<div class="frow"><div class="fl">${req ? '<span class="req">*</span>' : ''}${label}</div><div class="fv">${ctrl}</div></div>`;
    const tx = (f, w, v) => `<input class="inp ${E[f] ? 'err' : ''}" data-f="d.${f}" style="width:${w}px" value="${esc(v)}">`;
    const lines = d.lines.map((x, i) => {
      const l = getLine(x.po, x.line); const err = E['l' + i];
      let ds = none(), sq = none(), snb = none();
      if (x.kind === 'po' && x.refs.length) { ds = `<span class="lnk" title="${x.refs.join(', ')}">${x.refs.length}</span>`; sq = q1(lineRem(l)); snb = earliest(x.refs.map(r => l.sch.find(s => s.ref === r).needBy)); }
      if (x.kind === 'sch') { const s = l.sch.find(s => s.ref === x.refs[0]); ds = `<span class="lnk">${s.ref}</span>`; sq = q1(schRem(l, s)); snb = s.needBy; }
      return `<div class="aline"><div class="n">${i + 1}</div><div class="body">
        <div class="lrow"><div class="f w"><div class="l">Description</div>${esc(l.item)}</div>
          <div class="f"><div class="l">Shipped Qty</div><input class="inp ${err ? 'err' : ''}" style="width:110px" data-f="q.${i}" value="${esc(x.qty === '' ? '' : (isNaN(x.qty) ? x.qty : q4(x.qty)))}">${err ? `<div class="lerr">${err}</div>` : ''}</div>
          <div class="f"><div class="l">UOM</div><select class="inp" style="width:112px" disabled><option>${l.uom}</option></select></div>
          <div class="f"><div class="l">Received Quantity</div>0</div><div class="f"><div class="l">Status</div>Draft</div>
          <span class="x ico" data-tip="Remove line" data-a="rmLine" data-i="${i}">${I.delete}</span></div>
        <div class="lrow"><div class="f w"><div class="l">Supplier Part Number</div>${l.spn}</div><div class="f"><div class="l">PO #</div><span class="lnk">${l.po}</span></div><div class="f"><div class="l">PO Line</div>${l.line}</div><div class="f"><div class="l">Po Line Quantity</div>${q1(l.qty)}</div><div class="f"><div class="l">PO Line Need By</div>${l.needBy}</div></div>
        <div class="lrow"><div class="f w"><div class="l">Delivery Schedules</div>${ds}</div><div class="f"><div class="l">Schedule Line Qty</div>${sq}</div><div class="f"><div class="l">Schedule Line Need By</div>${snb}</div></div>
        <div class="lrow"><div class="f w"><div class="l">Invoice Num Reference</div></div><div class="f"><div class="l">Invoice</div></div><div class="f"><div class="l">Invoice Line</div></div><div class="f"><div class="l">Invoice Line Qty</div></div><div class="f"><div class="l">Supplier AUX Part Number</div>${l.aux}</div></div>
        <div class="lrow" style="margin-bottom:6px"><div class="f w"><div class="l">Match Reference</div><span class="none">None</span></div></div>
        <div class="lrow" style="margin-bottom:0"><div style="flex:1"><div class="l" style="font-weight:700;color:#5a6b7b;margin-bottom:3px">Comments</div><textarea class="inp" rows="2" style="width:100%"></textarea></div></div>
      </div></div>`;
    }).join('');
    return cspHeader() + `<div class="asn-page">
      <h1>Create Advance Ship Notice</h1>
      ${E.top ? `<div class="alert-err" style="margin-top:16px">${E.top}</div>` : ''}
      <div class="asn-cols">
        <div style="flex:1.2"><div class="sect-h">General Info</div>
          ${fr('ASN #', tx('asnNo', 140, d.asnNo) + (E.asnNo ? `<div class="lerr">${E.asnNo}</div>` : ''), 1)}
          ${fr('Status', 'Draft')}${fr('Gross Weight', tx('gross', 104, d.gross))}
          ${fr('Ship Date', dateInp(d.shipDate, 'd.shipDate'))}${fr('Expected Delivery Date', dateInp(d.expDate, 'd.expDate'))}
          ${fr('Supplier only', '<input class="inp" style="width:150px">')}${fr('CF Text', '<input class="inp" style="width:150px">')}</div>
        <div style="flex:1"><div class="sect-h">Ship To</div>
          ${fr('Ship To Warehouse', D.shipTo.warehouse)}${fr('Ship to Address', D.shipTo.address.join('<br>'))}${fr('Ship to Attention', tx('att', 140, d.att))}
          <div class="sect-h" style="margin-top:18px">Shipping Info</div>
          ${fr('Tracking Number', tx('tracking', 140, d.tracking))}${fr('Carrier', tx('carrier', 140, d.carrier))}${fr('Shipping Method', '<input class="inp" style="width:140px">')}${fr('Packing Slip #', '<input class="inp" style="width:140px">')}</div>
      </div>
      <div class="sect-h" style="margin-top:26px">Lines</div>
      <div style="margin:-6px 0 10px"><span class="addl" data-a="manage">${I.pencilBlue} Manage / Add PO line #</span></div>
      <div class="lines">${lines || '<div style="padding:20px" class="none">No lines on this ASN. Use Manage / Add PO line # to add PO lines.</div>'}</div>
      <div class="afoot"><span class="addl" data-a="manage">${I.plusCircle} Manage / Add PO line #</span><span class="sp"></span>
        <span class="lnk" data-a="cancelDraft">Cancel</span><span class="btn grey" data-a="saveDraft">Save</span><span class="btn grey" data-a="submit">Submit</span></div>
    </div>` + cspFooter;
  }
  function submitDraft() {
    const d = S.draft; const E = {};
    if (!d.asnNo.trim()) E.asnNo = 'ASN # is required';
    if (!d.lines.length) E.top = 'Add at least one PO line to the ASN.';
    const tot = {};
    d.lines.forEach((x, i) => { const v = Number(x.qty); if (!(v > 0)) E['l' + i] = 'Enter a quantity greater than 0'; tot[`${x.po}-${x.line}`] = (tot[`${x.po}-${x.line}`] || 0) + (v || 0); });
    for (const [k, t] of Object.entries(tot)) { const [po, line] = k.split('-'); const l = getLine(po, line); if (t > lineRem(l)) { E.top = `Total shipped quantity for PO ${po} line ${line} (${t}) exceeds the quantity remaining on the PO line (${lineRem(l)}).`; d.lines.forEach((x, i) => { if (x.po === po && x.line === +line) E['l' + i] = 'Exceeds PO line quantity'; }); } }
    if (Object.keys(E).length) { if (!E.top && Object.keys(E).length) E.top = 'Please fix the highlighted fields.'; S.errors = E; save(); render(); window.scrollTo(0, 0); return; }
    // record shipped quantities (PO line + schedule lines)
    const asnLines = d.lines.map(x => {
      const l = getLine(x.po, x.line); let left = Number(x.qty);
      S.shipped[lk(l)] = (S.shipped[lk(l)] || 0) + left;
      const refs = x.refs.slice(); const needBys = [];
      for (const r of refs) { const s = l.sch.find(s => s.ref === r); const take = Math.min(left, schRem(l, s)); S.shipped[sk(l, s)] = (S.shipped[sk(l, s)] || 0) + take; left -= take; needBys.push(s.needBy); }
      return { po: x.po, line: x.line, kind: x.kind, refs, needBys, qty: Number(x.qty) };
    });
    const pos = [...new Set(asnLines.map(x => x.po))];
    S.asns.unshift({ no: d.asnNo.trim(), status: 'Pending Receipt', ship: d.shipDate || 'None', att: d.att || 'None', carrier: d.carrier || 'None', tracking: d.tracking, updated: D.today, lines: asnLines, po: pos, mine: true });
    S.draft = null; S.errors = {}; S.banner = 'asn'; save(); location.hash = '#/csp/asns';
  }

  // ================================================================ SUPPLIER: ASN list
  function vAsns() {
    const mine = S.asns.map(a => ({ no: a.no, status: a.status, ship: a.ship, att: a.att, carrier: a.carrier, updated: a.updated, lines: a.lines.length, po: a.po, mine: 1 }));
    const all = mine.concat(D.asns);
    const rows = all.map((a, i) => `<tr class="${a.mine && i === 0 && S.banner === 'asn' ? 'new' : ''}">
      <td class="c"><span class="lnk">${esc(a.no)}</span></td><td>${a.status.replace(' ', '<br>')}</td><td>${none(a.ship)}</td><td><span class="none">None</span></td><td>${esc(a.att)}</td><td>${none(a.carrier)}</td><td></td><td>${a.updated}</td><td class="r">${a.lines}</td>
      <td>${a.po.map(p => `<span class="lnk">${esc(p)}</span>`).join(',<br>')}</td>
      <td><span class="acts" style="gap:8px">${a.status !== 'Received' ? `<span class="ico" data-tip="Edit">${I.edit}</span>` : ''}${a.status === 'Draft' ? `<span class="ico" data-tip="Delete">${I.delete}</span>` : ''}${a.status === 'Pending Receipt' ? `<span class="ico" data-tip="Void">${I.void}</span>` : ''}</span></td></tr>`).join('');
    return cspHeader() + `<div style="width:956px;margin:0 auto;padding:24px 0 60px">
      <h1>Advance Ship Notices</h1><div style="height:40px"></div>
      ${S.banner === 'asn' ? `<div class="alert-ok">Advance Ship Notice submitted successfully<span class="x" data-a="dismiss">${I.close}</span></div><div style="height:10px"></div>` : ''}
      <div class="c1bar"><span class="btn sm">Load from file</span><span class="btn sm">Export to ▾</span><span class="sp"></span><span class="lbl">View</span><span class="sel">All ${I.chev}</span><span class="btn sm">Advanced</span><span class="srch"><input placeholder="Search">${I.search}</span></div>
      <table class="c1"><thead><tr><th class="c">ASN Number</th><th>Status</th><th>Ship Date</th><th>Expected Delivery Date ▲</th><th>Ship to Attention</th><th>Carrier</th><th>Tracking #</th><th>Last Updated Date</th><th class="r">ASN Lines</th><th>PO Number</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      ${pager()}
    </div>` + cspFooter;
  }

  // ================================================================ BUYER: Receive › ASN Lines
  function receiveRows() {
    const mine = [];
    for (const a of S.asns) a.lines.forEach((x, i) => {
      const l = getLine(x.po, x.line); const key = `${a.no}#${i + 1}`;
      mine.push({ key, asn: a.no, ln: i + 1, item: l.item, po: x.po, poLine: x.line, refs: x.refs, needBys: x.needBys, supplier: D.supplierName, qty: x.qty, uom: l.uom, needBy: l.needBy, received: S.rcv[key] || 0, approval: 'No', mine: true });
    });
    const stat = D.receiveRows.map(r => Object.assign({ key: `${r.asn}#${r.ln}`, refs: [], needBys: [] }, r, { received: r.received + (S.rcv[`${r.asn}#${r.ln}`] || 0) }));
    return mine.concat(stat);
  }
  const xToggle = which => `<span class="xtoggle" data-a="xp" data-w="${which}" title="${S.xp[which] ? 'Collapse table' : 'Expand table'}">${S.xp[which] ? I.collapse : I.expand}</span>`;
  function vReceive() {
    const rows = receiveRows();
    const E = S.errors || {};
    const body = rows.map(r => {
      const open = r.qty - r.received;
      return `<tr>
        <td><span class="lnk">${esc(r.asn)}</span></td><td>${r.ln}</td><td>${esc(r.item)}</td><td><span class="lnk">${r.po}</span></td><td>${r.poLine}</td>
        <td>${r.refs.length ? r.refs.join('<br>') : none()}</td><td>${r.needBys.length ? r.needBys.join('<br>') : none()}</td>
        <td></td><td>${none()}</td><td>${esc(r.supplier)}</td><td class="r">${r.qty}</td><td>${r.uom}</td><td>${none(r.needBy)}</td><td class="r">${r.received}</td>
        <td>${dateInp('', `rd.${r.key}`)}</td>
        <td>${open > 0 ? `<span class="qr"><input class="inp ${E['qr.' + r.key] ? 'err' : ''}" data-qr="${esc(r.key)}" value="${esc((S.qr || {})[r.key] || '')}"><label><input type="checkbox" class="native" data-qa="${esc(r.key)}" data-open="${open}" ${(S.qr || {})[r.key] == open && open ? 'checked' : ''}> All</label></span>` : '<span class="none">Received</span>'}</td>
        <td>${r.approval}</td>
        <td class="c">${open > 0 ? `<span class="ico" data-tip="Detailed receipt" data-a="detail" data-k="${esc(r.key)}">${I.packageAdd}</span>` : ''}</td></tr>`;
    }).join('');
    const xp = S.xp.receive;
    return buyerHeader('Receive') + `
      <div class="c990 top"><h1>Receive</h1>
        <div class="tabs"><span class="tab">PO Lines</span><span class="tab on">ASN Lines</span><span class="tab">Returns</span><span class="tab">Returned Stock Order Lines</span></div>
        <div class="intro"><span>Enter quantities to fully or partially receive or apply other actions on the bottom of the page. To specify asset tags or other details, click the detailed receipt icon at the end of each row.</span>${I.print}</div>
        ${E.top ? `<div class="alert-err">${E.top}</div>` : ''}
        ${!S.asns.length ? `<div class="alert-info" style="margin-bottom:10px">No ASN from the supplier flow yet. Submit one in the supplier flow, or use <b>Prototype ▾ → Load sample ASN</b>.</div>` : ''}
        <div class="c1bar alt"><span class="btn sm">Export to ▾</span><span class="sp"></span><span class="lbl">View</span><span class="sel" style="width:230px">All ${I.chev}</span><span class="btn sm" style="padding:0 7px">${I.clock}</span><span class="btn sm">Advanced</span><span class="srch" style="width:210px"><input placeholder="Search">${I.search}</span></div>
      </div>
      <div class="xwrap ${xp ? 'expanded' : 'collapsed'}">${xToggle('receive')}
        <table class="c1 grey"><thead><tr><th>ASN #</th><th>ASN Line</th><th>Item</th><th>PO Number</th><th>PO Line</th><th>Schedule Line #</th><th>Schedule Line Need By</th><th>Invoice</th><th>Invoice Line</th><th>Supplier</th><th class="r">ASN Quantity</th><th>UOM</th><th>PO Line Need By</th><th class="r">Received</th><th class="c">Receipt Date</th><th>Quick Receipts <input type="checkbox" class="native" data-a="qrAll"></th><th>Receipt approval required</th><th class="c">Actions</th></tr></thead><tbody>${body}</tbody></table>
      </div>
      <div class="c990 bot">${pager(2)}<div style="display:flex;justify-content:flex-end;gap:14px;align-items:center;margin-top:16px"><span class="lnk">Cancel</span><span class="btn" data-a="quickReceive">Receive</span></div></div>` + buyerFooter;
  }
  function quickReceive() {
    const rows = receiveRows(); const qr = S.qr || {}; const E = {}; const todo = [];
    for (const r of rows) { const v = qr[r.key]; if (v === undefined || v === '') continue; const n = Number(v); const open = r.qty - r.received;
      if (!(n > 0) || n > open) { E['qr.' + r.key] = 1; E.top = `Quick receipt quantity for ${r.asn} line ${r.ln} must be between 1 and ${open}.`; } else todo.push([r, n]); }
    if (!todo.length && !E.top) E.top = 'Enter a Quick Receipts quantity (or check All) on at least one line.';
    if (E.top) { S.errors = E; save(); render(); return; }
    const ids = todo.map(([r, n]) => makeReceipt(r, n, {}));
    S.qr = {}; S.errors = {}; S.banner = { receipts: ids.length }; save(); location.hash = '#/buyer/receipts';
  }
  function makeReceipt(r, n, extra) {
    const l = r.mine ? getLine(r.po, r.poLine) : null;
    const id = String(S.nextReceipt++);
    S.rcv[r.key] = (S.rcv[r.key] || 0) + n;
    S.receipts.unshift({ id, date: D.today, status: 'Created', type: 'Receipt', po: r.po, poLine: r.poLine, refs: r.refs, needBys: r.needBys, item: r.item, supplier: r.supplier, receiver: D.receiver, qty: n, uom: r.uom, price: l ? l.price : 10, asn: r.asn, asnLine: r.ln, itemNo: l ? l.itemNo : 'None', needBy: r.needBy, ordered: l ? l.qty : r.qty, warehouse: extra.warehouse || 'Main Warehouse - SF', mine: true });
    return id;
  }

  // ================================================================ BUYER: ASN Detailed Receipt
  function vDetail(key) {
    const r = receiveRows().find(x => x.key === key);
    if (!r) return buyerHeader('Receive') + `<div class="c990"><h1>ASN Detailed Receipt</h1><p class="alert-info">That ASN line is no longer open. <span class="lnk" data-a="go" data-to="#/buyer/receive">Back to Receive</span></p></div>` + buyerFooter;
    const l = r.mine ? getLine(r.po, r.poLine) : null; const open = r.qty - r.received; const E = S.errors || {};
    const dr = S.dr && S.dr.key === key ? S.dr : (S.dr = { key, qty: String(open), action: 'inv', wh: '' });
    const kv = (k, v, req) => `<div class="kv"><div class="k">${req ? '<span class="req">*</span>' : ''}${k}</div><div class="v">${v}</div></div>`;
    const inp = w => `<input class="inp" style="width:${w}px">`;
    const sel = (w, v, ph) => `<select class="inp" style="width:${w}px">${ph ? `<option>${ph}</option>` : ''}${v ? `<option>${v}</option>` : ''}</select>`;
    const file = '<span class="fileinp"><span class="b">Choose File</span>No file chosen</span>';
    const price = l ? l.price : 10;
    return buyerHeader('Receive') + `<div class="c990"><h1>ASN Detailed Receipt</h1>
      ${E.top ? `<div class="alert-err" style="margin-top:14px">${E.top}</div>` : ''}
      <div class="form2">
        <div class="col" style="width:450px">
          ${kv('Quantity', `<input class="inp ${E.qty ? 'err' : ''}" style="width:56px;text-align:right" data-f="dr.qty" value="${esc(dr.qty)}"> ${r.uom}<div class="lnk" style="margin-top:4px">${money((Number(dr.qty) || 0) * price)} USD</div>`, 1)}
          ${kv('Close for Receiving', '<input type="checkbox" class="native">')}
          ${kv('Receipt Date', dateInp(D.today))}
          ${kv('Action', `<div style="display:flex;flex-direction:column;gap:12px">
            <label class="radio"><input type="radio" name="act" data-f="dr.action" value="consume" ${dr.action === 'consume' ? 'checked' : ''}> Consume</label>
            <label class="radio"><input type="radio" name="act" data-f="dr.action" value="inv" ${dr.action === 'inv' ? 'checked' : ''}> Receive to inventory</label>
            ${dr.action === 'inv' ? `<div style="display:flex;flex-direction:column;gap:12px;margin-left:10px">
              <div class="kv"><div class="k" style="width:96px">Target Item #</div><input class="inp" readonly style="width:172px" value="${esc(l ? l.itemNo : r.item)}"></div>
              <div class="kv"><div class="k" style="width:96px"><span class="req">*</span>Warehouse</div><div><select class="inp ${E.wh ? 'err' : ''}" style="width:192px" data-f="dr.wh"><option value="">Select an Option</option>${['Main Warehouse - SF', 'East DC'].map(w => `<option ${dr.wh === w ? 'selected' : ''}>${w}</option>`).join('')}</select>${E.wh ? '<div class="lerr">Warehouse is required</div>' : ''}</div></div>
              <div class="kv tight"><div class="k" style="width:96px"><span class="req">*</span>Location</div><div class="v">${dr.wh ? (dr.wh === 'East DC' ? 'B-12' : 'A-01') : 'None'}</div></div></div>` : ''}
            <label class="radio"><input type="radio" name="act" data-f="dr.action" value="return" ${dr.action === 'return' ? 'checked' : ''}> Return to supplier</label>
            <label class="radio"><input type="radio" name="act" data-f="dr.action" value="dispose" ${dr.action === 'dispose' ? 'checked' : ''}> Dispose</label></div>`)}
        </div>
        <div class="col" style="flex:1">
          ${kv('Inspection Result', sel(116, '', ' '))}${kv('Rfid Tag', inp(156))}${kv('Barcode', inp(156))}${kv('Custom Field 16', inp(226))}
          ${kv('Packing slip', file)}${kv('Custom Field 17', file)}${kv('Custom Field 12', inp(226))}${kv('Receipts_Source', sel(248, 'USA'))}
          ${kv('Carrier Name', inp(226))}${kv('money', `${inp(86)} <select class="inp" style="width:72px"><option>USD</option></select>`)}${kv('Custom Date', dateInp(''))}
          ${kv('Text Box CF', '<textarea class="inp" rows="5" style="width:244px"></textarea>')}${kv('Custom Field 13', sel(248, 'USA'))}${kv('Custom Field 18', inp(226))}
          ${kv('CF Attachments', file)}${kv('custom_field_2', inp(226))}${kv('Evidencia Recepcion', 'Add <span class="lnk">File</span> | <span class="lnk">URL</span> | <span class="lnk">Text</span>')}
        </div>
      </div>
      <div class="sect2">ASN Line</div>
      <table class="c1 grey" style="border:1px solid #ddd"><thead><tr><th>ASN #</th><th>ASN Line</th><th>PO #</th><th>PO Line</th><th>Schedule Line #</th><th>Schedule Line Need By</th><th>Invoice</th><th>Invoice Line</th><th>Description</th><th>Supplier</th><th class="r">Shipped Qty</th><th>UOM</th><th class="r">Price</th><th class="r">PO Total</th><th>Need By</th><th class="r">Received</th></tr></thead>
        <tbody><tr><td><span class="lnk">${esc(r.asn)}</span></td><td>${r.ln}</td><td><span class="lnk">${r.po}</span></td><td>${r.poLine}</td><td>${r.refs.length ? r.refs.join('<br>') : none()}</td><td>${r.needBys.length ? r.needBys.join('<br>') : none()}</td><td></td><td></td><td>${esc(r.item)}</td><td>${esc(r.supplier)}</td><td class="r">${q1(r.qty)}</td><td>${r.uom}</td><td class="r">${money(price)}</td><td class="r">${money(price * r.qty)}</td><td>${none(r.needBy)}</td><td class="r">${q1(r.received)}</td></tr></tbody></table>
      <div class="sect2">Asset Tags (Optional)</div>
      <div class="assets"><div class="top"><div class="k" style="width:146px;text-align:right;font-weight:700;color:#3e5673">Asset Tags</div><div style="flex:1">You can enter asset tags manually below or use <span class="lnk">this CSV template</span>. The headers must be <i>asset tag, serial, owner,</i> and <i>note</i>. In each row, <i>asset tag</i> is required while the others are optional. Remember, the number of asset tags in the CSV file must be ${open} or fewer. <span class="lnk">Toggle manual entry.</span><div style="margin-top:6px">${file}</div></div></div>
        <div class="man"><div style="display:flex;gap:10px;align-items:flex-end">${['Tag', 'Serial Number', 'Owner', 'Note'].map((t, i) => `<div><div style="font-weight:700;color:#3e5673;margin-bottom:6px">${i === 0 ? '<input type="checkbox" class="native"> ' : ''}${t}</div><input class="inp" style="width:194px"></div>`).join('')}</div></div></div>
      <div style="display:flex;justify-content:flex-end;gap:16px;align-items:center;margin-top:22px"><span class="lnk" data-a="go" data-to="#/buyer/receive">Cancel</span><span class="btn primary" data-a="submitDetail" data-k="${esc(key)}">Submit</span></div>
    </div>` + buyerFooter;
  }
  function submitDetail(key) {
    const r = receiveRows().find(x => x.key === key); const dr = S.dr; const open = r.qty - r.received; const E = {};
    const n = Number(dr.qty);
    if (!(n > 0) || n > open) { E.qty = 1; E.top = `Quantity must be between 1 and ${open}.`; }
    if (dr.action === 'inv' && !dr.wh) { E.wh = 1; E.top = E.top || 'Warehouse is required to receive to inventory.'; }
    if (E.top) { S.errors = E; save(); render(); return; }
    const id = makeReceipt(r, n, { warehouse: dr.wh });
    S.dr = null; S.errors = {}; S.banner = { receipts: 1, id }; save(); location.hash = '#/buyer/receipts';
  }

  // ================================================================ BUYER: View Receipts
  function allReceipts() { return S.receipts.concat(D.receipts.map(r => Object.assign({ status: 'Created', refs: [], needBys: [] }, r))); }
  function vReceipts() {
    const rows = allReceipts().map(r => `<tr>
      <td><input type="checkbox" class="native"></td><td><span class="lnk" data-a="go" data-to="#/buyer/receipts/${r.id}">${r.date}</span></td><td>${r.status}</td><td>${r.type}</td><td><span class="lnk">${r.po}</span></td><td>${r.poLine}</td>
      <td>${r.refs && r.refs.length ? r.refs.join('<br>') : none()}</td><td>${none()}</td><td>${none()}</td><td>${esc(r.item)}</td><td>${esc(r.supplier)}</td><td>${esc(r.receiver)}</td>
      <td class="r">${r.qty == null ? none() : r.qty}</td><td>${none(r.uom)}</td><td class="r">${money(r.price)}</td><td>USD</td><td class="r">${money(r.total != null ? r.total : r.price * r.qty)}</td><td></td>
      <td><span class="acts" style="gap:8px">${(r.actions === undefined || r.actions >= 1) ? `<span class="ico" data-tip="Void">${I.void}</span>` : ''}${(r.actions === undefined || r.actions >= 2) ? `<span class="ico" data-tip="Return">${I.inventoryReturn}</span>` : ''}</span></td></tr>`).join('');
    const b = S.banner && S.banner.receipts ? S.banner : null;
    return buyerHeader('View Receipts') + `
      <div class="c990 top"><h1>View Receipts</h1>
        <div class="tabs"><span class="tab on">Receipts</span><span class="tab">Receipt Requests</span></div><div style="height:24px"></div>
        ${b ? `<div class="alert-ok" style="margin-bottom:10px">${b.receipts} receipt${b.receipts > 1 ? 's' : ''} created successfully<span class="x" data-a="dismiss">${I.close}</span></div>` : ''}
        <div class="c1bar alt"><span class="btn sm">Export to ▾</span><span class="sp"></span><span class="lbl">View</span><span class="sel" style="width:230px">All ${I.chev}</span><span class="btn sm" style="padding:0 7px">${I.clock}</span><span class="btn sm">Advanced search</span><span class="srch" style="width:210px"><input placeholder="Search">${I.search}</span></div>
        <div class="bulk">↩ <span class="btn sm disabled">Void</span><span class="btn sm disabled">Return</span></div>
      </div>
      <div class="xwrap ${S.xp.receipts ? 'expanded' : 'collapsed'}">${xToggle('receipts')}
        <table class="c1"><thead><tr><th><input type="checkbox" class="native"></th><th>Created Date</th><th>Status</th><th>Type</th><th>PO ID</th><th>Order Line Number</th><th>Schedule Line #</th><th>Invoice(ASN Line)</th><th>Invoice Line Number(ASN Line)</th><th>Item</th><th>Supplier</th><th>Receiver</th><th class="r">Quantity</th><th>UOM</th><th class="r">Price</th><th>Currency</th><th class="r">Total</th><th>Receipts Batch Source</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>
      </div>
      <div class="c990 bot">${pager(3)}</div>` + buyerFooter;
  }

  // ================================================================ BUYER: View Receipt
  function vReceipt(id) {
    const r = allReceipts().find(x => x.id === id);
    if (!r) return buyerHeader('View Receipts') + `<div class="c990"><h1>View Receipt</h1><p class="alert-info">Receipt not found. <span class="lnk" data-a="go" data-to="#/buyer/receipts">View All Receipts</span></p></div>` + buyerFooter;
    const kv = (k, v) => `<div class="kv"><div class="k">${k}</div><div class="v">${v}</div></div>`;
    const total = r.total != null ? r.total : r.price * (r.qty || 0);
    return buyerHeader('View Receipts') + `<div class="c990"><h1>View Receipt</h1><div style="height:24px"></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${kv('Receipt ID', r.id)}${kv('Receipt Request', none())}${r.asn ? kv('ASN', `<span class="lnk">${esc(r.asn)} · Line ${r.asnLine}</span>`) : ''}${kv('Created on', r.date)}${kv('Type', r.type.toLowerCase())}${kv('Status', r.status)}
        ${kv('Item number', esc(r.itemNo || 'DLHM64'))}${kv('Item', `<span class="lnk">${esc(r.item)}</span>`)}${kv('Quantity', r.qty == null ? none() : r.qty)}${kv('Voided/Returned Quantity', '0.0')}${kv('UOM', none(r.uom))}
        ${kv('Price', money(r.price) + ' USD')}${kv('Receipt Date', r.date)}${kv('Created by user', esc(r.receiver))}${kv('Match Reference Key', none())}${kv('Inspection Result', none())}
        ${kv('Chart of Accounts', 'SAP General Ledger')}${kv('Account', 'DAL-Marketing-Assets')}${r.warehouse ? kv('Warehouse', esc(r.warehouse)) : ''}${['Rfid Tag', 'Barcode', 'Custom Field 16', 'Packing slip', 'Custom Field 17', 'Custom Field 12'].map(k => kv(k, none())).join('')}
        ${kv('Receipts_Source', 'USA')}${['Carrier Name', 'money', 'Custom Date', 'Text Box CF'].map(k => kv(k, none())).join('')}${kv('Custom Field 13', 'USA')}${['Custom Field 18', 'CF Attachments', 'custom_field_2'].map(k => kv(k, none())).join('')}
        ${kv('Exported', 'No (<span class="lnk">Change</span>)')}${kv('Evidencia recepcion', none())}
      </div>
      <div class="sect2">PO Line</div>
      <table class="c1 grey" style="border:1px solid #ddd"><thead><tr><th>PO</th><th>Line</th><th>Schedule Line #</th><th>Req</th><th>Line</th><th>Description</th><th>Supplier</th><th class="r">Ordered</th><th>Unit</th><th class="r">Price</th><th class="r">Total</th><th class="r">Landed Cost</th><th class="r">Total with Landed Cost</th><th>Need By</th><th class="r">Received</th></tr></thead>
        <tbody><tr><td><span class="lnk">${r.po}</span></td><td>${r.poLine}</td><td>${r.refs && r.refs.length ? r.refs.join('<br>') : none()}</td><td><span class="lnk">4102</span></td><td>1</td><td>${esc(r.item)} ${I.edit.replace('width="20" height="20"', 'width="13" height="13"')}</td><td><span class="lnk">${esc(r.supplier)}</span></td><td class="r">${r.ordered || r.qty || ''}</td><td>${none(r.uom)}</td><td class="r">${money(r.price)}</td><td class="r">${money(r.price * (r.ordered || r.qty || 0))}</td><td></td><td></td><td>${none(r.needBy)}</td><td class="r">${q1(r.qty || 0)}</td></tr></tbody></table>
      <div style="display:flex;justify-content:flex-end;gap:14px;margin-top:30px"><span class="btn">Return</span><span class="btn">Edit Receipt</span></div>
      <div class="sect2">Void</div>
      <div class="kv"><div class="k">Qty to Void</div><div class="v"><input class="inp" style="width:156px"> <label><input type="checkbox" class="native"> All</label><div style="font-size:10.5px;color:#555;margin-top:6px">${r.qty || 0} eligible for void</div></div></div>
      <div class="kv" style="margin-top:10px"><div class="k">Reason for Voiding</div><div class="v"><select class="inp" style="width:194px"><option>Select</option></select></div></div>
      <div class="kv" style="margin-top:10px"><div class="k">Void Note</div><div class="v"><textarea class="inp" rows="5" style="width:390px" placeholder="Provide optional note"></textarea></div></div>
      <div style="display:flex;justify-content:flex-end;gap:14px;align-items:center;margin-top:8px"><span class="lnk" data-a="go" data-to="#/buyer/receipts">« View All Receipts</span><span class="btn disabled">Void Receipt</span></div>
      <div class="sect2">${I.clock} Integration History</div><div>No Records Found</div>
      <div class="sect2" style="margin-top:50px">${I.clock} History</div>
      <div class="hist"><span class="who">${esc(r.receiver)}</span> on <b>${r.date}</b> at <b>10:42 AM</b><div>${r.type} ${r.id} Created</div></div>
    </div>` + buyerFooter;
  }

  // ================================================================ prototype menu
  let menuOpen = false;
  function vProto() {
    const it = (l, to, dim) => `<div class="i ${dim ? 'dim' : ''}" ${dim ? '' : `data-a="go" data-to="${to}"`}>${l}</div>`;
    const firstKey = (receiveRows().find(r => r.qty - r.received > 0) || {}).key;
    const firstRcpt = allReceipts()[0];
    return `<div class="proto"><span class="btn sm" data-a="menu">Prototype ▾</span>${menuOpen ? `<div class="menu">
      <div class="h">Supplier · CSP</div>${it('1 · Purchase Orders', '#/csp/orders')}${it('2 · Flip to ASN (PO 3627)', '#/csp/flip/3627')}${it('3 · Draft ASN', '#/csp/asn/new', !S.draft)}${it('4 · Manage / Add PO lines', '#/csp/manage', !S.draft)}${it('5 · Advance Ship Notices', '#/csp/asns')}
      <hr><div class="h">Buyer · Inventory</div>${it('6 · Receive › ASN Lines', '#/buyer/receive')}${it('7 · ASN Detailed Receipt', firstKey ? `#/buyer/receive/detail/${encodeURIComponent(firstKey)}` : '', !firstKey)}${it('8 · View Receipts', '#/buyer/receipts')}${it('9 · View Receipt', firstRcpt ? `#/buyer/receipts/${firstRcpt.id}` : '', !firstRcpt)}
      <hr><div class="i" data-a="sampleAsn">Load sample ASN (ASN-3627-01, 5 lines)</div><div class="i" data-a="reset">Reset prototype</div></div>` : ''}</div>`;
  }
  function loadSample() {
    S = fresh();
    for (const k of ['3627-1', '3627-2', '3626-1', '3626-2', '3625-1']) S.sel['P:' + k] = true;
    S.picker = { mode: 'flip', firstPo: '3627' }; const lines = buildLines(); S.picker = null; S.sel = {};
    S.draft = { asnNo: 'ASN-3627-01', gross: '', shipDate: D.today, expDate: '', att: 'hello', tracking: '', carrier: '', lines };
    submitDraft(); S.banner = null; save(); location.hash = '#/buyer/receive'; toast('Sample ASN-3627-01 submitted from the supplier side');
  }
  function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }

  // ================================================================ router
  function render() {
    const h = location.hash || '#/csp/orders';
    let html = '';
    const m = h.match(/^#\/(\w+)\/?([^/]*)\/?([^/]*)\/?(.*)$/) || [];
    const [, area, a, b, c] = m;
    document.title = (area === 'buyer' ? 'Coupa · ' : 'Coupa Supplier Portal · ') + 'ASN at PO Delivery Schedule Line Level';
    if (area === 'csp') {
      if (a === 'orders') html = vOrders();
      else if (a === 'flip') { if (!S.picker || S.picker.mode !== 'flip') { history.replaceState(null, '', '#/csp/orders'); openPicker('flip', b || '3627'); return; } html = vOrders(); }
      else if (a === 'asn' && b === 'new') html = vDraft();
      else if (a === 'manage') { if (S.draft && (!S.picker || S.picker.mode !== 'manage')) { history.replaceState(null, '', '#/csp/asn/new'); openPicker('manage'); return; } html = vDraft(); }
      else if (a === 'asns') html = vAsns();
      else html = vOrders();
    } else if (area === 'buyer') {
      if (a === 'receive' && b === 'detail') html = vDetail(decodeURIComponent(c));
      else if (a === 'receive') html = vReceive();
      else if (a === 'receipts' && b) html = vReceipt(b);
      else if (a === 'receipts') html = vReceipts();
      else html = vReceive();
    } else if (area === 'proto') {
      if (a === 'sample') { loadSample(); return; }
      if (a === 'draft') { S = fresh(); for (const k of ['3627-1', '3627-2', '3626-1', '3626-2', '3625-1']) S.sel['P:' + k] = true; S.picker = { mode: 'flip', firstPo: '3627' }; finishPicker(); return; }
      if (a === 'reset') { localStorage.removeItem(KEY); S = fresh(); location.hash = '#/csp/orders'; return; }
      html = vOrders();
    } else html = vOrders();
    if (S.picker && area === 'csp') html += vPicker();
    $app.innerHTML = html + vProto();
  }
  window.addEventListener('hashchange', () => { if (!/^#\/csp/.test(location.hash)) S.picker = null; S.errors = {}; if (!/receipts/.test(location.hash) && S.banner && S.banner.receipts) S.banner = null; if (!/asns/.test(location.hash) && S.banner === 'asn') S.banner = null; save(); render(); window.scrollTo(0, 0); });

  // ================================================================ events
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-a]'); if (!el) { if (menuOpen && !e.target.closest('.proto')) { menuOpen = false; render(); } return; }
    const a = el.dataset.a, k = el.dataset.k;
    if (a !== 'menu' && menuOpen && !el.closest('.menu')) menuOpen = false;
    switch (a) {
      case 'go': menuOpen = false; if (el.dataset.to) { if (location.hash === el.dataset.to) render(); else location.hash = el.dataset.to; } break;
      case 'menu': menuOpen = !menuOpen; render(); break;
      case 'flip': openPicker('flip', el.dataset.po); break;
      case 'manage': openPicker('manage'); break;
      case 'closePicker': S.picker = null; S.confirm = null; save(); render(); break;
      case 'exp': S.exp[k] = !(S.exp[k] !== undefined ? S.exp[k] : !getLine(...k.split('-')).collapsed); save(); render(); break;
      case 'expAll': for (const l of D.poLines) S.exp[lk(l)] = true; save(); render(); break;
      case 'colAll': for (const l of D.poLines) S.exp[lk(l)] = false; save(); render(); break;
      case 'selP': { const l = getLine(...k.split('-')); const st = parentState(l);
        for (const s of l.sch) delete S.sel['S:' + sk(l, s)];
        if (st === 'on') delete S.sel['P:' + k]; else S.sel['P:' + k] = true; save(); render(); break; }
      case 'selS': { const id = 'S:' + k; if (S.sel[id]) delete S.sel[id]; else S.sel[id] = true; save(); render(); break; }
      case 'selAll': { const c = counts(); S.sel = {}; if (c.sel < c.total) for (const l of D.poLines) if (lineRem(l) > 0) S.sel['P:' + lk(l)] = true; save(); render(); break; }
      case 'clearSel': S.sel = {}; save(); render(); break;
      case 'pickerOk': pickerOk(); break;
      case 'confirmPick': S.confirm.choice = el.dataset.v; save(); render(); break;
      case 'confirmCancel': S.confirm = null; save(); render(); break;
      case 'confirmOk': if (S.confirm.choice === 'po') for (const key of S.confirm.keys) { const l = getLine(...key.split('-')); for (const s of l.sch) delete S.sel['S:' + sk(l, s)]; S.sel['P:' + key] = true; } finishPicker(); break;
      case 'rmLine': S.draft.lines.splice(+el.dataset.i, 1); S.errors = {}; save(); render(); break;
      case 'saveDraft': save(); toast('ASN draft saved'); break;
      case 'cancelDraft': S.draft = null; S.errors = {}; save(); location.hash = '#/csp/orders'; break;
      case 'submit': submitDraft(); break;
      case 'dismiss': S.banner = null; save(); render(); break;
      case 'xp': S.xp[el.dataset.w] = !S.xp[el.dataset.w]; save(); render(); break;
      case 'detail': S.dr = null; S.errors = {}; location.hash = `#/buyer/receive/detail/${encodeURIComponent(k)}`; break;
      case 'submitDetail': submitDetail(k); break;
      case 'quickReceive': quickReceive(); break;
      case 'qrAll': { const on = el.checked; S.qr = {}; if (on) for (const r of receiveRows()) { const o = r.qty - r.received; if (o > 0) S.qr[r.key] = String(o); } save(); render(); break; }
      case 'sampleAsn': menuOpen = false; loadSample(); break;
      case 'reset': localStorage.removeItem(KEY); S = fresh(); menuOpen = false; location.hash = '#/csp/orders'; render(); toast('Prototype reset'); break;
    }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.dataset.f === 'pq') { S.picker.q = t.value; save(); const pos = t.selectionStart; render(); const n = document.querySelector('[data-f="pq"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } return; }
    if (t.dataset.f && t.dataset.f.startsWith('d.')) { S.draft[t.dataset.f.slice(2)] = t.value; save(); return; }
    if (t.dataset.f && t.dataset.f.startsWith('q.')) { S.draft.lines[+t.dataset.f.slice(2)].qty = t.value; save(); return; }
    if (t.dataset.f === 'dr.qty') { S.dr.qty = t.value; save(); return; }
    if (t.dataset.qr !== undefined) { S.qr = S.qr || {}; S.qr[t.dataset.qr] = t.value; save(); return; }
  });
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.f === 'dr.action') { S.dr.action = t.value; save(); render(); }
    if (t.dataset.f === 'dr.wh') { S.dr.wh = t.value; save(); render(); }
    if (t.dataset.f === 'dr.qty') { render(); }
    if (t.dataset.qa !== undefined) { S.qr = S.qr || {}; S.qr[t.dataset.qa] = t.checked ? t.dataset.open : ''; save(); render(); }
  });

  if (!location.hash) location.hash = '#/csp/orders';
  render();
})();
