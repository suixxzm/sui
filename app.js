/* =========================================================
   가상 휴대폰 연애 시뮬레이션 (기본 휴대폰 틀)
   순수 HTML/CSS/JS (빌드 없음). 데이터는 config.js 에서 고쳐요.
   ========================================================= */
(function () {
  'use strict';
  var C = window.CONFIG;
  /* config.js 에 문법 오류가 있으면 검은 화면 대신 안내를 보여줘요 */
  if (!C) {
    var errBox = document.getElementById('phone');
    if (errBox) {
      errBox.innerHTML = '<div style="position:absolute;inset:0;background:#111;color:#fff;padding:70px 20px;font:15px/1.6 -apple-system,sans-serif;overflow:auto">' +
        '<b style="font-size:20px">config.js 를 읽지 못했어요</b><br><br>config.js 안에 쉼표( , ), 괄호( { } [ ] ), 따옴표( &quot; ) 가 빠졌거나 남아 있어요.<div id="cfgWhy" style="margin-top:14px;color:#ffd479">어디가 문제인지 찾는 중…</div></div>';
      var why = document.getElementById('cfgWhy');
      var escH = function (t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
      try {
        fetch('./config.js', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (txt) {
          var lines = txt.split('\n'), keys = [];
          lines.forEach(function (ln, i) { if (/^  [A-Za-z_][A-Za-z0-9_]*\s*:/.test(ln)) { keys.push(i); } });
          var bad = [];
          keys.forEach(function (st, k) {
            var en = k + 1 < keys.length ? keys[k + 1] : lines.length;
            var seg = lines.slice(st, en);
            while (seg.length && /^\s*(\};?|\)\;?)?\s*$/.test(seg[seg.length - 1]) && k + 1 === keys.length) { seg.pop(); }
            var code = seg.join('\n');
            try { new Function('return {' + code + (k + 1 < keys.length ? '\nzz__:1' : '') + '\n}'); }
            catch (e) { bad.push({ name: lines[st].trim().split(':')[0], from: st + 1, to: st + seg.length, msg: e.message, seg: seg, st: st }); }
          });
          if (!bad.length) { why.innerHTML = '항목별로는 문제를 못 찾았어요. 파일 맨 위(<b>window.CONFIG = {</b>)나 맨 아래(<b>};</b>)를 확인해 주세요.<br>오류: ' + escH((window.__cfgErr || {}).msg || ''); return; }
          var o = '문제가 있는 항목: <b>' + escH(bad[0].name) + '</b> (config.js ' + bad[0].from + '~' + bad[0].to + '번 줄)<br>오류: ' + escH(bad[0].msg) + '<br><br>';
          var sl = bad[0].seg, base0 = bad[0].st;
          var its = [];
          sl.forEach(function (ln, i) { if (/^\s{4}[\{\[]/.test(ln)) { its.push(i); } });
          var hit = [];
          its.forEach(function (a0, k) {
            var b0 = k + 1 < its.length ? its[k + 1] : sl.length;
            var ch = sl.slice(a0, b0).join('\n').replace(/[\s,]*$/, '');
            var chk = /^\s*\/\//.test(ch) ? '' : ch;
            try { new Function('return [' + ch.replace(/\/\/[^\n]*$/, '') + '\n]'); } catch (e) { hit.push([a0, b0]); }
          });
          if (hit.length) { var h0 = hit[0]; base0 += h0[0]; sl = sl.slice(h0[0], h0[1] + 1); o += '정확히 이 부분이 이상해요 (' + (base0 + 1) + '번 줄부터):<br>'; }
          o += '<div style="font:11px/1.5 Menlo,monospace;color:#ccc;white-space:pre;overflow:auto;background:#1c1c1c;padding:8px;border-radius:8px">';
          sl.slice(0, 60).forEach(function (ln, i) { o += (base0 + i + 1) + '  ' + escH(ln.length > 90 ? ln.slice(0, 90) + '…' : ln) + '\n'; });
          o += '</div>';
          if (bad.length > 1) { o += '<br>그 밖에 의심되는 항목: ' + bad.slice(1).map(function (x) { return escH(x.name) + '(' + x.from + '줄)'; }).join(', '); }
          why.innerHTML = o;
        })['catch'](function () { why.textContent = '파일을 다시 읽지 못했어요.'; });
      } catch (e) { why.textContent = ''; }
    }
    return;
  }
  /* config.js 에 없는 새 항목은 여기 기본값을 써요 (config.js 를 덜 고쳐도 화면이 뜨게) */
  var DEF = {
    TODAY: "2026-10-24", TIME: "8:00", DATE: "", CARRIER: "SKT", PASSCODE: "1107",
    IMG: { lockWallpaper: "./wallpaper-lock.jpg", homeWallpaper: "./wallpaper-home.jpg", startBg: "./start-bg.jpg" },
    NOTIFS: [], CALLS: [], VOICEMAIL_BADGE: "", NEWS: [], MESSAGES: [], GALLERY: [], TRASH: [],
    TWEETS: [], DMS: [], NOTIS: [], QUOTES: [], REPOSTS: [], TRENDS: [], SEARCH_KEYWORD: "",
    KAKAO: { FRIENDS: [], ROOMS: {} }, YOUTUBE_URL: "https://www.youtube.com", X_FOLLOWERS: 0,
    DM_FIRST_DELAY: 4000, DM_GAP_MIN: 7000, DM_GAP_MAX: 15000, IG_REQ_POPS: 0
  };
  Object.keys(DEF).forEach(function (k) { if (C[k] === undefined) { C[k] = DEF[k]; } });
  /* 인스타그램 기본 내용 (config.js 에 INSTA 가 없을 때 이 내용을 써요. 고치려면 config.js 에 INSTA 를 붙여넣고 수정하세요) */
  var IG_DEF = { bio: "", posts: [], stories: [], requests: [], dm: { user: "", msgs: [] } };
  /* index.html 이 예전 것이어도 insta.js 를 직접 읽어와요 */
  if (!window.INSTA_CONFIG) {
    try {
      var xi = new XMLHttpRequest();
      xi.open('GET', './insta.js?t=' + Date.now(), false);
      xi.send();
      if (xi.status === 200 || (xi.status === 0 && xi.responseText)) { (new Function(xi.responseText))(); }
    } catch (e) {}
  }
  if (window.INSTA_CONFIG) { C.INSTA = window.INSTA_CONFIG; }
  if (!C.INSTA) { C.INSTA = IG_DEF; }
  /* 게임 속 날짜(TODAY)와 시작 시각(TIME) */
  var TD = (function () { var a = String(C.TODAY).split('-'); return [parseInt(a[0], 10), parseInt(a[1], 10), parseInt(a[2], 10)]; })();
  var BASE_TD = TD.slice();
  function makeDate() { return TD[1] + '월 ' + TD[2] + '일 ' + ['일', '월', '화', '수', '목', '금', '토'][new Date(TD[0], TD[1] - 1, TD[2]).getDay()] + '요일'; }
  var DATE_AUTO = !C.DATE;
  if (!C.DATE) { C.DATE = makeDate(); }
  var START_T = (function () { var m = String(C.TIME || '8:00').match(/(\d+):(\d+)/); return m ? (m[1].length < 2 ? '0' : '') + m[1] + ':' + m[2] : '08:00'; })();
  if (!C.KAKAO.ROOMS) { C.KAKAO.ROOMS = {}; }
  if (!C.KAKAO.FRIENDS) { C.KAKAO.FRIENDS = []; }
  /* 쪽지(DMS) 중 time 이 시작 시각보다 이른 것은 이미 와 있던 쪽지, 나머지는 게임 중에 차례로 도착해요 */
  var DM_PRE = 0;
  while (DM_PRE < C.DMS.length && String(C.DMS[DM_PRE].time) < START_T) { DM_PRE++; }
  /* 폰 안의 시간: config 의 TIME(예: 8:00)에서 시작해서 실제 시간처럼 1분에 1분씩 흘러요 */
  var CLOCK0 = Date.now();
  var CLOCK_BASE = (function () {
    var m = String(C.TIME || '8:00').match(/(\d+):(\d+)/);
    return m ? parseInt(m[1], 10) * 60 + parseInt(m[2], 10) : 480;
  })();
  function clockMin() { return (CLOCK_BASE + Math.floor((Date.now() - CLOCK0) / 60000)) % 1440; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function clockStr() { var t = clockMin(); return Math.floor(t / 60) + ':' + pad2(t % 60); }
  function clockHHMM() { var t = clockMin(); return pad2(Math.floor(t / 60)) + ':' + pad2(t % 60); }
  var phone = document.getElementById('phone');

  /* ---------- 유틸 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function comma(n) { return Number(n).toLocaleString('en-US'); }
  function compact(n) {
    if (n >= 10000) { return (Math.round(n / 1000) / 10) + '만'; }
    return comma(n);
  }
  function qs(r, s) { return r.querySelector(s); }
  function qsa(r, s) { return Array.prototype.slice.call(r.querySelectorAll(s)); }

  /* ---------- 저장소 (못 써도 에러 없이) ---------- */
  var mem = {};
  var store = {
    get: function (k) {
      try { var v = localStorage.getItem(k); if (v !== null) { return v; } } catch (e) {}
      return mem[k] === undefined ? null : mem[k];
    },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem(k, v); } catch (e) {} },
    del: function (k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) {} }
  };

  var notifOff = false;
  try { notifOff = (localStorage.getItem('sim2.notifOff') === '1'); } catch (e) {}
  function setNotifOff(v) { notifOff = !!v; try { localStorage.setItem('sim2.notifOff', v ? '1' : '0'); } catch (e) {} }
  var USER = { last: '', first: '', name: '', igId: '' };
  function fullName() { return (USER.last || '') + (USER.first || USER.name || ''); }
  function saveUser() { USER.name = USER.first; try { store.set('sim2.user', JSON.stringify(USER)); } catch (e) {} }
  function loadUser() {
    var raw = store.get('sim2.user');
    if (!raw) { return false; }
    try {
      var u = JSON.parse(raw);
      if (u && (u.first || u.name) && u.igId) { USER = { last: u.last || '', first: u.first || u.name, name: u.first || u.name, igId: u.igId }; return true; }
    } catch (e) {}
    return false;
  }
  function handleReset() {
    try {
      if (/[?&]reset=1/.test(location.search)) {
        store.del('sim2.user'); store.del('sim2.dm'); store.del('sim2.dmRead'); store.del('sim2.sms'); store.del('sim2.smsOrder'); store.del('sim2.kkav');
        if (history.replaceState) { history.replaceState(null, '', location.pathname); }
      }
    } catch (e) {}
  }
  function isStandalone() {
    try {
      return window.navigator.standalone === true ||
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
    } catch (e) { return false; }
  }

  /* ---------- 아이콘 ---------- */
  var I = {};
  I.signal = '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>';
  I.wifi = '<svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M8.5 2.2c2.5 0 4.7.9 6.4 2.6l1.1-1.2C14 1.7 11.4.7 8.5.7S3 1.7 1 3.6l1.1 1.2c1.7-1.7 3.9-2.6 6.4-2.6z"/><path d="M8.5 5.5c1.5 0 2.800.5 3.800 1.500l1.100-1.200C12.100 4.600 10.400 3.900 8.500 3.900S4.900 4.600 3.600 5.800l1.100 1.200c1-1 2.300-1.500 3.800-1.500z"/><circle cx="8.5" cy="9.7" r="1.7"/></svg>';
  I.batt = '<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="22" height="12" rx="3.6" fill="none" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="19" height="9" rx="2.3" fill="currentColor"/><path d="M24 4.5v4c.9-.3 1.5-1.2 1.5-2s-.6-1.7-1.5-2z" fill="currentColor" opacity=".5"/></svg>';
  I.lock = '<svg width="20" height="24" viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="2.5" y="10.5" width="15" height="11" rx="3" fill="currentColor" stroke="none"/><path d="M5.500 10.500V7a4.500 4.500 0 019 0v3.500"/></svg>';
  I.chevUp = '<svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8l7-6 7 6"/></svg>';
  I.flash = '<svg width="22" height="26" viewBox="0 0 22 26" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M6 2h10l-1.500 5h-7z M7.500 7v14a3.500 3.500 0 007 0V7"/><path d="M11 11v4" stroke-linecap="round"/></svg>';
  I.camera = '<svg width="26" height="22" viewBox="0 0 26 22" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"><path d="M3 6h5l2-3h6l2 3h5v13H3z"/><circle cx="13" cy="12.500" r="4.200"/></svg>';
  I.search = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L21 21"/></svg>';
  I.mic = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5.500 11a6.500 6.500 0 0013 0M12 17.500V21"/></svg>';
  I.back = '<svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 10l8 8"/></svg>';
  I.chevR = '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.500 1.500L7 7l-5.500 5.500"/></svg>';
  I.person = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4.500"/><path d="M3.500 22c0-5 3.800-8 8.500-8s8.500 3 8.500 8z"/></svg>';
  I.photo = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="4.500" width="18" height="15" rx="2.500"/><circle cx="9" cy="10" r="1.800"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg>';
  I.video = '<svg width="26" height="18" viewBox="0 0 26 18" fill="none" stroke="#0a84ff" stroke-width="2" stroke-linejoin="round"><rect x="1.500" y="2" width="16" height="14" rx="3.500"/><path d="M18 7l6-3.500v11L18 11z"/></svg>';
  I.plus = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><path d="M10 3v14M3 10h14"/></svg>';
  I.info = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0a84ff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9.500"/><path d="M12 11v6" stroke-width="2.400"/><circle cx="12" cy="7.500" r=".9" fill="#0a84ff"/></svg>';
  I.filter = '<svg width="22" height="18" viewBox="0 0 22 18" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><path d="M2 3h18M5 9h12M8 15h6"/></svg>';
  I.trash = '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4.500h6V7M6.500 7l1 13h9l1-13"/></svg>';
  I.dots3 = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
  I.share = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.500 8.500L12 4l4.500 4.500M5 12v7h14v-7"/></svg>';
  I.heart = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"><path d="M12 20s-7.500-4.600-9-9.200C2 7 4.400 4.500 7.400 4.500c1.900 0 3.500 1 4.600 2.600 1.100-1.600 2.700-2.600 4.600-2.600 3 0 5.400 2.500 4.400 6.300C19.500 15.400 12 20 12 20z"/></svg>';
  I.compass = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M15.500 8.500l-2 5-5 2 2-5z"/></svg>';
  I.tabs = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"><rect x="3" y="7" width="14" height="13" rx="2.500"/><path d="M7 4h12a2 2 0 012 2v10"/></svg>';
  /* X 앱 */
  I.xlogo = function (s) { return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round"><path d="M4.500 3.500l15 17" stroke-width="2.800"/><path d="M19.500 3.500l-15 17" stroke-width="1.300"/></svg>'; };
  I.reply = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linejoin="round"><path d="M4 5h16v11h-8.500L7 20v-4H4z"/></svg>';
  I.repost = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.500L3.500 7 7 10.500M3.500 7H16a3 3 0 013 3v2.500M17 20.500l3.500-3.500L17 13.500M20.500 17H8a3 3 0 01-3-3v-2.500"/></svg>';
  I.like = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linejoin="round"><path d="M12 20s-7.500-4.600-9-9.200C2 7 4.400 4.500 7.400 4.500c1.900 0 3.500 1 4.600 2.600 1.100-1.600 2.700-2.600 4.600-2.600 3 0 5.400 2.500 4.400 6.300C19.500 15.400 12 20 12 20z"/></svg>';
  I.views = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><path d="M6 20v-9M12 20V5M18 20v-6"/></svg>';
  I.bm = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linejoin="round"><path d="M6 4h12v16l-6-4.500L6 20z"/></svg>';
  I.shr = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.500 8.500L12 4l4.500 4.500M5 12v7h14v-7"/></svg>';
  I.home = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.500 11L12 3.500l8.500 7.500v9.500H14.500v-6h-5v6H3.500z"/></svg>';
  I.homeOn = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3.500 11L12 3.500l8.500 7.500v9.500H14.500v-6h-5v6H3.500z"/></svg>';
  I.bell = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M6 17V11a6 6 0 0112 0v6l1.500 2h-15zM10 21h4"/></svg>';
  I.mail = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.500c-5 0-9 3.400-9 7.700 0 2.500 1.400 4.700 3.600 6.100-.2 1.200-.9 2.400-1.900 3.300 2-.1 3.800-.9 5-1.900.7.200 1.500.3 2.300.3 5 0 9-3.400 9-7.800S17 3.500 12 3.500z"/></svg>';
  I.mailOn = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.500c-5 0-9 3.400-9 7.700 0 2.500 1.400 4.700 3.600 6.100-.2 1.200-.9 2.400-1.900 3.300 2-.1 3.800-.9 5-1.900.7.200 1.500.3 2.300.3 5 0 9-3.400 9-7.800S17 3.500 12 3.500z"/></svg>';
  I.chatPlus = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.500c-4.700 0-8.500 3.200-8.500 7.200 0 2.300 1.300 4.400 3.400 5.700-.2 1.100-.8 2.200-1.800 3 1.900-.1 3.500-.8 4.700-1.800.7.200 1.400.3 2.200.3"/><path d="M17.500 12v7M14 15.500h7"/></svg>';
  I.chevDn = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  I.sort = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20V5M4 9l4-4 4 4M16 4v15M12 15l4 4 4-4"/></svg>';
  I.pencil = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1-4.500L16.500 4a2 2 0 013 3L8 18.500z"/></svg>';
  I.lockSm = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="3" fill="currentColor" stroke="none"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>';
  /* 전화 앱 탭 */
  I.tStar = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.700 5.900 6.300.7-4.700 4.300 1.300 6.300L12 17l-5.600 3.200 1.300-6.300L3 9.600l6.300-.7z"/></svg>';
  I.tClock = '<svg width="26" height="26" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.500" fill="currentColor"/><path d="M12 6.500V12.500h4.500" stroke="#fff" stroke-width="2.200" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  I.tPerson = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="9.500" r="3.400" fill="#fff"/><path d="M5.500 18.500c1-3 3.600-4.300 6.500-4.300s5.500 1.300 6.500 4.300A9.500 9.500 0 0112 21.500a9.500 9.500 0 01-6.500-3z" fill="#fff"/></svg>';
  I.tKeys = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="4.500" r="2"/><circle cx="12" cy="4.500" r="2"/><circle cx="19" cy="4.500" r="2"/><circle cx="5" cy="11" r="2"/><circle cx="12" cy="11" r="2"/><circle cx="19" cy="11" r="2"/><circle cx="5" cy="17.500" r="2"/><circle cx="12" cy="17.500" r="2"/><circle cx="19" cy="17.500" r="2"/><circle cx="12" cy="23" r="1.500" opacity="0"/></svg>';
  I.tVoice = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"><circle cx="6.500" cy="12" r="3.800"/><circle cx="17.500" cy="12" r="3.800"/><path d="M6.500 15.800h11"/></svg>';
  I.handset = '<svg viewBox="0 0 24 24" fill="#fff"><path d="M20.010 15.380c-1.230 0-2.420-.2-3.530-.56a.977.977 0 00-1.010.24l-1.570 1.970c-2.830-1.350-5.480-3.900-6.890-6.830l1.950-1.660c.27-.28.35-.67.24-1.020-.37-1.110-.56-2.300-.56-3.530 0-.54-.45-.99-.99-.99H4.190C3.650 3 3 3.240 3 3.990 3 13.280 10.730 21 20.010 21c.71 0 .99-.63.99-1.180v-3.450c0-.54-.45-.99-.99-.99z"/></svg>';

  /* ---------- 앱 아이콘 (직접 그린 단순한 아이콘) ---------- */
  function fillName(x) {
    x = String(x);
    return x.replace(/\{NAME\}아/g, function () {
      var c = String(USER.name || '').charCodeAt(String(USER.name || '').length - 1);
      var jong = c >= 0xAC00 && c <= 0xD7A3 && ((c - 0xAC00) % 28) !== 0;
      return USER.name + (jong ? '아' : '야');
    }).replace(/\{NAME\}랑/g, function () {
      var c = String(USER.name || '').charCodeAt(String(USER.name || '').length - 1);
      var jong = c >= 0xAC00 && c <= 0xD7A3 && ((c - 0xAC00) % 28) !== 0;
      return USER.name + (jong ? '이랑' : '랑');
    }).replace(/\{FULL\}/g, fullName()).replace(/\{LAST\}/g, USER.last || '').replace(/\{NAME\}/g, USER.name);
  }
  var ICO = {};
  ICO.kakao = '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#FEE500"/><path d="M30 14C20.600 14 13 20 13 27.400c0 4.700 3.100 8.800 7.800 11.200l-1.800 6.600c-.1.500.4.800.8.500l7.800-5.100c.8.100 1.600.1 2.400.1 9.400 0 17-6 17-13.300S39.400 14 30 14z" fill="#3a1d1d"/></svg>';
  ICO.x = '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#000"/><path d="M17 16l26 28" stroke="#fff" stroke-width="5.500"/><path d="M43 16L17 44" stroke="#fff" stroke-width="2.200"/></svg>';
  ICO.instagram = '<svg viewBox="0 0 60 60"><defs><radialGradient id="igG" cx=".3" cy="1.05" r="1.15"><stop offset="0" stop-color="#fdf497"/><stop offset=".1" stop-color="#fdf497"/><stop offset=".45" stop-color="#fd5949"/><stop offset=".6" stop-color="#d6249f"/><stop offset="1" stop-color="#285aeb"/></radialGradient></defs><rect width="60" height="60" fill="url(#igG)"/><rect x="15" y="15" width="30" height="30" rx="9" fill="none" stroke="#fff" stroke-width="3"/><circle cx="30" cy="30" r="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="38.500" cy="21.500" r="2" fill="#fff"/></svg>';
  ICO.youtube = '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#fff"/><rect x="9" y="16.500" width="42" height="27" rx="8" fill="#ee2e3d"/><path d="M25.500 23v14l12-7z" fill="#fff"/></svg>';
  ICO.weverseFb = '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#05051c"/><text x="30" y="41" font-size="36" font-style="italic" font-weight="700" text-anchor="middle" fill="#eeeef2" font-family="Georgia,serif">w</text></svg>';
  ICO.photos = '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#fff"/><g transform="translate(30 30)" style="mix-blend-mode:multiply"><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#f6d24a" opacity=".9"/><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#f39a3a" opacity=".9" transform="rotate(45)"/><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#ea5a5a" opacity=".9" transform="rotate(90)"/><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#c06bd6" opacity=".9" transform="rotate(135)"/><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#5a8ee6" opacity=".9" transform="rotate(180)"/><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#4cc3e8" opacity=".9" transform="rotate(225)"/><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#5cc86b" opacity=".9" transform="rotate(270)"/><ellipse cx="0" cy="-10" rx="7.500" ry="11.500" fill="#a8d64a" opacity=".9" transform="rotate(315)"/></g></svg>';
  ICO.settings = '<svg viewBox="0 0 60 60"><defs><linearGradient id="stG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a9aa0"/><stop offset="1" stop-color="#6a6a70"/></linearGradient></defs><rect width="60" height="60" fill="url(#stG)"/><g transform="translate(30 30)"><circle r="17" fill="none" stroke="#dcdce0" stroke-width="7" stroke-dasharray="6.670 6.670"/><circle r="14" fill="#e6e6ea"/><circle r="6.500" fill="#85858a"/></g></svg>';
  ICO.phone = '<svg viewBox="0 0 60 60"><defs><linearGradient id="phG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ae17a"/><stop offset="1" stop-color="#2bb648"/></linearGradient></defs><rect width="60" height="60" fill="url(#phG)"/><g transform="translate(14 14) scale(1.350)" fill="#fff">' + I.handset.replace('<svg viewBox="0 0 24 24" fill="#fff">', '').replace('</svg>', '') + '</g></svg>';
  ICO.safari = '<svg viewBox="0 0 60 60"><defs><linearGradient id="sfBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e3e4ea"/></linearGradient><linearGradient id="sfC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#52b8ff"/><stop offset="1" stop-color="#0a5fe6"/></linearGradient></defs><rect width="60" height="60" fill="url(#sfBg)"/><circle cx="30" cy="30" r="22" fill="url(#sfC)" stroke="#d8dae0" stroke-width="1.500"/><circle cx="30" cy="30" r="19.500" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray=".6 3.080" opacity=".9"/><g transform="rotate(45 30 30)"><path d="M30 13l5.500 17H24.500z" fill="#ff3b30"/><path d="M30 47l5.500-17H24.500z" fill="#fff"/></g></svg>';
  ICO.messages = '<svg viewBox="0 0 60 60"><defs><linearGradient id="msG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ae17a"/><stop offset="1" stop-color="#2bb648"/></linearGradient></defs><rect width="60" height="60" fill="url(#msG)"/><path d="M30 14c-9.400 0-17 6.200-17 13.800 0 4.400 2.500 8.300 6.500 10.800-.5 2.200-1.800 4.300-3.500 6 3.400-.3 6.700-1.700 9-3.500 1.600.4 3.300.6 5 .6 9.400 0 17-6.200 17-13.900C47 20.200 39.400 14 30 14z" fill="#fff"/></svg>';
  ICO.kakao = '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#fae100"/><ellipse cx="30" cy="27.500" rx="19.500" ry="15.500" fill="#3b1e1e"/><path d="M19.500 37l-3.500 10 11.500-6.500z" fill="#3b1e1e"/><text x="30" y="31.500" font-size="10.500" font-weight="800" text-anchor="middle" fill="#fae100" font-family="Arial,Helvetica,sans-serif">TALK</text></svg>';

  ICO.dday = '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#ff7aa8"/><path d="M30 47S14 37.600 14 26.800C14 21.200 18 17 22.900 17c3.100 0 5.600 1.600 7.100 4 1.500-2.400 4-4 7.100-4C42 17 46 21.200 46 26.800 46 37.600 30 47 30 47z" fill="#fff"/><text x="30" y="34" font-size="11.500" font-weight="900" text-anchor="middle" fill="#ff5c93" font-family="Arial,Helvetica,sans-serif">D+</text></svg>';
  /* ---------- 디데이 (기념일) ---------- */
  function ddInfo() {
    var D = C.DDAY; if (!D || !D.partner) { return null; }
    var base = parseInt(D.days, 10) || 100;
    var today = new Date(TD[0], TD[1] - 1, TD[2]);
    var start = new Date(BASE_TD[0], BASE_TD[1] - 1, BASE_TD[2] - (base - 1));
    var days = Math.round((today - start) / 86400000) + 1;
    return { partner: D.partner, days: days, today: today, start: start, photo: D.photo || '' };
  }
  function ddFmt(d, sep) { sep = sep || '.'; return d.getFullYear() + sep + pad2(d.getMonth() + 1) + sep + pad2(d.getDate()); }
  function ddNotifText(dd) { return (C.DDAY && C.DDAY.notif) || (dd.partner + '님과 ' + dd.days + '일입니다'); }

  /* ---------- 공통 요소 ---------- */
  function sbHtml(mode, left) {
    return '<div class="sb ' + mode + '"">' + (left ? '<span>' + esc(left) + '</span>' : '<span class="clk">' + clockStr() + '</span>') + '<span class="r">' + I.signal + I.wifi + I.batt + '</span></div>';
  }
  /* 사진 이름이 조금 달라도(대문자 .JPG, .jpeg, .png, .HEIC, .jpg.jpg 처럼 확장자가 두 번) 찾아서 보여줘요 */
  var EXT1 = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG', '.heic', '.HEIC'];
  var EXT2 = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.heic', '.HEIC'];
  function variants(src) {
    var m = String(src).match(/^(.*?)(\.[A-Za-z0-9]+)$/);
    if (!m) { return [src]; }
    var out = [src], seen = {};
    seen[src] = 1;
    function add(v) { if (!seen[v]) { seen[v] = 1; out.push(v); } }
    EXT1.forEach(function (e) { add(m[1] + e); });
    EXT2.forEach(function (e) { add(m[1] + m[2] + e); });
    return out;
  }
  /* 이름 후보: 먼저 적힌 이름 하나만 빠르게 시도하고, 없을 때만 다른 확장자를 한꺼번에 시도해요. 찾은 이름은 기기에 기억해요 */
  var RES = {}, RESW = {};
  try {
    var savedRes = JSON.parse(localStorage.getItem('sim2.res') || '{}');
    Object.keys(savedRes).forEach(function (k) { if (savedRes[k]) { RES[k] = savedRes[k]; } });
  } catch (e) {}
  function saveRes() { try { localStorage.setItem('sim2.res', JSON.stringify(RES)); } catch (e) {} }
  function resolve(src, cb) {
    if (!src) { cb(null); return; }
    if (RES[src] !== undefined) { cb(RES[src] || null); return; }
    var w = RESW[src] || (RESW[src] = []);
    w.push(cb);
    if (w.length > 1) { return; }
    var vs = variants(src), n = vs.length, ok = [];
    function done(v) {
      RES[src] = v;
      if (v) { saveRes(); }
      var list = RESW[src] || [];
      RESW[src] = [];
      list.forEach(function (f) { f(v || null); });
    }
    function fin() {
      if (RES[src] !== undefined) { return; }
      for (var j = 1; j < n; j++) {
        if (ok[j] === undefined) { return; }
        if (ok[j]) { done(vs[j]); return; }
      }
      done('');
    }
    var first = new Image();
    first.onload = function () { done(vs[0]); };
    first.onerror = function () {
      /* 다른 확장자는 한 번에 하나씩만 시도해요(없는 사진 때문에 요청이 한꺼번에 몰리지 않게) */
      var k = 1;
      (function tryNext() {
        if (k >= n) { done(''); return; }
        var im = new Image(), v = vs[k++];
        im.onload = function () { done(v); };
        im.onerror = tryNext;
        im.src = v;
      })();
    };
    first.src = vs[0];
  }
  var DECODED = {};
  function rs(src) { return (src && RES[src]) ? RES[src] : src; }
  /* 배경 사진: 다 받아서 디코딩이 끝난 뒤 부드럽게 나타나요(기본 그라데이션이 먼저 비치지 않아요) */
  function setBg(div, srcs) {
    function show(v) {
      var im = new Image();
      function put() {
        var p = document.createElement('div');
        p.className = 'bgph';
        p.style.backgroundImage = 'url("' + v + '")';
        if (DECODED[v]) { p.style.transition = 'none'; p.classList.add('on'); div.appendChild(p); DECODED[v] = true; return; }
        DECODED[v] = true;
        div.appendChild(p);
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.classList.add('on'); }); });
      }
      im.onload = function () { if (im.decode) { im.decode().then(put, put); } else { put(); } };
      im.onerror = function () { div.classList.add('fbk'); };
      im.src = v;
    }
    (function next(i) {
      if (i >= srcs.length) { div.classList.add('fbk'); return; }
      resolve(srcs[i], function (v) { if (v) { show(v); } else { next(i + 1); } });
    })(0);
  }
  /* 시작 화면에 있는 동안 배경과 프로필 사진을 미리 받아둬요 */
  function preload() {
    var list = [C.IMG && C.IMG.lockWallpaper, C.IMG && C.IMG.homeWallpaper, (C.IMG && C.IMG.startBg) || './start-bg.jpg'];
    (C.TWEETS || []).forEach(function (t) { if (t && t.avatar) { list.push(t.avatar); } });
    (C.NEWS || []).forEach(function (n) { if (n && n.img) { list.push(n.img); } });
    /* 카톡 프로필 사진, 트위터 본문 사진도 먼저 받아둬요 */
    try { if (C.KAKAO && C.KAKAO.PHOTOS) { Object.keys(C.KAKAO.PHOTOS).forEach(function (k) { if (C.KAKAO.PHOTOS[k]) { list.push(C.KAKAO.PHOTOS[k]); } }); } } catch (e) {}
    (C.TWEETS || []).forEach(function (t) { (t && t.images || []).forEach(function (p) { if (p) { list.push(p); } }); });
    list.forEach(function (s) { if (s) { resolve(s, function (v) { if (v) { var im = new Image(); im.src = v; if (im.decode) { im.decode().then(function () { DECODED[v] = true; }, function () {}); } } }); } });
    /* 나머지 사진은 화면이 한가할 때 3장씩만 차례로 받아둬요(한꺼번에 받다가 지금 보는 사진이 늦어지지 않게) */
    setTimeout(function () {
      var more = [], seen = {};
      function add(x) { if (x && !seen[x]) { seen[x] = 1; more.push(x); } }
      (C.TWEETS || []).forEach(function (t) { (t.images || []).forEach(add); });
      (C.GALLERY || []).forEach(function (p) { if (p) { add(p.src); } });
      if (C.INSTA) { (C.INSTA.posts || []).forEach(function (p) { add(p.img); }); (C.INSTA.stories || []).forEach(function (p) { add(p.img); }); }
      var K0 = C.KAKAO && C.KAKAO.ROOMS; if (K0) { Object.keys(K0).forEach(function (n) { (K0[n].msgs || []).forEach(function (g) { add(g.img); }); }); }
      (C.TRASH || []).forEach(function (p) { if (p) { add(p.src); } });
      var idx = 0, active = 0;
      function pump() {
        while (active < 3 && idx < more.length) {
          active++;
          resolve(more[idx++], function (v) { if (v) { var im = new Image(); im.decoding = 'async'; im.src = v; } active--; pump(); });
        }
      }
      pump();
    }, 1200);
  }
  function avHtml(kind, name) {
    if (kind === 'person') { return '<div class="av">' + I.person + '</div>'; }
    return '<div class="av">' + esc(String(name || '?').charAt(0)) + '</div>';
  }
  function imgTag(src, cls) {
    return '<img ' + (cls ? 'class="' + cls + '" ' : '') + 'src="' + esc(rs(src)) + '" alt="" decoding="async" draggable="false">';
  }
  function xav(src, fb) {
    return '<div class="xav' + (fb === 'black' ? ' blk' : '') + '">' + I.person + (src ? '<img data-rm="1" src="' + esc(rs(src)) + '" data-orig="' + esc(src) + '" alt="" decoding="async">' : '') + '</div>';
  }
  function xavDefault() { return '<div class="xav">' + I.person + '</div>'; }

  /* 이미지가 없으면 깨진 아이콘 대신 대체 표시 */
  phone.addEventListener('error', function (e) {
    var t = e.target;
    if (!t || t.tagName !== 'IMG') { return; }
    var orig = t.getAttribute('data-orig') || t.getAttribute('src') || '';
    t.setAttribute('data-orig', orig);
    var vs = variants(orig);
    var i = parseInt(t.getAttribute('data-vi') || '0', 10) + 1;
    if (i < vs.length) { t.setAttribute('data-vi', String(i)); t.src = vs[i]; return; }
    if (t.getAttribute('data-rm')) { t.remove(); return; }
    var d = document.createElement('div');
    d.className = 'ph';
    d.innerHTML = I.photo;
    if (t.parentNode) { t.parentNode.replaceChild(d, t); }
  }, true);

  function alertBox(title, msg) {
    var o = el('<div class="alert-ov"><div class="alert"><div class="tt">' + esc(title) + (msg ? '<p>' + esc(msg) + '</p>' : '') + '</div><button type="button">확인</button></div></div>');
    qs(o, 'button').addEventListener('click', function () { o.remove(); });
    phone.appendChild(o);
  }
  function soon() { /* 준비 중인 곳은 눌러도 아무 변화 없음 */ }

  /* 홈 바 */
  var hb = el('<div id="hb"></div>');
  var hbHit = el('<div id="hbHit"></div>');
  function setHB(mode) { hb.className = mode === 'dark' ? 'dark' : (mode === 'off' ? 'off' : ''); }

  function swipeDetect(elm, cb) {
    var sx = 0, sy = 0, on = false;
    elm.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; on = true; });
    elm.addEventListener('pointercancel', function () { on = false; });
    elm.addEventListener('pointerup', function (e) {
      if (!on) { return; }
      on = false;
      cb(e.clientX - sx, e.clientY - sy);
    });
  }

  /* ---------- 상태 ---------- */
  var L = {};          // 레이어 모음
  var current = 'start';
  var curApp = null;
  var appCleanup = null;

  function clearLayers() { qsa(phone, '.layer').forEach(function (n) { n.remove(); }); }

  /* =========================================================
     시작 화면
     ========================================================= */
  function showStart() {
    current = 'start';
    clearLayers();
    setHB('off');
    var s = el('<section class="layer start s2 fade-in"><div class="card">' +
      '<div class="s2-badge">♡</div><h1 class="s2-tt">나의 프로필</h1>' +
      '<p class="sub">게임에서 쓸 이름과 아이디를 적어주세요</p>' +
      '<div class="row2"><label>성<input id="inLast" maxlength="4" autocomplete="off" placeholder="성"></label>' +
      '<label>이름<input id="inName" maxlength="8" autocomplete="off" placeholder="이름"></label></div>' +
      '<label>인스타그램 아이디<div class="at"><span>@</span><input id="inIg" maxlength="30" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="instagram_id"></div></label>' +
      '<p class="note">※ 본인 또는 가상의 아이디만 입력해주세요.</p>' +
      '<button class="go" id="goBtn" type="button" disabled>시작</button></div></section>');
    phone.appendChild(s);
    (function () {
      resolve((C.IMG && C.IMG.startBg) || './start-bg.jpg', function (v) {
        if (!v) { return; }
        s.style.backgroundImage = 'url("' + v + '")';
        s.style.backgroundSize = 'cover';
        s.style.backgroundRepeat = 'no-repeat';
        s.style.backgroundPosition = 'center';
      });
    })();
    var inLast = qs(s, '#inLast'), inName = qs(s, '#inName'), inIg = qs(s, '#inIg'), go = qs(s, '#goBtn');
    function clean() {
      inIg.value = inIg.value.replace(/^@+/, '').replace(/[^A-Za-z0-9_.]/g, '');
      go.disabled = !(inLast.value.trim().length >= 1 && inName.value.trim().length >= 1 && /^[A-Za-z0-9_.]{1,30}$/.test(inIg.value));
    }
    inName.addEventListener('input', clean);
    inLast.addEventListener('input', clean);
    inIg.addEventListener('input', clean);
    go.addEventListener('click', function () {
      clean();
      if (go.disabled) { return; }
      USER = { last: inLast.value.trim().slice(0, 4), first: inName.value.trim().slice(0, 8), name: '', igId: inIg.value.slice(0, 30) };
      saveUser();
      showLock();
    });
    L.start = s;
  }

  /* =========================================================
     잠금화면
     ========================================================= */
  var passBuf = '';
  var passOn = false;
  var LETTERS = { 1: '', 2: 'ABC', 3: 'DEF', 4: 'GHI', 5: 'JKL', 6: 'MNO', 7: 'PQRS', 8: 'TUV', 9: 'WXYZ', 0: '' };

  function showLock() {
    current = 'lock';
    clearLayers();
    passBuf = ''; passOn = false;
    setHB('light');
    var notifs = preGroupHtml() + kakaoLockHtml() + xFollowHtml() + C.NOTIFS.map(function (n) {
      var mm = String(n.time).match(/(\d+)\s*분/), off = n.time === '방금' ? 0 : (mm ? parseInt(mm[1], 10) : -1);
      return '<div class="notif"><div class="ic">' + ICO.phone + '</div><div class="tx"><b>' + esc(n.name) + '</b><span>' + esc(n.text) + '</span></div><div class="tm"' + (off >= 0 ? ' data-at="' + (clockMin() - off) + '"' : '') + '>' + esc(n.time) + '</div></div>';
    }).join('');
    var keys = '';
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (d) {
      keys += '<button class="key" type="button" data-k="' + d + '"><b>' + d + '</b><small>' + LETTERS[d] + '</small></button>';
    });
    keys += '<div class="key empty"></div><button class="key" type="button" data-k="0"><b>0</b><small></small></button><div class="key empty"></div>';
    var l = el('<section class="layer lock" id="lock">' +
      '<div class="bgimg bg-lock" id="lockBg"></div><div class="shade"></div>' + sbHtml('light', C.CARRIER) +
      '<div class="lk-top">' + I.lock + '<div class="lk-date">' + esc(C.DATE) + '</div><div class="lk-time clk">' + clockStr() + '</div></div>' +
      '<div class="notifs">' + notifs + '</div>' +
      '<div class="lk-btn l">' + I.flash + '</div><div class="lk-btn r">' + I.camera + '</div>' +
      '<div class="lk-hint">' + I.chevUp + '위로 쓸어올려 잠금 해제</div><div class="lk-hit" id="lkHit"></div>' +
      '<div class="pass" id="pass"><h2>암호 입력</h2><div class="dots" id="dots"><i></i><i></i><i></i><i></i></div>' +
      '<div class="keys">' + keys + '</div>' +
      '<div class="foot"><span>긴급 상황</span><button type="button" id="passR">취소</button></div></div></section>');
    phone.appendChild(l);
    phone.appendChild(hbHit); phone.appendChild(hb);
    L.lock = l;
    setBg(qs(l, '#lockBg'), [C.IMG.lockWallpaper]);
    startDMs();
    if (!window.__kkFlowStarted) { window.__kkFlowStarted = true; setTimeout(kkRunAll, 1200); }
    bindLockNotifs(); lockDense();
    (function () {
      var dd = ddInfo(); if (!dd || dd.days !== (parseInt(C.DDAY.days, 10) || 100)) { return; }
      setTimeout(function () {
        if (current !== 'lock' || !L.lock) { return; }
        var box = qs(L.lock, '.notifs'); if (!box || qs(box, '.notif[data-dd]')) { return; }
        var n = el('<div class="notif pop" data-dd="1" data-app="dday"><div class="ic">' + ICO.dday + '</div><div class="tx"><b>디데이</b><span>' + esc(ddNotifText(dd)) + '</span></div><div class="tm">' + esc((C.DDAY && C.DDAY.time) || '방금') + '</div></div>');
        box.insertBefore(n, box.firstChild); bindLockNotifs(); lockDense();
      }, 900);
    })();
    qs(l, '#lkHit').addEventListener('click', showPass);
    swipeDetect(l, function (dx, dy) { if (!passOn && dy < -50 && Math.abs(dy) > Math.abs(dx)) { showPass(); } });
    qsa(l, '.key[data-k]').forEach(function (k) {
      k.addEventListener('click', function () { pressKey(k.getAttribute('data-k')); });
    });
    qs(l, '#passR').addEventListener('click', function () {
      if (passBuf.length > 0) { passBuf = passBuf.slice(0, -1); renderDots(); } else { hidePass(); }
    });
  }
  function showPass() {
    if (current !== 'lock') { return; }
    passOn = true; passBuf = ''; renderDots();
    qs(L.lock, '#pass').classList.add('on');
    L.lock.classList.add('passing');
  }
  function hidePass() {
    passOn = false; passBuf = ''; renderDots();
    qs(L.lock, '#pass').classList.remove('on');
    L.lock.classList.remove('passing');
  }
  function renderDots() {
    if (!L.lock) { return; }
    qsa(L.lock, '#dots i').forEach(function (d, i) { d.classList.toggle('f', i < passBuf.length); });
    var r = qs(L.lock, '#passR');
    if (r) { r.textContent = passBuf.length > 0 ? '삭제' : '취소'; }
  }
  function pressKey(d) {
    if (!passOn || passBuf.length >= 4) { return; }
    passBuf += d;
    renderDots();
    if (passBuf.length === 4) { setTimeout(checkPass, 130); }
  }
  function checkPass() {
    if (passBuf === String(C.PASSCODE)) { unlock(); return; }
    var dots = qs(L.lock, '#dots');
    dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake');
    try { if (navigator.vibrate) { navigator.vibrate(200); } } catch (e) {}
    setTimeout(function () { passBuf = ''; renderDots(); dots.classList.remove('shake'); }, 450);
  }
  function unlock() {
    buildHome();
    var lock = L.lock;
    phone.insertBefore(L.home, lock);
    lock.classList.add('fade-out');
    current = 'home';
    setTimeout(function () { lock.remove(); L.lock = null; }, 360);
    if (pendingDm) { var pid = pendingDm; pendingDm = null; goDm(pid); }
    else if (pendingKk) { kkGoto = pendingKk; pendingKk = null; openApp('kakao', null, { instant: true }); }
    else if (pendingApp) { var pa = pendingApp; pendingApp = null; openApp(pa, null, { instant: true }); }
  }
  document.addEventListener('keydown', function (e) {
    if (current === 'lock' && passOn && /^[0-9]$/.test(e.key)) { pressKey(e.key); }
    if (current === 'lock' && !passOn && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowUp')) { showPass(); }
    if (current === 'lock' && passOn && e.key === 'Backspace') { passBuf = passBuf.slice(0, -1); renderDots(); }
  });

  /* =========================================================
     홈 화면
     ========================================================= */
  function appHtml(id, label, icon, extra) {
    return '<button type="button" class="app" data-app="' + id + '"><div class="ico">' + icon + (extra || '') + '</div>' + (label ? '<span class="lb">' + esc(label) + '</span>' : '') + '</button>';
  }
  function ddWidgetHtml() {
    var dd = ddInfo(); if (!dd) { return ''; }
    var bg = dd.photo ? ' style="background-image:linear-gradient(rgba(0,0,0,.08),rgba(0,0,0,.38)),url(&quot;' + esc(rs(dd.photo)) + '&quot;)"' : '';
    return '<button type="button" class="app wdg" data-app="dday"><div class="dd-w' + (dd.photo ? ' ph' : '') + '"' + bg + '>' +
      '<div class="dd-nm"><span>' + esc(dd.partner) + '</span><i>♥</i><span>' + esc(USER.name || '나') + '</span></div>' +
      '<div class="dd-cap">우리 함께한 지</div><div class="dd-n">' + dd.days + '<small>일</small></div>' +
      '<div class="dd-st">' + ddFmt(dd.start) + ' ~</div></div><span class="lb">디데이</span></button>';
  }
  function buildHome() {
    var weverse = appHtml('weverse', 'Weverse', ICO.weverseFb);
    var h = el('<section class="layer home" id="home">' +
      '<div class="bgimg bg-home" id="homeBg"></div><div class="shade"></div>' + sbHtml('light') +
      '<div class="grid">' + ddWidgetHtml() +
      appHtml('x', 'X', ICO.x) + appHtml('instagram', 'Instagram', ICO.instagram) + appHtml('youtube', 'YouTube', ICO.youtube) + weverse +
      appHtml('photos', '사진', ICO.photos) + appHtml('settings', '설정', ICO.settings) +
      '</div>' +
      '<div class="dots-pg"><i class="on"></i><i></i></div>' +
      '<div class="pill">' + I.search + '<span>검색</span></div>' +
      '<div class="dock">' + appHtml('phone', '', ICO.phone) + appHtml('safari', '', ICO.safari) + appHtml('messages', '', ICO.messages) + appHtml('kakao', '', ICO.kakao) + '</div></section>');
    L.home = h;
    setBg(qs(h, '#homeBg'), [C.IMG.homeWallpaper, C.IMG.lockWallpaper]);
    qsa(h, '.app').forEach(function (a) {
      a.addEventListener('click', function () { openApp(a.getAttribute('data-app'), qs(a, '.ico')); });
    });
    if (!phone.contains(hb)) { phone.appendChild(hbHit); phone.appendChild(hb); }
    phone.insertBefore(h, phone.firstChild);
    setHB('light');
  }

  /* =========================================================
     앱 열기/닫기
     ========================================================= */
  var IMPL = {};
  function openApp(id, fromEl, opts) {
    if (current !== 'home') { return; }
    if (id === 'youtube') {
      try { window.open(C.YOUTUBE_URL, '_blank', 'noopener'); } catch (e) {}
      return;
    }
    if (id === 'weverse') {
      try { window.open(C.WEVERSE_URL || 'https://weverse.io/tws/profile/44e29f1d7d5a64908dc4674a53e53d97', '_blank', 'noopener'); } catch (e) {}
      return;
    }
    if (!IMPL[id]) { soon(); return; }
    var pr = phone.getBoundingClientRect();
    var layer = el('<section class="layer" id="appLayer"></section>');
    if (fromEl) {
      var r = fromEl.getBoundingClientRect();
      layer.style.transformOrigin = (r.left + r.width / 2 - pr.left) + 'px ' + (r.top + r.height / 2 - pr.top) + 'px';
    }
    phone.insertBefore(layer, hbHit);
    var animate = !(opts && opts.instant);
    if (animate) { layer.classList.add('prep'); }
    current = 'app'; curApp = id;
    L.app = layer;
    appCleanup = IMPL[id](layer) || null;
    if (animate) {
      /* 화면 내용을 먼저 다 그려 놓고(무거운 작업 끝) 그다음 애니메이션을 시작해야 안 끊겨요 */
      void layer.offsetWidth;
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        if (!layer.isConnected || L.app !== layer) { layer.classList.remove('prep'); return; }
        layer.classList.remove('prep'); layer.classList.add('opening');
        layer.addEventListener('animationend', function f() { layer.classList.remove('opening'); layer.removeEventListener('animationend', f); });
      }); });
    }
  }
  function closeApp(instant) {
    if (current !== 'app' || !L.app) { return; }
    var layer = L.app;
    current = 'home';
    if (appCleanup) { try { appCleanup(); } catch (e) {} appCleanup = null; }
    layer.classList.remove('opening');
    setHB('light');
    if (instant === true) { layer.remove(); }
    else {
      layer.classList.add('closing');
      setTimeout(function () { layer.remove(); }, 290);
    }
    L.app = null; curApp = null;
  }
  function goHome() {
    if (current === 'app') { closeApp(); }
    else if (current === 'lock') { showPass(); }
  }
  hbHit.addEventListener('click', goHome);
  swipeDetect(hbHit, function (dx, dy) { if (dy < -40) { goHome(); } });
  /* 모든 앱: 맨 아래에서 위로 쓸어올리면 홈으로 */
  (function () {
    var sy = 0, on = false;
    phone.addEventListener('pointerdown', function (e) {
      var r = phone.getBoundingClientRect();
      on = (e.clientY > r.bottom - 60);
      sy = e.clientY;
    });
    phone.addEventListener('pointerup', function (e) {
      if (on && current === 'app' && sy - e.clientY > 45) { goHome(); }
      on = false;
    });
  })();

  /* 오른쪽에서 밀려 들어오는 하위 화면 */
  function pushView(parent, html, cls) {
    var v = el('<div class="view prep ' + (cls || '') + '">' + html + '</div>');
    parent.appendChild(v);
    void v.offsetWidth;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      v.classList.remove('prep');
      if (v.isConnected && !v.__cancel) { v.classList.add('slide-in'); }
    }); });
    return v;
  }
  function popView(v, after) {
    v.classList.remove('slide-in');
    v.classList.add('slide-out');
    setTimeout(function () { v.remove(); if (after) { after(); } }, 260);
  }

  /* =========================================================
     전화 앱
     ========================================================= */

  /* =========================================================
     설정 (아이폰 설정 모양)
     ========================================================= */
  IMPL.dday = function (layer) {
    setHB('dark');
    var dd = ddInfo(); if (!dd) { return null; }
    var DAY = 86400000;
    function addDays(n) { return new Date(dd.start.getFullYear(), dd.start.getMonth(), dd.start.getDate() + n - 1); }
    function addYears(y) { return new Date(dd.start.getFullYear() + y, dd.start.getMonth(), dd.start.getDate()); }
    var list = [];
    [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].forEach(function (n) { list.push({ t: n + '일', d: addDays(n) }); });
    [1, 2, 3].forEach(function (y) { list.push({ t: y + '주년', d: addYears(y) }); });
    list = list.filter(function (x) { return x.d >= dd.today; }).sort(function (a, b) { return a.d - b.d; }).slice(0, 7);
    var WD = ['일', '월', '화', '수', '목', '금', '토'];
    var rows = list.map(function (x) {
      var left = Math.round((x.d - dd.today) / DAY);
      return '<div class="dd-row' + (left === 0 ? ' now' : '') + '"><div><b>' + x.t + '</b><span>' + ddFmt(x.d) + ' (' + WD[x.d.getDay()] + ')</span></div><em>' + (left === 0 ? 'D-DAY' : 'D-' + left) + '</em></div>';
    }).join('');
    var heroBg = dd.photo ? ' style="background-image:linear-gradient(rgba(0,0,0,.05),rgba(0,0,0,.45)),url(&quot;' + esc(rs(dd.photo)) + '&quot;)"' : '';
    layer.innerHTML = '<div class="dd-app">' + sbHtml(dd.photo ? 'light' : 'dark') +
      '<div class="dd-sc"><div class="dd-hero' + (dd.photo ? ' ph' : '') + '"' + heroBg + '>' +
      '<div class="dd-nm big"><span>' + esc(dd.partner) + '</span><i>♥</i><span>' + esc(USER.name || '나') + '</span></div>' +
      '<div class="dd-cap">우리 함께한 지</div><div class="dd-n big">' + dd.days + '<small>일</small></div>' +
      '<div class="dd-st">' + ddFmt(dd.start, '. ') + '. 부터</div></div>' +
      '<div class="dd-sec">다가오는 기념일</div><div class="dd-list">' + rows + '</div><div style="height:60px"></div></div></div>';
    return null;
  };

  IMPL.settings = function (layer) {
    setHB('dark');
    function sq(color, inner) {
      return '<span class="st-ic" style="background:' + color + '"><svg viewBox="0 0 24 24" fill="#fff">' + inner + '</svg></span>';
    }
    var G1 = [
      ['비행기 모드', '#ff9f0a', '<path d="M21 16v-2l-8-5V3.500a1.500 1.500 0 00-3 0V9l-8 5v2l8-2.500V19l-2 1.500V22l3.500-1 3.500 1v-1.500L13 19v-5.500z"/>', 'toggle'],
      ['Wi-Fi', '#0a84ff', '<path d="M12 18.500a1.700 1.700 0 110 3.400 1.700 1.700 0 010-3.400zM12 13c2 0 3.800.8 5.100 2.100l-1.500 1.500A5.400 5.400 0 0012 15.100c-1.500 0-2.800.6-3.600 1.500l-1.500-1.500A7.500 7.500 0 0112 13zm0-5c3.300 0 6.200 1.300 8.300 3.500l-1.500 1.500A9.800 9.800 0 0012 10.100c-2.800 0-5.200 1.100-6.800 2.900L3.700 11.500A12.600 12.600 0 0112 8z"/>', 'SK_WiFi'],
      ['Bluetooth', '#0a84ff', '<path d="M11 3l6 5-4 3.500L17 15l-6 6v-7l-3.500 3-1-1.200L10 12.500 6.500 8.200l1-1.200L11 10z"/>', '켬'],
      ['셀룰러', '#30d158', '<path d="M3 17h3v4H3zm5-5h3v9H8zm5-5h3v14h-3zm5-4h3v18h-3z"/>', '']
    ];
    var G2 = [
      ['알림', '#ff3b30', '<path d="M12 2a6 6 0 00-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 00-6-6zm-2 17a2 2 0 004 0z"/>'],
      ['사운드 및 햅틱', '#ff2d55', '<path d="M4 9v6h4l5 4V5L8 9zm12 .5a4 4 0 010 5l-1.200-1.200a2.300 2.300 0 000-2.600z"/>'],
      ['집중 모드', '#5e5ce6', '<path d="M20 14.500A8.500 8.500 0 019.500 4 8.500 8.500 0 1020 14.500z"/>'],
      ['스크린 타임', '#5e5ce6', '<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v5.500l4 2.300-.8 1.400L11 13V7z"/>']
    ];
    var G3 = [
      ['일반', '#8e8e93', '<circle cx="12" cy="12" r="4"/><path d="M11 2h2l.5 3 2 .8 2.500-1.800 1.400 1.400-1.800 2.500.8 2 3 .5v2l-3 .5-.8 2 1.800 2.500-1.400 1.400-2.500-1.800-2 .8-.5 3h-2l-.5-3-2-.8-2.500 1.800-1.400-1.400L6.500 15l-.8-2-3-.5v-2l3-.5.8-2L4.700 5.500l1.400-1.400L8.600 5.900l2-.8z" opacity=".55"/>'],
      ['제어 센터', '#8e8e93', '<rect x="3" y="5" width="18" height="5" rx="2.500"/><rect x="3" y="14" width="18" height="5" rx="2.500"/>'],
      ['디스플레이 및 밝기', '#0a84ff', '<circle cx="12" cy="12" r="4.500"/><path d="M11 1h2v3h-2zm0 19h2v3h-2zM1 11h3v2H1zm19 0h3v2h-3zM4.200 5.600l1.400-1.400 2.100 2.100-1.400 1.400zm12.100 12.100l1.400-1.400 2.100 2.100-1.400 1.400zM5.600 19.800l-1.400-1.400 2.100-2.100 1.400 1.400zM17.700 7.700l-1.400-1.400 2.100-2.100 1.400 1.400z"/>'],
      ['배경화면', '#32ade6', '<path d="M3 5h18v14H3zm2 2v7.500l4-4 3 3 3-4 4 5V7z"/>']
    ];
    function grp(list) {
      return '<div class="st-grp">' + list.map(function (r) {
        var val = r[3] === 'toggle' ? '<span class="st-tg"><i></i></span>' : (r[3] ? '<span class="st-val">' + esc(r[3] === 'SK_WiFi' ? '연결 안 됨' : r[3]) + '</span>' : '');
        return '<div class="st-row">' + sq(r[1], r[2]) + '<span class="st-tx">' + esc(r[0]) + '</span>' + val + '<span class="st-chev">' + '<svg width="8" height="14" viewBox="0 0 8 14" fill="none" stroke="#c4c4c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l6 6-6 6"/></svg></span></div>';
      }).join('') + '</div>';
    }
    layer.innerHTML = '<div class="st-app">' + sbHtml('dark') +
      '<div class="st-sc"><h1 class="st-h">설정</h1>' +
      '<div class="st-search">' + I.search + '<span>검색</span></div>' +
      '<div class="st-grp st-me"><div class="st-av" id="stAv"></div><div class="st-mt"><b id="stNm"></b><span>Apple ID, iCloud+, 미디어 및 구입 항목</span></div></div>' +
      '<div class="st-cap">내 정보</div>' +
      '<div class="st-grp">' +
        '<label class="st-row st-in"><span class="st-tx">성</span><input id="stLast" maxlength="4" autocomplete="off"></label>' +
        '<label class="st-row st-in"><span class="st-tx">이름</span><input id="stFirst" maxlength="8" autocomplete="off"></label>' +
        '<label class="st-row st-in"><span class="st-tx">인스타그램</span><input id="stIg" maxlength="30" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></label>' +
      '</div><div class="st-foot">바꾸면 바로 저장돼요.</div>' +
      '<div class="st-grp"><div class="st-row" id="stNotif"><span class="st-ic" style="background:#ff3b30"><svg viewBox="0 0 24 24" fill="#fff"><path d="M12 2a6 6 0 00-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 00-6-6zm-2 17a2 2 0 004 0z"/></svg></span><span class="st-tx">알림 끄기</span><span class="st-tg real' + (notifOff ? ' on' : '') + '" id="stTg"><i></i></span></div></div>' +
      '<div class="st-foot">켜면 X 쪽지와 인스타그램 알림이 오지 않아요.</div>' +
      grp(G1) + grp(G2) + grp(G3) +
      '<div class="st-grp"><button type="button" class="st-row st-reset" id="stReset">처음부터 다시 하기</button></div>' +
      '<div style="text-align:center;color:#aeaeb2;font-size:12px;padding:6px 0 30px">버전 24</div></div></div>';
    var iL = qs(layer, '#stLast'), iF = qs(layer, '#stFirst'), iI = qs(layer, '#stIg');
    qs(layer, '#stNotif').addEventListener('click', function () {
      setNotifOff(!notifOff);
      qs(layer, '#stTg').classList.toggle('on', notifOff);
    });
    iL.value = USER.last || ''; iF.value = USER.first || USER.name || ''; iI.value = USER.igId || '';
    function paint() {
      qs(layer, '#stNm').textContent = fullName();
      qs(layer, '#stAv').textContent = (USER.first || USER.name || '').charAt(0);
    }
    paint();
    iL.addEventListener('input', function () { USER.last = iL.value.trim(); saveUser(); paint(); });
    iF.addEventListener('input', function () { if (iF.value.trim()) { USER.first = iF.value.trim(); saveUser(); paint(); } });
    iF.addEventListener('blur', function () { iF.value = USER.first; });
    iI.addEventListener('input', function () {
      iI.value = iI.value.replace(/^@+/, '').replace(/[^A-Za-z0-9_.]/g, '');
      if (iI.value) { USER.igId = iI.value; saveUser(); }
    });
    iI.addEventListener('blur', function () { iI.value = USER.igId; });
    qs(layer, '#stReset').addEventListener('click', function () {
      var o = el('<div class="st-ov"><div class="st-sheet"><div class="st-st"><b>처음부터 다시 할까요?</b><span>지금까지의 진행 상황이 모두 초기화돼요. 이름과 인스타그램 아이디는 그대로 남아요.</span></div>' +
        '<button type="button" class="st-ok" id="stOk">처음부터 다시 하기</button><button type="button" class="st-no" id="stNo">취소</button></div></div>');
      phone.appendChild(o);
      requestAnimationFrame(function () { o.classList.add('on'); });
      qs(o, '#stNo').addEventListener('click', function () { o.classList.remove('on'); setTimeout(function () { o.remove(); }, 220); });
      qs(o, '#stOk').addEventListener('click', function () {
        ['sim2.dm', 'sim2.dmRead', 'sim2.sms', 'sim2.smsOrder', 'sim2.kkav', 'sim2.res'].forEach(function (k) { store.del(k); });
        location.reload();
      });
    });
    return null;
  };

  IMPL.phone = function (layer) {
    setHB('dark');
    var mode = 'all';
    layer.innerHTML = '<div class="pa" style="position:absolute;inset:0;background:#fff">' + sbHtml('dark') +
      '<div class="scroll"><div class="pa-body"><h1>최근 통화</h1>' +
      '<div class="search">' + I.search + '<span>검색</span>' + I.mic + '</div><div id="calls"></div></div></div>' +
      '<div class="pa-top"><button class="cbtn" type="button">편집</button>' +
      '<div class="seg"><button type="button" data-m="all" class="on">모두</button><button type="button" data-m="missed">부재중 전화</button></div>' +
      '<button class="cbtn" type="button" style="padding:0 13px">' + I.filter + '</button></div>' +
      '<div class="tabbar">' +
      '<div class="tab">' + I.tStar + '즐겨찾기</div>' +
      '<div class="tab on">' + I.tClock + '최근 통화</div>' +
      '<div class="tab">' + I.tPerson + '연락처</div>' +
      '<div class="tab">' + I.tKeys + '키패드</div>' +
      '<div class="tab">' + I.tVoice + '음성 사서함' + (C.VOICEMAIL_BADGE ? '<span class="bd">' + esc(C.VOICEMAIL_BADGE) + '</span>' : '') + '</div></div></div>';
    function renderCalls() {
      var html = '';
      C.CALLS.forEach(function (c) {
        if (mode === 'missed' && !c.missed) { return; }
        var nm = c.name + (c.count ? ' (' + c.count + ')' : '');
        var arrow = c.dir === 'out' ? '↗' : '↙';
        html += '<div class="row">' + avHtml(c.avatar, c.name) +
          '<div class="mid"><div class="nm"><b class="' + (c.missed ? 'red' : '') + '">' + esc(nm) + '</b><span>' + arrow + ' ' + esc(c.type) + '</span></div>' +
          '<div class="when">' + esc(c.time) + '</div><div class="info">' + I.info + '</div></div></div>';
      });
      qs(layer, '#calls').innerHTML = html;
    }
    renderCalls();
    qsa(layer, '.seg button').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-m');
        qsa(layer, '.seg button').forEach(function (x) { x.classList.toggle('on', x === b); });
        renderCalls();
        qs(layer, '.scroll').scrollTop = 0;
      });
    });
  };

  /* =========================================================
     사파리 앱
     ========================================================= */
  IMPL.safari = function (layer) {
    setHB('dark');
    var cards = C.NEWS.map(function (n, i) {
      return '<div class="ncard" data-i="' + i + '"><div class="th">' + imgTag(n.img) + '</div><div class="nt"><div class="pr">' + esc(n.press) + ' · ' + esc(n.time) + '</div><div class="ti">' + esc(n.title) + '</div></div></div>';
    }).join('');
    layer.innerHTML = '<div class="sf" style="position:absolute;inset:0;background:#fff">' + sbHtml('dark') +
      '<div class="sf-main"><div class="glogo"><span style="color:#4285f4">G</span><span style="color:#ea4335">o</span><span style="color:#fbbc05">o</span><span style="color:#4285f4">g</span><span style="color:#34a853">l</span><span style="color:#ea4335">e</span></div>' +
      '<div class="gsearch">' + I.search + '<span>검색 또는 URL 입력</span>' + I.mic + '</div>' +
      '<div class="sec">뉴스</div>' + cards + '</div>' +
      '<div class="addr"><span style="color:#0a84ff">' + I.back + '</span><span class="u">google.com</span><span style="color:#0a84ff">' + I.share + '</span></div></div>';
    qsa(layer, '.ncard').forEach(function (c) {
      c.addEventListener('click', function () { openArticle(layer, C.NEWS[parseInt(c.getAttribute('data-i'), 10)]); });
    });
  };
  function openArticle(layer, n) {
    var paras = n.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var v = pushView(layer, sbHtml('dark') +
      '<div class="art-top"><button class="back" type="button">' + I.back + '<span>뒤로</span></button><span style="width:50px"></span></div>' +
      '<div class="scroll"><div class="art-body"><div class="pr">' + esc(n.press) + '</div><h2>' + esc(n.title) + '</h2><div class="tm">입력 ' + esc(n.time) + '</div>' +
      '<div class="hero">' + imgTag(n.img) + '</div>' + paras + '</div></div>', 'art');
    qs(v, '.back').addEventListener('click', function () { popView(v); });
  }

  /* =========================================================
     문자 앱
     ========================================================= */
  var msgUnread = null;
  var smsLoaded = false, smsOrder = [];
  function loadSms() {
    if (smsLoaded) { return; }
    smsLoaded = true;
    try {
      var all = JSON.parse(store.get('sim2.sms') || '{}');
      smsOrder = JSON.parse(store.get('sim2.smsOrder') || '[]');
      C.MESSAGES.forEach(function (m) {
        (all[m.id] || []).forEach(function (t) {
          var tx = typeof t === 'string' ? t : t.text, tm = typeof t === 'string' ? START_T : t.time;
          m.msgs.push({ from: 'me', time: tm, text: tx, reply: true }); m.delivered = true;
        });
      });
    } catch (e) {}
  }
  function saveSms(id, text, time) {
    var all = {};
    try { all = JSON.parse(store.get('sim2.sms') || '{}'); } catch (e) {}
    (all[id] = all[id] || []).push({ text: text, time: time });
    store.set('sim2.sms', JSON.stringify(all));
    smsOrder = smsOrder.filter(function (x) { return x !== id; });
    smsOrder.unshift(id);
    store.set('sim2.smsOrder', JSON.stringify(smsOrder));
  }
  IMPL.messages = function (layer) {
    loadSms();
    setHB('dark');
    if (!msgUnread) { msgUnread = {}; C.MESSAGES.forEach(function (m) { msgUnread[m.id] = !!m.unread; }); }
    layer.innerHTML = '<div class="ms" style="position:absolute;inset:0;background:#fff">' + sbHtml('dark') +
      '<div class="scroll"><div class="ms-body"><h1>메시지</h1><div class="search" style="margin-top:2px">' + I.search + '<span>검색</span>' + I.mic + '</div>' +
      '<div class="fpills"><span class="fpill">모든 메시지</span><span class="fpill">알 수 없는 발신자</span></div><div id="threads"></div></div></div>' +
      '<div class="ms-top"><span class="txt">편집</span><span class="txt">' + I.pencil + '</span></div></div>';
    function renderList() {
      var html = '';
      var ordered = [];
      smsOrder.forEach(function (id) { C.MESSAGES.forEach(function (m) { if (m.id === id) { ordered.push(m); } }); });
      C.MESSAGES.forEach(function (m) { if (smsOrder.indexOf(m.id) === -1) { ordered.push(m); } });
      ordered.forEach(function (m) {
        var last = m.msgs[m.msgs.length - 1];
        var lt = m.listTime;
        if (smsOrder.indexOf(m.id) !== -1 && last.reply) { lt = last.time; }
        html += '<div class="trow" data-id="' + m.id + '">' + (msgUnread[m.id] ? '<i class="dot"></i>' : '') +
          avHtml(m.kind === 'spam' ? 'person' : 'initial', m.name) +
          '<div class="mid"><div class="l1"><b>' + esc(m.name) + '</b><span>' + esc(lt) + ' ' + I.chevR + '</span></div><div class="pv">' + esc(last.text) + '</div></div></div>';
      });
      qs(layer, '#threads').innerHTML = html;
      qsa(layer, '.trow').forEach(function (r) {
        r.addEventListener('click', function () { openThread(layer, r.getAttribute('data-id'), renderList); });
      });
    }
    renderList();
  };
  function linkify(text) {
    return String(text).split(/(https?:\/\/[^\s]+)/g).map(function (p) {
      return /^https?:\/\//.test(p) ? '<span class="lnk">' + esc(p) + '</span>' : esc(p);
    }).join('');
  }
  function openThread(layer, id, onClose) {
    var m = C.MESSAGES.filter(function (x) { return x.id === id; })[0];
    if (!m) { return; }
    msgUnread[id] = false;
    var spam = m.kind === 'spam';
    var bubs = '', prev = '';
    var shown = m.msgs.slice();
    var replyStart = -1;
    if (smsOrder.indexOf(m.id) !== -1) {
      for (var ri = shown.length - 1; ri >= 0 && shown[ri].reply; ri--) { replyStart = ri; }
    }
    shown.forEach(function (g, i) {
      if (i === replyStart) { bubs += '<div class="divd">오늘 ' + esc(g.time) + '</div>'; }
      bubs += '<div class="bub ' + g.from + (prev && prev !== g.from ? ' gap' : '') + '"><div class="b">' + linkify(g.text) + '</div><span class="tt">' + esc(g.time) + '</span></div>';
      prev = g.from;
    });
    var v = pushView(layer, sbHtml('dark') +
      '<div class="th-top"><button class="back" type="button" style="padding-top:2px">' + I.back + '<span>메시지</span></button>' +
      '<div class="c">' + avHtml(spam ? 'person' : 'initial', m.name) + '<span>' + esc(m.name) + ' ' + '</span></div><span style="margin-top:6px">' + I.video + '</span></div>' +
      '<div class="th-body" id="thb"><div class="divd">' + esc(m.divider) + '</div>' +
      (spam ? '<div class="note-s">문자(SMS) · 발신자 정보 없음</div>' : '') + bubs +
      '<div class="deliv" id="dlv" style="display:' + (m.delivered && m.msgs[m.msgs.length - 1].from === 'me' ? 'block' : 'none') + '">전달됨</div></div>' +
      (spam
        ? '<div class="th-in"><div class="pl">' + I.plus + '</div><div class="bx"><span>문자 메시지</span>' + I.mic + '</div></div>'
        : '<form class="th-in" id="thForm" action="#"><div class="pl">' + I.plus + '</div><div class="bx"><input id="thQ" type="text" enterkeyhint="send" placeholder="문자 메시지" autocomplete="off" autocapitalize="off" spellcheck="false"><span class="mic">' + I.mic + '</span><button type="submit" class="snd" aria-label="보내기"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button></div></form>'), 'ms');
    v.style.background = '#fff';
    var body = qs(v, '#thb');
    var thForm = qs(v, '#thForm');
    if (thForm) {
      var q = qs(v, '#thQ'), bx = qs(v, '.th-in .bx');
      var repliedOnce = m.msgs.some(function (x) { return x.reply; });
      q.addEventListener('input', function () { bx.classList.toggle('has', q.value.length > 0); });
      thForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = String(q.value || '').replace(/^\s+|\s+$/g, '');
        if (!text) { return; }
        var dl = qs(v, '#dlv');
        var lastFrom = m.msgs[m.msgs.length - 1].from;
        var nowT = clockHHMM();
        if (!repliedOnce) {
          dl.insertAdjacentHTML('beforebegin', '<div class="divd">오늘 ' + nowT + '</div>');
          repliedOnce = true;
        }
        dl.insertAdjacentHTML('beforebegin', '<div class="bub me' + (lastFrom !== 'me' ? ' gap' : '') + '"><div class="b">' + linkify(text) + '</div><span class="tt">' + nowT + '</span></div>');
        m.msgs.push({ from: 'me', time: nowT, text: text, reply: true });
        m.delivered = true;
        saveSms(m.id, text, nowT);
        dl.style.display = 'block';
        q.value = ''; bx.classList.remove('has');
        body.scrollTop = body.scrollHeight;
      });
    }
    requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; });
    setTimeout(function () { body.scrollTop = body.scrollHeight; }, 320);
    qs(v, '.back').addEventListener('click', function () { popView(v, onClose); });
    qsa(v, '.lnk').forEach(function (a) { a.addEventListener('click', soon); });
    /* 길게 누르거나 왼쪽으로 밀면 보낸 시각 표시 */
    var timer = null, sx = 0, moved = false;
    body.addEventListener('pointerdown', function (e) {
      sx = e.clientX; moved = false;
      timer = setTimeout(function () { body.classList.toggle('reveal'); timer = null; }, 450);
    });
    body.addEventListener('pointermove', function (e) { if (Math.abs(e.clientX - sx) > 8 && timer) { clearTimeout(timer); timer = null; } });
    body.addEventListener('pointerup', function (e) {
      if (timer) { clearTimeout(timer); timer = null; }
      if (e.clientX - sx < -40) { body.classList.toggle('reveal'); }
    });
    body.addEventListener('pointercancel', function () { if (timer) { clearTimeout(timer); timer = null; } });
  }

  /* 앱 안에서 웹페이지 열기 (카톡 인앱 브라우저 모양). 사이트가 막아서 안 보이면 ↗ 버튼으로 새 탭에서 열어요 */
  function openExternal(url) {
    var w = null;
    try { w = window.open(url, '_blank', 'noopener'); } catch (x) {}
    if (!w) { var t = document.createElement('a'); t.href = url; t.target = '_blank'; t.rel = 'noopener'; document.body.appendChild(t); t.click(); t.remove(); }
  }
  function openWeb(parent, url) {
    var host = String(url).replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    var xIc = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.200" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
    var outIc = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/></svg>';
    var rfIc = '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><path d="M19.500 12a7.500 7.500 0 11-2.200-5.300M19.500 4.500v4.500H15"/></svg>';
    var v = pushView(parent, sbHtml('dark') +
      '<div class="wb-top"><button type="button" class="wb-x" aria-label="닫기">' + xIc + '</button><div class="wb-url">' + I.lockSm.replace('width="22" height="22"', 'width="13" height="13"') + '<span>' + esc(host) + '</span></div>' +
      '<button type="button" class="wb-rf" aria-label="새로고침">' + rfIc + '</button><button type="button" class="wb-out" aria-label="새 탭으로 열기">' + outIc + '</button></div>' +
      '<div class="wb-load"><i></i></div><iframe class="wb-fr" src="' + esc(url) + '" referrerpolicy="no-referrer" allow="autoplay; fullscreen"></iframe>', 'wb');
    var fr = qs(v, '.wb-fr'), ld = qs(v, '.wb-load');
    fr.addEventListener('load', function () { ld.classList.add('done'); });
    qs(v, '.wb-x').addEventListener('click', function () { popView(v); });
    qs(v, '.wb-rf').addEventListener('click', function () { ld.classList.remove('done'); fr.src = url; });
    qs(v, '.wb-out').addEventListener('click', function () { openExternal(url); });
    return v;
  }

  /* =========================================================
     카카오톡 앱
     ========================================================= */
  var kkUnread = null;
  var kkGoto = null;
  var pendingKk = null;
  /* ---- 카카오톡 대화 스크립트 (config.js 의 KAKAO.SCRIPT 에서 가져와요) ----
     방 이름마다 step 목록: auto = 입력창을 누르면 자동으로 쳐지는 문장(비우면 직접 입력), reply = 보내면 상대가 보내는 말,
     then = { wait: 밀리초, msgs: [...] } 일정 시간 뒤 이어서 오는 말, done: true = 대화 끝 */
  var KK_SCRIPT = (C.KAKAO && C.KAKAO.SCRIPT) || {};
  /* ---- 가짜 한글 키패드: 자동 입력할 때 아래에서 올라오고 눌리는 글쇠가 깜빡여요 ---- */
  var HG = {
    CHO: 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',
    JUNG: 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ',
    JONG: ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'],
    VSPLIT: { 'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅐ'], 'ㅚ': ['ㅗ', 'ㅣ'], 'ㅝ': ['ㅜ', 'ㅓ'], 'ㅞ': ['ㅜ', 'ㅔ'], 'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ'] },
    FSPLIT: { 'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'] },
    SHIFT: { 'ㄲ': 'ㄱ', 'ㄸ': 'ㄷ', 'ㅃ': 'ㅂ', 'ㅆ': 'ㅅ', 'ㅉ': 'ㅈ', 'ㅒ': 'ㅐ', 'ㅖ': 'ㅔ' }
  };
  function hgComp(c, j, f) { return String.fromCharCode(0xAC00 + (c * 21 + j) * 28 + f); }
  /* 문장을 "눌러야 할 글쇠 순서 + 그때 입력창에 보일 글자"로 풀어요 */
  function hgSteps(text) {
    var out = [], pre = '';
    for (var k = 0; k < text.length; k++) {
      var ch = text.charAt(k), code = ch.charCodeAt(0);
      if (code >= 0xAC00 && code <= 0xD7A3) {
        var n = code - 0xAC00, fi = n % 28, ji = ((n - fi) / 28) % 21, ci = Math.floor(n / 588);
        var cho = HG.CHO.charAt(ci), jung = HG.JUNG.charAt(ji), jong = HG.JONG[fi];
        out.push({ v: pre + cho, keys: [cho] });
        var vs = HG.VSPLIT[jung];
        if (vs) { out.push({ v: pre + hgComp(ci, HG.JUNG.indexOf(vs[0]), 0), keys: [vs[0]] }); out.push({ v: pre + hgComp(ci, ji, 0), keys: [vs[1]] }); }
        else { out.push({ v: pre + hgComp(ci, ji, 0), keys: [jung] }); }
        if (fi) {
          var fs = HG.FSPLIT[jong];
          if (fs) { out.push({ v: pre + hgComp(ci, ji, HG.JONG.indexOf(fs[0])), keys: [fs[0]] }); out.push({ v: pre + hgComp(ci, ji, fi), keys: [fs[1]] }); }
          else { out.push({ v: pre + hgComp(ci, ji, fi), keys: [jong] }); }
        }
        pre += ch;
      } else if (ch === ' ') { pre += ch; out.push({ v: pre, keys: [' '] }); }
      else if (code >= 0x3131 && code <= 0x3163) { pre += ch; out.push({ v: pre, keys: [ch] }); }
      else { pre += ch; out.push({ v: pre, keys: [] }); }
    }
    return out;
  }
  function kkbHtml() {
    var rows = ['ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ', 'ㅁㄴㅇㄹㅎㅗㅓㅏㅣ', 'ㅋㅌㅊㅍㅠㅜㅡ'];
    function key(c) { return '<i class="k" data-j="' + c + '">' + c + '</i>'; }
    return '<div class="kkb" id="kkb">' +
      '<div class="kr1">' + rows[0].split('').map(key).join('') + '</div>' +
      '<div class="kr2">' + rows[1].split('').map(key).join('') + '</div>' +
      '<div class="kr3"><i class="k fn" data-j="SHIFT"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"><path d="M12 4l8 9h-5v7H9v-7H4z"/></svg></i>' + rows[2].split('').map(key).join('') +
      '<i class="k fn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linejoin="round"><path d="M21 5H9l-6 7 6 7h12z"/><path d="M13 9.500l5 5M18 9.500l-5 5" stroke-linecap="round"/></svg></i></div>' +
      '<div class="kr4"><i class="k fn w">123</i><i class="k fn g"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.800"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></i><i class="k sp" data-j=" ">스페이스</i><i class="k fn w r">줄바꿈</i></div>' +
      '</div>';
  }
  /* =========================================================
     전화 걸려오기 / 엔딩 화면 (스토리에서 PHONE.call, PHONE.ending 으로 불러요)
     음성 파일 확장자는 mp3/m4a/wav 중 아무거나 돼요
     ========================================================= */
  var kkCtx = null;
  document.addEventListener('pointerdown', function () {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (AC && !kkCtx) { kkCtx = new AC(); }
      if (kkCtx && kkCtx.state === 'suspended') { kkCtx.resume(); }
    } catch (e) {}
  }, true);
  /* 답장이 긍정인지 부정인지 말투로 가려요. 모호하면 긍정으로 봐요 */
  var KK_NEG = /아니|아냐|안\s*(해|할|돼|되|갈|만나|받)|싫|끝내|끝이|끝났|헤어|그만|못\s*(해|하|만나|받)|꺼져|몰라|별로|ㄴㄴ|노노|됐어|관심\s*없|지겨|미워|연락\s*하지/;
  var KK_POS = /응|웅|ㅇㅇ|좋|그래|알겠|알았|사랑|고마|보고\s*싶|다시|만나|하자|할게|해줘|괜찮|ㅎㅎ|ㅋㅋ|♡|❤|믿|용서|오빠|자기|그럴게|당연/;
  function kkPos(t) {
    var x = String(t || '');
    x = x.replace(/(끝내|헤어지|그만두|그만하|이별하)\S*\s*(기\s*)?(싫|않)\S*/g, '좋아').replace(/(안|못)\s*(싫|미워)\S*/g, '좋아');
    var n = (x.match(new RegExp(KK_NEG.source, 'g')) || []).length;
    var p = (x.match(new RegExp(KK_POS.source, 'g')) || []).length;
    return n <= p;
  }
  /* "나 다시 받아주면 안될까?"에 대한 답: 받아주면(응 알겠어 / 보고싶어) true → 1번 엔딩 쪽, 거절하면(미안 안될거같다 / 헤어졌잖아) false → 2번 엔딩 */
  function kkAccept(t) {
    var x = String(t || '').replace(/\s+/g, '');
    if (/안(될|돼|되|받|만나|할)|못(받|만나|돌아|해)|무리|아닌것|헤어졌|끝났|이미끝|싫|아니|아냐|ㄴㄴ|그만|거절|돌아갈수없|힘들|어려울|어렵/.test(x)) { return false; }
    if (/응|웅|ㅇㅇ|알겠|알았|그래|보고싶|좋|사랑|다시|만나|고마|ㅇㅋ|오케|당연|받아줄|받아줘|받아줄게|ㅎㅎ|♡|❤/.test(x)) { return true; }
    if (/미안/.test(x)) { return false; }
    return true;
  }
  /* "너 진짜 나랑 이렇게 끝낼 거야?"에 대한 답: 끝내는 데 동조하면 false(이별), 반대하거나 애정 표현이면 true(재회) */
  function kkKeep(t) {
    var x = String(t || '').replace(/\s+/g, '');
    if (/보고싶지(않|안)|안보고싶|사랑(안|하지않)|좋아하지않|정떨어|질렸/.test(x)) { return false; }
    if (/(끝내|헤어지|그만두|그만하|이별하)\S*(기)?(싫|않|안)|끝낼수없|끝(내|나)지(말|마)|안끝|못끝|못헤어/.test(x)) { return true; }
    if (/보고싶|사랑|좋아해|미안|고마|다시|사귀|돌아와|가지마|잡고싶|곁에/.test(x)) { return true; }
    if (/끝내자|끝낼|끝이야|끝났|끝내|헤어지자|헤어져|헤어지|그만하자|이별/.test(x)) { return false; }
    if (/^(응|웅|ㅇㅇ|ㅇ|그래|맞아|어|ㅇㅋ|알았|네|넹|그렇지|당연)/.test(x)) { return false; }
    if (/아니|아냐|ㄴㄴ|싫|노노|못/.test(x)) { return true; }
    return true;
  }
  /* "난 진짜 너 위해서" 뒤의 답: 사과/긍정/애정 표현 또는 말줄임표면 false(버전 2), 그 밖의 답은 한 글자여도 true(버전 4) */
  function kkHarsh(t) {
    var raw = String(t || '');
    if (/\.{2,}|…/.test(raw)) { return false; }
    if (/[?？]/.test(raw)) { return true; }
    var x = raw.replace(/\s+/g, '');
    if (/안보고|보고싶지(않|안)|사랑(안|하지않)|좋아하지않|싫|미안(안|하지않)|안미안/.test(x)) { return true; }
    if (/^(응|웅|어|ㅇㅇ|ㅇ|ㅇㅋ|그래|그랭|알겠어|알았어|네|넹|넵)[.!~ㅎㅋ♡❤]*$/.test(x)) { return false; }
    if (/미안|죄송|ㅈㅅ|ㅁㅇ|잘못했|보고싶|보고파|사랑|좋아해|고마|다시만나|돌아와/.test(x)) { return false; }
    return true;
  }
  /* 음성 재생(없으면 6초 뒤 끊겨요). 끝나면 onEnd */
  function kkVoice(base, onEnd) {
    var exts = ['.mp3', '.m4a', '.wav', '.aac', '.ogg'], i = 0, a = null, ended = false, fb = null;
    function end() { if (ended) { return; } ended = true; clearTimeout(fb); onEnd(); }
    function tryNext() {
      if (ended) { return; }
      if (i >= exts.length) { fb = setTimeout(end, 6000); return; }
      a = new Audio(); a.preload = 'auto'; a.src = base + exts[i++];
      a.addEventListener('error', tryNext, { once: true });
      a.addEventListener('ended', end);
      var p = a.play(); if (p && p.catch) { p.catch(function () {}); }
    }
    tryNext();
    return { stop: function () { ended = true; clearTimeout(fb); if (a) { try { a.pause(); } catch (e) {} } } };
  }
  function kkRing() {
    var on = true, t = null, el1 = null;
    try {
      el1 = new Audio('./ringtone.mp3'); el1.loop = true;
      el1.addEventListener('error', synth, { once: true });
      var p = el1.play(); if (p && p.catch) { p.catch(function () {}); }
    } catch (e) { synth(); }
    var synthOn = false;
    function synth() {
      if (!on || synthOn) { return; } synthOn = true;
      try {
        if (!kkCtx) { var AC = window.AudioContext || window.webkitAudioContext; kkCtx = new AC(); }
        if (kkCtx.state === 'suspended') { kkCtx.resume(); }
      } catch (e) { return; }
      var N = [880, 1175, 1319, 880, 1175, 1319];
      (function burst() {
        if (!on) { return; }
        var now = kkCtx.currentTime;
        N.forEach(function (f, k) {
          var d = [0, 0.17, 0.34, 0.62, 0.79, 0.96][k], o = kkCtx.createOscillator(), g = kkCtx.createGain();
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, now + d); g.gain.linearRampToValueAtTime(0.2, now + d + 0.02); g.gain.exponentialRampToValueAtTime(0.001, now + d + 0.3);
          o.connect(g); g.connect(kkCtx.destination); o.start(now + d); o.stop(now + d + 0.32);
        });
        t = setTimeout(burst, 2600);
      })();
    }
    return function () { on = false; clearTimeout(t); if (el1) { try { el1.pause(); } catch (e) {} } };
  }
  /* 전화 화면: 수락/거절 → 통화 화면 + 음성 → 음성이 끝나면 자동으로 끊겨요 */
  function kkCall(o) {
    var hs = I.handset;
    var nm = o.name || '';
    function ci(path) { return '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>'; }
    var ICN = {
      speaker: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M3 9.500v5h4l5 4.500v-14l-5 4.500zM15 8.500a5 5 0 010 7l-1.200-1.200a3.300 3.300 0 000-4.600zM17.500 6a8.500 8.500 0 010 12l-1.200-1.200a6.800 6.800 0 000-9.600z"/></svg>',
      ft: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M3 8.500A2.500 2.500 0 015.500 6h8A2.500 2.500 0 0116 8.500v7a2.500 2.500 0 01-2.500 2.500h-8A2.500 2.500 0 013 15.500zM17.500 10.500L22 7.500v9l-4.500-3z"/></svg>',
      mute: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="#fff" stroke="none"/><path d="M5.500 11a6.500 6.500 0 0013 0M12 17.500V21M4 4l16 16"/></svg>',
      more: '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="5" cy="12" r="2.200"/><circle cx="12" cy="12" r="2.200"/><circle cx="19" cy="12" r="2.200"/></svg>',
      keypad: '<svg viewBox="0 0 24 24" fill="#fff"><circle cx="5" cy="4" r="1.900"/><circle cx="12" cy="4" r="1.900"/><circle cx="19" cy="4" r="1.900"/><circle cx="5" cy="10" r="1.900"/><circle cx="12" cy="10" r="1.900"/><circle cx="19" cy="10" r="1.900"/><circle cx="5" cy="16" r="1.900"/><circle cx="12" cy="16" r="1.900"/><circle cx="19" cy="16" r="1.900"/><circle cx="12" cy="22" r="1.900"/></svg>',
      clock: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 3a8.500 8.500 0 100 17 8.500 8.500 0 000-17zm0 2a6.500 6.500 0 110 13 6.500 6.500 0 010-13zm-.8 2.500v5l3.600 2.100.8-1.400-2.900-1.700V7.500z"/><path d="M4 4.500L7.500 2 8.700 3.600 5.200 6zM20 4.500L16.500 2l-1.200 1.600L18.800 6z"/></svg>',
      msg: '<svg viewBox="0 0 24 24" fill="#fff"><path d="M12 3C6.500 3 2 6.500 2 10.800c0 2.400 1.300 4.500 3.400 5.900-.2 1.300-.8 2.600-1.800 3.600 2.200-.2 3.900-1 5.100-2 .9.200 2.200.4 3.300.4 5.500 0 10-3.500 10-7.900S17.500 3 12 3z"/></svg>'
    };
    var ov = el('<div class="kcall"><div class="kc-bg"></div>' +
      '<div class="kc-top"><div class="kc-sub">휴대전화</div><div class="kc-name">' + esc(nm) + '</div><div class="kc-ph">휴대전화</div></div>' +
      '<div class="kc-grid"></div>' +
      '<div class="kc-quick"><div class="kq"><i>' + ICN.clock + '</i><span>나중에 보기</span></div><div class="kq"><i>' + ICN.msg + '</i><span>메시지</span></div></div>' +
      '<div class="kc-btm"><div class="kc-btn dec" id="kcDec"><i>' + hs + '</i><span>거절</span></div><div class="kc-btn acc" id="kcAcc"><i>' + hs + '</i><span>승인</span></div></div></div>');
    phone.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('on'); });
    var stopRing = kkRing(), voice = null, timer = null, sec = 0, closed = false;
    function close(cb) {
      if (closed) { return; } closed = true;
      clearInterval(timer); clearTimeout(ov.__t); stopRing();
      if (voice) { voice.stop(); }
      qs(ov, '.kc-sub').textContent = '통화 종료';
      setTimeout(function () { ov.classList.remove('on'); setTimeout(function () { ov.remove(); if (cb) { cb(); } }, 280); }, 700);
    }
    qs(ov, '#kcDec').addEventListener('click', function () {
      close(function () {
        if (o.onDecline) { o.onDecline(); }
      });
    });
    qs(ov, '#kcAcc').addEventListener('click', function () {
      stopRing();
      var sub = qs(ov, '.kc-sub'), g = qs(ov, '.kc-grid');
      ov.classList.add('conn');
      var items = [['스피커', ICN.speaker], ['FaceTime', ICN.ft], ['소리 끔', ICN.mute], ['더 보기', ICN.more], ['종료', null], ['키패드', ICN.keypad]];
      g.innerHTML = items.map(function (t) {
        if (!t[1]) { return '<div class="kb2 end" id="kcEnd"><i>' + hs + '</i><span>종료</span></div>'; }
        return '<div class="kb2"><i>' + t[1] + '</i><span>' + t[0] + '</span></div>';
      }).join('');
      var bt = qs(ov, '.kc-btm'); if (bt) { bt.remove(); }
      var qk = qs(ov, '.kc-quick'); if (qk) { qk.remove(); }
      sub.textContent = '연결 중...';
      ov.__t = setTimeout(function () {
        sub.textContent = '0:00';
        timer = setInterval(function () { sec++; sub.textContent = Math.floor(sec / 60) + ':' + (sec % 60 < 10 ? '0' : '') + (sec % 60); }, 1000);
      }, 900);
      voice = kkVoice(o.voice, function () { close(function () { if (o.onEnd) { o.onEnd(); } }); });
      qs(ov, '#kcEnd').addEventListener('click', function () { close(function () { if (o.onEnd) { o.onEnd(); } }); });
    });
    return ov;
  }
  function kkEnding(kind, num) {
    var good = kind === 'reunion';
    var ov = el('<div class="kend start ' + (good ? 'good' : 'bad') + '"><div class="ke-in"><div class="ke-n">' + num + '번 엔딩</div><div class="ke-t">' + (good ? '재회엔딩💕💕' : '이별엔딩💔') + '</div><button type="button" class="ke-b">처음부터 다시</button></div></div>');
    phone.appendChild(ov);
    resolve((C.IMG && C.IMG.startBg) || './start-bg.jpg', function (v) {
      if (!v) { return; }
      ov.style.backgroundImage = 'url("' + v + '")';
      ov.style.backgroundSize = 'cover'; ov.style.backgroundRepeat = 'no-repeat'; ov.style.backgroundPosition = 'center';
    });
    requestAnimationFrame(function () { ov.classList.add('on'); });
    qs(ov, '.ke-b').addEventListener('click', function () { location.reload(); });
  }
  /* config.js 의 스토리 스크립트에서 쓸 수 있는 기능: PHONE.call / PHONE.ending / PHONE.replies / PHONE.incoming */
  window.PHONE = { call: function (o) { return kkCall(o); }, ending: function (k, n) { kkEnding(k, n); }, replies: function (n, l, d) { kkReplies(n, l, d); }, incoming: function (n, t) { kkIncoming(n, t); } };
  var kkS = {};          /* 방 이름 -> { step, blocked } */
  var kkUI = null;       /* 지금 열려 있는 카카오톡 화면 { layer, name, add(g), refresh(), goRoom(n) } */
  var KK_DATE = C.TODAY;
  /* ---- 카톡 선택지 대화 진행 ----
     config.js 의 KAKAO.SCRIPT["이름"] = [ 단계, 단계, ... ]
     { me: "문장" }            → 내가 보낼 말 (자판으로 자동 입력, 보내기는 직접)
     { them: ["말", "말"] }     → 상대가 보내는 말 (입력 중 … 표시 후 도착)
     { wait: 밀리초, them: [...] } → 기다렸다가 상대가 보내는 말
     { choice: [ { label: "버튼 글자", steps: [...] }, { label: "답장 안 하기", silent: true, steps: [...] } ] } → 선택지 */
  function kkState(name) {
    if (!KK_SCRIPT[name] || !KK_SCRIPT[name].length) { return null; }
    if (!kkS[name]) { kkS[name] = { q: KK_SCRIPT[name].slice(), busy: false }; }
    return kkS[name];
  }
  function kkStep(name) { var st = kkState(name); return st && !st.busy ? (st.q[0] || null) : null; }
  function kkUiField(name) { var ui = kkUiLive(); if (ui && ui.name === name && ui.field) { ui.field(); } }
  /* 방끼리 연결: 선택하면 표시(set)가 남고, 다른 방이 그 표시를 보고 대사·선택지·진행이 바뀌어요 */
  var KK_FLAGS = {};
  function kkHasAll(f) { if (!f) { return true; } return (Array.isArray(f) ? f : [f]).every(function (x) { return !!KK_FLAGS[x]; }); }
  function kkHasAny(f) { if (!f) { return false; } return (Array.isArray(f) ? f : [f]).some(function (x) { return !!KK_FLAGS[x]; }); }
  function kkOk(o) { return !o || (kkHasAll(o['if']) && !kkHasAny(o.unless)); }
  function kkSetFlags(f) {
    if (!f) { return; }
    (Array.isArray(f) ? f : [f]).forEach(function (x) { if (x) { KK_FLAGS[x] = true; } });
    setTimeout(function () { Object.keys(KK_SCRIPT).forEach(function (n) { if (kkS[n]) { kkRun(n); } }); }, 0);
  }
  /* 세 카톡이 모두 끝나면(남은 단계가 '저녁 기다리기'뿐이면) 잠시 뒤 폰 시간을 저녁으로 돌리고 '저녁' 표시를 남겨요 */
  var EVE_T = null;
  function kkCheckEvening() {
    if (EVE_T || KK_FLAGS['저녁']) { return; }
    var names = Object.keys(KK_SCRIPT); if (!names.length) { return; }
    var all = names.every(function (n) {
      var st = kkS[n]; if (!st || st.busy) { return false; }
      var h = st.q[0]; return !h || (h.need && String(h.need) === '저녁');
    });
    if (!all) { return; }
    EVE_T = setTimeout(function () { setGameClock(C.EVENING_TIME || '21:40'); kkSetFlags('저녁'); setTimeout(kkCheckNextDay, 300); }, C.EVENING_DELAY || 150000);
  }
  /* 저녁 대화까지 다 끝나면(또는 저녁 대화가 없으면) 다음 날 새벽으로 넘어가요 */
  var NEXT_T = null;
  function kkCheckNextDay() {
    if (NEXT_T || !KK_FLAGS['저녁'] || KK_FLAGS['다음날'] || !C.DAY2) { return; }
    var names = Object.keys(KK_SCRIPT);
    var all = names.every(function (n) {
      var st = kkS[n]; if (!st) { return true; } if (st.busy) { return false; }
      var h = st.q[0]; return !h || (h.need && String(h.need) === '다음날');
    });
    if (!all) { return; }
    NEXT_T = setTimeout(goNextDay, C.DAY2.DELAY || 15000);
  }
  function altIds(seed, n) {
    var Lt = 'abcdefghijklmnopqrstuvwxyz', Dg = '0123456789', out = [], seen = {};
    function rnd(k) { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.floor(seed / 65536) % k; }
    function pick(set, k) { var o = ''; for (var i = 0; i < k; i++) { o += set.charAt(rnd(set.length)); } return o; }
    while (out.length < n) {
      var t = rnd(4), u;
      if (t === 0) { u = 'user' + pick(Dg, 8); } else if (t === 1) { u = pick(Lt, 1) + pick(Dg, 7); } else if (t === 2) { u = 'user_' + pick(Dg, 7); } else { u = pick(Lt, 1) + '_' + pick(Dg, 7); }
      if (!seen[u]) { seen[u] = 1; out.push(u); }
    }
    return out;
  }
  function goNextDay() {
    var D2 = C.DAY2; if (!D2 || KK_FLAGS['다음날']) { return; }
    /* 날짜·시간 */
    var nd = new Date(TD[0], TD[1] - 1, TD[2] + 1);
    TD[0] = nd.getFullYear(); TD[1] = nd.getMonth() + 1; TD[2] = nd.getDate();
    C.TODAY = TD[0] + '-' + pad2(TD[1]) + '-' + pad2(TD[2]); KK_DATE = C.TODAY;
    if (DATE_AUTO || D2.DATE) { C.DATE = D2.DATE || makeDate(); }
    setGameClock(D2.TIME || '03:12');
    /* X: 추천 타임라인 교체, 알계 팔로우 알림, 협박 쪽지 */
    if (D2.TWEETS) { C.TWEETS = D2.TWEETS; }
    var ids = altIds(20261025, 80), no = [], k = 0, mins = ['방금', '방금', '1분', '1분', '2분', '3분', '3분', '4분', '5분', '6분', '8분', '9분', '11분', '13분', '15분', '18분', '21분', '25분'];
    mins.forEach(function (tm, i) { var c = 1 + (i % 3); no.push({ who: ids.slice(k, k + c), more: i % 2 ? 0 : 7 + (i * 13) % 40, time: tm }); k += c; });
    C.NOTIS = D2.NOTIS || no; notiOpen = false;
    if (D2.X_FOLLOWERS !== undefined) { C.X_FOLLOWERS = D2.X_FOLLOWERS; }
    if (D2.DMS) {
      C.DMS = D2.DMS.map(function (d) { var o = {}; for (var x in d) { o[x] = d[x]; } return o; });
      DM_PRE = 0; while (DM_PRE < C.DMS.length && !C.DMS[DM_PRE].live) { DM_PRE++; }
      dmArrived = DM_PRE; dmStarted = false; dmRead = {};
    }
    /* 인스타 팔로우 요청 */
    if (D2.IG_REQ_POPS !== undefined) { C.IG_REQ_POPS = D2.IG_REQ_POPS; igPopN = 0; IG_RQ = null; }
    if (D2.DM_GAP_MIN) { C.DM_GAP_MIN = D2.DM_GAP_MIN; } if (D2.DM_GAP_MAX) { C.DM_GAP_MAX = D2.DM_GAP_MAX; }
    KK_FLAGS['다음날'] = true;
    /* 화면: 바로 새벽 잠금화면으로 */
    if (L.app) { try { if (appCleanup) { appCleanup(); } } catch (e) {} appCleanup = null; L.app = null; curApp = null; }
    L.home = null; showLock();
    kkSetFlags('다음날');
  }
  function setGameClock(hhmm) {
    var m = String(hhmm).match(/(\d+):(\d+)/); if (!m) { return; }
    CLOCK_BASE = parseInt(m[1], 10) * 60 + parseInt(m[2], 10); CLOCK0 = Date.now();
    var t = clockStr(); qsa(phone, '.clk').forEach(function (n) { n.textContent = t; });
  }
  function kkRunAll() { Object.keys(KK_SCRIPT).forEach(function (n) { kkRun(n); }); }
  function kkRun(name) {
    var st = kkState(name); if (!st || st.busy) { return; }
    var guard = 0;
    while (st.q.length && guard++ < 500) {
      var s0 = st.q[0];
      if (!kkOk(s0)) { st.q.shift(); continue; }                                   /* if / unless 가 안 맞는 단계는 건너뛰기 */
      if (s0.need) { if (!kkHasAll(s0.need)) { break; } st.q.shift(); continue; }  /* 다른 방에서 표시가 생길 때까지 기다리기 */
      if (s0.cond) { st.q.shift(); st.q = ((kkOk(s0.cond) ? s0.then : s0['else']) || []).concat(st.q); continue; }
      if (s0.set && !s0.me && !s0.them && !s0.choice) { st.q.shift(); kkSetFlags(s0.set); continue; }
      if (s0.to) {                                                               /* 다른 방으로 메시지 보내기 (기다리지 않고 바로 다음 단계) */
        st.q.shift();
        (function (o) { setTimeout(function () { if (o.them && o.them.length) { kkReplies(o.to, o.them, function () { if (o.set2) { kkSetFlags(o.set2); } }); } }, o.wait || 0); })(s0);
        continue;
      }
      if (s0.ending) { st.q.shift(); setTimeout(function () { kkEnding(s0.ending[0], s0.ending[1]); }, s0.wait || 2200); kkUiField(name); return; }
      break;
    }
    var s = st.q[0];
    if (s && (s.them || s.wait) && !s.choice && !s.me) {
      st.q.shift(); st.busy = true; kkUiField(name);
      var go = function () { st.busy = false; if (s.set) { kkSetFlags(s.set); } kkRun(name); };
      var say = function () { if (s.them && s.them.length) { kkReplies(name, s.them, go); } else { go(); } };
      if (s.wait) { setTimeout(say, s.wait); } else { say(); }
      return;
    }
    kkUiField(name);
    kkCheckEvening();
    kkCheckNextDay();
  }
  function kkSent(name) { var st = kkState(name); if (!st) { return; } var s0 = st.q[0]; if (s0 && s0.me) { st.q.shift(); if (s0.set) { kkSetFlags(s0.set); } } kkRun(name); }
  function kkPick(name, i) {
    var st = kkState(name); if (!st || st.busy) { return; }
    var s = st.q[0]; if (!s || !s.choice || !s.choice[i]) { return; }
    st.q.shift(); st.q = (s.choice[i].steps || []).concat(st.q);
    kkSetFlags(s.choice[i].set);
    kkRun(name);
  }
  function kkUiLive() { return kkUI && kkUI.layer && kkUI.layer.isConnected ? kkUI : null; }
  function kkPush(name, from, text) {
    var K = C.KAKAO; if (!K || !K.ROOMS[name]) { return null; }
    var g = { d: KK_DATE, t: clockHHMM(), from: from, text: text };
    K.ROOMS[name].msgs.push(g);
    return g;
  }
  function kkBanner(name, text) {
    qsa(phone, '.banner').forEach(function (o) { if (o.__kk) { o.remove(); } });
    var KP = {};
    try { if (C.KAKAO && C.KAKAO.PHOTOS) { Object.keys(C.KAKAO.PHOTOS).forEach(function (k) { KP[k] = C.KAKAO.PHOTOS[k]; }); } } catch (e) {}
    var pf = KP[name];
    var av = '<div class="bav"><i>' + I.person + '</i>' + (pf ? '<img data-rm="1" src="' + esc(rs(pf)) + '" data-orig="' + esc(pf) + '" alt="" decoding="async" draggable="false">' : '') + '<em>' + ICO.kakao + '</em></div>';
    var b = el('<div class="banner"><div class="bi" style="background:none">' + av + '</div><div><b>' + esc(name) + '</b><span>' + esc(fillName(text)) + '</span></div></div>');
    b.__kk = true; phone.appendChild(b);
    b.style.pointerEvents = 'auto'; b.style.cursor = 'pointer';
    b.addEventListener('click', function () { if (b.__moved) { return; } b.remove(); goKk(name); });
    swipeAway(b);
    void b.offsetWidth;
    requestAnimationFrame(function () { b.classList.add('on'); });
    setTimeout(function () { b.classList.add('out'); }, 3200);
    setTimeout(function () { b.remove(); }, 3800);
  }
  function goKk(name) {
    if (current === 'lock') { pendingKk = name; showPass(); return; }
    if (current === 'app' && curApp === 'kakao' && kkUiLive()) { kkUiLive().goRoom(name); return; }
    if (current === 'app') { closeApp(true); }
    if (current === 'home') { kkGoto = name; openApp('kakao', null, { instant: true }); }
  }
  /* 상대 메시지 도착: 방이 열려 있으면 바로 붙이고, 아니면 안 읽은 표시 + 알림 */
  function kkIncoming(name, text) {
    var g = kkPush(name, 'them', text); if (!g) { return; }
    var ui = kkUiLive();
    if (ui && ui.name === name) { ui.add(g); return; }
    var K = C.KAKAO;
    if (kkUnread) { kkUnread[name] = (kkUnread[name] || 0) + 1; } else { K.ROOMS[name].unread = (K.ROOMS[name].unread || 0) + 1; }
    if (ui) { ui.refresh(); }
    if (current === 'lock' && L.lock) {
      var box = qs(L.lock, '.notifs');
      if (box) {
        var old = qs(box, '.notif[data-kk="' + name + '"]'); if (old) { old.remove(); }
        var n = el('<div class="notif pop" data-kk="' + esc(name) + '"><div class="ic">' + ICO.kakao + '</div><div class="tx"><b>' + esc(name) + '</b><span>' + esc(fillName(text)) + '</span></div><div class="tm">' + esc(g.t) + '</div></div>');
        box.insertBefore(n, box.firstChild); bindLockNotifs(); lockDense();
      }
    } else { kkBanner(name, text); }
  }
  function kkReplies(name, list, done) {
    var i = 0;
    (function next() {
      if (i >= list.length) { if (done) { done(); } return; }
      var wait = i === 0 ? 1800 : 1000 + Math.random() * 1000;
      var ui = kkUiLive();
      if (ui && ui.name === name) { setTimeout(function () { var u = kkUiLive(); if (u && u.name === name) { u.typing(true); } }, i === 0 ? 500 : 80); }
      setTimeout(function () { var u = kkUiLive(); if (u && u.name === name) { u.typing(false); } kkIncoming(name, list[i]); i++; next(); }, wait);
    })();
  }
  IMPL.kakao = function (layer) {
    setHB('dark');
    var K = C.KAKAO || { FRIENDS: [], ROOMS: {} };
    var TODAY = TD;
    var WD = ['일', '월', '화', '수', '목', '금', '토'];
    if (!kkUnread) { kkUnread = {}; Object.keys(K.ROOMS).forEach(function (n) { kkUnread[n] = K.ROOMS[n].unread || 0; }); }
    var tab = 'friends';
    var kic = {
      search: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L21 21"/></svg>',
      add: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round"><circle cx="9.500" cy="8" r="3.600"/><path d="M2.500 20c.5-3.800 3.300-5.600 7-5.600M18 10v7M14.500 13.500h7"/></svg>',
      music: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l10-2v12"/><circle cx="6.500" cy="18" r="2.500"/><circle cx="16.500" cy="16" r="2.500"/></svg>',
      gear: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.900" stroke-linejoin="round"><circle cx="12" cy="12" r="3.200"/><path d="M19.400 13a7.800 7.800 0 000-2l2-1.500-2-3.400-2.300.9a7.600 7.600 0 00-1.700-1l-.4-2.500h-4l-.4 2.500a7.600 7.600 0 00-1.700 1l-2.300-.9-2 3.400 2 1.500a7.800 7.800 0 000 2l-2 1.500 2 3.400 2.300-.9c.5.400 1.100.7 1.700 1l.4 2.500h4l.4-2.500c.6-.3 1.200-.6 1.700-1l2.300.9 2-3.400z"/></svg>',
      newchat: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4C7 4 3 7.200 3 11.200c0 2.400 1.400 4.500 3.600 5.800-.2 1.200-.9 2.300-1.900 3.200 2-.1 3.700-.9 4.900-1.900.8.200 1.500.3 2.400.3 5 0 9-3.200 9-7.400"/><path d="M18 3v6M15 6h6"/></svg>',
      tFriends: '<svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.500" r="4.200"/><path d="M3.800 21c.6-4.600 4-7 8.200-7s7.600 2.400 8.200 7z"/></svg>',
      tChat: '<svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.500 3 2 6.600 2 11.100c0 2.800 1.700 5.200 4.300 6.700-.2 1.300-.9 2.600-2 3.600 2.200-.1 4.100-1 5.500-2.100.7.100 1.400.2 2.200.2 5.500 0 10-3.600 10-8.100S17.500 3 12 3z"/></svg>',
      tOpen: '<svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.500 3 2 6.600 2 11.100c0 2.800 1.700 5.200 4.300 6.700-.2 1.300-.9 2.600-2 3.600 2.200-.1 4.100-1 5.500-2.100.7.100 1.400.2 2.200.2 5.500 0 10-3.600 10-8.100S17.500 3 12 3z"/><circle cx="8" cy="11" r="1.200" fill="#fff"/><circle cx="12" cy="11" r="1.200" fill="#fff"/><circle cx="16" cy="11" r="1.200" fill="#fff"/></svg>',
      tMore: '<svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2.200"/><circle cx="12" cy="12" r="2.200"/><circle cx="19" cy="12" r="2.200"/></svg>',
      plus: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
      emo: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="1.800" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.500 14c.8 1.500 2 2.200 3.500 2.200s2.700-.7 3.500-2.200"/><circle cx="9" cy="10" r=".6" fill="#333"/><circle cx="15" cy="10" r=".6" fill="#333"/></svg>',
      hash: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"><path d="M9 4L7 20M17 4l-2 20M4 9h17M3 15h17"/></svg>',
      menu: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'
    };
    /* 카톡 프로필 사진: config.js 의 KAKAO.PHOTOS 에 { "이름": "./사진.jpg" } 로 적어요 */
    var KKFILE = {};
    if (K.PHOTOS) { Object.keys(K.PHOTOS).forEach(function (k) { KKFILE[k] = K.PHOTOS[k]; }); }
    Object.keys(KKFILE).forEach(function (k) { resolve(KKFILE[k], function () {}); });
    var AVP = {};
    AVP = {};
    function avK(size, key) {
      var ph = key && AVP[key];
      var st = size ? ' style="width:' + size + 'px;height:' + size + 'px;border-radius:' + Math.round(size * 0.37) + 'px"' : '';
      if (!ph && key) {
        var fp = KKFILE[key];
        if (fp) { return '<div class="kk-av"' + st + '>' + I.person.replace('<svg ', '<svg width="' + Math.round((size || 48) * 0.62) + '" height="' + Math.round((size || 48) * 0.62) + '" ') + '<img data-rm="1" src="' + esc(rs(fp)) + '" data-orig="' + esc(fp) + '" alt=""></div>'; }
      }
      if (ph) { return '<div class="kk-av"' + st + '><img src="' + ph + '" alt="" style="width:100%;height:100%;object-fit:cover;display:block"></div>'; }
      return '<div class="kk-av"' + st + '>' + I.person.replace('<svg ', '<svg width="' + Math.round((size || 48) * 0.62) + '" height="' + Math.round((size || 48) * 0.62) + '" ') + '</div>';
    }
    function pickPhoto(key, done) {
      var inp = document.createElement('input');
      inp.type = 'file'; inp.accept = 'image/*'; inp.style.display = 'none';
      inp.addEventListener('change', function () {
        var f = inp.files && inp.files[0];
        if (!f) { return; }
        var url = URL.createObjectURL(f), im = new Image();
        im.onload = function () {
          var S = 256, c = document.createElement('canvas'); c.width = S; c.height = S;
          var w = im.naturalWidth, h = im.naturalHeight, m = Math.min(w, h);
          c.getContext('2d').drawImage(im, (w - m) / 2, (h - m) / 2, m, m, 0, 0, S, S);
          AVP[key] = c.toDataURL('image/jpeg', 0.82);
          try { store.set('sim2.kkav', JSON.stringify(AVP)); } catch (e) {}
          URL.revokeObjectURL(url);
          done();
        };
        im.src = url;
      });
      document.body.appendChild(inp); inp.click();
      setTimeout(function () { inp.remove(); }, 60000);
    }
    function kt(x) { return esc(fillName(x)); }
    function pd(d) { var a = d.split('-'); return [parseInt(a[0], 10), parseInt(a[1], 10), parseInt(a[2], 10)]; }
    function ktime(t) {
      var a = t.split(':'), h = parseInt(a[0], 10), m = a[1];
      return (h < 12 ? '오전 ' : '오후 ') + (h % 12 === 0 ? 12 : h % 12) + ':' + m;
    }
    function listTime(g) {
      var d = pd(g.d);
      if (d[0] === TODAY[0] && d[1] === TODAY[1] && d[2] === TODAY[2]) { return ktime(g.t); }
      if (d[0] === TODAY[0] && d[1] === TODAY[1] && d[2] === TODAY[2] - 1) { return '어제'; }
      if (d[0] === TODAY[0]) { return d[1] + '월 ' + d[2] + '일'; }
      return d[0] + '. ' + d[1] + '. ' + d[2];
    }
    function longDate(d) {
      var a = pd(d), wd = WD[new Date(a[0], a[1] - 1, a[2]).getDay()];
      return a[0] + '년 ' + a[1] + '월 ' + a[2] + '일 ' + wd + '요일';
    }
    function totalUnread() { var n = 0; Object.keys(kkUnread).forEach(function (k) { n += kkUnread[k] || 0; }); return n; }
    var main;
    layer.innerHTML = '<div class="kk" style="position:absolute;inset:0;background:#fff"><div id="kkMain"></div></div>';
    main = qs(layer, '#kkMain');
    /* 하단 탭: 친구 / 채팅 / 지금 / 쇼핑 / 더보기 (새 카카오톡처럼 아이콘만) */
    var TBI = {
      friends: '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7.600" r="4.300"/><path d="M3.600 20.400c.6-4.500 4-7 8.400-7s7.800 2.500 8.400 7c.1.600-.3 1.100-.9 1.100H4.500c-.6 0-1-.5-.9-1.100z"/></svg>',
      chats: '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.500 3 2 6.600 2 11.100c0 2.800 1.700 5.200 4.300 6.700-.2 1.300-.9 2.600-2 3.600 2.200-.1 4.100-1 5.500-2.100.7.100 1.400.2 2.200.2 5.500 0 10-3.600 10-8.100S17.500 3 12 3z"/></svg>',
      now: '<svg width="32" height="30" viewBox="0 0 26 24" fill="currentColor"><path d="M15.500 4.500c4.400 0 8 2.900 8 6.500 0 2.100-1.200 4-3.100 5.200.2 1.100.8 2.100 1.600 2.900-1.900 0-3.400-.7-4.500-1.600-.6.100-1.300.2-2 .2"/><path d="M10.500 5C5.800 5 2 8.100 2 11.900c0 2.400 1.500 4.500 3.700 5.700-.2 1.100-.8 2.200-1.700 3.100 1.900-.1 3.500-.8 4.700-1.800.6.100 1.200.2 1.800.2 4.700 0 8.500-3.100 8.500-7.200S15.200 5 10.500 5z" stroke="#fff" stroke-width="1.300"/><path d="M8.600 9.200v5.400l4.600-2.700z" fill="#fff"/></svg>',
      shop: '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8.300 8V6.700a3.700 3.700 0 017.400 0V8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5.200 8h13.600c.6 0 1 .4 1 1l.6 10.600c.1 1-.7 1.900-1.700 1.900H5.300c-1 0-1.800-.9-1.700-1.900L4.200 9c0-.6.400-1 1-1z"/></svg>',
      more: '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><circle cx="4.500" cy="12" r="2.100"/><circle cx="12" cy="12" r="2.100"/><circle cx="19.500" cy="12" r="2.100"/></svg>'
    };
    function barHtml() {
      var u = totalUnread();
      function t(id) {
        return '<button type="button" class="' + (tab === id ? 'on' : '') + '" data-t="' + id + '" aria-label="' + id + '">' + TBI[id] + (id === 'chats' && u > 0 ? '<i class="bd">' + u + '</i>' : '') + '</button>';
      }
      return '<div class="kk-bar kk-bar2">' + t('friends') + t('chats') + t('now') + t('shop') + t('more') + '</div>';
    }
    function bindBar() {
      qsa(main, '.kk-bar button').forEach(function (b) {
        b.addEventListener('click', function () {
          var t = b.getAttribute('data-t');
          if (t !== tab) { tab = t; render(); }
        });
      });
    }
    /* 카톡 쇼핑/더보기 그림 조각 (kk-ui.jpg 한 장에 모아 둔 것) */
    var KUI = {"p1": [0, 0, 744, 1036], "p2": [746, 0, 390, 1036], "ad": [0, 1038, 1109, 555], "r1": [0, 1595, 140, 141], "r2": [142, 1595, 141, 141], "w1": [285, 1595, 140, 141], "w2": [427, 1595, 141, 141], "w3": [570, 1595, 141, 141], "ord": [713, 1595, 138, 137], "i1": [853, 1595, 102, 102], "i2": [957, 1595, 102, 102], "i3": [1061, 1595, 101, 102], "i4": [0, 1738, 102, 102], "i5": [104, 1738, 102, 102], "g00": [208, 1738, 101, 101], "g01": [311, 1738, 102, 101], "g02": [415, 1738, 102, 101], "g03": [519, 1738, 101, 101], "g10": [622, 1738, 101, 102], "g11": [725, 1738, 102, 102], "g12": [829, 1738, 102, 102], "g13": [933, 1738, 101, 102], "g20": [1036, 1738, 101, 102], "g21": [0, 1842, 102, 102], "g22": [104, 1842, 102, 102], "g23": [208, 1842, 101, 102]};
    function spr(n, w, cls) {
      var r = KUI[n], sc = w / r[2], h = Math.round(r[3] * sc);
      return '<i class="kspr ' + (cls || '') + '" style="width:' + w + 'px;height:' + h + 'px;background-size:' + Math.round(1200 * sc) + 'px auto;background-position:-' + Math.round(r[0] * sc) + 'px -' + Math.round(r[1] * sc) + 'px"></i>';
    }
    function sprFull(n) {
      var r = KUI[n];
      return '<i class="kspr" style="width:100%;aspect-ratio:' + r[2] + '/' + r[3] + ';background-size:' + (1200 / r[2] * 100).toFixed(3) + '% auto;background-position:' + (r[0] / (1200 - r[2]) * 100).toFixed(3) + '% ' + (r[1] / (1944 - r[3]) * 100).toFixed(3) + '%"></i>';
    }
    function head(title, icons) { return '<div class="kk-head kk-head2"><h1>' + title + '</h1><div class="ics">' + icons.join('') + '</div></div>'; }
    var kic2 = {
      newOpen: '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M11 6.500C6.800 6.500 3.500 9.100 3.500 12.400c0 2 1.200 3.700 3.100 4.800-.2.900-.7 1.800-1.400 2.500 1.600-.1 2.900-.7 3.900-1.500.6.100 1.200.2 1.900.2 4.200 0 7.500-2.700 7.500-6"/><path d="M14 5.500c3.600 0 6.500 2.300 6.500 5.300M18 2.500v5M15.500 5h5"/></svg>',
      myBag: '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.900" stroke-linejoin="round"><path d="M8.500 8V6.700a3.500 3.500 0 017 0V8"/><path d="M5 8h14l.8 12.500H4.200z"/><text x="12" y="17.300" text-anchor="middle" font-size="6.400" font-weight="900" fill="#111" stroke="none" font-family="Arial,Helvetica,sans-serif">MY</text></svg>',
      scan: '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"><path d="M4 8.500V5.500A1.500 1.500 0 015.500 4h3M15.500 4h3A1.500 1.500 0 0120 5.500v3M20 15.500v3a1.500 1.500 0 01-1.500 1.500h-3M8.500 20h-3A1.500 1.500 0 014 18.500v-3M4 12h16"/></svg>'
    };
    /* 더보기 아이콘 (선만 있는 검정 아이콘) */
    function lic(inner) { return '<svg class="kmi" width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#111" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>'; }
    var MI = {
      '선물하기': lic('<path d="M6 13.500l10-4.500 10 4.500v10L16 28 6 23.500z"/><path d="M6 13.500L16 18l10-4.500M16 18v10"/><path d="M16 9.500S11.500 7 11.500 4.800c0-1.400 1.100-2.300 2.300-2.300 1 0 1.700.5 2.200 1.300.5-.8 1.200-1.300 2.200-1.300 1.200 0 2.300.9 2.300 2.300C20.500 7 16 9.500 16 9.500z"/>'),
      '받은선물': lic('<path d="M16 27.500S3.500 20 3.500 11.800C3.500 8 6.200 5 9.800 5c2.700 0 4.900 1.500 6.200 3.700C17.300 6.500 19.500 5 22.200 5c3.600 0 6.300 3 6.300 6.800C28.500 20 16 27.500 16 27.500z"/><path d="M16 9v18M4.500 15h23"/><path d="M16 15c-2-3-5.500-3.500-5.500-1.500S14 15 16 15zM16 15c2-3 5.500-3.500 5.500-1.500S18 15 16 15z"/>'),
      '톡딜': lic('<circle cx="8.500" cy="8.500" r="3.300"/><circle cx="23.500" cy="23.500" r="3.300"/><path d="M19 4l-7.500 11h7l-6.500 13"/>'),
      '이모티콘': lic('<path d="M16 3.500c6.900 0 12.500 5.400 12.500 12.100S22.900 27.700 16 27.700c-1.600 0-3.200-.3-4.600-.8L6 28.500l1.300-4.600C5 21.700 3.500 18.800 3.500 15.600 3.500 8.900 9.100 3.500 16 3.500z"/><path d="M12.500 13.500v.8M19.500 12.600c.8-.6 1.700-.6 2.400 0M11.500 18.500c2.500 2.600 6.500 2.600 9 0"/>'),
      '라이브쇼핑': lic('<path d="M4 7h24v14H18.500L14 26v-5H4z"/><text x="16" y="17.700" text-anchor="middle" font-size="8.300" font-weight="800" fill="#111" stroke="none" font-family="Arial,Helvetica,sans-serif">LIVE</text>'),
      '메이커스': lic('<circle cx="16" cy="16" r="12"/><path d="M10.500 21.500v-11l5.500 7 5.500-7v11"/>'),
      '프렌즈': lic('<path d="M9.500 9.500a3.300 3.300 0 115.300-2.600M22.500 9.500a3.300 3.300 0 10-5.300-2.600"/><path d="M5 17c0-6 4.900-10 11-10s11 4 11 10-4.900 10-11 10S5 23 5 17z"/><path d="M11 15.300h2.500M18.500 15.300H21"/><path d="M13 20.300c0-1.500 1.300-2.300 3-2.300s3 .8 3 2.300-1.300 2.200-3 2.200-3-.7-3-2.200z"/><path d="M16 18v1.300"/>'),
      'AI국민비서': lic('<circle cx="16" cy="16" r="12.500" stroke-width="2.200"/><path d="M8.500 15c.8-3.700 4-6 7.700-6 3.900 0 7 2.900 7 6.600 0 3.300-2.700 5.900-5.900 5.900-2.400 0-4.300-1.900-4.300-4.300 0-1.800 1.400-3.200 3.200-3.200" stroke-width="2.600"/>'),
      '모바일신분증': lic('<rect x="3.500" y="7" width="25" height="18" rx="2.500"/><circle cx="11" cy="14" r="2.800"/><path d="M6.500 21.300c.6-2.600 2.300-3.900 4.500-3.900s3.900 1.300 4.500 3.900M18.500 13.500h6.500M18.500 18h6.500"/>'),
      '톡클라우드': lic('<path d="M9.500 24.500h14a5.500 5.500 0 001-10.900A8 8 0 009 12.500a6 6 0 00.5 12z"/>'),
      '캘린더': lic('<rect x="5.500" y="6" width="21" height="21" rx="1.500"/><path d="M10.500 3.500V8M21.500 3.500V8M5.500 10.500h21M12 18l3 3 5.500-6"/>'),
      '예약하기': lic('<rect x="5.500" y="6" width="21" height="21" rx="1.500"/><path d="M10.500 3.500V8M21.500 3.500V8M5.500 10.500h21M10.500 18.500h11M17.500 14.500l4 4-4 4"/>')
    };
    /* 쇼핑 아이콘 (색 있는 아이콘) */
    var SI = {
      gift: '<svg width="34" height="34" viewBox="0 0 32 32"><rect x="5" y="12" width="22" height="16" rx="2.500" fill="#ffb31a"/><rect x="4" y="10" width="24" height="6" rx="2" fill="#ffc83d"/><rect x="14" y="10" width="4" height="18" fill="#ff4d4d"/><path d="M16 11S9 9.500 9 6.300C9 4.500 10.300 3.300 12 3.300c2.200 0 4 3.300 4 7.700zM16 11s7-1.500 7-4.700c0-1.800-1.300-3-3-3-2.200 0-4 3.300-4 7.700z" fill="#ff4d4d"/></svg>',
      deal: '<svg width="34" height="34" viewBox="0 0 32 32"><circle cx="8.500" cy="9" r="4" fill="#ff3d57"/><circle cx="23.500" cy="23" r="4" fill="#ff3d57"/><path d="M20 3.500L11 16h7.500l-6 12.500L25 13h-7.500z" fill="#ff3d57"/></svg>',
      live: '<svg width="38" height="34" viewBox="0 0 36 32"><path d="M4 5h28a2 2 0 012 2v15a2 2 0 01-2 2H20l-6 5v-5H4a2 2 0 01-2-2V7a2 2 0 012-2z" fill="#ff2a2a"/><text x="18" y="18.800" text-anchor="middle" font-size="10" font-weight="900" fill="#fff" font-family="Arial,Helvetica,sans-serif">LIVE</text></svg>',
      brand: '<svg width="34" height="34" viewBox="0 0 32 32"><path d="M6 3h20a1.500 1.500 0 011.500 1.500v14.300c0 .5-.2.900-.6 1.200L17 28.400a1.500 1.500 0 01-2 0L5.100 20a1.500 1.500 0 01-.6-1.200V4.500A1.500 1.500 0 016 3z" fill="#ff9a3c"/><circle cx="12" cy="10" r="2" fill="#fff"/><circle cx="20" cy="17" r="2" fill="#fff"/><path d="M20.500 9L11.500 18" stroke="#fff" stroke-width="2.200" stroke-linecap="round"/></svg>',
      forme: '<svg width="36" height="34" viewBox="0 0 32 30"><path d="M16 28S2 20 2 10.200C2 5.800 5.200 2.500 9.300 2.500c2.900 0 5.300 1.600 6.700 4 1.400-2.400 3.800-4 6.700-4C26.800 2.500 30 5.800 30 10.200 30 20 16 28 16 28z" fill="#9b5cff"/></svg>'
    };
    function renderNow() {
      main.innerHTML = sbHtml('dark') + head('지금', [kic.search, kic2.newOpen, kic.gear]) +
        '<div class="kk-list kk-l2"><div class="kk-pills"><span class="kk-pill">숏폼</span><span class="kk-pill on">오픈채팅</span></div>' +
        '<div class="kk-none"><div class="ic">' + TBI.now + '</div><b>참여 중인 오픈채팅방이 없어요</b><span>관심사가 같은 사람들과 대화를 시작해 보세요</span></div><div style="height:20px"></div></div>' + barHtml();
      bindBar();
    }
    var KU = { store: 'https://store.kakao.com/', gift: 'https://gift.kakao.com/', live: 'https://shoppinglive.kakao.com/', makers: 'https://makers.kakao.com/', emo: 'https://e.kakao.com/', friends: 'https://store.kakao.com/kakaofriends' };
    function lnk(k) { return ' data-href="' + KU[k] + '"'; }
    main.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-href]') : null;
      if (!a) { return; }
      openWeb(layer, a.getAttribute('data-href'));
    });
    function renderShop() {
      var tabs = ['홈', '랭킹', '아모레특가', '아디다스쎈딜', '수능특가', '패션'].map(function (x, i) { return '<span class="kk-pill' + (i === 0 ? ' on' : '') + '"' + lnk('store') + '>' + x + '</span>'; }).join('');
      var acts = [['gift', '선물하기', 'gift'], ['deal', '톡딜', 'store'], ['live', '라이브쇼핑', 'live'], ['brand', '브랜드딜', 'store'], ['forme', 'FOR ME', 'store']].map(function (a) { return '<div class="ks-act"' + lnk(a[2]) + '><span class="si">' + SI[a[0]] + '</span><span>' + a[1] + '</span></div>'; }).join('');
      main.innerHTML = sbHtml('dark') + head('쇼핑', ['<span' + lnk('store') + '>' + kic.search + '</span>', '<span' + lnk('store') + '>' + kic2.myBag + '</span>', kic.gear]) +
        '<div class="kk-list kk-l2"><div class="kk-pills hs">' + tabs + '</div>' +
        '<div class="ks-cards hs"><div class="ks-card"' + lnk('store') + '><b>최근 본 상품</b><div class="th">' + spr('r1', 45) + spr('r2', 45) + '</div></div>' +
        '<div class="ks-card"' + lnk('store') + '><b>찜한 상품<em>더보기 ›</em></b><div class="th">' + spr('w1', 45) + spr('w2', 45) + spr('w3', 45) + '</div></div>' +
        '<div class="ks-card"' + lnk('store') + '><b>주문내역</b><div class="th">' + spr('ord', 44) + '</div></div></div>' +
        '<h2 class="ks-h">오늘의 PICK <i>i</i></h2>' +
        '<div class="ks-pick"' + lnk('store') + '>' + spr('p1', 240, 'pk') + spr('p2', 126, 'pk') + '</div>' +
        '<div class="ks-acts">' + acts + '</div><div style="height:30px"></div></div>' + barHtml();
      bindBar();
    }
    function renderMore() {
      var labels = [['선물하기', '받은선물', '톡딜', '이모티콘'], ['라이브쇼핑', '메이커스', '프렌즈', 'AI국민비서'], ['모바일신분증', '톡클라우드', '캘린더', '예약하기']];
      var gl = { '선물하기': 'gift', '받은선물': 'gift', '톡딜': 'store', '이모티콘': 'emo', '라이브쇼핑': 'live', '메이커스': 'makers', '프렌즈': 'friends' };
      var grid = labels.map(function (row, r) { return row.map(function (l, c) { return '<div class="km-it"' + (gl[l] ? lnk(gl[l]) : '') + '>' + MI[l] + '<span>' + l + '</span></div>'; }).join(''); }).join('');
      var pay = (C.KAKAO && C.KAKAO.PAY) || '10,000원';
      main.innerHTML = sbHtml('dark') + head('더보기', [kic.search, kic2.scan, '<span class="kk-dot">' + kic.gear + '</span>']) +
        '<div class="kk-list kk-l2 km"><div class="kk-pills"><span class="kk-pill on">홈</span><span class="kk-pill">지갑</span></div>' +
        '<div class="km-pay"><span class="lg"><svg width="16" height="15" viewBox="0 0 24 22" fill="#111"><path d="M12 1C5.900 1 1 4.900 1 9.800c0 3 1.900 5.700 4.800 7.300-.2 1.300-.9 2.700-2 3.700 2.400-.1 4.500-1.100 6-2.300.7.100 1.400.2 2.200.2 6.100 0 11-3.900 11-8.900S18.100 1 12 1z"/></svg><b>pay</b></span><span class="amt">' + esc(pay) + '</span><span class="sp"></span><span>송금</span><i></i><span>자산</span><i></i><span>결제</span></div>' +
        '<div class="km-grid">' + grid + '<div class="km-dots"><i class="on"></i><i></i><i></i></div></div>' +
        '<div class="km-ad">' + sprFull('ad') + '<div class="ft"><span>케이스티파이 리플 케이스</span><em>구매하기</em></div></div>' +
        '<h2 class="ks-h">카카오 나우</h2><div style="height:30px"></div></div>' + barHtml();
      bindBar();
    }
    function friendsSorted() {
      return K.FRIENDS.slice().sort(function (a, b) { return a.localeCompare(b, 'ko'); });
    }
    function renderFriends() {
      var rows = friendsSorted().map(function (n) {
        return '<div class="kk-row" data-f="' + esc(n) + '">' + avK(46, n) + '<div class="nm">' + esc(n) + '</div></div>';
      }).join('');
      main.innerHTML = sbHtml('dark') +
        '<div class="kk-head kk-head2"><h1>친구</h1><div class="ics">' + kic.search + kic.add + kic.music + kic.gear + '</div></div>' +
        '<div class="kk-list"><div class="kk-row me" data-me="1">' + avK(54, '__me') + '<div class="nm"><b>' + esc(fullName()) + '</b></div></div>' +
        '<div class="kk-sec">친구 ' + K.FRIENDS.length + '<span>' + '﹀' + '</span></div>' + rows + '<div style="height:20px"></div></div>' + barHtml();
      bindBar();
      qsa(main, '.kk-row[data-f]').forEach(function (r) {
        r.addEventListener('click', function () { openProfile(r.getAttribute('data-f')); });
      });
      var meRow = qs(main, '.kk-row.me');
      if (meRow) { meRow.addEventListener('click', function () { openProfile(fullName(), true); }); }
    }
    function chatRooms() {
      var list = [];
      K.FRIENDS.forEach(function (n) {
        var r = K.ROOMS[n];
        if (r && r.msgs && r.msgs.length) { list.push({ name: n, last: r.msgs[r.msgs.length - 1] }); }
      });
      list.sort(function (a, b) { return (b.last.d + ' ' + b.last.t).localeCompare(a.last.d + ' ' + a.last.t); });
      return list;
    }
    function renderChats() {
      var rows = chatRooms().map(function (r) {
        var u = kkUnread[r.name] || 0;
        return '<div class="kk-row ch" data-f="' + esc(r.name) + '">' + avK(52, r.name) + '<div class="mid"><div class="l1"><b>' + esc(r.name) + '</b></div><div class="pv">' + (r.last.img ? '사진' : kt(r.last.text)) + '</div></div>' +
          '<div class="rt"><span class="tm">' + esc(listTime(r.last)) + '</span>' + (u > 0 ? '<i class="bd">' + u + '</i>' : '') + '</div></div>';
      }).join('');
      main.innerHTML = sbHtml('dark') +
        '<div class="kk-head kk-head2"><h1>채팅</h1><div class="ics">' + kic.search + kic.newchat + kic.gear + '</div></div>' +
        '<div class="kk-list">' + (rows || '<div class="kk-empty">채팅방이 없어요</div>') + '<div style="height:20px"></div></div>' + barHtml();
      bindBar();
      qsa(main, '.kk-row[data-f]').forEach(function (r) {
        r.addEventListener('click', function () { openRoom(r.getAttribute('data-f')); });
      });
    }
    function listRefresh() { if (!qs(layer, '.kr')) { render(); } }
    function render() { if (tab === 'friends') { renderFriends(); } else if (tab === 'now') { renderNow(); } else if (tab === 'shop') { renderShop(); } else if (tab === 'more') { renderMore(); } else { renderChats(); } }
    function openProfile(name, isMe) {
      var key = isMe ? '__me' : name;
      var v = pushView(layer, sbHtml('light') +
        '<div class="kp-top"><button type="button" class="x" aria-label="닫기"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg></button></div>' +
        '<div class="kp-mid"><div class="kp-avw">' + avK(104, key) + '</div><div class="n">' + esc(name) + '</div></div>' +
        '<div class="kp-btm">' + (isMe ? '<button type="button" class="chat" id="kpEdit" style="display:none"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z"/></svg><span>프로필 사진 변경</span></button>' : '<button type="button" class="chat"><svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M12 3C6.500 3 2 6.600 2 11.100c0 2.800 1.700 5.200 4.300 6.700-.2 1.300-.9 2.600-2 3.600 2.200-.1 4.100-1 5.500-2.100.7.100 1.400.2 2.200.2 5.500 0 10-3.600 10-8.100S17.500 3 12 3z"/></svg><span>1:1 채팅</span></button>') + '</div>', 'kp');
      function setPh() { qs(v, '.kp-avw .kk-av').outerHTML = avK(104, key); }
      qs(v, '.x').addEventListener('click', function () { popView(v, function () { render(); }); });
      if (!isMe) { qs(v, '.chat').addEventListener('click', function () { v.remove(); openRoom(name); }); }
    }
    function rowHtml(g, prev, nx, name) {
      var html = '';
      if (!prev || g.d !== prev.d) { html += '<div class="kr-date"><span>' + longDate(g.d) + '</span></div>'; }
      var first = !prev || g.d !== prev.d || g.from !== prev.from;
      var showTime = !nx || nx.from !== g.from || nx.t !== g.t || nx.d !== g.d;
      var tm = showTime ? '<span class="ktm">' + ktime(g.t) + '</span>' : '';
      var inner = g.img ? '<div class="kb kimg"><i class="kph">' + I.photo + '</i><img data-rm="1" src="' + esc(rs(g.img)) + '" data-orig="' + esc(g.img) + '" alt="" decoding="async" draggable="false"></div>' : '<div class="kb">' + kt(g.text) + '</div>';
      if (g.from === 'me') {
        html += '<div class="kr-msg me' + (first ? ' first' : '') + '" data-t="' + g.t + '">' + tm + inner + '</div>';
      } else {
        html += '<div class="kr-msg them' + (first ? ' first' : '') + '" data-t="' + g.t + '">' + (first ? avK(40, name) : '<div class="ksp"></div>') +
          '<div class="kcol">' + (first ? '<div class="knm">' + esc(name) + '</div>' : '') + '<div class="krow">' + inner + tm + '</div></div></div>';
      }
      return html;
    }
    var SEND_IC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V6M6 11.500l6-6 6 6"/></svg>';
    function openRoom(name) {
      var room = K.ROOMS[name] || { msgs: [] };
      kkUnread[name] = 0; if (room.unread) { room.unread = 0; }
      var html = '', msgs = room.msgs;
      msgs.forEach(function (g, i) { html += rowHtml(g, msgs[i - 1], msgs[i + 1], name); });
      var v = pushView(layer, sbHtml('dark') +
        '<div class="kr-top"><button type="button" class="back">' + I.back + '</button><b>' + esc(name) + '</b><div class="ics">' + kic.search + kic.menu + '</div></div>' +
        '<div class="kr-body" id="krb">' + html + '<div style="height:12px"></div></div>' +
        '<div class="kc-ch" id="kcCh"></div><div class="kr-in"><span class="pl">' + kic.plus + '</span><div class="fld"><textarea id="krI" rows="1" placeholder="메시지 입력" autocomplete="off" autocapitalize="off" enterkeyhint="send"></textarea>' + kic.emo + '</div><span class="hs" id="krH">' + kic.hash + '</span></div>' + (kkState(name) ? kkbHtml() : ''), 'kr');
      v.style.background = '#b2c7da';
      var body = qs(v, '#krb');
      requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; });
      setTimeout(function () { body.scrollTop = body.scrollHeight; }, 320);
      var inp = qs(v, '#krI'), hs = qs(v, '#krH'), typing = false, typeTimer = null, startAuto = null;
      var st = kkState(name);
      function scroll() { body.scrollTop = body.scrollHeight; }
      function kbShow() { v.classList.add('kbup'); setTimeout(scroll, 120); setTimeout(scroll, 400); }
      function kbHide() { v.classList.remove('kbup'); }
      body.addEventListener('click', function () { if (!typing) { kbHide(); } });
      function typingRow(on) {
        var old = qs(body, '.kr-typ'); if (old) { old.remove(); }
        if (!on) { return; }
        var last = room.msgs[room.msgs.length - 1];
        var first = !last || last.from !== 'them';
        var h = '<div class="kr-typ' + (first ? ' first' : '') + '">' + (first ? avK(40, name) : '<div class="ksp"></div>') +
          '<div class="kcol">' + (first ? '<div class="knm">' + esc(name) + '</div>' : '') + '<div class="kb kdots"><i></i><i></i><i></i></div></div></div>';
        var sp = qs(body, 'div[style*="height:12px"]');
        if (sp) { sp.insertAdjacentHTML('beforebegin', h); } else { body.insertAdjacentHTML('beforeend', h); }
        scroll();
      }
      function addMsg(g) {
        typingRow(false);
        var prev = room.msgs[room.msgs.length - 2];
        if (prev && prev.from === g.from && prev.d === g.d && prev.t === g.t) {
          var rows = qsa(body, '.kr-msg'), lr = rows[rows.length - 1];
          if (lr) { var o = qs(lr, '.ktm'); if (o) { o.remove(); } }
        }
        var sp = qs(body, 'div[style*="height:12px"]');
        var h = rowHtml(g, prev, null, name);
        if (sp) { sp.insertAdjacentHTML('beforebegin', h); } else { body.insertAdjacentHTML('beforeend', h); }
        scroll();
      }
      var mirror = null;
      function measure() {
        var w = inp.clientWidth || inp.offsetWidth;
        if (!w || !inp.value) { return 38; }
        if (!mirror) {
          mirror = document.createElement('div');
          mirror.style.cssText = 'position:absolute;left:-9999px;top:0;visibility:hidden;pointer-events:none;box-sizing:border-box;padding:8px 0;font-size:16px;line-height:22px;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;word-break:normal;';
          mirror.style.fontFamily = getComputedStyle(inp).fontFamily;
          v.appendChild(mirror);
        }
        mirror.style.width = w + 'px';
        mirror.textContent = inp.value + '\u200b';
        return Math.ceil(mirror.offsetHeight);
      }
      function autosize() {
        var h = Math.max(38, Math.min(measure(), 112));
        inp.style.height = h + 'px';
        v.style.setProperty('--kx', Math.max(0, h - 38) + 'px');
        inp.scrollTop = inp.scrollHeight;
        scroll();
      }
      function syncSend() {
        autosize();
        var has = inp.value.length > 0 && !typing;
        hs.innerHTML = has ? '<button type="button" class="snd" aria-label="전송">' + SEND_IC + '</button>' : kic.hash;
        var bt = qs(hs, '.snd'); if (bt) { bt.addEventListener('click', doSend); }
      }
      var chBox = qs(v, '#kcCh');
      function doSend() {
        var text = String(inp.value || '').replace(/^\s+|\s+$/g, '');
        if (!text || typing) { return; }
        var g = kkPush(name, 'me', text); inp.value = '';
        addMsg(g); syncSend(); inp.blur();
        kkSent(name);
        var nx = kkStep(name);
        if (!(nx && nx.me)) { kbHide(); }
      }
      /* 입력창 상태: 막힘 / 선택지 / 자동 입력 */
      function field() {
        var stp = kkStep(name);
        inp.readOnly = true; inp.setAttribute('inputmode', 'none');
        inp.placeholder = '메시지 입력';
        if (!typing && !(stp && stp.me)) { inp.value = ''; }
        syncSend();
        if (stp && stp.choice) {
          kbHide();
          var vis = []; stp.choice.forEach(function (c, i) { if (kkOk(c)) { vis.push(i); } });
          if (stp.autoOne && vis.length === 1) {          /* 고를 게 하나뿐이면 바로 넘어가기 */
            chBox.classList.remove('on'); chBox.innerHTML = ''; v.classList.remove('chon');
            setTimeout(function () { kkPick(name, vis[0]); }, 500);
            return;
          }
          chBox.innerHTML = stp.choice.map(function (c, i) { return kkOk(c) ? '<button type="button" class="kc-b' + (c.silent ? ' sil' : '') + '" data-i="' + i + '">' + esc(fillName(c.label)) + '</button>' : ''; }).join('');
          chBox.classList.add('on'); v.classList.add('chon');
          requestAnimationFrame(function () { body.style.paddingBottom = (chBox.offsetHeight + 84) + 'px'; scroll(); setTimeout(scroll, 260); });
          qsa(chBox, '.kc-b').forEach(function (b) {
            b.addEventListener('click', function () { chBox.classList.remove('on'); chBox.innerHTML = ''; kkPick(name, parseInt(b.getAttribute('data-i'), 10)); });
          });
          scroll();
        } else { chBox.classList.remove('on'); chBox.innerHTML = ''; v.classList.remove('chon'); body.style.paddingBottom = ''; }
        if (stp && stp.me && startAuto && !typing && !inp.value) { setTimeout(startAuto, 650); }
      }
      if (st) {
        startAuto = function () {
          var stp = kkStep(name);
          if (typing || !stp || !stp.me || inp.value || !v.isConnected) { return; }
          inp.blur();
          var steps = hgSteps(fillName(stp.me)), i = 0; typing = true; syncSend();
          kbShow();
          function press(keys) {
            keys.forEach(function (kk) {
              var sh = HG.SHIFT[kk], base = sh || kk;
              var ks = qsa(v, '.kkb .k[data-j="' + base + '"]');
              var tg = ks[0]; if (tg) { tg.classList.add('p'); setTimeout(function () { tg.classList.remove('p'); }, 110); }
              if (sh) { var sf = qs(v, '.kkb .k[data-j="SHIFT"]'); if (sf) { sf.classList.add('p'); setTimeout(function () { sf.classList.remove('p'); }, 110); } }
            });
          }
          function nextKey() {
            if (!typing) { return; }
            if (i >= steps.length) { typing = false; syncSend(); return; }
            var s0 = steps[i++]; inp.value = s0.v; press(s0.keys); syncSend();
            typeTimer = setTimeout(nextKey, (s0.keys[0] === ' ' ? 70 : 42) + Math.random() * 38);
          }
          typeTimer = setTimeout(nextKey, 320);
        };
        inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doSend(); } });
        qs(v, '.fld').addEventListener('click', function () { startAuto(); });
        field();
        setTimeout(function () { kkRun(name); }, 0);
      } else {
        inp.readOnly = true; inp.setAttribute('inputmode', 'none'); autosize();
      }
      kkUI = { layer: layer, name: name, add: addMsg, typing: typingRow, refresh: listRefresh, field: field, goRoom: function (n) { v.remove(); kkUI.name = null; openRoom(n); } };
      qs(v, '.back').addEventListener('click', function () { clearTimeout(typeTimer); typing = false; kkUI.name = null; popView(v, function () { render(); }); });
    }
    kkUI = { layer: layer, name: null, add: function () {}, typing: function () {}, refresh: listRefresh, field: function () {}, goRoom: function (n) { openRoom(n); } };
    render();
    if (kkGoto) { var g0 = kkGoto; kkGoto = null; tab = 'chats'; render(); openRoom(g0); }
  };

  /* =========================================================
     인스타그램 앱 (비공개 계정: 프로필 / 게시물 / 스토리 보관함 / 쪽지만 눌러져요)
     ========================================================= */
  var igLiked = {};
  IMPL.instagram = function (layer) {
    setHB('dark');
    var G = C.INSTA || IG_DEF;
    /* 게시물은 날짜가 최신인 것이 맨 앞(피드 위 / 프로필 왼쪽 위)이에요 */
    G = (function (g) { var o = {}; for (var k in g) { o[k] = g[k]; } o.posts = (g.posts || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); }); return o; })(G);
    var ME = USER.igId || 'me';
    var TODAY = new Date(TD[0], TD[1] - 1, TD[2]);
    var tab = 'home';
    function bindHearts(root) {
      qsa(root, '.hh').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = parseInt(b.getAttribute('data-i'), 10);
          igLiked[i] = !igLiked[i];
          qsa(layer, '.hh[data-i="' + i + '"]').forEach(function (x) { x.classList.toggle('on', !!igLiked[i]); });
          qsa(layer, '.ig-likes[data-i="' + i + '"]').forEach(function (x) { x.textContent = '좋아요 ' + ((G.posts[i].likes || 0) + (igLiked[i] ? 1 : 0)) + '개'; });
          if (igLiked[i]) { likeDm(); }
        });
      });
    }
    var RQ = igReqIds();
    function pd(d) { var a = String(d).split('-'); return new Date(parseInt(a[0], 10), parseInt(a[1], 10) - 1, parseInt(a[2], 10)); }
    function md(d) { var x = pd(d); return (x.getMonth() + 1) + '월 ' + x.getDate() + '일'; }
    function ymd(d) { var x = pd(d); return x.getFullYear() + '년 ' + (x.getMonth() + 1) + '월 ' + x.getDate() + '일'; }
    function agoTxt(d) {
      var n = Math.round((TODAY - pd(d)) / 86400000);
      if (n < 7) { return n + '일 전'; }
      if (n < 30) { return Math.floor(n / 7) + '주 전'; }
      if (n < 365) { return Math.floor(n / 30) + '개월 전'; }
      return Math.floor(n / 365) + '년 전';
    }
    function ktime(t) {
      var a = String(t).split(':'), h = parseInt(a[0], 10);
      return (h < 12 ? '오전 ' : '오후 ') + (h % 12 === 0 ? 12 : h % 12) + ':' + a[1];
    }
    var ic = {
      home: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linejoin="round"><path d="M3.500 10.500L12 3l8.500 7.500V21h-6v-6.500h-5V21h-6z"/></svg>',
      homeOn: '<svg width="26" height="26" viewBox="0 0 24 24" fill="#111" stroke="#111" stroke-width="1.9" stroke-linejoin="round"><path d="M3.500 10.500L12 3l8.500 7.500V21h-6v-6.500h-5V21h-6z"/></svg>',
      reels: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4.500"/><path d="M3 8.500h18M8.500 3l3 5.500M14 3l3 5.500"/><path d="M10 12.500v5l4.500-2.500z" fill="#111"/></svg>',
      send: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linejoin="round" stroke-linecap="round"><path d="M21.500 3L10 14M21.500 3l-6.500 18-3.500-8-8-3.500z"/></svg>',
      search: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="7"/><path d="M16 16l5 5"/></svg>',
      heart: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linejoin="round"><path d="M12 20.500S3 15 3 8.800C3 6 5 4 7.500 4c1.800 0 3.600 1 4.500 2.600C12.900 5 14.700 4 16.500 4 19 4 21 6 21 8.800 21 15 12 20.500 12 20.500z"/></svg>',
      cmt: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linejoin="round"><path d="M20.500 11.500c0 4.500-3.800 8-8.500 8-1.100 0-2.100-.2-3-.5L4 20.500l1.300-4C4.200 15.200 3.500 13.500 3.500 11.500c0-4.400 3.800-8 8.500-8s8.500 3.600 8.500 8z"/></svg>',
      mark: '<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linejoin="round"><path d="M5.500 3.500h13v17L12 15.500l-6.500 5z"/></svg>',
      menu: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round"><path d="M4 6.500h16M4 12h16M4 17.500h16"/></svg>',
      plusSq: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.9" stroke-linecap="round"><rect x="3.500" y="3.500" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/></svg>',
      grid: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.900"><rect x="3.500" y="3.500" width="7" height="7"/><rect x="13.500" y="3.500" width="7" height="7"/><rect x="3.500" y="13.500" width="7" height="7"/><rect x="13.500" y="13.500" width="7" height="7"/></svg>',
      tag: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" stroke-width="1.8" stroke-linejoin="round"><path d="M4 4h16v16H4z" opacity="0"/><path d="M12 3.500c-3 0-4.500 2-4.500 4.500 0 2.200 1.200 4 3 5l-5 1.500c-.8.300-1 1-1 1.800V20h15v-3.700c0-.8-.2-1.500-1-1.800l-5-1.500c1.800-1 3-2.800 3-5C16.500 5.500 15 3.500 12 3.500z"/></svg>',
      reelsG: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4.500"/><path d="M3 8.500h18M8.500 3l3 5.500M14 3l3 5.500"/><path d="M10 12.500v5l4.500-2.500z" fill="#8e8e8e"/></svg>',
      lockI: '<svg width="14" height="16" viewBox="0 0 14 16" fill="none" stroke="#111" stroke-width="1.8"><rect x="1.500" y="7" width="11" height="7.500" rx="2" fill="#111"/><path d="M4 7V4.800C4 3.200 5.300 2 7 2s3 1.200 3 2.800V7"/></svg>',
      chevD: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l7 7 7-7"/></svg>',
      dots: '<svg width="20" height="20" viewBox="0 0 24 24" fill="#111"><circle cx="5" cy="12" r="1.800"/><circle cx="12" cy="12" r="1.800"/><circle cx="19" cy="12" r="1.800"/></svg>',
      x: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>',
      back: '<svg width="14" height="22" viewBox="0 0 12 20" fill="none" stroke="#111" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 10l8 8"/></svg>'
    };
    function avatar(size, ring) {
      var s = size || 32;
      return '<div class="ig-av' + (ring ? ' ring' : '') + '" style="width:' + s + 'px;height:' + s + 'px">' + I.person.replace('<svg ', '<svg width="' + Math.round(s * 0.62) + '" height="' + Math.round(s * 0.62) + '" ') + '</div>';
    }
    function imBox(src, cls) {
      return '<div class="ig-im ' + (cls || '') + '"><i class="ig-ph">' + I.photo + '</i>' + (src ? '<img data-rm="1" src="' + esc(rs(src)) + '" data-orig="' + esc(src) + '" alt="" decoding="async" draggable="false">' : '') + '</div>';
    }
    G.posts.concat([]).forEach(function (p) { if (p.img) { resolve(p.img, function () {}); } });
    (G.stories || []).forEach(function (s) { if (s.img) { resolve(s.img, function () {}); } });

    layer.innerHTML = '<div class="ig" style="position:absolute;inset:0;background:#fff"><div id="igMain"></div></div>';
    var main = qs(layer, '#igMain');

    function barHtml() {
      function b(id, icon, on) { return '<button type="button" class="' + (on ? 'on' : '') + '" data-t="' + id + '">' + icon + '</button>'; }
      var prof = '<div class="ig-pb' + (tab === 'profile' ? ' on' : '') + '">' + avatar(26) + '</div>';
      return '<div class="ig-bar">' + b('home', tab === 'home' ? ic.homeOn : ic.home, tab === 'home') + '<span class="inert">' + ic.reels + '</span>' + b('dm', ic.send, false) + '<span class="inert">' + ic.search + '</span>' +
        '<button type="button" data-t="profile">' + prof + '</button></div>';
    }
    function bindBar() {
      qsa(main, '.ig-bar button').forEach(function (b) {
        b.addEventListener('click', function () {
          var t = b.getAttribute('data-t');
          if (t === 'dm') { openDmList(); return; }
          if (t !== tab) { tab = t; render(); }
        });
      });
    }
    function postHtml(p, i, detail) {
      var cm = p.comments || [];
      var cmLine = !detail && cm.length ? '<div class="ig-more" data-i="' + i + '">댓글 ' + cm.length + '개 모두 보기</div>' : '';
      return '<article class="ig-post"><div class="ig-ph-top">' + avatar(32) + '<b>' + esc(ME) + '</b><span class="sp"></span>' + ic.dots + '</div>' +
        imBox(p.img, 'sq') +
        '<div class="ig-acts"><button type="button" class="hh' + (igLiked[i] ? ' on' : '') + '" data-i="' + i + '" aria-label="좋아요">' + ic.heart + '</button><span class="cm" data-i="' + i + '">' + ic.cmt + '</span>' + ic.send + '<span class="sp"></span>' + ic.mark + '</div>' +
        '<div class="ig-likes" data-i="' + i + '">좋아요 ' + ((p.likes || 0) + (igLiked[i] ? 1 : 0)) + '개</div>' +
        '<div class="ig-cap"><b>' + esc(ME) + '</b> ' + esc(p.caption || '') + '</div>' + cmLine +
        '<div class="ig-date">' + esc(md(p.date)) + '</div></article>';
    }
    function renderHome() {
      var feed = G.posts.map(function (p, i) { return postHtml(p, i, false); }).join('');
      main.innerHTML = sbHtml('dark') +
        '<div class="ig-top"><span class="logo">Instagram</span><span class="sp"></span><button type="button" id="igAct" aria-label="활동" class="ig-hb">' + ic.heart + '<i class="dot"></i></button><button type="button" id="igDm" aria-label="쪽지">' + ic.send + '</button></div>' +
        '<div class="ig-scroll"><div class="ig-stories"><div class="st"><div class="ig-me">' + avatar(66) + '<i class="plus"><svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M6 1.500v9M1.500 6h9"/></svg></i></div><span>내 스토리</span></div></div>' +
        feed + '<div style="height:90px"></div></div>' + barHtml();
      bindBar();
      bindHearts(main);
      qs(main, '#igDm').addEventListener('click', openDmList);
      qs(main, '#igAct').addEventListener('click', openReq);
      qsa(main, '.ig-more,.ig-acts .cm').forEach(function (n) {
        n.addEventListener('click', function () { openPost(parseInt(n.getAttribute('data-i'), 10)); });
      });
    }
    function renderProfile() {
      var cells = G.posts.map(function (p, i) { return '<div class="c" data-i="' + i + '">' + imBox(p.img, 'fill') + '</div>'; }).join('');
      main.innerHTML = sbHtml('dark') +
        '<div class="ig-top"><span class="un">' + ic.lockI + '<b>' + esc(ME) + '</b>' + ic.chevD + '</span><span class="sp"></span><span class="inert">' + ic.plusSq + '</span><button type="button" id="igMenu" aria-label="메뉴">' + ic.menu + '</button></div>' +
        '<div class="ig-scroll"><div class="ig-prof"><div class="row">' + avatar(86) +
        '<div class="stats"><div><b>' + G.posts.length + '</b><span>게시물</span></div><div><b>0</b><span>팔로워</span></div><div><b>0</b><span>팔로잉</span></div></div></div>' +
        '<div class="nm">' + esc(fullName()) + '</div>' + (G.bio ? '<div class="bio">' + esc(G.bio).replace(/\n/g, '<br>') + '</div>' : '') +
        '<div class="btns"><span class="inert">프로필 편집</span><span class="inert">프로필 공유</span></div></div>' +
        '<div class="ig-tabs"><span class="on">' + ic.grid + '</span><span>' + ic.reelsG + '</span><span>' + ic.tag + '</span></div>' +
        '<div class="ig-grid">' + cells + '</div><div style="height:90px"></div></div>' + barHtml();
      bindBar();
      qs(main, '#igMenu').addEventListener('click', openMenu);
      qsa(main, '.ig-grid .c').forEach(function (c) {
        c.addEventListener('click', function () { openPost(parseInt(c.getAttribute('data-i'), 10)); });
      });
    }
    function render() { if (tab === 'home') { renderHome(); } else { renderProfile(); } }

    function openPost(i) {
      var p = G.posts[i];
      var cm = (p.comments || []).map(function (c) {
        return '<div class="ig-cm">' + avatar(34) + '<div class="tx"><div><b>' + esc(c.user) + '</b> ' + esc(c.text) + '</div><div class="sub">' + esc(c.time || '') + '&nbsp;&nbsp;답글 달기</div></div><span class="hr">' + ic.heart.replace(/width="25" height="25"/, 'width="14" height="14"') + '</span></div>';
      }).join('');
      var v = pushView(layer, sbHtml('dark') +
        '<div class="ig-top"><button type="button" class="back">' + ic.back + '</button><b class="tt">게시물</b><span class="sp"></span></div>' +
        '<div class="ig-scroll">' + postHtml(p, i, true) + '<div class="ig-cms">' + cm + '</div><div style="height:90px"></div></div>' +
        '<div class="ig-cin">' + avatar(30) + '<span>댓글 달기...</span></div>', 'igv');
      qs(v, '.back').addEventListener('click', function () { popView(v); });
      bindHearts(v);
    }
    function openMenu() {
      var items = ['설정 및 활동', '보관', '내 활동', 'QR 코드', '저장됨', '친한 친구', '즐겨찾기'];
      var sh = el('<div class="ig-sheetbg"><div class="ig-sheet"><i class="grab"></i><div class="ttl">' + esc(ME) + '</div>' +
        items.map(function (t) { return '<div class="it' + (t === '보관' ? ' act' : '') + '" data-k="' + esc(t) + '">' + esc(t) + '</div>'; }).join('') + '</div></div>');
      layer.appendChild(sh);
      requestAnimationFrame(function () { sh.classList.add('on'); });
      function close(cb) { sh.classList.remove('on'); setTimeout(function () { sh.remove(); if (cb) { cb(); } }, 220); }
      sh.addEventListener('click', function (e) {
        if (e.target === sh) { close(); return; }
        var it = e.target.closest ? e.target.closest('.it.act') : null;
        if (it) { close(openArchive); }
      });
    }
    function openArchive() {
      var prevKey = '';
      var cells = (G.stories || []).map(function (s, i) {
        var d = pd(s.date), key = s.date;
        var badge = key !== prevKey ? '<span class="bd"><b>' + d.getDate() + '</b>' + (d.getMonth() + 1) + '월</span>' : '';
        prevKey = key;
        return '<div class="c" data-i="' + i + '">' + imBox(s.img, 'fill') + badge + '</div>';
      }).join('');
      var T = {
        story: '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#111" stroke-width="2.600" stroke-linecap="round"><circle cx="15" cy="15" r="11.500" stroke-dasharray="3.500 3.600"/></svg>',
        heart: '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#8e8e8e" stroke-width="2.200" stroke-linecap="round"><circle cx="15" cy="15" r="11.500" stroke-dasharray="3.500 3.600"/><path d="M15 20.500s-5.500-3.300-5.500-7a3 3 0 015.500-1.600 3 3 0 015.500 1.600c0 3.700-5.500 7-5.500 7z" stroke-linejoin="round"/></svg>',
        cal: '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#8e8e8e" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><rect x="3.500" y="5.500" width="23" height="21" rx="4"/><path d="M9.500 3v5M20.500 3v5M3.500 11.500h23"/><text x="15" y="23" text-anchor="middle" font-size="9" font-weight="700" fill="#8e8e8e" stroke="none" font-family="-apple-system,Helvetica,Arial">30</text></svg>',
        pin: '<svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="#8e8e8e" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><path d="M15 26s8-6.800 8-13.200a8 8 0 00-16 0C7 19.200 15 26 15 26z"/><circle cx="15" cy="12.800" r="2.800"/></svg>'
      };
      var v = pushView(layer, sbHtml('dark') +
        '<div class="ig-top ig-ah"><button type="button" class="back circ" aria-label="뒤로">' + ic.back + '</button><b class="tt">스토리 보관함 ' + ic.chevD + '</b><span class="sp"></span><span class="circ inert"><svg width="22" height="22" viewBox="0 0 24 24" fill="#111"><circle cx="5" cy="12" r="1.900"/><circle cx="12" cy="12" r="1.900"/><circle cx="19" cy="12" r="1.900"/></svg></span></div>' +
        '<div class="ig-scroll"><div class="ig-atabs"><span class="on">' + T.story + '</span><span>' + T.heart + '</span><span>' + T.cal + '</span><span>' + T.pin + '</span></div><div class="ig-arc">' + cells + '</div><div style="height:60px"></div></div>', 'igv');
      qs(v, '.back').addEventListener('click', function () { popView(v); });
      qsa(v, '.ig-arc .c').forEach(function (c) {
        c.addEventListener('click', function () { openStory(parseInt(c.getAttribute('data-i'), 10)); });
      });
    }
    function openStory(i0) {
      var list = G.stories || [], i = i0;
      var o = el('<div class="ig-story"></div>');
      layer.appendChild(o);
      setHB('light');
      function draw() {
        var s = list[i];
        var bars = list.map(function (x, k) { return '<i class="' + (k < i ? 'done' : (k === i ? 'cur' : '')) + '"></i>'; }).join('');
        o.innerHTML = '<div class="bg">' + imBox(s.img, 'full') + '</div><div class="bars">' + bars + '</div>' +
          '<div class="hd">' + avatar(34) + '<b>' + esc(ME) + '</b><span>' + esc(agoTxt(s.date)) + '</span><span class="sp"></span><button type="button" class="cl" aria-label="닫기">' + ic.x + '</button></div>' +
          '<div class="dt">' + esc(ymd(s.date)) + '</div><div class="l"></div><div class="r"></div>';
        qs(o, '.cl').addEventListener('click', function () { o.remove(); setHB('dark'); });
        qs(o, '.l').addEventListener('click', function () { if (i > 0) { i--; draw(); } });
        qs(o, '.r').addEventListener('click', function () { if (i < list.length - 1) { i++; draw(); } else { o.remove(); setHB('dark'); } });
      }
      draw();
    }
    function openReq() {
      var rows = RQ.map(function (u) {
        return '<div class="ig-rq">' + avatar(44) + '<div class="mid"><b>' + esc(u) + '</b><span>팔로우 요청</span></div><span class="ok inert">확인</span><span class="no inert">삭제</span></div>';
      }).join('');
      var v = pushView(layer, sbHtml('dark') +
        '<div class="ig-top"><button type="button" class="back">' + ic.back + '</button><b class="tt">팔로우 요청</b><span class="sp"></span></div>' +
        '<div class="ig-scroll"><div class="ig-rqh">요청 ' + RQ.length + '개</div>' + rows + '<div style="height:60px"></div></div>', 'igv');
      qs(v, '.back').addEventListener('click', function () { popView(v); });
    }
    function openDmList() {
      var dm = G.dm || { user: '', msgs: [] };
      var last = dm.msgs[dm.msgs.length - 1] || {};
      var pv = last.kind === 'mention' ? '스토리에 회원님을 태그했습니다' : (last.kind === 'share' ? '스토리를 공유했습니다' : (last.kind === 'story' ? '스토리에 답장했습니다' : (last.text || '')));
      var v = pushView(layer, sbHtml('dark') +
        '<div class="ig-top"><button type="button" class="back">' + ic.back + '</button><b class="tt">' + esc(ME) + '</b><span class="sp"></span></div>' +
        '<div class="ig-scroll"><div class="ig-dmh">메시지</div>' + (dm.user ? '<div class="ig-dmrow" id="igRow">' + avatar(54) + '<div class="mid"><b>' + esc(dm.user) + '</b><span>' + esc(pv) + (last.d ? ' · ' + esc(agoTxt(last.d)) : '') + '</span></div></div>' : '') + '</div>', 'igv');
      qs(v, '.back').addEventListener('click', function () { popView(v); });
      if (dm.user) { qs(v, '#igRow').addEventListener('click', function () { openThread(dm); }); }
    }
    function openThread(dm) {
      var html = '', prevD = '';
      dm.msgs.forEach(function (m) {
        if (m.d !== prevD) { html += '<div class="ig-dd">' + esc(ymd(m.d)) + ' ' + esc(ktime(m.t)) + '</div>'; prevD = m.d; }
        var mine = m.from === 'me';
        if (m.kind === 'share' && m.story && G.stories && G.stories[m.story - 1]) {
          html += '<div class="ig-xs ' + (mine ? 'me' : 'th') + '"><div class="lb">' + (mine ? '회원님이 스토리를 공유했습니다' : '누군가 스토리를 공유했습니다') + '</div>' +
            '<div class="ig-sc" data-s="' + (m.story - 1) + '">' + imBox(G.stories[m.story - 1].img, 'fill') + '</div>' +
            (m.text ? '<div class="ig-mm ' + (mine ? 'me' : 'th') + '"><div class="bb">' + esc(m.text) + '</div></div>' : '') + '</div>';
        } else if (m.kind) {
          var lab = m.kind === 'mention' ? (mine ? '회원님이 스토리에 누군가를 태그했습니다' : '누군가 스토리에 회원님을 태그했습니다')
            : (m.kind === 'share' ? (mine ? '회원님이 스토리를 공유했습니다' : '누군가 스토리를 공유했습니다')
            : (mine ? '회원님이 스토리에 답장했습니다' : '누군가 회원님의 스토리에 답장했습니다'));
          html += '<div class="ig-xs ' + (mine ? 'me' : 'th') + '"><div class="lb">' + lab + '</div><div class="bx"><i></i><span>스토리를 볼 수 없습니다</span></div>' +
            (m.text ? '<div class="ig-mm ' + (mine ? 'me' : 'th') + '"><div class="bb">' + esc(m.text) + '</div></div>' : '') + '</div>';
        } else {
          html += '<div class="ig-mm ' + (mine ? 'me' : 'th') + '">' + (mine ? '' : avatar(26)) + '<div class="bb">' + esc(m.text) + '</div></div>';
        }
      });
      var v = pushView(layer, sbHtml('dark') +
        '<div class="ig-top ig-th"><button type="button" class="back">' + ic.back + '</button>' + avatar(34) + '<div class="who"><b>' + esc(dm.user) + '</b><span>' + esc(dm.user) + '</span></div><span class="sp"></span></div>' +
        '<div class="ig-tb" id="igTb">' + html + '<div style="height:20px"></div></div>' +
        '<div class="ig-min"><span>메시지 보내기...</span></div>', 'igv');
      qs(v, '.back').addEventListener('click', function () { popView(v); });
      qsa(v, '.ig-sc').forEach(function (c) {
        c.addEventListener('click', function () { openStory(parseInt(c.getAttribute('data-s'), 10)); });
      });
      var tb = qs(v, '#igTb');
      requestAnimationFrame(function () { tb.scrollTop = tb.scrollHeight; });
      setTimeout(function () { tb.scrollTop = tb.scrollHeight; }, 320);
    }
    render();
  };

  /* =========================================================
     사진 앱
     ========================================================= */
  IMPL.photos = function (layer) {
    setHB('dark');
    var tab = 'lib';
    layer.innerHTML = '<div class="pt" style="position:absolute;inset:0;background:#fff"><div id="ptMain"></div>' +
      '<div class="tabbar" id="ptBar">' +
      '<div class="tab on" data-t="lib">' + I.photo.replace('<svg ', '<svg width="26" height="26" ') + '보관함</div>' +
      '<div class="tab" data-t="col">' + '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800"><rect x="3.500" y="6.500" width="17" height="13" rx="2.500"/><path d="M6.500 4h11"/></svg>' + '컬렉션</div>' +
      '<div class="tab dis" aria-disabled="true">' + I.search.replace('width="18" height="18"', 'width="26" height="26"') + '검색</div></div></div>';
    var main = qs(layer, '#ptMain');
    function render() {
      qsa(layer, '#ptBar .tab[data-t]').forEach(function (t) { t.classList.toggle('on', t.getAttribute('data-t') === tab); });
      if (tab === 'lib') { renderLib(); } else { renderCol(); }
    }
    function gridHtml(list, withDays) {
      return '<div class="pgrid">' + list.map(function (p, i) {
        return '<div class="c" data-i="' + i + '">' + imgTag(p.src) + (withDays ? '<span class="dl">' + p.daysLeft + '일</span>' : '') + '</div>';
      }).join('') + '</div>';
    }
    function renderLib() {
      main.innerHTML = sbHtml('dark') + '<div class="pt-top"><div class="r1" style="display:flex;justify-content:space-between;align-items:center"><h1>보관함</h1><div class="rt"><span class="pbtn dis" aria-disabled="true">선택</span><span class="pbtn dis" aria-disabled="true">' + I.dots3 + '</span></div></div>' +
        '<div class="pt-seg dis" aria-disabled="true"><span>연도</span><span>월</span><span>일</span><span class="on">모든 사진</span></div></div>' +
        '<div class="pt-scroll">' + gridHtml(C.GALLERY, false) + '<div class="pcount">사진 ' + C.GALLERY.length + '장</div></div>';
      var sc = qs(main, '.pt-scroll');
      requestAnimationFrame(function () { sc.scrollTop = sc.scrollHeight; });
      qsa(main, '.pgrid .c').forEach(function (c) {
        c.addEventListener('click', function () { openViewer(C.GALLERY, parseInt(c.getAttribute('data-i'), 10), 'lib'); });
      });
    }
    function renderCol() {
      var dis = ' dis" aria-disabled="true';
      main.innerHTML = sbHtml('dark') + '<div class="pt-top"><div class="r1" style="display:flex;justify-content:space-between;align-items:center"><h1>컬렉션</h1></div></div>' +
        '<div class="pt-scroll" style="padding-top:calc(var(--top) + 54px)"><div class="col-body" style="padding-top:0">' +
        '<h2 class="' + dis + '">사람 및 반려동물</h2><div class="cards' + dis + '"><div class="cd">사람</div><div class="cd">반려동물</div></div>' +
        '<h2 class="' + dis + '">내 앨범</h2><div class="cards' + dis + '"><div class="cd">즐겨찾기</div><div class="cd">최근 항목</div></div>' +
        '<h2 class="' + dis + '">미디어 유형</h2><div class="lst' + dis + '"><div class="li">비디오</div><div class="li">셀피</div><div class="li">라이브 포토</div><div class="li">스크린샷</div></div>' +
        '<h2>유틸리티</h2><div class="lst">' +
        '<div class="li' + dis + '">가져오기</div><div class="li' + dis + '">숨겨진 항목</div>' +
        '<button class="li" type="button" id="goTrash">' + I.trash + '<span>최근 삭제된 항목</span><span class="n">' + C.TRASH.length + ' ' + I.chevR + '</span></button></div></div></div>';
      qs(main, '#goTrash').addEventListener('click', openTrash);
    }
    qsa(layer, '#ptBar .tab[data-t]').forEach(function (t) {
      t.addEventListener('click', function () { tab = t.getAttribute('data-t'); render(); });
    });
    function openTrash() {
      var v = pushView(layer, sbHtml('dark') +
        '<div class="tr-top"><button class="back" type="button">' + I.back + '<span>컬렉션</span></button><div class="tt">최근 삭제된 항목</div><span class="pbtn dis" aria-disabled="true">선택</span></div>' +
        '<div class="scroll"><div class="trash-note">사진과 비디오는 30일 동안 여기에 보관된 후 영구적으로 삭제됩니다.</div>' + gridHtml(C.TRASH, true) + '<div style="height:150px"></div></div>' +
        '<div class="tr-bar"><span class="dis" aria-disabled="true">모두 삭제</span><span class="rr dis" aria-disabled="true">모두 복구</span></div>', 'pt');
      v.style.background = '#fff';
      qs(v, '.back').addEventListener('click', function () { popView(v); });
      qsa(v, '.pgrid .c').forEach(function (c) {
        c.addEventListener('click', function () { openViewer(C.TRASH, parseInt(c.getAttribute('data-i'), 10), 'trash'); });
      });
    }
    function openViewer(list, idx, kind) {
      var i = idx;
      var v = el('<div class="viewer"></div>');
      layer.appendChild(v);
      setHB('light');
      function draw() {
        var p = list[i];
        var tools = kind === 'trash'
          ? '<div class="vb"><span class="dd dis" aria-disabled="true">삭제</span><span class="rr dis" aria-disabled="true">복구</span></div>'
          : '<div class="vb pic"><span class="dis" aria-disabled="true">' + I.share + '</span><span class="dis" aria-disabled="true">' + I.heart + '</span><span class="dis" aria-disabled="true">' + I.info.replace(/#0a84ff/g, '#fff') + '</span><span class="dis" aria-disabled="true">' + I.trash.replace('class="ic"', 'width="24" height="24"') + '</span></div>';
        v.innerHTML = sbHtml('light') + '<div class="vt"><button class="back" type="button">' + I.back + '<span>뒤로</span></button>' +
          '<div class="dt"><b>' + esc(p.date) + '</b><span>' + esc(p.time) + '</span></div><span class="sp"></span></div>' +
          '<div class="vi">' + imgTag(p.src) + '</div>' + tools;
        qs(v, '.back').addEventListener('click', function () { v.remove(); setHB('dark'); });
      }
      draw();
      swipeDetect(v, function (dx, dy) {
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) {
          var n = i + (dx < 0 ? 1 : -1);
          if (n >= 0 && n < list.length) { i = n; draw(); }
        }
      });
    }
    render();
  };

  /* =========================================================
     X(트위터) 앱
     ========================================================= */
  var liked = {};
  var xCtx = null;
  var notiOpen = false;
  var dmArrived = DM_PRE;
  var dmStarted = false;
  var dmRead = {};

  function rich(s) {
    return String(s).split(/(\{IG\}|\{NAME\}|\{FULL\}|\{LAST\})/).map(function (p) {
      if (p === '{IG}') { return '<span class="mention">@' + esc(USER.igId) + '</span>'; }
      if (p === '{NAME}') { return esc(USER.name); }
      if (p === '{FULL}') { return esc(fullName()); }
      if (p === '{LAST}') { return esc(USER.last || ''); }
      return esc(p).replace(/(^|\s)(#[^\s#]+)/g, '$1<span class="mention">$2</span>');
    }).join('');
  }
  function unreadCount() {
    var n = 0;
    for (var i = 0; i < dmArrived && i < C.DMS.length; i++) { if (!dmRead[C.DMS[i].id]) { n++; } }
    return n;
  }
  function likeCount(t) { return t.like + (liked[t.id] ? 1 : 0); }
  /* 북마크 / 인용 / 재게시 (트윗마다 따로) */
  var marked = {};
  function bmCount(t) { return (t.bm || 0) + (marked[t.id] ? 1 : 0); }
  function twById(id) { return C.TWEETS.filter(function (x) { return x.id === id; })[0]; }
  function quotesOf(t) { return t.quotes || []; }
  /* 재게시한 계정: config 에 reposts 가 없으면 알계 아이디를 자동으로 만들어요(같은 트윗은 늘 같은 목록) */
  var RP_CACHE = {};
  function repostsOf(t) {
    if (t.reposts) { return t.reposts; }
    if (RP_CACHE[t.id]) { return RP_CACHE[t.id]; }
    var seed = 0, k;
    for (k = 0; k < String(t.id).length; k++) { seed = (seed * 31 + String(t.id).charCodeAt(k)) % 2147483647; }
    seed = seed || 7;
    function rnd(n) { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.floor(seed / 65536) % n; }
    var Lt = 'abcdefghijklmnopqrstuvwxyz', Dg = '0123456789';
    function pick(set, n) { var o = ''; for (var i = 0; i < n; i++) { o += set.charAt(rnd(set.length)); } return o; }
    var pre = ['tws_', 'twsmy_', '42_', 'sinyu_', 'dohoon_', 'youngjae_', 'kyungmin_', 'jihoon_', 'hanjin_', ''];
    var n = Math.min(t.rt || 0, 18), out = [], seen = {};
    while (out.length < n) {
      var h = pre[rnd(pre.length)] + pick(Lt, 3 + rnd(4)) + (rnd(2) ? pick(Dg, 1 + rnd(3)) : '');
      if (!seen[h]) { seen[h] = 1; out.push({ name: h, handle: h }); }
    }
    RP_CACHE[t.id] = out;
    return out;
  }
  function actsHtml(t, full) {
    var num = full ? comma : compact;
    return '<div class="acts"><span class="a">' + I.reply + '</span>' +
      '<button type="button" data-act="quotes" data-id="' + t.id + '">' + I.repost + '<span>' + num(t.rt) + '</span></button>' +
      '<button type="button" class="lk' + (liked[t.id] ? ' on' : '') + '" data-act="like" data-id="' + t.id + '"' + (full ? ' data-full="1"' : '') + '>' + I.like + '<span>' + num(likeCount(t)) + '</span></button>' +
      (full ? '' : '<span class="a">' + I.views + '<span>' + compact(t.views) + '</span></span>') +
      '<button type="button" class="bmk' + (marked[t.id] ? ' on' : '') + '" data-act="bm" data-id="' + t.id + '"' + (full ? ' data-full="1"' : '') + '>' + I.bm + (full ? '<span>' + comma(bmCount(t)) + '</span>' : '') + '</button>' +
      '<span class="a">' + I.shr + '</span></div>';
  }
  /* 스핀: 트윗 안의 질문 카드. 카드를 누르면 스핀 답변 페이지가 열려요 */
  var SPIN_DOMAIN = 'spin-spin.com';
  var SPIN_LOGO = '<span class="sp-logo">Spinspin</span>';
  function spinCard(t) {
    var oneLine = String(t.spin.q).replace(/\s+/g, ' ');
    return '<div class="spin" data-act="spin" data-id="' + t.id + '"><div class="sp-out"><div class="sp-box">' + SPIN_LOGO + '<div class="sp-q">' + esc(t.spin.q) + '</div></div>' +
      '<div class="sp-cap">' + esc(oneLine) + '</div></div><div class="sp-src">출처: ' + SPIN_DOMAIN + '</div></div>';
  }
  function mediaHtml(t) {
    var media = '';
    if (t.spin) { media += spinCard(t); }
    if (t.card) {
      media += '<div class="twirl"><div class="cd"><span class="lab">twirl twirl</span>' + esc(t.card) + '</div><div class="src">출처: twirl-twirl.invalid</div></div>';
    }
    if (t.images && t.images.length) {
      media += '<div class="imgs ' + (t.images.length === 1 ? 'one' : 'two') + '">' + t.images.map(function (s) { return '<div class="im">' + imgTag(s) + '</div>'; }).join('') + '</div>';
    }
    return media;
  }
  function tweetHtml(t) {
    return '<article class="tw" data-id="' + t.id + '">' + xav(t.avatar, t.avatarFallback) +
      '<div class="mn"><div class="hd"><b>' + esc(t.name) + '</b><span>@' + esc(t.handle) + ' · ' + esc(t.age) + '</span><span class="xl">' + I.xlogo(17) + '</span></div>' +
      '<div class="tx">' + rich(t.text) + '</div>' + mediaHtml(t) + actsHtml(t, false) + '</div></article>';
  }
  function updateBadge() {
    if (!xCtx) { return; }
    var b = qs(xCtx.layer, '#dmBadge');
    var n = unreadCount();
    if (b) { b.textContent = n; b.style.display = n > 0 ? 'flex' : 'none'; }
  }
  function bannerShow(d) {
    if (notifOff) { return; }
    var bdm = d;
    var b = el('<div class="banner"><div class="bi" style="color:#fff">' + I.xlogo(22) + '</div><div><b>새 쪽지</b><span>' + esc(d.name) + ': ' + rich(d.msgs[0]) + '</span></div></div>');
    phone.appendChild(b);
    b.style.pointerEvents = 'auto'; b.style.cursor = 'pointer';
    b.addEventListener('click', function () { if (b.__moved) { return; } b.remove(); goDm(bdm.id); });
    swipeAway(b);
    void b.offsetWidth;
    requestAnimationFrame(function () { b.classList.add('on'); });
    setTimeout(function () { b.classList.add('out'); }, 3200);
    setTimeout(function () { b.remove(); }, 3800);
  }
  function dmNotifHtml(d) {
    return '<div class="notif dmn" data-id="' + d.id + '"><div class="ic">' + ICO.x + '</div><div class="tx"><b>새 쪽지</b><span>' + esc(d.name) + ': ' + rich(d.msgs[0]) + '</span></div><div class="tm" data-at="' + clockMin() + '">방금</div></div>';
  }
  /* 새벽 사이에 이미 와 있던 쪽지는 하나로 묶어서 보여줘요(실제 도착 시각으로) */
  function preGroupHtml() {
    if (notifOff) { return ''; }
    var n = 0, last = null;
    for (var i = 0; i < DM_PRE; i++) { if (!dmRead[C.DMS[i].id]) { n++; last = C.DMS[i]; } }
    if (!n) { return ''; }
    return '<div class="notif dmn grp" data-id="' + last.id + '"><div class="ic">' + ICO.x + '</div><div class="tx"><b>새 쪽지 ' + n + '개</b><span>' + esc(last.name) + ': ' + rich(last.msgs[0]) + '</span></div><div class="tm">' + esc(last.time) + '</div></div>';
  }
  function kakaoLockHtml() {
    var K = C.KAKAO; if (!K || !K.ROOMS) { return ''; }
    var out = [];
    (K.FRIENDS || []).forEach(function (n) {
      var r = K.ROOMS[n]; if (!r || !r.unread || !r.msgs || !r.msgs.length) { return; }
      var l = r.msgs[r.msgs.length - 1];
      if (l.from !== 'them') { return; }
      out.push({ n: n, l: l });
    });
    out.sort(function (a, b) { return (b.l.d + b.l.t).localeCompare(a.l.d + a.l.t); });
    return out.map(function (o) {
      return '<div class="notif" data-kk="' + esc(o.n) + '"><div class="ic">' + ICO.kakao + '</div><div class="tx"><b>' + esc(o.n) + '</b><span>' + esc(o.l.img ? '사진' : fillName(o.l.text)) + '</span></div><div class="tm">' + esc(o.l.t) + '</div></div>';
    }).join('');
  }
  function xFollowHtml() {
    if (notifOff) { return ''; }
    var n = (C.NOTIS || [])[0];
    if (!n) { return ''; }
    var who = n.who[0] + (n.more > 0 ? '님 외 ' + n.more + '명이' : '님이');
    return '<div class="notif"><div class="ic">' + ICO.x + '</div><div class="tx"><b>알림</b><span>' + esc(who) + ' 회원님을 팔로우했습니다</span></div><div class="tm">' + (KK_FLAGS['다음날'] ? '방금' : '07:58') + '</div></div>';
  }
  function lockDense() {
    lockScrollMode();
  }
  function addLockNotif(d) {
    if (notifOff) { return; }
    if (!L.lock) { return; }
    var box = qs(L.lock, '.notifs');
    if (!box) { return; }
    var n = el(dmNotifHtml(d));
    n.classList.add('pop');
    box.insertBefore(n, box.firstChild);
    var live = qsa(box, '.dmn:not(.grp)');
    while (live.length > 1) { live[live.length - 1].remove(); live.pop(); }
    bindLockNotifs();
    lockDense();
  }
  /* 알림을 위로(목록이 안 길 때) 또는 왼쪽으로 밀면 사라져요. 목록이 길면 세로 드래그는 스크롤이에요 */
  function swipeAway(n, onGone) {
    var sx = 0, sy = 0, dx = 0, dy = 0, on = false, id = null, axis = '';
    n.style.touchAction = 'none';
    n.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
      sx = e.clientX; sy = e.clientY; dx = 0; dy = 0; on = true; id = e.pointerId; axis = ''; n.__moved = false;
      n.style.transition = 'none';
    });
    n.addEventListener('pointermove', function (e) {
      if (!on) { return; }
      dx = Math.min(0, e.clientX - sx); dy = e.clientY - sy;
      var adx = Math.abs(e.clientX - sx), ady = Math.abs(dy);
      if (!axis && (adx > 8 || ady > 8)) {
        axis = adx > ady ? 'x' : 'y';
        if (axis === 'y' && n.style.touchAction === 'pan-y') { on = false; n.style.transition = ''; return; }
        try { n.setPointerCapture(id); } catch (x) {}
      }
      if (!axis) { return; }
      n.__moved = true;
      if (axis === 'x') {
        n.style.transform = 'translate3d(' + dx + 'px,0,0)'; n.style.opacity = String(Math.max(0.2, 1 + dx / 300));
      } else {
        dy = Math.min(0, dy);
        n.style.transform = 'translate3d(0,' + dy + 'px,0)'; n.style.opacity = String(Math.max(0.2, 1 + dy / 140));
      }
    });
    function end(cancel) {
      if (!on) { n.__moved = false; return; }
      on = false;
      n.style.transition = 'transform .22s ease, opacity .22s ease';
      var gone = !cancel && ((axis === 'x' && dx < -80) || (axis === 'y' && dy < -40));
      if (gone) {
        n.style.transform = axis === 'x' ? 'translate3d(-480px,0,0)' : 'translate3d(0,-120px,0)'; n.style.opacity = '0';
        setTimeout(function () { n.remove(); if (onGone) { onGone(); } }, 220);
      } else {
        n.style.transform = ''; n.style.opacity = '';
      }
      setTimeout(function () { n.__moved = false; }, 60);
    }
    n.addEventListener('pointerup', function () { end(false); });
    n.addEventListener('pointercancel', function () { end(true); });
  }
  /* 알림이 많아 목록이 넘치면 세로 스크롤을 우선해요 */
  function lockScrollMode() {
    var box = L.lock && qs(L.lock, '.notifs');
    if (!box) { return; }
    var over = box.scrollHeight > box.clientHeight + 2;
    qsa(box, '.notif').forEach(function (n) { n.style.touchAction = over ? 'pan-y' : 'none'; });
  }
  function bindLockNotifs() {
    if (!L.lock) { return; }
    qsa(L.lock, '.notif').forEach(function (n) {
      if (n.__b) { return; }
      n.__b = true;
      n.style.cursor = 'pointer';
      n.addEventListener('click', function () { if (n.__moved) { return; } pendingDm = n.getAttribute('data-id') || null; pendingKk = n.getAttribute('data-kk') || null; pendingApp = n.getAttribute('data-app') || null; showPass(); });
      swipeAway(n, lockScrollMode);
    });
  }
  var pendingDm = null;
  var pendingApp = null;
  function goDm(id) {
    function go() { if (xCtx && xCtx.goDM) { xCtx.goDM(id, true); } }
    if (current === 'lock') { pendingDm = id; showPass(); return; }
    if (current === 'app' && curApp === 'x') { go(); return; }
    /* 홈 화면이 보였다가 열리지 않게, 바로 X 쪽지창으로 들어가요 */
    if (current === 'app') { closeApp(true); }
    if (current === 'home') { openApp('x', null, { instant: true }); go(); }
  }
  /* 쪽지는 트위터를 열지 않아도 시간차를 두고 계속 도착해요(잠금화면에는 알림으로, 그 밖에는 위에서 내려오는 배너로) */
  function startDMs() {
    if (dmStarted || dmArrived >= C.DMS.length) { return; }
    dmStarted = true;
    function gap() {
      var lo = C.DM_GAP_MIN || 7000, hi = C.DM_GAP_MAX || 15000;
      return lo + Math.random() * (hi - lo);
    }
    function step() {
      dmArrived++;
      var d = C.DMS[dmArrived - 1];
      if (d.live || String(d.time) >= START_T) { d.time = clockHHMM(); }
      if (current === 'lock') { addLockNotif(d); }
      else if (!(xCtx && xCtx.tab === 'dm')) { bannerShow(d); }
      /* 배너가 올라오는 동안에는 무거운 갱신을 미루어 끊기지 않게 해요 */
      setTimeout(function () {
        updateBadge();
        if (xCtx && xCtx.tab === 'dm' && xCtx.renderDM) { xCtx.renderDM(); }
      }, 700);
      var g = gap();
      setTimeout(igPop, g * 0.5);
      if (dmArrived < C.DMS.length) { setTimeout(step, g); }
    }
    setTimeout(step, C.DM_FIRST_DELAY);
  }

  /* 인스타 아이콘은 그라데이션 id가 겹치면 홈 화면이 가려진 동안 비어 보여서, 쓸 때마다 새 id를 줘요 */
  var igIconN = 0;
  function igIcon() {
    /* 그라데이션 참조(url(#id)) 없이 CSS 배경으로 그려요 — 아이폰 사파리에서 알림 로고가 비던 문제 */
    return '<span class="igi"><svg viewBox="0 0 60 60" width="100%" height="100%"><rect x="15" y="15" width="30" height="30" rx="9" fill="none" stroke="#fff" stroke-width="3"/><circle cx="30" cy="30" r="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="38.500" cy="21.500" r="2" fill="#fff"/></svg></span>';
  }
  /* 인스타 팔로우 요청 아이디(알계처럼 무작위로 만들고, 같은 아이디가 계속 쓰이게 한 번만 만들어요) */
  var IG_RQ = null;
  function igReqIds() {
    if (IG_RQ) { return IG_RQ; }
    var cfg = C.INSTA && C.INSTA.requests;
    if (cfg && cfg.length) { IG_RQ = cfg.slice(); return IG_RQ; }
    if (cfg && !cfg.length && !KK_FLAGS['다음날']) { IG_RQ = []; return IG_RQ; }
    var seed = 20261029, L = 'abcdefghijklmnopqrstuvwxyz', D = '0123456789';
    function rnd(n) { seed = (seed * 1103515245 + 12345) % 2147483648; return Math.floor(seed / 65536) % n; }
    function pick(set, n) { var o = ''; for (var i = 0; i < n; i++) { o += set.charAt(rnd(set.length)); } return o; }
    var seen = {}, out = [];
    while (out.length < 47) {
      var t = rnd(6), u;
      if (t === 0) { u = pick(L, 2 + rnd(3)) + pick(D, 1 + rnd(2)) + pick(L, 1 + rnd(3)); }
      else if (t === 1) { u = pick(L, 4 + rnd(4)) + '_' + pick(D, 2 + rnd(3)); }
      else if (t === 2) { u = '_' + pick(L, 3 + rnd(3)) + pick(D, 1 + rnd(3)); }
      else if (t === 3) { u = pick(L, 2 + rnd(2)) + '.' + pick(L, 2 + rnd(3)) + pick(D, 1 + rnd(2)); }
      else if (t === 4) { u = pick(L, 5 + rnd(4)); }
      else { u = pick(D, 1) + pick(L, 3 + rnd(3)) + pick(D, 2 + rnd(3)); }
      if (!seen[u]) { seen[u] = 1; out.push(u); }
    }
    IG_RQ = out;
    return IG_RQ;
  }
  /* 인스타 팔로우 요청 알림: 트위터 쪽지 사이사이에 번갈아 와요(잠금화면이면 알림으로, 아니면 위에서 내려오는 배너로) */
  var igPopN = 0;
  function igPop() {
    if (notifOff) { return; }
    var C0 = C.IG_REQ_POPS === undefined ? 10 : C.IG_REQ_POPS;
    if (igPopN >= C0) { return; }
    var ids = igReqIds(), id = ids[igPopN % ids.length]; igPopN++;
    var text = id + '님이 팔로우를 요청했습니다.';
    if (current === 'lock' && L.lock) {
      var box = qs(L.lock, '.notifs');
      if (box) {
        var old = qs(box, '.notif[data-ig]'); if (old) { old.remove(); }
        var n = el('<div class="notif pop" data-ig="1"><div class="ic">' + igIcon() + '</div><div class="tx"><b>Instagram</b><span>' + esc(text) + '</span></div><div class="tm">방금</div></div>');
        box.insertBefore(n, box.firstChild); bindLockNotifs(); lockDense();
      }
      return;
    }
    var b = el('<div class="banner"><div class="bi" style="background:none">' + igIcon() + '</div><div><b>Instagram</b><span>' + esc(text) + '</span></div></div>');
    phone.appendChild(b);
    b.style.pointerEvents = 'auto'; b.style.cursor = 'pointer';
    b.addEventListener('click', function () {
      if (b.__moved) { return; }
      b.remove();
      if (current === 'app' && curApp === 'instagram') { return; }
      if (current === 'app') { closeApp(true); }
      if (current === 'home') { openApp('instagram', null, { instant: true }); }
    });
    swipeAway(b);
    void b.offsetWidth;
    requestAnimationFrame(function () { b.classList.add('on'); });
    setTimeout(function () { b.classList.add('out'); }, 3200);
    setTimeout(function () { b.remove(); }, 3800);
  }

  /* 인스타에서 좋아요를 처음 누르면 트위터 쪽지가 한 통 와요 */
  var likeDmSent = false;
  function likeDm() {
    if (likeDmSent) { return; }
    likeDmSent = true;
    /* 이미 쪽지가 와 있던 알계 계정에서, 같은 대화창에 새 쪽지가 이어서 와요 */
    var cfg = (C.INSTA && C.INSTA.likeDm) || {};
    if (!cfg.msgs || !cfg.msgs[0]) { return; }
    var FROM = cfg.handle || '';
    var text = cfg.msgs[0];
    setTimeout(function () {
      var idx = -1;
      for (var i = 0; i < C.DMS.length; i++) { if (C.DMS[i].handle === FROM) { idx = i; break; } }
      var d;
      if (idx >= 0) {
        d = C.DMS.splice(idx, 1)[0];
        if (idx < DM_PRE) { DM_PRE--; }
        if (idx < dmArrived) { dmArrived--; }
        d.msgs = d.msgs.concat([text]);
        d.time = clockHHMM();
        delete dmRead[d.id];
      } else {
        d = { id: 'dlike', name: FROM, handle: FROM, time: clockHHMM(), followers: 0, following: 2, posts: 0, msgs: [text] };
      }
      C.DMS.splice(dmArrived, 0, d);
      dmArrived++;
      var shown = { id: d.id, name: d.name, handle: d.handle, time: d.time, msgs: [text] };
      if (current === 'lock') { addLockNotif(shown); } else if (!(xCtx && xCtx.tab === 'dm')) { bannerShow(shown); }
      setTimeout(function () {
        updateBadge();
        if (xCtx && xCtx.tab === 'dm' && xCtx.renderDM) { xCtx.renderDM(); }
      }, 700);
    }, 2200);
  }

  IMPL.x = function (layer) {
    setHB('dark');
    var ctx = { layer: layer, tab: 'home' };
    xCtx = ctx;
    layer.innerHTML = '<div class="xa" style="position:absolute;inset:0;background:#fff"><div id="xBase"></div></div>';
    var base = qs(layer, '#xBase');
    var root = qs(layer, '.xa');

    function barHtml() {
      var n = unreadCount();
      return '<div class="x-bar">' +
        '<button type="button" data-go="home">' + (ctx.tab === 'home' ? I.homeOn : I.home) + '<i class="rd"></i></button>' +
        '<button type="button" data-go="search">' + I.search.replace('width="18" height="18"', 'width="26" height="26"').replace('stroke-width="2.4"', ctx.tab === 'search' ? 'stroke-width="3.4"' : 'stroke-width="2.4"') + '</button>' +
        '<button type="button" data-go="me"><span class="pf' + (ctx.tab === 'me' ? ' act' : '') + '">' + I.person.replace('<svg ', '<svg width="20" height="20" ').replace('fill="currentColor"', 'fill="#fff"') + '</span></button>' +
        '<button type="button" data-go="noti">' + (ctx.tab === 'noti' ? I.bell.replace('stroke-width="2"', 'stroke-width="3"') : I.bell) + (notiOpen || ctx.tab === 'noti' || !(C.NOTIS || []).length ? '' : '<span class="bg2" style="display:flex">' + (C.NOTIS || []).length + '</span>') + '</button>' +
        '<button type="button" data-go="dm">' + (ctx.tab === 'dm' ? I.mailOn : I.mail) + '<span class="bg2" id="dmBadge" style="display:' + (n > 0 ? 'flex' : 'none') + '">' + n + '</span></button></div>';
    }
    function bindBar() {
      qsa(base, '.t1 .me, .me2').forEach(function (b) {
        b.style.cursor = 'pointer';
        b.addEventListener('click', function () { if (ctx.tab !== 'me') { ctx.tab = 'me'; render(); } });
      });
      qsa(base, '[data-soon]').forEach(function (b) { b.addEventListener('click', soon); });
      qsa(base, '[data-go]').forEach(function (b) {
        b.addEventListener('click', function () {
          var g = b.getAttribute('data-go');
          if (g === ctx.tab) { return; }
          ctx.tab = g; render();
        });
      });
    }
    function renderHome() {
      base.innerHTML = sbHtml('dark') +
        '<div class="x-top"><div class="t1"><span class="me">' + I.person.replace('<svg ', '<svg width="20" height="20" ').replace('fill="currentColor"', 'fill="#fff"') + '</span>' + I.xlogo(24) + '</div>' +
        '<div class="t2"><button type="button" class="on">추천</button><button type="button">팔로잉</button></div></div>' +
        '<div class="x-feed">' + C.TWEETS.map(tweetHtml).join('') + '</div>' +
        '<button class="fab" type="button" data-soon="1">' + I.plus.replace('width="20" height="20"', 'width="26" height="26"') + '</button>' + barHtml();
      bindBar();
      bindFeed(base);
    }
    function dmRows() {
      var rows = '';
      for (var i = dmArrived - 1; i >= 0; i--) {
        if (i >= C.DMS.length) { continue; }
        var d = C.DMS[i];
        var unread = !dmRead[d.id];
        var last = d.msgs[d.msgs.length - 1];
        rows += '<div class="dmr' + (unread ? ' unread' : '') + '" data-id="' + d.id + '">' + xavDefault() +
          '<div class="mn"><div class="l1"><b>' + esc(d.name) + '</b><span class="tm">' + esc(d.time) + '</span></div><div class="l2"><div class="pv">' + rich(last) + '</div>' + (unread ? '<i class="ud"></i>' : '') + '</div></div></div>';
      }
      return rows || '<div class="dm-empty">아직 쪽지가 없어요</div>';
    }
    function renderDM() {
      base.innerHTML = sbHtml('dark') +
        '<div class="dm-top"><div class="t1"><span class="me2">' + I.person.replace('<svg ', '<svg width="22" height="22" ').replace('fill="currentColor"', 'fill="#fff"') + '</span><b>Chat</b><span class="flt">전체' + I.chevDn + '</span></div><div class="sb2">' + I.search + '<span>검색</span></div></div>' +
        '<div class="dm-list">' + dmRows() + '</div>' +
        '<button class="fab" type="button" data-soon="1">' + I.chatPlus + '</button>' + barHtml();
      bindBar();
      qsa(base, '.dmr').forEach(function (r) {
        r.addEventListener('click', function () { openDM(r.getAttribute('data-id')); });
      });
    }
    ctx.renderDM = renderDM;
    ctx.goDM = function (id, instant) {
      ctx.tab = 'dm';
      render();
      openDM(id, instant);
    };
    function renderSearch() {
      var gear = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 8.800a3.200 3.200 0 100 6.400 3.200 3.200 0 000-6.400z"/><path d="M19.400 13a7.800 7.800 0 000-2l2-1.500-2-3.400-2.300.9a7.600 7.600 0 00-1.700-1l-.4-2.500h-4l-.4 2.500a7.600 7.600 0 00-1.700 1l-2.300-.9-2 3.400 2 1.500a7.800 7.800 0 000 2l-2 1.500 2 3.400 2.300-.9c.5.400 1.100.7 1.700 1l.4 2.500h4l.4-2.500c.6-.3 1.200-.6 1.700-1l2.300.9 2-3.400z"/></svg>';
      var tabs = ['탐색', '실시간 트렌드', '뉴스', '스포츠', '엔터테인먼트'].map(function (n, i) { return '<span class="' + (i === 0 ? 'on' : '') + '"><em>' + n + '</em></span>'; }).join('');
      var rows = (C.TRENDS || []).map(function (w) {
        return '<div class="trd" data-q="' + esc(w) + '"><div><b>' + esc(w) + '</b><span>대한민국에서 트렌드 중</span></div><i>' + '···' + '</i></div>';
      }).join('');
      base.innerHTML = sbHtml('dark') +
        '<div class="ex-top"><div class="r1"><span class="me2">' + I.person.replace('<svg ', '<svg width="22" height="22" ').replace('fill="currentColor"', 'fill="#fff"') + '</span>' +
        '<form class="sbx" id="exForm" action="#">' + I.search + '<input id="exQ" type="search" enterkeyhint="search" placeholder="X 검색" autocomplete="off" autocapitalize="off" spellcheck="false"></form><span class="gr2">' + gear + '</span></div><div class="tabs">' + tabs + '</div></div>' +
        '<div class="ex-list">' + rows + '</div>' + barHtml();
      bindBar();
      qsa(base, '.trd').forEach(function (r) {
        r.addEventListener('click', function () { openResults(r.getAttribute('data-q')); });
      });
      var f = qs(base, '#exForm'), q = qs(base, '#exQ');
      try { q.focus(); } catch (e) {}
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var term = String(q.value || '').replace(/^\s+|\s+$/g, '');
        if (!term) { return; }
        q.blur();
        openResults(term);
      });
    }
    /* 진짜 X 게시물/타임라인 끼워 넣기: config.js 의 X_EMBEDS 에서 검색어(match)에 맞는 것을 결과 맨 위에 보여줘요 */
    function embedHtml(term) {
      var t = String(term).toLowerCase(), out = '';
      (C.X_EMBEDS || []).forEach(function (e) {
        var hit = (e.match || []).some(function (m) { return m && t.indexOf(String(m).toLowerCase()) !== -1; });
        if (!hit) { return; }
        (e.posts || []).forEach(function (u) {
          if (u) { out += '<div class="x-emb-post"><blockquote class="twitter-tweet" data-lang="ko" data-dnt="true"><a href="' + esc(String(u).replace('://x.com/', '://twitter.com/')) + '"></a></blockquote></div>'; }
        });
        if (e.account) {
          out += '<div class="x-emb-tl"><a class="twitter-timeline" data-lang="ko" data-dnt="true" data-height="640" data-chrome="noheader nofooter" href="https://twitter.com/' + esc(String(e.account).replace(/^@/, '')) + '">@' + esc(String(e.account).replace(/^@/, '')) + ' 게시물</a></div>';
        }
      });
      return out ? '<div class="x-emb">' + out + '</div>' : '';
    }
    function loadXWidgets(el) {
      function go() { try { window.twttr.widgets.load(el); } catch (e) {} }
      if (window.twttr && window.twttr.widgets) { go(); return; }
      var sc = document.querySelector('script[data-xw]');
      if (!sc) {
        sc = document.createElement('script');
        sc.src = 'https://platform.twitter.com/widgets.js'; sc.async = true; sc.charset = 'utf-8'; sc.setAttribute('data-xw', '1');
        document.head.appendChild(sc);
      }
      sc.addEventListener('load', go);
    }
    /* 검색 결과: 게임 속 트윗 중에서 검색어가 들어간 게시물을 X 검색 화면처럼 보여줘요 */
    function openResults(term) {
      var words = String(term).toLowerCase().split(/\s+/).filter(function (w) { return w; });
      var found = C.TWEETS.filter(function (t) {
        var hay = [t.name, t.handle, t.text, t.spin ? t.spin.q : '', t.spin ? t.spin.a : ''].join(' ').toLowerCase();
        return words.every(function (w) { return hay.indexOf(w) !== -1; });
      });
      var v = pushView(root, sbHtml('dark') +
        '<div class="sr-top"><div class="r1"><button type="button" class="back" style="color:#0f1419">' + I.back + '</button><div class="sbx">' + I.search + '<span class="q">' + esc(term) + '</span></div><span class="mo">···</span></div>' +
        '<div class="tabs"><span class="on"><em>인기</em></span><span><em>최신</em></span><span><em>사용자</em></span><span><em>미디어</em></span><span><em>리스트</em></span></div></div>' +
        '<div class="sr-list">' + embedHtml(term) + (found.length ? found.map(tweetHtml).join('') : (embedHtml(term) ? '' : '<div class="act-empty"><h2>"' + esc(term) + '"에 대한 결과 없음</h2><p>철자를 확인하거나 다른 검색어를 입력해 보세요.</p></div>')) + '<div style="height:40px"></div></div>', 'xa');
      v.style.background = '#fff';
      qs(v, '.back').addEventListener('click', function () { popView(v); });
      bindFeed(v);
      var em = qs(v, '.x-emb'); if (em) { loadXWidgets(em); }
    }
    function renderNoti() {
      notiOpen = true;
      var person = '<svg width="30" height="30" viewBox="0 0 24 24" fill="#1d9bf0"><circle cx="9" cy="8" r="4"/><path d="M1.500 20.500c.6-4 3.600-6 7.500-6s6.900 2 7.500 6z"/><path d="M19 7v6M16 10h6" stroke="#1d9bf0" stroke-width="2.200" stroke-linecap="round"/></svg>';
      var rows = (C.NOTIS || []).map(function (n, i) {
        var av = n.who.map(function () { return '<span class="nav">' + I.person.replace('<svg ', '<svg width="18" height="18" ').replace('fill="currentColor"', 'fill="#fff"') + '</span>'; }).join('');
        var txt = '<b>' + esc(n.who[0]) + '</b>' + (n.more > 0 ? '님 외 ' + n.more + '명이' : '님이') + ' 회원님을 팔로우했습니다';
        return '<div class="nrow' + (i < 8 ? ' new' : '') + '"><div class="ni">' + person + '</div><div class="nb"><div class="navs">' + av + '</div><div class="nt">' + txt + ' <span>· ' + esc(n.time) + '</span></div></div></div>';
      }).join('');
      base.innerHTML = sbHtml('dark') +
        '<div class="no-top"><div class="t1">알림</div><div class="tabs"><span class="on"><em>전체</em></span><span><em>인증됨</em></span><span><em>멘션</em></span></div></div>' +
        '<div class="no-list">' + rows + '</div>' + barHtml();
      bindBar();
    }
    function renderMe() {
      var cal = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.800" stroke-linecap="round" stroke-linejoin="round"><rect x="3.500" y="5" width="17" height="15" rx="3"/><path d="M3.500 10h17M8 3v4M16 3v4"/></svg>';
      var tabs = '<div class="mt on"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.500 9.500h7M8.500 14h4"/></svg><b>게시물</b><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div>' +
        '<div class="mt"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"><path d="M12 4C7.500 4 4 7 4 10.800c0 2.100 1.100 4 2.900 5.200-.2 1.100-.8 2-1.700 2.800 1.800-.1 3.300-.7 4.400-1.600.7.200 1.500.3 2.400.3 4.500 0 8-3 8-6.700S16.500 4 12 4z"/></svg></div>' +
        '<div class="mt"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.500l-3.500 3.500L7 10.500M3.500 7H16a4 4 0 014 4v1M17 20.500l3.500-3.500-3.500-3.500M20.500 17H8a4 4 0 01-4-4v-1"/></svg></div>' +
        '<div class="mt"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linejoin="round"><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M8 4h8M10.500 11.500v5l4-2.500z"/></svg></div>';
      base.innerHTML = sbHtml('light') +
        '<div class="me-banner"><button type="button" class="mb back" aria-label="뒤로">' + I.back.replace(/stroke="[^"]*"/, 'stroke="#fff"') + '</button><span class="mb" style="pointer-events:none">' + I.search.replace('width="18" height="18"', 'width="22" height="22"') + '</span></div>' +
        '<div class="me-body"><div class="me-av"><svg viewBox="0 0 92 92" width="92" height="92"><rect width="92" height="92" fill="#cfd9de"/><ellipse cx="46" cy="38" rx="17" ry="20" fill="#647a8c"/><ellipse cx="46" cy="96" rx="34" ry="26" fill="#647a8c"/></svg></div>' +
        '<div class="me-btns"><span>프로필 공유</span><span>프로필 수정</span></div>' +
        '<div class="me-name">&nbsp;</div><div class="me-hd">@' + esc(USER.igId) + '</div>' +
        '<div class="me-join">' + cal + '<span>' + TD[0] + '년 ' + TD[1] + '월에 가입함</span></div>' +
        '<div class="me-fol"><span><b>0</b> 팔로잉</span><span><b>' + comma(C.X_FOLLOWERS || 0) + '</b> 팔로워</span></div>' +
        '<div class="me-tabs">' + tabs + '</div>' +
        '<div class="act-empty"><h2>아직 게시물이 없습니다</h2><p>게시물을 올리면 여기에 표시됩니다.</p></div></div>' +
        '<button class="fab" type="button" data-soon="1">' + I.plus.replace('width="20" height="20"', 'width="26" height="26"') + '</button>' + barHtml();
      bindBar();
      qs(base, '.me-banner .back').addEventListener('click', function () { ctx.tab = 'home'; render(); });
      var fl = qsa(base, '.me-fol span')[1];
      if (fl) { fl.style.cursor = 'pointer'; fl.addEventListener('click', function () { ctx.tab = 'fol'; render(); }); }
    }
    /* 팔로워 목록: 알림 목록에 있는 알계들이 팔로우한 것처럼 일부분 보여줘요 */
    function renderFollowers() {
      var seen = {}, ids = [];
      (C.NOTIS || []).forEach(function (n) { (n.who || []).forEach(function (w) { if (!seen[w]) { seen[w] = 1; ids.push(w); } }); });
      var tab = 'fol';
      function draw() {
        var rows = tab === 'fol' ? ids.map(function (id) {
          return '<div class="fl-r">' + xavDefault() + '<div class="fl-n"><b>' + esc(id) + '</b><span>@' + esc(id) + '</span></div><span class="fl-b">팔로우</span></div>';
        }).join('') : '<div class="act-empty"><h2>아직 팔로우한 계정이 없어요</h2></div>';
        base.innerHTML = sbHtml('dark') +
          '<div class="fl-top"><button type="button" class="back" aria-label="뒤로">' + I.back + '</button><div class="fl-t"><b>' + esc(fullName()) + '</b><span>@' + esc(USER.igId) + '</span></div></div>' +
          '<div class="fl-tabs"><span data-k="fol" class="' + (tab === 'fol' ? 'on' : '') + '"><em>팔로워</em></span><span data-k="ing" class="' + (tab === 'ing' ? 'on' : '') + '"><em>팔로잉</em></span></div>' +
          '<div class="fl-list">' + rows + '</div>';
        qs(base, '.fl-top .back').addEventListener('click', function () { ctx.tab = 'me'; render(); });
        qsa(base, '.fl-tabs span').forEach(function (t) { t.addEventListener('click', function () { tab = t.getAttribute('data-k'); draw(); }); });
      }
      draw();
    }
    function render() { if (ctx.tab === 'fol') { renderFollowers(); return; } if (ctx.tab === 'me') { renderMe(); return; } if (ctx.tab === 'home') { renderHome(); } else if (ctx.tab === 'search') { renderSearch(); } else if (ctx.tab === 'noti') { renderNoti(); } else { renderDM(); } }

    /* 피드/상세 공통: 트윗을 누르면 상세, 하트·북마크·재게시·스핀은 아래 한 곳에서 처리해요 */
    function bindFeed(scope) {
      qsa(scope, '.tw').forEach(function (a) {
        a.addEventListener('click', function (e) {
          if (e.target.closest('[data-act]')) { return; }
          openDetail(a.getAttribute('data-id'));
        });
      });
    }
    function refreshActs(id) {
      var t = twById(id); if (!t) { return; }
      qsa(layer, '[data-act="like"][data-id="' + id + '"]').forEach(function (x) {
        x.classList.toggle('on', !!liked[id]);
        var sp = qs(x, 'span'); if (sp) { sp.textContent = x.getAttribute('data-full') ? comma(likeCount(t)) : compact(likeCount(t)); }
      });
      qsa(layer, '[data-act="bm"][data-id="' + id + '"]').forEach(function (x) {
        x.classList.toggle('on', !!marked[id]);
        var sp = qs(x, 'span'); if (sp) { sp.textContent = comma(bmCount(t)); }
      });
      qsa(layer, '[data-st="like"][data-id="' + id + '"]').forEach(function (x) { x.textContent = comma(likeCount(t)); });
      qsa(layer, '[data-st="bm"][data-id="' + id + '"]').forEach(function (x) { x.textContent = comma(bmCount(t)); });
    }
    layer.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!a || !layer.contains(a)) { return; }
      var act = a.getAttribute('data-act'), id = a.getAttribute('data-id');
      if (!id) { return; }
      e.stopPropagation();
      if (act === 'like') { liked[id] = !liked[id]; refreshActs(id); }
      else if (act === 'bm') { marked[id] = !marked[id]; refreshActs(id); }
      else if (act === 'quotes' || act === 'qlist') { openActivity(id, 'q'); }
      else if (act === 'reposts') { openActivity(id, 'r'); }
      else if (act === 'spin') { openSpin(id); }
    });

    /* 트윗 상세 */
    function openDetail(id) {
      var t = twById(id);
      if (!t) { return; }
      var replies = (t.replies || []).map(function (r) {
        return '<div class="rp">' + xav(r.avatar) + '<div><div class="hd"><b>' + esc(r.name) + '</b><span>@' + esc(r.handle) + ' · ' + esc(r.age) + '</span></div><div class="tx">' + rich(r.text) + '</div></div></div>';
      }).join('');
      var v = pushView(root, sbHtml('dark') +
        '<div class="dtop"><button type="button" class="back" style="color:#0f1419">' + I.back + '</button><span class="tt">게시물</span></div>' +
        '<div class="scroll"><div class="dbody"><div class="au">' + xav(t.avatar, t.avatarFallback) + '<div><b>' + esc(t.name) + '</b><span>@' + esc(t.handle) + '</span></div></div>' +
        '<div class="big">' + rich(t.text) + '</div>' + mediaHtml(t) +
        '<div class="meta">' + esc(t.detailTime || '') + ' · ' + TD[0] + '. ' + TD[1] + '. ' + TD[2] + '. · 조회 <b>' + comma(t.views || 0) + '</b>회</div>' +
        '<div class="dstats"><span data-act="reposts" data-id="' + t.id + '"><b>' + comma(t.rt || 0) + '</b> 재게시</span><span data-act="qlist" data-id="' + t.id + '"><b>' + comma(quotesOf(t).length) + '</b> 인용</span>' +
        '<span><b data-st="like" data-id="' + t.id + '">' + comma(likeCount(t)) + '</b> 마음에 들어요</span><span><b data-st="bm" data-id="' + t.id + '">' + comma(bmCount(t)) + '</b> 북마크</span></div>' +
        actsHtml(t, true) +
        (t.lockReplies ? '<div class="lockbox">' + I.lockSm + '<span>일부 계정만 답글을 쓸 수 있습니다.</span></div>' : '') + replies + '<div style="height:40px"></div></div></div>', 'xa');
      v.style.background = '#fff';
      qs(v, '.back').addEventListener('click', function () { popView(v); });
    }

    /* 게시 활동 (인용 / 재게시) */
    function openActivity(tid, startTab) {
      if (qs(root, '.view.act')) { return; }
      var t6 = twById(tid); if (!t6) { return; }
      var mini = (t6.images || []).map(function (s) { return '<div>' + imgTag(s) + '</div>'; }).join('');
      function quotesHtml() {
        var qsList = quotesOf(t6);
        if (!qsList.length) { return '<div class="act-empty"><h2>아직 인용 없음</h2><p>다른 사람의 게시물을 공유할 때 본인의 의견을 추가하면 여기에 표시됩니다.</p></div>'; }
        return qsList.map(function (q) {
          return '<div class="qt">' + xav(q.avatar) + '<div style="flex:1;min-width:0"><div class="hd" style="display:flex;gap:4px;font-size:15px"><b>' + esc(q.name) + '</b><span style="color:#536471">@' + esc(q.handle) + ' · ' + esc(q.age || '') + '</span></div>' +
            '<div class="tx" style="font-size:15px;line-height:20px;margin-top:2px;white-space:pre-wrap">' + rich(q.text) + '</div>' +
            '<div class="emb"><div class="ee"><div class="hd"><b>' + esc(t6.name) + '</b><span>@' + esc(t6.handle) + ' · ' + esc(t6.age) + '</span></div><p>' + rich(t6.text) + '</p>' + (mini ? '<div class="mini">' + mini + '</div>' : '') + '</div></div>' +
            '<div class="acts"><span class="a">' + I.reply + '</span><span class="a">' + I.repost + (q.rt ? '<span>' + compact(q.rt) + '</span>' : '') + '</span><span class="a">' + I.like + (q.like ? '<span>' + compact(q.like) + '</span>' : '') + '</span><span class="a">' + I.views + (q.views ? '<span>' + compact(q.views) + '</span>' : '') + '</span><span class="a">' + I.bm + '</span><span class="a">' + I.shr + '</span></div></div></div>';
        }).join('');
      }
      function repostsHtml() {
        var list = repostsOf(t6);
        if (!list.length) { return '<div class="act-empty"><h2>마음에 드는 게시물 널리 알리기</h2><p>다른 사람의 게시물을 재게시해 내 타임라인에서 공유하세요. 재게시하면 여기에 표시됩니다.</p></div>'; }
        return list.map(function (r) {
          return '<div class="rep-row">' + xav(r.avatar) + '<div style="flex:1;min-width:0"><b>' + esc(r.name) + '</b><span>@' + esc(r.handle) + '</span></div><span class="fl-b">팔로우</span></div>';
        }).join('');
      }
      var rpIc = I.repost.replace('<svg ', '<svg style="width:20px;height:20px;flex:none" ');
      var v = pushView(root, sbHtml('dark') +
        '<div class="act-top"><div class="t1"><button type="button" class="bk back" style="color:#0f1419;padding:0">' + I.back + '</button>게시 활동<span class="so">' + I.sort + '</span></div>' +
        '<div class="t2"><button type="button" data-t="q">' + I.pencil + '<span>인용</span></button><button type="button" data-t="r">' + rpIc + '<span>재게시</span></button></div></div>' +
        '<div class="act-list" id="actList"></div>', 'xa act');
      v.style.background = '#fff';
      qs(v, '.bk').addEventListener('click', function () { popView(v); });
      function show(k) {
        qsa(v, '.t2 button').forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-t') === k); });
        qs(v, '#actList').innerHTML = k === 'q' ? quotesHtml() : repostsHtml();
        qs(v, '#actList').scrollTop = 0;
      }
      qsa(v, '.t2 button').forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-t')); }); });
      show(startTab === 'r' ? 'r' : 'q');
    }

    /* 스핀 답변 페이지 (X 안에서 열리는 웹페이지 모양, 아래에 원래 트윗이 붙어 있어요) */
    function openSpin(id) {
      var t = twById(id); if (!t || !t.spin) { return; }
      var ans = t.spin.a || t.text;
      var ago = function (x) { x = String(x || ''); return /전$/.test(x) ? x : (x ? x + ' 전' : '방금'); };
      var heart = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7.500-4.600-9-9.200C2 7 4.400 4.500 7.400 4.500c1.900 0 3.500 1 4.600 2.600 1.100-1.600 2.700-2.600 4.600-2.600 3 0 5.400 2.500 4.400 6.300C19.500 15.400 12 20 12 20z"/></svg>';
      var xIc = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>';
      var rf = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.500 12a7.500 7.500 0 11-2.200-5.300M19.500 4.500v4.500H15"/></svg>';
      var v = pushView(root,
        '<div class="spp">' + sbHtml('dark') + '<div class="spp-prog"></div>' +
        '<div class="spp-sc">' +
          '<div class="spp-hd">' + SPIN_LOGO + '<span class="spp-login">회원가입/로그인</span></div>' +
          '<div class="spp-q"><div class="spp-who"><i class="spp-anon">S</i><div><b>익명</b><span>' + esc(ago(t.spin.qAge || t.age)) + '</span></div></div><div class="spp-qt">' + esc(t.spin.q) + '</div></div>' +
          '<div class="spp-a"><div class="spp-who">' + xav(t.avatar, t.avatarFallback) + '<div><b>' + esc(t.name) + '</b><span>' + esc(ago(t.age)) + '</span></div><span class="spp-more">⋮</span></div>' +
            '<div class="spp-at">' + rich(ans) + '</div><div class="spp-act"><span class="spp-gift">⭐ 선물하기</span>' + heart + '</div></div>' +
          '<div class="spp-prof">' + xav(t.avatar, t.avatarFallback) + '<div><b>' + esc(t.name) + '</b><span>팔로워 ' + esc(t.spin.followers || 1) + '</span></div></div>' +
          '<div class="spp-sp"></div></div>' +
        '<div class="spp-bot"><div class="spp-bar"><button type="button" class="spp-x" aria-label="닫기">' + xIc + '</button><div class="spp-url"><b>' + SPIN_DOMAIN + '</b><span>⋮</span></div><span class="spp-rf">' + rf + '</span></div>' +
        '<div class="spp-sheet"><i class="grab"></i><div class="spp-tw">' + xav(t.avatar, t.avatarFallback) + '<div class="nm"><b>' + esc(t.name) + '</b><span>@' + esc(t.handle) + '</span></div><span class="spp-dm">쪽지</span></div>' +
          '<div class="spp-tt">' + rich(t.text) + '</div>' +
          '<div class="spp-ic"><span>' + I.reply + '</span><button type="button" data-act="quotes" data-id="' + t.id + '">' + I.repost + '</button>' +
          '<button type="button" class="lk' + (liked[t.id] ? ' on' : '') + '" data-act="like" data-id="' + t.id + '">' + I.like + '</button>' +
          '<button type="button" class="bmk' + (marked[t.id] ? ' on' : '') + '" data-act="bm" data-id="' + t.id + '">' + I.bm + '</button><span>' + I.shr + '</span></div></div></div>' +
        '</div>', 'xa');
      v.style.background = '#fff';
      qs(v, '.spp-x').addEventListener('click', function () { popView(v); });
      requestAnimationFrame(function () { var b = qs(v, '.spp-bot'), sp = qs(v, '.spp-sp'); if (b && sp) { sp.style.height = (b.offsetHeight + 16) + 'px'; } });
    }

    /* 쪽지 대화 */
    function openDM(id, instant) {
      var d = C.DMS.filter(function (x) { return x.id === id; })[0];
      if (!d) { return; }
      dmRead[id] = true;
      var bub = d.msgs.map(function (m) {
        return '<div class="dbub"><div class="b">' + rich(m) + '</div></div>';
      }).join('');
      var v = pushView(root, sbHtml('dark') +
        '<div class="dtop"><button type="button" class="back" style="color:#0f1419">' + I.back + '</button><span class="tt" style="font-size:17px">' + esc(d.name) + '</span></div>' +
        '<div class="dmv-body"><div class="dmv-info">' + xavDefault() + '<b>' + esc(d.name) + '</b><span>@' + esc(d.handle) + '</span>' +
        '<small>' + TD[0] + '년 ' + TD[1] + '월 가입 · 팔로워 ' + d.followers + '명 · 팔로잉 ' + d.following + '명 · 게시물 ' + d.posts + '개</small></div>' +
        bub + '<div class="dbub"><div class="t">' + esc(d.time) + '</div></div></div>' +
        '<div class="dm-in"><span class="pl">' + I.plus.replace('width="20" height="20"', 'width="26" height="26"') + '</span><div><span>쪽지</span>' + I.mic.replace('width="18" height="18"', 'width="24" height="24"') + '</div></div>', 'xa');
      v.style.background = '#fff';
      if (instant) { v.__cancel = true; v.classList.remove('slide-in'); }
      qs(v, '.back').addEventListener('click', function () {
        popView(v, function () { updateBadge(); if (ctx.tab === 'dm') { renderDM(); } });
      });
      updateBadge();
    }

    render();
    startDMs();
    return function () { xCtx = null; };
  };

  /* =========================================================
     시작
     ========================================================= */
  function agoStr(at) {
    var d = clockMin() - at;
    if (d < 1) { return '방금'; }
    return d < 60 ? d + '분 전' : Math.floor(d / 60) + '시간 전';
  }
  setInterval(function () {
    var t = clockStr();
    qsa(phone, '.clk').forEach(function (n) { if (n.textContent !== t) { n.textContent = t; } });
    qsa(phone, '.tm[data-at]').forEach(function (n) {
      var a = agoStr(parseInt(n.getAttribute('data-at'), 10));
      if (n.textContent !== a) { n.textContent = a; }
    });
  }, 1000);
  function boot() {
    phone.classList.toggle('standalone', isStandalone());
    handleReset();
    preload();
    if (loadUser()) { showLock(); } else { showStart(); }
    try {
      if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
        navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).catch(function () {});
      }
    } catch (e) {}
  }
  boot();
})();
