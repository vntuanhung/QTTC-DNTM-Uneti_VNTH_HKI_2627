/* extras.js – v26.05: lịch sử phiên bản (pop-up) + liên kết "Vẽ đồ thị MCC" trên thanh menu */
(function () {
  'use strict';
  var CUR = { v: 'v26.05', d: '26/11/2026' };
  var HIST = [
    { v: 'v26.05', d: '26/11/2026', items: ['Cập nhật nội dung bài tập mới: bộ 50 đề luyện vẽ đồ thị chi phí sử dụng vốn cận biên (MCC).', 'Bổ sung lịch sử phiên bản.'] },
    { v: 'v26.04', d: '24/11/2026', items: ['Cập nhật giao diện website.', 'Cập nhật cơ chế ôn tập và làm bài mới.', 'Chỉnh sửa cơ chế trên hệ thống.'] },
    { v: 'v26.03', d: '16/11/2026', items: ['Cập nhật giao diện website.', 'Cập nhật cơ chế ôn tập và làm bài mới.', 'Chỉnh sửa lỗi hệ thống trên máy chủ.'] },
    { v: 'v26.02', d: '06/11/2026', items: ['Chỉnh sửa và cập nhật nội dung các câu hỏi học tập.', 'Chỉnh sửa lỗi hệ thống trên máy chủ.'] },
    { v: 'v26.01', d: '28/10/2026', items: ['Tích hợp hệ thống câu hỏi các tuần.', 'Tích hợp đăng nhập làm bài.'] }
  ];
  var css = '' +
    '.verlink{background:none;border:0;padding:0;font:inherit;font-weight:700;color:var(--pri,#2a4fd6);text-decoration:underline;cursor:pointer}' +
    '.vmodal{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(10,15,30,.35);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}' +
    '.vbox{width:min(560px,100%);max-height:85vh;overflow:auto;border-radius:22px;padding:20px 22px;background:var(--card,rgba(255,255,255,.75));-webkit-backdrop-filter:saturate(180%) blur(24px);backdrop-filter:saturate(180%) blur(24px);border:1px solid var(--glass-b,rgba(255,255,255,.8));box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 24px 60px rgba(20,30,80,.3);color:var(--ink,#152033);-webkit-user-select:text;user-select:text}' +
    '@media(prefers-color-scheme:dark){.vbox{background:rgba(24,32,56,.88)}}' +
    '.vbox h2{margin:0 0 12px;font-size:20px}.vbox .vx{float:right;border:0;background:var(--acc,rgba(72,110,255,.1));color:var(--ink,#152033);border-radius:99px;width:34px;height:34px;font-size:18px;cursor:pointer}' +
    '.vitem{padding:12px 0;border-top:1px solid var(--line,rgba(30,50,110,.12))}.vitem:first-of-type{border-top:0}' +
    '.vitem h3{margin:0 0 4px;font-size:15.5px}.vitem h3 span{font-weight:500;color:var(--mut,#56627a);font-size:14px}.vitem ul{margin:4px 0 0;padding-left:20px}.vitem li{margin:3px 0;font-size:14.5px}' +
    '.vtag{display:inline-block;margin-left:6px;padding:1px 8px;border-radius:99px;font-size:11.5px;font-weight:700;background:rgba(40,180,110,.16);color:#177245;vertical-align:2px}' +
    'nav a.navx{display:inline-block;padding:8px 15px;border-radius:99px;color:var(--ink,#152033);text-decoration:none;font-weight:500;white-space:nowrap}nav a.navx:hover{background:var(--acc,rgba(72,110,255,.1))}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function openHist() {
    var m = document.createElement('div'); m.className = 'vmodal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Lịch sử phiên bản');
    m.innerHTML = '<div class="vbox"><button class="vx" aria-label="Đóng">×</button><h2>Lịch sử phiên bản</h2>' + HIST.map(function (h, i) {
      return '<div class="vitem"><h3>Phiên bản ' + h.v + ' <span>(cập nhật ngày ' + h.d + ')</span>' + (i === 0 ? '<span class="vtag">Hiện tại</span>' : '') + '</h3><ul>' + h.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    }).join('') + '</div>';
    var close = function () { m.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    m.addEventListener('click', function (e) { if (e.target === m || e.target.classList.contains('vx')) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(m); m.querySelector('.vx').focus();
  }
  function setVer() {
    document.querySelectorAll('.foot-ver').forEach(function (el) {
      el.innerHTML = 'Phiên bản: <button class="verlink" type="button" title="Xem lịch sử phiên bản">' + CUR.v + '</button> (cập nhật ngày ' + CUR.d + ').';
      el.querySelector('.verlink').addEventListener('click', openHist);
    });
  }
  function addNav() {
    var nav = document.getElementById('nav'); if (!nav || nav.querySelector('.navx') || !nav.children.length) return;
    var a = document.createElement('a'); a.className = 'navx'; a.href = 'mcc.html'; a.textContent = 'Vẽ đồ thị MCC';
    var ref = nav.querySelector('[data-t="history"]'); nav.insertBefore(a, ref || null);
  }
  function init() {
    setVer(); addNav();
    var nav = document.getElementById('nav');
    if (nav && window.MutationObserver) new MutationObserver(addNav).observe(nav, { childList: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
