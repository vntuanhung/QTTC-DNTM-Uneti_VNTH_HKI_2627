(function () {
'use strict';
var CFG = window.APP_CONFIG, MAXA = CFG.MAX_ATTEMPTS || 5;
var CLASSES = ['DHTM18A4HN', 'DHTM18A1CL', 'DHTM18A1HN', 'DHTM18A3HN', 'DHLQ17A2HN'];
var ST = { active: null, qmap: {}, user: null, token: null, bank: null, config: [], history: [], tab: 'home', exam: null, timer: null, busy: false };
var $ = function (s) { return document.querySelector(s); };
var app = $('#app');

function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmtNum(x, d) { if (x == null || isNaN(x)) return ''; return Number(x).toLocaleString('vi-VN', { minimumFractionDigits: d == null ? 0 : d, maximumFractionDigits: d == null ? 2 : d }); }
function fmtTime(sec) { sec = Math.max(0, Math.floor(sec)); var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return (h ? h + ':' : '') + String(m).padStart(h ? 2 : 1, '0') + ':' + String(s).padStart(2, '0'); }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleString('vi-VN', { hour12: false, dateStyle: 'short', timeStyle: 'short' }) : ''; }
function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.remove('hidden'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.add('hidden'); }, 3500); }
function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } return null; }

function api(action, data) {
  if (/DAN-URL/.test(CFG.API_URL)) return Promise.reject(new Error('Chưa cấu hình API_URL trong config.js'));
  var body = Object.assign({ action: action, token: ST.token }, data || {});
  return fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j.ok) { if (j.error === 'SESSION_EXPIRED') { logout(true); throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'); } throw new Error(j.error || 'Lỗi không xác định'); }
      return j;
    });
}

/* ---------------- Dữ liệu tuần / đề ---------------- */
function weekInfo(w) { return ST.bank.weeks.filter(function (x) { return x.week === w; })[0]; }
function weekCfg(w) { return ST.config.filter(function (c) { return c.week === w; })[0] || { week: w, open: true, from: '', to: '' }; }
function isOpen(c) { var n = Date.now(); if (!c.open) return false; if (c.from && n < Date.parse(c.from)) return false; if (c.to && n > Date.parse(c.to)) return false; return true; }
function lockText(c) { if (!c.open) return 'Đang khóa'; if (c.from && Date.now() < Date.parse(c.from)) return 'Mở lúc ' + fmtDate(c.from); if (c.to && Date.now() > Date.parse(c.to)) return 'Đã đóng lúc ' + fmtDate(c.to); return ''; }
function findQuestion(qid) { return ST.qmap[qid] || null; }
var L = 'ABCD';
function keyText(q, d) {
  if (!q) return String(d.k);
  if (q.type === 'mcq') { var i = L.indexOf(d.k); return d.k + '. ' + (q.options[i] || ''); }
  return fmtNum(Number(d.k), 2) + ' ' + (d.u || '');
}
function ansText(q, d) {
  if (!d.a) return '(bỏ trống)';
  if (q && q.type === 'mcq') { var i = L.indexOf(String(d.a).toUpperCase()); return d.a + '. ' + (q.options[i] || ''); }
  return d.a + (q && q.unit ? ' ' + q.unit : '');
}

/* ---------------- Khung chung ---------------- */
function setNav() {
  var tabs = [['home', 'Ôn tập theo tuần'], ['history', 'Lịch sử làm bài'], ['rank', 'Bảng xếp hạng']];
  if (ST.user.admin) { tabs.push(['admin', 'Quản trị']); }
  $('#nav').innerHTML = tabs.map(function (t) { return '<button data-t="' + t[0] + '" class="' + (ST.tab === t[0] ? 'on' : '') + '">' + t[1] + '</button>'; }).join('');
  $('#whoami').textContent = ST.user.name + ' · ' + ST.user.msv + ' · ' + ST.user.lop;
  $('#top').classList.remove('hidden');
}
$('#nav').addEventListener('click', function (e) { var t = e.target.getAttribute('data-t'); if (t) go(t); });
$('#logout').addEventListener('click', function () { if (!ST.exam || confirm('Bài đang làm chưa lưu sẽ được giữ nháp trên máy này. Đăng xuất?')) logout(); });

