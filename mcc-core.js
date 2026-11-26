/* mcc-core.js – v26.05: câu vẽ đồ thị MCC trong đề ôn tập (tuần 10, Chương 5 – Bài tập).
   Dùng chung dữ liệu đề với mcc-data.js. Được app.js gọi qua window.MCC. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(x, d) { return Number(x).toLocaleString('vi-VN', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function parseNum(s) {
    s = String(s == null ? '' : s).trim().replace(/\s+/g, '').replace(/%$/, '');
    if (!s) return NaN;
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
    else s = s.replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
  }
  var css = '.mcc-text p{margin:6px 0}.mcc-de{margin:6px 0;padding-left:20px}.mcc-de li{margin:3px 0}' +
    '.mcc-grid{display:grid;grid-template-columns:minmax(260px,340px) 1fr;gap:14px;align-items:start;margin-top:10px}@media(max-width:820px){.mcc-grid{grid-template-columns:1fr}}' +
    '.mcc-blk{border:1px solid var(--line,rgba(30,50,110,.14));border-radius:14px;padding:10px 12px;margin-top:10px;background:var(--field,rgba(255,255,255,.7))}.mcc-blk>b{display:block;font-size:14px;color:var(--pri,#2a4fd6);margin-bottom:6px}' +
    '.mcc-kh{display:grid;grid-template-columns:140px 1fr;gap:8px;align-items:center;margin:6px 0}.mcc-kh span{font-size:13.5px;color:var(--mut,#56627a)}.mcc-kh input{padding:8px 10px}' +
    '.mcc-chart{background:var(--field,rgba(255,255,255,.7));border:1px solid var(--line,rgba(30,50,110,.14));border-radius:14px;padding:6px}.mcc-svg{width:100%;height:auto;display:block;color:var(--ink,#152033)}' +
    '.mcc-svg .ax{stroke:var(--ink,#152033);stroke-width:1.4}.mcc-svg .gridl{stroke:var(--line,rgba(30,50,110,.14));stroke-width:1}.mcc-svg .seg{stroke:var(--pri,#2a4fd6);stroke-width:4;stroke-linecap:round}' +
    '.mcc-svg .segk{stroke:#16a34a;stroke-width:3;stroke-dasharray:9 6;stroke-linecap:round}.mcc-svg .jump{stroke:var(--pri2,#5b7cff);stroke-width:1.6;stroke-dasharray:5 5}.mcc-svg .jumpk{stroke:#16a34a}' +
    '.mcc-svg .guide{stroke:var(--mut,#56627a);stroke-width:1;stroke-dasharray:3 4;opacity:.7}.mcc-svg .tl{font:12.5px "Cambria Math",Cambria,"Times New Roman",serif;fill:var(--mut,#56627a)}' +
    '.mcc-svg .lab{font:600 14px "Cambria Math",Cambria,"Times New Roman",serif;fill:var(--pri,#2a4fd6)}.mcc-svg .labk{fill:#16a34a}.mcc-svg .axt{font:600 13px system-ui,sans-serif;fill:var(--ink,#152033)}' +
    '.mcc-legend{display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--mut,#56627a);margin:6px 0}.mcc-legend span{display:inline-block;width:26px;height:0;border-top:4px solid var(--pri,#2a4fd6);margin-left:8px}.mcc-legend .lg2{border-top:3px dashed #16a34a}' +
    '.mcc-sol table{font-size:14px;margin:8px 0}.mcc-k{font:16px/1.7 "Cambria Math",Cambria,"Times New Roman",serif}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  function bank() { return (window.MCC_BANK || []).filter(Boolean); }
  function idx(qid) { return Number(String(qid).split('-')[1]); }

  /* Tính lời giải đầy đủ từ số liệu đề */
  function solve(raw) {
    var q = JSON.parse(JSON.stringify(raw)); q.t = q.t || 20; q.plim = q.plim || null; q.re = q.ni - q.dv;
    var bp = [];
    q.lims.forEach(function (L, i) { bp.push({ v: Math.round(L / (q.wd / 100)), src: 'd', calc: fmt(L) + ' / ' + q.wd + '%', why: 'Lãi suất vay tăng ' + q.rates[i] + '% → ' + q.rates[i + 1] + '%' }); });
    if (q.plim && q.fp.length > 1) bp.push({ v: Math.round(q.plim / (q.wp / 100)), src: 'p', calc: fmt(q.plim) + ' / ' + q.wp + '%', why: 'Chi phí phát hành CPƯĐ tăng ' + fmt(q.fp[0], 1) + ' → ' + fmt(q.fp[1], 1) + ' USD/CP' });
    bp.push({ v: Math.round(q.re / (q.we / 100)), src: 'e', calc: fmt(q.re) + ' / ' + q.we + '%', why: 'Hết LN giữ lại → phát hành CP thường mới' });
    bp.sort(function (a, b) { return a.v - b.v; });
    q.kd = q.rates.map(function (r) { return r * (1 - q.t / 100); });
    q.kp = q.fp.map(function (x) { return q.Dp / (q.Pp - x) * 100; });
    q.D1 = q.D0 * (1 + q.g / 100); q.ke = q.D1 / q.P0 * 100 + q.g; q.kn = q.D1 / (q.P0 * (1 - q.f / 100)) * 100 + q.g;
    q.bp = bp; q.bps = bp.map(function (b) { return b.v; });
    q.ints = [0].concat(q.bps).map(function (x) {
      var di = bp.filter(function (b) { return b.src === 'd' && b.v <= x; }).length, pi = bp.filter(function (b) { return b.src === 'p' && b.v <= x; }).length, ei = bp.some(function (b) { return b.src === 'e' && b.v <= x; });
      var d = q.kd[di], p = q.kp[pi], e = ei ? q.kn : q.ke;
      return { d: d, p: p, e: e, v: Math.round((q.wd / 100 * d + q.wp / 100 * p + q.we / 100 * e) * 100 + 1e-9) / 100 };
    });
    return q;
  }
  function deHtml(q) {
    var debt = q.lims.length === 1 ? 'dưới ' + fmt(q.lims[0]) + ' USD lãi suất ' + q.rates[0] + '%; từ ' + fmt(q.lims[0]) + ' USD trở lên lãi suất ' + q.rates[1] + '%.'
      : 'dưới ' + fmt(q.lims[0]) + ' USD lãi suất ' + q.rates[0] + '%; từ ' + fmt(q.lims[0]) + ' đến dưới ' + fmt(q.lims[1]) + ' USD lãi suất ' + q.rates[1] + '%; từ ' + fmt(q.lims[1]) + ' USD trở lên lãi suất ' + q.rates[2] + '%.';
    var pref = q.plim && q.fp.length > 1 ? 'chi phí phát hành ' + fmt(q.fp[0], 1) + ' USD/CP, nếu phát hành vượt ' + fmt(q.plim) + ' USD thì tăng lên ' + fmt(q.fp[1], 1) + ' USD/CP.' : 'chi phí phát hành ' + fmt(q.fp[0], 1) + ' USD/CP (không đổi theo quy mô phát hành).';
    return '<p><b>' + esc(q.co) + '</b> có cơ cấu vốn tối ưu: nợ dài hạn ' + q.wd + '%, cổ phiếu ưu đãi ' + q.wp + '%, cổ phiếu thường ' + q.we + '%. Thuế suất thuế TNDN ' + (q.t || 20) + '%.</p><ul class="mcc-de">' +
      '<li>Vay nợ: ' + debt + '</li><li>Lãi ròng dự kiến ' + fmt(q.ni) + ' USD, chia cổ tức cho cổ đông thường ' + fmt(q.dv) + ' USD.</li>' +
      '<li>Cổ phiếu thường: giá ' + q.P0 + ' USD, cổ tức năm ngoái ' + fmt(q.D0, 1) + ' USD, tăng đều ' + q.g + '%/năm; phát hành mới chịu chi phí ' + q.f + '% giá bán.</li>' +
      '<li>Cổ phiếu ưu đãi: giá ' + q.Pp + ' USD, cổ tức ' + fmt(q.Dp, 1) + ' USD/năm; ' + pref + '</li></ul>' +
      '<p><b>Yêu cầu:</b> Xác định các điểm gãy, tính WACC của từng khoảng vốn và vẽ đồ thị MCC (WACC làm tròn 2 chữ số thập phân). Chấm theo tỷ lệ giá trị đúng; chọn sai số điểm gãy thì câu này 0 điểm.</p>';
  }

  /* Vẽ SVG: series = [{bp:[số], w:[số], cls:'seg'|'segk', lab:true}] */
  function niceStep(range, cnt) { var raw = range / cnt, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p; }
  function svg(series, hint) {
    var W = 640, H = 430, L = 72, R = 24, T = 24, B = 78, out = [];
    var allBp = [], allW = [];
    series.forEach(function (s) { s.bp.forEach(function (x, i) { if (isFinite(x) && x > 0 && (i === 0 || x > s.bp[i - 1])) allBp.push(x); }); s.w.forEach(function (x) { if (isFinite(x)) allW.push(x); }); });
    var maxBp = allBp.length ? Math.max.apply(null, allBp) : 0;
    var xMax = maxBp ? maxBp * 1.3 : 1000000, xs = niceStep(xMax, 5); xMax = Math.ceil(xMax / xs) * xs;
    var yLo = allW.length ? Math.min.apply(null, allW) : 8, yHi = allW.length ? Math.max.apply(null, allW) : 14;
    var ys = niceStep(Math.max(yHi - yLo, 1) * 1.6, 5), yMin = Math.max(0, Math.floor((yLo - ys) / ys) * ys), yMax = Math.ceil((yHi + ys) / ys) * ys;
    var X = function (v) { return L + (v / xMax) * (W - L - R); }, Y = function (v) { return T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B); };
    out.push('<defs><marker id="mar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>');
    for (var gy = yMin; gy <= yMax + 1e-9; gy += ys) out.push('<line class="gridl" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(gy) + '" y2="' + Y(gy) + '"/><text class="tl" x="' + (L - 8) + '" y="' + (Y(gy) + 4) + '" text-anchor="end">' + fmt(gy, ys < 1 ? 1 : 0) + '%</text>');
    for (var gx = 0; gx <= xMax + 1e-9; gx += xs) out.push('<text class="tl" x="' + X(gx) + '" y="' + (H - B + 18) + '" text-anchor="middle">' + (gx >= 1e6 ? fmt(gx / 1e6, gx % 1e6 ? 1 : 0) + ' tr' : fmt(gx / 1000) + 'k') + '</text>');
    out.push('<line class="ax" x1="' + L + '" y1="' + (H - B) + '" x2="' + (W - R + 6) + '" y2="' + (H - B) + '" marker-end="url(#mar)"/><line class="ax" x1="' + L + '" y1="' + (H - B) + '" x2="' + L + '" y2="' + (T - 10) + '" marker-end="url(#mar)"/>');
    out.push('<text class="axt" x="' + (W - R) + '" y="' + (H - 12) + '" text-anchor="end">Quy mô vốn (USD)</text><text class="axt" x="14" y="' + (T - 8) + '">WACC (%)</text>');
    var drawn = 0;
    series.forEach(function (s, si) {
      var n = s.bp.length, ok = s.bp.map(function (x, i) { return isFinite(x) && x > 0 && (i === 0 || (isFinite(s.bp[i - 1]) && x > s.bp[i - 1])); }), prev = null;
      for (var k = 0; k <= n; k++) {
        var a = k === 0 ? 0 : (ok[k - 1] ? s.bp[k - 1] : NaN), b = k === n ? xMax : (ok[k] ? s.bp[k] : NaN), wv = s.w[k];
        if (!isFinite(a) || !isFinite(b) || !isFinite(wv) || b <= a) { prev = null; continue; }
        drawn++;
        out.push('<line class="' + s.cls + '" x1="' + X(a) + '" y1="' + Y(wv) + '" x2="' + X(b) + '" y2="' + Y(wv) + '"/>');
        if (s.lab) out.push('<text class="lab' + (si ? ' labk' : '') + '" x="' + ((X(a) + X(b)) / 2) + '" y="' + (Y(wv) + (si ? 18 : -9)) + '" text-anchor="middle">' + fmt(wv, 2) + '%</text>');
        if (prev && Math.abs(prev.x - a) < 1e-6) out.push('<line class="jump' + (si ? ' jumpk' : '') + '" x1="' + X(a) + '" y1="' + Y(prev.w) + '" x2="' + X(a) + '" y2="' + Y(wv) + '"/>');
        prev = { x: b, w: wv };
      }
      if (si === 0) s.bp.forEach(function (x, i) {
        if (!ok[i]) return;
        out.push('<line class="guide" x1="' + X(x) + '" x2="' + X(x) + '" y1="' + (H - B) + '" y2="' + T + '"/><text class="lab" x="' + X(x) + '" y="' + (H - B + 36 + (i % 2) * 16) + '" text-anchor="middle" style="font-size:12.5px">BP' + (i + 1) + ' = ' + fmt(x) + '</text>');
      });
    });
    if (!drawn) out.push('<text class="tl" x="' + ((L + W - R) / 2) + '" y="' + ((T + H - B) / 2) + '" text-anchor="middle" style="font-size:15px">' + esc(hint || '') + '</text>');
    return '<svg class="mcc-svg" viewBox="0 0 640 430" role="img" aria-label="Đồ thị MCC">' + out.join('') + '</svg>';
  }

  /* ----- Trong đề thi ----- */
  function question(qid) {
    var raw = bank()[idx(qid) - 1];
    return { id: qid, type: 'mcc', raw: raw, text: raw ? 'Vẽ đồ thị MCC – ' + raw.co : 'Vẽ đồ thị MCC (chưa tải được đề)' };
  }
  function examHtml(q, saved) {
    if (!q.raw) return '<div class="err">Không tải được đề vẽ đồ thị (mcc-data.js). Hãy tải lại trang.</div>';
    var a = {}; try { a = JSON.parse(saved || '{}') || {}; } catch (e) { a = {}; }
    return '<div class="mcc" data-mq="' + esc(q.id) + '"><div class="mcc-text">' + deHtml(q.raw) + '</div><div class="mcc-grid"><div>' +
      '<label>Đường MCC có bao nhiêu điểm gãy?</label><select class="mcc-n"><option value="">-- Chọn --</option>' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<option ' + (Number(a.n) === n ? 'selected' : '') + '>' + n + '</option>'; }).join('') + '</select>' +
      '<div class="mcc-in"></div></div><div class="mcc-chart"></div></div></div>';
  }
  function inputsHtml(n, a) {
    if (!n) return '<div class="mut" style="margin-top:8px">n điểm gãy chia quy mô vốn thành n + 1 khoảng.</div>';
    var h = '<div class="mcc-blk"><b>Các điểm gãy (USD)</b>';
    for (var i = 1; i <= n; i++) h += '<div class="mcc-kh"><span>BP<sub>' + i + '</sub> =</span><input data-bp="' + i + '" inputmode="decimal" placeholder="VD: 600.000" value="' + esc((a.bp || [])[i - 1] || '') + '"></div>';
    h += '</div><div class="mcc-blk"><b>WACC của từng khoảng vốn (%)</b>';
    for (var k = 1; k <= n + 1; k++) {
      var rng = k === 1 ? '0 → BP<sub>1</sub>' : k === n + 1 ? 'Trên BP<sub>' + n + '</sub>' : 'BP<sub>' + (k - 1) + '</sub> → BP<sub>' + k + '</sub>';
      h += '<div class="mcc-kh"><span>Khoảng ' + k + ' (' + rng + ')</span><input data-w="' + k + '" inputmode="decimal" placeholder="VD: 10,58" value="' + esc((a.w || [])[k - 1] || '') + '"></div>';
    }
    return h + '</div>';
  }
  function bind(root, onChange) {
    root.querySelectorAll('.mcc[data-mq]').forEach(function (box) {
      var qid = box.getAttribute('data-mq'), sel = box.querySelector('.mcc-n'), inb = box.querySelector('.mcc-in'), ch = box.querySelector('.mcc-chart');
      var read = function () {
        var n = Number(sel.value) || 0, bp = [], w = [];
        for (var i = 1; i <= n; i++) { var e = box.querySelector('[data-bp="' + i + '"]'); bp.push(e ? e.value : ''); }
        for (var k = 1; k <= n + 1 && n; k++) { var e2 = box.querySelector('[data-w="' + k + '"]'); w.push(e2 ? e2.value : ''); }
        return { n: n, bp: bp, w: w };
      };
      var redraw = function () {
        var a = read();
        ch.innerHTML = svg([{ bp: a.bp.map(parseNum), w: a.w.map(parseNum), cls: 'seg', lab: true }], a.n ? 'Nhập điểm gãy và WACC để đường MCC hiện ra' : 'Chọn số điểm gãy để bắt đầu');
        return a;
      };
      var emit = function () { var a = redraw(); onChange(qid, a.n ? JSON.stringify(a) : ''); };
      var build = function (keep) {
        var prev = keep ? read() : { bp: [], w: [] };
        inb.innerHTML = inputsHtml(Number(sel.value) || 0, prev);
        inb.querySelectorAll('input').forEach(function (el) { el.addEventListener('input', emit); });
      };
      var saved = {}; try { saved = JSON.parse(onChange.saved(qid) || '{}') || {}; } catch (e) { saved = {}; }
      inb.innerHTML = inputsHtml(Number(sel.value) || 0, saved);
      inb.querySelectorAll('input').forEach(function (el) { el.addEventListener('input', emit); });
      sel.addEventListener('change', function () { build(true); emit(); });
      redraw();
    });
  }

  /* ----- Sau khi nộp: so sánh + lời giải ----- */
  function reviewHtml(d, num) {
    var raw = bank()[idx(d.q) - 1], a = {}, key = {};
    try { a = JSON.parse(d.a || '{}') || {}; } catch (e) { a = {}; }
    try { key = JSON.parse(d.k || '{}') || {}; } catch (e) { key = {}; }
    var pt = Number(d.pt) || 0, mx = Number(d.mx) || 5;
    var tag = d.ok ? '<span class="tag ok">✓ Đúng · ' + fmt(pt, 2) + '/' + mx + ' điểm</span>' : (d.a ? '<span class="tag bad">' + (pt > 0 ? 'Đúng một phần' : '✗ Sai') + ' · ' + fmt(pt, 2) + '/' + mx + ' điểm</span>' : '<span class="tag bad">✗ Bỏ trống · 0/' + mx + ' điểm</span>');
    var h = '<div class="q ' + (d.ok ? 'ok' : 'bad') + '"><div class="qh"><span class="n">Câu ' + num + ' – Vẽ đồ thị MCC</span>' + tag + '</div>';
    if (!raw) return h + '<div class="mut">Không tải được đề (mcc-data.js).</div></div>';
    var q = solve(raw), n = q.bps.length;
    h += '<div class="mcc-text">' + deHtml(raw) + '</div>';
    h += '<div class="ans"><div>Bạn chọn: <b>' + (a.n ? a.n + ' điểm gãy' : '(bỏ trống)') + '</b> · đáp án: <b>' + n + ' điểm gãy</b>' + (d.tot ? ' · đúng ' + (d.good || 0) + '/' + d.tot + ' giá trị' : '') + '</div></div>';
    h += '<div class="mcc-legend"><span class="lg1"></span> Đồ thị của bạn <span class="lg2"></span> Đồ thị đáp án</div>';
    h += '<div class="mcc-chart">' + svg([{ bp: (a.bp || []).map(parseNum), w: (a.w || []).map(parseNum), cls: 'seg', lab: true }, { bp: q.bps, w: q.ints.map(function (x) { return x.v; }), cls: 'segk', lab: true }], '') + '</div>';
    var p2 = function (x) { return fmt(x, 2) + '%'; };
    h += '<div class="exp mcc-sol"><div class="sl KQ"><b>Lời giải</b><span>LN giữ lại = ' + fmt(q.ni) + ' − ' + fmt(q.dv) + ' = ' + fmt(q.re) + ' USD</span></div>' +
      '<div class="tw"><table><tr><th>Điểm gãy</th><th>Nguyên nhân</th><th>Cách tính</th><th>Kết quả (USD)</th></tr>' +
      q.bp.map(function (b, i) { return '<tr><td>BP<sub>' + (i + 1) + '</sub></td><td>' + esc(b.why) + '</td><td>' + esc(b.calc) + '</td><td><b>' + fmt(b.v) + '</b></td></tr>'; }).join('') + '</table></div>' +
      '<div class="mcc-k"><i>k</i><sub>d</sub>: ' + q.rates.map(function (r, i) { return r + '% × (1 − ' + q.t + '%) = ' + p2(q.kd[i]); }).join('; ') +
      '<br><i>k</i><sub>p</sub>: ' + q.fp.map(function (x, i) { return fmt(q.Dp, 1) + ' / (' + q.Pp + ' − ' + fmt(x, 1) + ') = ' + p2(q.kp[i]); }).join('; ') +
      '<br><i>D</i><sub>1</sub> = ' + fmt(q.D0, 1) + ' × (1 + ' + q.g + '%) = ' + fmt(q.D1, 4) + '; <i>k</i><sub>e</sub> = ' + fmt(q.D1, 4) + ' / ' + q.P0 + ' + ' + q.g + '% = ' + p2(q.ke) + '; <i>k</i><sub>n</sub> = ' + fmt(q.D1, 4) + ' / [' + q.P0 + ' × (1 − ' + q.f + '%)] + ' + q.g + '% = ' + p2(q.kn) + '</div>' +
      '<div class="tw"><table><tr><th>Khoảng vốn (USD)</th><th>Vay (' + q.wd + '%)</th><th>CPƯĐ (' + q.wp + '%)</th><th>CP thường (' + q.we + '%)</th><th>WACC</th></tr>' +
      q.ints.map(function (it, k) { var a0 = k === 0 ? 0 : q.bps[k - 1], b0 = q.bps[k]; return '<tr><td>' + (b0 ? fmt(a0) + ' – ' + fmt(b0) : 'Trên ' + fmt(a0)) + '</td><td>' + p2(it.d) + '</td><td>' + p2(it.p) + '</td><td>' + p2(it.e) + '</td><td><b>' + p2(it.v) + '</b></td></tr>'; }).join('') + '</table></div>' +
      '<div class="mut">Đường MCC có dạng bậc thang đi lên, gãy tại ' + q.bps.map(function (b) { return fmt(b); }).join('; ') + ' USD.</div></div></div>';
    return h;
  }

  window.MCC = { isId: function (qid) { return String(qid).indexOf('MCC-') === 0; }, question: question, examHtml: examHtml, bind: bind, reviewHtml: reviewHtml };
})();