function go(tab) {
  stopTimer(); ST.exam = null; ST.tab = tab; setNav();
  if (tab === 'home') renderHome(); else if (tab === 'history') renderHistory(); else if (tab === 'rank') renderRank(); else if (tab === 'admin') renderAdmin();
  window.scrollTo(0, 0);
}
function logout(silent) {
  stopTimer(); ST.user = null; ST.token = null; ST.exam = null; ST.active = null; store('qttc_session', null);
  $('#top').classList.add('hidden'); renderLogin();
}
function stopTimer() { if (ST.timer) { clearInterval(ST.timer); ST.timer = null; } }

/* ---------------- Đăng nhập ---------------- */
function renderLogin(msg) {
  var prev = store('qttc_last') || {};
  app.innerHTML = '<div class="card login"><h1>Đăng nhập ôn tập</h1><p class="mut">Môn Quản trị tài chính trong doanh nghiệp thương mại</p>' +
    '<label>Họ và tên</label><input id="l_name" autocomplete="name" value="' + esc(prev.name || '') + '">' +
    '<label>Mã sinh viên</label><input id="l_msv" inputmode="numeric" autocomplete="off" value="' + esc(prev.msv || '') + '">' +
    '<label>Lớp học phần</label><select id="l_lop"><option value="">-- Chọn lớp --</option>' + CLASSES.concat(['GV_admin']).map(function (c) { return '<option ' + (prev.lop === c ? 'selected' : '') + '>' + c + '</option>'; }).join('') + '</select>' +
    '<div id="l_keyw" class="hidden"><label>Mật khẩu giảng viên</label><input id="l_key" type="password"></div>' +
    '<div id="l_err" class="err ' + (msg ? '' : 'hidden') + '">' + esc(msg || '') + '</div>' +
    '<p><button id="l_go" class="btn" style="width:100%">Đăng nhập</button></p></div>';
  var sel = $('#l_lop'); var sync = function () { $('#l_keyw').classList.toggle('hidden', sel.value !== 'GV_admin'); }; sel.onchange = sync; sync();
  var doLogin = function () {
    var b = $('#l_go'), err = $('#l_err'); err.classList.add('hidden'); b.disabled = true; b.textContent = 'Đang đăng nhập…';
    var d = { name: $('#l_name').value, msv: $('#l_msv').value, lop: sel.value, key: $('#l_key').value };
    api('login', d).then(function (j) {
      ST.user = j.user; ST.token = j.token; ST.config = j.config; store('qttc_session', { token: j.token, user: j.user, t: Date.now() }); store('qttc_last', { name: d.name, msv: d.msv, lop: d.lop });
      return afterLogin();
    }).catch(function (e) { err.textContent = e.message; err.classList.remove('hidden'); b.disabled = false; b.textContent = 'Đăng nhập'; });
  };
  $('#l_go').onclick = doLogin;
  app.onkeydown = function (e) { if (e.key === 'Enter' && $('#l_go')) doLogin(); };
}
function afterLogin() {
  return refreshState().then(function () { ST.tab = 'home'; go('home'); });
}
function refreshState() {
  return api('state').then(function (j) { ST.active = j.active; ST.history = j.attempts; });
}

/* ---------------- Trang chủ: chọn tuần ---------------- */
function weekStats(w) { var l = ST.history.filter(function (a) { return a.week === w; }); return { n: l.length, best: l.length ? Math.max.apply(null, l.map(function (a) { return a.score; })) : null }; }
function renderHome() {
  var act = ST.active;
  var html = '<h1>Chọn tuần ôn tập</h1><p class="mut">Mỗi lần bắt đầu, hệ thống <b>chọn ngẫu nhiên</b> đề từ ngân hàng câu hỏi của tuần (khác nhau giữa các sinh viên và giữa các lần làm). Tuần 1: 20 câu trắc nghiệm lý thuyết. Tuần 2–14 (trừ tuần 5, 11): 5 câu trắc nghiệm + 15 câu tính toán điền đáp số. Mỗi câu 5 điểm, tổng 100 điểm. Bạn được <b>lưu bài tối đa ' + MAXA + ' lần</b> trong một đề; hoàn thành (nộp) đề này mới được làm đề khác.</p>';
  if (act) {
    html += '<div class="card" style="border-color:var(--pri)"><h2>Bạn đang làm dở một đề</h2><div>Tuần ' + act.week + ' · bắt đầu ' + esc(fmtDate(act.startedAt)) + ' · đã lưu ' + act.saves + (ST.user.admin ? ' lần' : '/' + MAXA + ' lần') + ' · thời gian đã làm ' + fmtTime(act.seconds) + '</div><p><button class="btn" id="h_resume">Tiếp tục làm đề</button></p></div>';
  }
  html += '<div class="grid">';
  ST.bank.weeks.forEach(function (w) {
    var c = weekCfg(w.week), open = isOpen(c), canStart = open || ST.user.admin, st = weekStats(w.week);
    html += '<div class="card"><div style="display:flex;justify-content:space-between;gap:8px"><h2>Tuần ' + w.week + '</h2><span class="pill ' + (open ? 'open' : 'lock') + '">' + (open ? 'Đang mở' : 'Khóa') + '</span></div>' +
      '<div><b>' + esc(w.title) + '</b></div><div class="mut">' + esc(w.chapter) + '</div>' +
      '<div class="mut">' + (w.calc ? w.theory + ' trắc nghiệm + ' + w.calc + ' tính toán' : w.theory + ' trắc nghiệm') + '</div>' +
      '<div class="mut">Đã hoàn thành ' + st.n + ' đề' + (st.best != null ? ' · cao nhất ' + fmtNum(st.best, 1) : '') + '</div>';
    if (!open) html += '<div class="mut">' + esc(lockText(c)) + '</div>';
    else if (c.to) html += '<div class="mut">Đóng lúc ' + esc(fmtDate(c.to)) + '</div>';
    html += '<p><button class="btn start" data-w="' + w.week + '" ' + (!canStart || act ? 'disabled' : '') + '>Làm đề mới (ngẫu nhiên)</button></p></div>';
  });
  app.innerHTML = html + '</div>';
  var r = $('#h_resume'); if (r) r.onclick = function () { openExam(); };
  app.querySelectorAll('.start').forEach(function (b) {
    b.onclick = function () {
      b.disabled = true; b.textContent = 'Đang tạo đề…';
      api('start', { week: Number(b.getAttribute('data-w')) }).then(function (j) { ST.active = j.active; openExam(); })
        .catch(function (e) { toast(e.message); refreshState().then(renderHome); });
    };
  });
}

/* ---------------- Làm bài ---------------- */
function draftKey(id) { return 'qttc_draft_' + ST.user.msv + '_' + id; }
function openExam() {
  var a = ST.active; if (!a) return go('home');
  var d = store(draftKey(a.id));
  ST.exam = { id: a.id, week: a.week, qids: a.qids, answers: d && d.answers ? d.answers : Object.assign({}, a.answers), baseSec: a.seconds, t0: Date.now(), saves: a.saves };
  ST.tab = 'home'; setNav(); stopTimer(); renderExam();
  ST.timer = setInterval(function () { var t = $('#tm'); if (t) t.textContent = fmtTime(elapsed()); }, 1000);
  window.scrollTo(0, 0);
}
function elapsed() { return ST.exam.baseSec + (Date.now() - ST.exam.t0) / 1000; }
function saveDraft() { store(draftKey(ST.exam.id), { answers: ST.exam.answers }); }
function renderExam() {
  var ex = ST.exam;
  var html = '<div class="timer"><div><b>Tuần ' + ex.week + ' – Đề ngẫu nhiên</b><div class="mut" id="sv">Đã lưu ' + ex.saves + (ST.user.admin ? ' lần (không giới hạn)' : '/' + MAXA + ' lần') + '</div></div><div class="t" id="tm">' + fmtTime(elapsed()) + '</div><div><button class="btn sec" id="x_save">Lưu bài</button> <button class="btn" id="x_sub">Nộp bài & chấm điểm</button></div></div>';
  ex.qids.forEach(function (id, i) {
    var q = findQuestion(id); if (!q) return;
    html += '<div class="q"><div><span class="n">Câu ' + (i + 1) + '.</span> ' + esc(q.text) + ' <span class="mut">(5 điểm)</span></div>';
    if (q.type === 'mcq') {
      q.options.forEach(function (o, j) {
        html += '<label class="opt" style="font-weight:400;margin:0"><input type="radio" name="' + q.id + '" value="' + L[j] + '" ' + (ex.answers[q.id] === L[j] ? 'checked' : '') + '><span><b>' + L[j] + '.</b> ' + esc(o) + '</span></label>';
      });
    } else {
      html += '<div class="fill"><input data-q="' + q.id + '" inputmode="decimal" placeholder="Nhập đáp số" value="' + esc(ex.answers[q.id] || '') + '"><span>' + esc(q.unit || '') + '</span></div>';
    }
    html += '</div>';
  });
  html += '<p class="mut">Đáp số làm tròn 2 chữ số thập phân, 1 năm = 360 ngày; nhập dấu phẩy hoặc dấu chấm thập phân đều được. Bạn được lưu bài tối đa ' + MAXA + ' lần để làm tiếp sau; ' + (ST.user.admin ? '<b>Tài khoản giảng viên được lưu không giới hạn.</b>' : '<b>nếu lưu thêm lần nữa sau ' + MAXA + ' lần, bài sẽ tự động được chấm và nộp, không thể làm lại.</b>') + '</p>';
  app.innerHTML = html;
  app.querySelectorAll('input[type=radio]').forEach(function (r) { r.onchange = function () { ex.answers[r.name] = r.value; saveDraft(); }; });
  app.querySelectorAll('input[data-q]').forEach(function (r) { r.oninput = function () { ex.answers[r.getAttribute('data-q')] = r.value; saveDraft(); }; });
  $('#x_save').onclick = saveExam;
  $('#x_sub').onclick = submitExam;
}
function setBusy(b) { ['#x_save', '#x_sub'].forEach(function (s) { var e = $(s); if (e) e.disabled = b; }); }
function saveExam() {
  var ex = ST.exam;
  if (!ST.user.admin && ex.saves >= MAXA && !confirm('Bạn đã dùng hết ' + MAXA + ' lần lưu. Lưu thêm sẽ TỰ ĐỘNG chấm điểm và nộp bài, không thể làm lại. Tiếp tục?')) return;
  setBusy(true);
  api('save', { id: ex.id, answers: ex.answers, seconds: elapsed() }).then(function (j) {
    if (j.finished) return finishExam(j);
    ex.saves = j.saves; ST.active.saves = j.saves; ST.active.answers = Object.assign({}, ex.answers); ST.active.seconds = Math.round(elapsed());
    $('#sv').textContent = 'Đã lưu ' + j.saves + (ST.user.admin ? ' lần (không giới hạn)' : '/' + MAXA + ' lần');
    toast('Đã lưu bài (lần ' + j.saves + (ST.user.admin ? ')' : '/' + MAXA + ')') + (!ST.user.admin && j.saves >= MAXA ? ' – đây là lần lưu cuối, lần lưu tiếp theo sẽ tự động nộp bài' : '')); setBusy(false);
  }).catch(function (e) { toast(e.message); setBusy(false); });
}
function submitExam() {
  var ex = ST.exam, blank = ex.qids.filter(function (id) { return !String(ex.answers[id] || '').trim(); }).length;
  if (!confirm((blank ? 'Còn ' + blank + ' câu chưa trả lời. ' : '') + 'Nộp bài và chấm điểm? Sau khi nộp bạn không thể làm lại đề này.')) return;
  setBusy(true);
  api('submit', { id: ex.id, answers: ex.answers, seconds: elapsed() }).then(finishExam).catch(function (e) { toast(e.message); setBusy(false); });
}
function finishExam(j) {
  var ex = ST.exam; stopTimer(); store(draftKey(ex.id), null);
  ST.active = null; ST.exam = null;
  ST.history.push({ id: j.id, time: j.time, week: j.week, score: j.score, correct: j.correct, total: j.total, seconds: j.seconds, detail: j.detail });
  renderResult(j);
}
function renderResult(j) {
  var html = '<div class="card" style="text-align:center"><div class="mut">Tuần ' + j.week + (j.auto ? ' · bài được tự động nộp do đã lưu quá ' + MAXA + ' lần' : '') + '</div><div class="score">' + fmtNum(j.score, 1) + '/100</div><div>Đúng ' + j.correct + '/' + j.total + ' câu · thời gian làm bài ' + fmtTime(j.seconds) + '</div>' +
    '<p><button class="btn" id="r_home">Về trang chọn tuần</button> <button class="btn sec" id="r_rank">Xem xếp hạng</button></p></div>';
  html += '<div class="card"><h2>Các câu bỏ trống hoặc làm sai</h2><p class="mut">Đề đã nộp không thể làm lại; bạn có thể xem lại các câu này trong mục Lịch sử làm bài.</p></div>' + reviewHtml(j.detail, true);
  app.innerHTML = html; setNav();
  $('#r_home').onclick = function () { go('home'); };
  $('#r_rank').onclick = function () { ST.rankWeek = j.week; go('rank'); };
  window.scrollTo(0, 0);
}
function reviewHtml(detail, onlyWrong) {
  var list = detail.map(function (d, i) { return { d: d, i: i }; }).filter(function (x) { return !onlyWrong || !x.d.ok; });
  if (!list.length) return '<div class="card">Bạn trả lời đúng tất cả các câu. Tuyệt vời!</div>';
  return list.map(function (x) {
    var d = x.d, q = findQuestion(d.q);
    return '<div class="q ' + (d.ok ? 'ok' : 'bad') + '"><div><span class="n">Câu ' + (x.i + 1) + '</span> ' + (d.ok ? '✓ Đúng' : (d.a ? '✗ Sai' : '✗ Bỏ trống')) + '</div><div>' + esc(q ? q.text : d.q) + '</div>' +
      '<div class="mut">Bạn trả lời: <b>' + esc(ansText(q, d)) + '</b></div>' + (d.ok ? '' : '<div class="mut">Đáp án đúng: <b>' + esc(keyText(q, d)) + '</b></div>') +
      (d.s && q && q.type === 'fill' ? '<div class="exp">' + esc(d.s) + '</div>' : '') + '</div>';
  }).join('');
}

/* ---------------- Lịch sử ---------------- */
function renderHistory() {
  var h = ST.history.slice().sort(function (a, b) { return a.time < b.time ? 1 : -1; });
  if (!h.length) { app.innerHTML = '<h1>Lịch sử làm bài</h1><div class="card">Bạn chưa làm bài ôn tập nào.</div>'; return; }
  var avg = h.reduce(function (s, a) { return s + a.score; }, 0) / h.length;
  var cor = h.reduce(function (s, a) { return s + a.correct; }, 0), tot = h.reduce(function (s, a) { return s + a.total; }, 0);
  var html = '<h1>Lịch sử làm bài</h1><div class="stats"><div class="stat">Số lượt làm<b>' + h.length + '</b></div><div class="stat">Điểm trung bình<b>' + fmtNum(avg, 1) + '</b></div><div class="stat">Tỷ lệ làm đúng<b>' + fmtNum(cor / tot * 100, 1) + '%</b></div><div class="stat">Số đề đã nộp<b>' + h.length + '</b></div></div>';
  var byW = {}; h.forEach(function (a) { (byW[a.week] = byW[a.week] || []).push(a); });
  html += '<div class="card"><h2>Theo từng tuần</h2><table><tr><th>Tuần</th><th>Số lượt</th><th>Điểm TB</th><th>Cao nhất</th><th>% đúng</th></tr>' +
    Object.keys(byW).sort(function (a, b) { return a - b; }).map(function (w) {
      var l = byW[w], c = l.reduce(function (s, a) { return s + a.correct; }, 0), t = l.reduce(function (s, a) { return s + a.total; }, 0);
      return '<tr><td>' + w + '</td><td>' + l.length + '</td><td>' + fmtNum(l.reduce(function (s, a) { return s + a.score; }, 0) / l.length, 1) + '</td><td>' + fmtNum(Math.max.apply(null, l.map(function (a) { return a.score; })), 1) + '</td><td>' + fmtNum(c / t * 100, 1) + '%</td></tr>';
    }).join('') + '</table></div>';
  html += '<div class="card"><h2>Các đề đã nộp</h2><table><tr><th>Nộp lúc</th><th>Tuần</th><th>Điểm</th><th>Đúng</th><th>Thời lượng</th><th></th></tr>' +
    h.map(function (a, i) { return '<tr><td>' + esc(fmtDate(a.time)) + '</td><td>' + a.week + '</td><td><b>' + fmtNum(a.score, 1) + '</b></td><td>' + a.correct + '/' + a.total + '</td><td>' + fmtTime(a.seconds) + '</td><td><button class="link" data-i="' + i + '">Xem câu sai/bỏ trống</button></td></tr>'; }).join('') + '</table></div>';
  // câu sai (theo lần làm gần nhất của từng câu)
  var latest = {}; ST.history.slice().sort(function (a, b) { return a.time < b.time ? -1 : 1; }).forEach(function (a) { (a.detail || []).forEach(function (d) { var o = latest[d.q] || (latest[d.q] = { wrong: 0, last: null }); if (!d.ok) o.wrong++; o.last = d; }); });
  var wrongs = Object.keys(latest).filter(function (k) { return !latest[k].last.ok; });
  html += '<div class="card"><h2>Các câu làm sai (' + wrongs.length + ')</h2><p class="mut">Hiển thị các câu mà lần làm gần nhất của bạn vẫn sai.</p>' +
    (wrongs.length ? reviewHtml(wrongs.map(function (k) { return latest[k].last; }), true) : '<div>Không có câu sai nào – tuyệt vời!</div>') + '</div>';
  app.innerHTML = html;
  app.querySelectorAll('button[data-i]').forEach(function (b) {
    b.onclick = function () { var a = h[Number(b.getAttribute('data-i'))]; app.innerHTML = '<p><button class="btn sec" id="h_back">← Quay lại</button></p><div class="card"><h2>Tuần ' + a.week + ' · bài đã nộp</h2><div class="score">' + fmtNum(a.score, 1) + '/100</div><div class="mut">' + esc(fmtDate(a.time)) + ' · ' + fmtTime(a.seconds) + '</div></div>' + reviewHtml(a.detail, true); $('#h_back').onclick = renderHistory; window.scrollTo(0, 0); };
  });
}

/* ---------------- Bảng xếp hạng ---------------- */
function defaultWeek() {
  var open = ST.bank.weeks.filter(function (w) { return isOpen(weekCfg(w.week)); });
  return (open.length ? open[open.length - 1] : ST.bank.weeks[0]).week;
}
function renderRank(week, lop) {
  week = week || ST.rankWeek || defaultWeek(); lop = lop || ST.rankLop || CLASSES[0]; ST.rankWeek = week; ST.rankLop = lop;
  var html = '<h1>Bảng xếp hạng theo tuần</h1><div class="card"><div class="row"><div><label>Tuần</label><select id="k_w">' + ST.bank.weeks.map(function (w) { return '<option value="' + w.week + '" ' + (w.week === week ? 'selected' : '') + '>Tuần ' + w.week + ' – ' + esc(w.title) + '</option>'; }).join('') + '</select></div>' +
    (ST.user.admin ? '<div><label>Lớp</label><select id="k_l">' + CLASSES.map(function (c) { return '<option ' + (c === lop ? 'selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' : '') + '</div>' +
    '<p class="mut">Điểm tuần = điểm trung bình các đề đã nộp trong tuần. Cùng điểm thì bạn làm ít đề hơn xếp trên.</p><div id="k_t">Đang tải…</div></div>';
  app.innerHTML = html;
  $('#k_w').onchange = function () { renderRank(Number(this.value), ST.rankLop); };
  var kl = $('#k_l'); if (kl) kl.onchange = function () { renderRank(ST.rankWeek, this.value); };
  api('leaderboard', { week: week, lop: lop }).then(function (j) {
    var t = $('#k_t'); if (!t) return;
    if (!j.rows.length) { t.innerHTML = 'Chưa có ai làm bài trong tuần này (lớp ' + esc(j.lop) + ').'; return; }
    var me = j.rows.filter(function (r) { return r.me; })[0];
    t.innerHTML = (me ? '<p><b>Thứ hạng của bạn: ' + me.rank + '/' + j.rows.length + '</b> (lớp ' + esc(j.lop) + ')</p>' : '') +
      '<table><tr><th>Hạng</th><th>Họ tên</th><th>MSV</th><th>Điểm</th><th>Số đề đã ôn</th></tr>' + j.rows.map(function (r) { return '<tr class="' + (r.me ? 'me' : '') + '"><td>' + r.rank + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.msv) + '</td><td>' + fmtNum(r.score, 2) + '</td><td>' + r.exams + '</td></tr>'; }).join('') + '</table>';
  }).catch(function (e) { var t = $('#k_t'); if (t) t.innerHTML = '<div class="err">' + esc(e.message) + '</div>'; });
}

/* ---------------- Quản trị ---------------- */
function toLocalInput(iso) { if (!iso) return ''; var d = new Date(iso), p = function (n) { return String(n).padStart(2, '0'); }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes()); }
function renderAdmin() {
  api('config').then(function (j) {
    ST.config = j.config;
    var html = '<h1>Quản trị: mở / khóa bài tập tuần</h1><div class="card"><p class="mut">Đặt thời điểm mở và đóng cho từng tuần (để trống = không giới hạn). Bỏ chọn "Mở" để khóa hẳn tuần. Giờ hiển thị theo múi giờ máy của bạn.</p>' +
      '<table><tr><th>Tuần</th><th>Mở</th><th>Từ</th><th>Đến</th><th>Ghi chú</th></tr>' + ST.bank.weeks.map(function (w) {
        var c = weekCfg(w.week);
        return '<tr data-w="' + w.week + '"><td>' + w.week + '</td><td><input type="checkbox" class="a_o" style="width:auto" ' + (c.open ? 'checked' : '') + '></td><td><input type="datetime-local" class="a_f" value="' + toLocalInput(c.from) + '"></td><td><input type="datetime-local" class="a_t" value="' + toLocalInput(c.to) + '"></td><td><input class="a_n" value="' + esc(c.note || '') + '"></td></tr>';
      }).join('') + '</table><p><button class="btn" id="a_save">Lưu cấu hình</button></p></div>';
    app.innerHTML = html;
    $('#a_save').onclick = function () {
      var cfg = [].map.call(app.querySelectorAll('tr[data-w]'), function (tr) {
        var f = tr.querySelector('.a_f').value, t = tr.querySelector('.a_t').value;
        return { week: Number(tr.getAttribute('data-w')), open: tr.querySelector('.a_o').checked, from: f ? new Date(f).toISOString() : '', to: t ? new Date(t).toISOString() : '', note: tr.querySelector('.a_n').value };
      });
      this.disabled = true; var b = this;
      api('setConfig', { config: cfg }).then(function (r) { ST.config = r.config; toast('Đã lưu cấu hình'); }).catch(function (e) { toast(e.message); }).then(function () { b.disabled = false; });
    };
  }).catch(function (e) { app.innerHTML = '<div class="err">' + esc(e.message) + '</div>'; });
}

/* ---------------- Khởi động ---------------- */
function boot() {
  fetch('questions.json').then(function (r) { return r.json(); }).then(function (b) {
    ST.bank = b; ST.qmap = {}; b.weeks.forEach(function (w) { w.questions.forEach(function (q) { ST.qmap[q.id] = q; }); });
    var s = store('qttc_session');
    if (s && s.token && Date.now() - s.t < 5.5 * 3600 * 1000) {
      ST.token = s.token; ST.user = s.user;
      return api('config').then(function (j) { ST.config = j.config; return afterLogin(); }).catch(function () { logout(true); });
    }
    renderLogin();
  }).catch(function () { app.innerHTML = '<div class="err">Không tải được dữ liệu đề (questions.json).</div>'; });
}
boot();
})();
