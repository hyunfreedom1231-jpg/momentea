/* =========================================================
   Momentea 웹앱 — 화면 전환 · 인터랙션 · 모션
   ========================================================= */
(function () {
  'use strict';
  const D = window.MT_DATA, P = D.products;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const device = $('#device');
  const IMG = n => 'assets/img/' + n + '.jpg';
  const ic = (n, m, cls) => `<i class="ic ${m ? 'm ' : ''}i-${n}${cls ? ' ' + cls : ''}"></i>`;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const vibrate = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const hasJong = w => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 !== 0; };
  const josa = (w, a, b) => w + (hasJong(w) ? a : b);
  const pad = n => String(n).padStart(2, '0');
  const fmt = ms => { ms = Math.max(0, ms); const m = Math.floor(ms / 60000), s = Math.floor(ms / 1000) % 60, c = Math.floor(ms / 10) % 100; return pad(m) + ':' + pad(s) + ':' + pad(c); };

  const state = {
    product: 'earlgrey',
    settings: { temp: null, guide: null, strength: 3, repeat: 3 },
    recent: D.recentKeywords.slice(),
    week: JSON.parse(JSON.stringify(D.week)),
    timer: { round: 1, rounds: [], running: false, endAt: 0, remain: 0, dur: 0, raf: 0 },
    review: [2, 2, 2, 2]
  };

  /* ---------------- QR 체험 모드 (?flow=pansy | ?flow=hibiscus) ----------------
     전시장 제품 사진 앞 QR → 사진 검색 → 차 정보 → 우리기 → 타이머 → 후기 → 체험 종료 */
  const FLOW_KEY = new URLSearchParams(location.search).get('flow');
  const FLOW = { pansy: 'pansy', hibiscus: 'morninghip', morninghip: 'morninghip' }[FLOW_KEY] || null;
  let flowDone = false;

  /* ---------------- 디바이스 스케일 ----------------
     PC: 아이폰 13(390×844) 프레임을 창에 맞춰 축소.
     휴대폰: 어떤 기종이든 가로를 꽉 채우고(390 기준으로 확대·축소), 세로는 기종에 맞춰 늘거나 줄어듦.
       - 아래쪽에 붙은 요소(탭 바, 하단 버튼, 키보드 등)는 화면 아래 기준으로 따라 내려가거나 올라감
       - 세로가 짧은 기종에서는 우리기 설정·체험 완료처럼 내용이 많은 화면의 간격을 조금씩 줄임
       - 세로가 640보다 짧으면(아주 작은 화면) 그때만 전체를 축소 */
  const BASE_H = 844, MIN_H = 640;
  function anchorBottoms() {
    // 기기 높이를 바꿔 보고, 위치가 고정된(top 기준) 요소 중 화면 아래쪽(640 이하)에 있는 것을 아래 기준으로 전환
    const items = [];
    $$('.screen').forEach(sc => Array.from(sc.children).forEach(c => { if (getComputedStyle(c).position === 'absolute') items.push(c); }));
    device.style.height = BASE_H + 'px'; const a = items.map(c => [c.offsetTop, c.offsetHeight]);
    device.style.height = (BASE_H + 100) + 'px'; const b = items.map(c => [c.offsetTop, c.offsetHeight]);
    items.forEach((c, i) => {
      const [y, h] = a[i];
      if (b[i][0] === y && b[i][1] === h && y >= 640) { c.style.top = 'auto'; c.style.bottom = (BASE_H - y - h) + 'px'; }
    });
    device.style.height = BASE_H + 'px';
    // 세로가 짧을 때 간격을 줄이는 화면들 — calc(원래 위치 + 줄어든 높이 × 비율)
    const squeeze = (el, f, v) => { if (!el) return; const t = parseFloat(el.style.top || getComputedStyle(el).top); el.style.top = `calc(${t}px + var(${v || '--dyn'}) * ${f})`; };
    const bt = $$('#s-brew > .sec-title, #s-brew > .opt-row, #s-brew > .seg-slider');
    [.05, .067, .31, .33, .57, .585, .76, .77].forEach((f, i) => squeeze(bt[i], f));
    squeeze($('#s-count .count-ring'), .5, '--dy');
    ['#vPrompt', '#vHeard', '#vWave'].forEach(sel => squeeze($(sel), .5, '--dy'));
  }
  anchorBottoms();
  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const REC = /[?&]rec\b/.test(location.search);       // 시연 영상 녹화용: 화면 전체를 기기 화면으로 채움
    const phone = vw <= 500 || REC;
    document.documentElement.classList.toggle('is-phone', phone);
    // 실제 휴대폰(터치)에서는 기기 자체 상태 바가 있으므로 시안용 가짜 상태 바(9:41)를 숨김
    document.documentElement.classList.toggle('is-touch', phone && window.matchMedia('(pointer: coarse)').matches);
    let s, h = BASE_H;
    if (phone) {
      s = vw / 390; h = vh / s;
      if (h < MIN_H) { h = MIN_H; s = vh / MIN_H; }
      h = Math.round(h * 100) / 100;
    } else s = Math.min(1, (vw - 48) / 390, (vh - 48) / BASE_H);
    device.style.height = h + 'px';
    device.style.setProperty('--dy', (h - BASE_H).toFixed(2) + 'px');
    device.style.setProperty('--dyn', Math.min(0, h - BASE_H).toFixed(2) + 'px');
    device.style.setProperty('--s', s.toFixed(4));
  }
  window.addEventListener('resize', fit); fit();
  const scaleOf = () => device.getBoundingClientRect().width / 390;

  /* ---------------- 눌림 피드백 ---------------- */
  const PRESS = '.press,.press-card,.press-ic,.press-soft,.c3-go,.sg,.v-mic,.cam-shutter,.tb-plus,.tb-fab';
  let pressEl = null, pressT = 0, pressX = 0, pressY = 0;
  device.addEventListener('pointerdown', e => {
    const el = e.target.closest(PRESS); if (!el) return;
    pressEl = el; pressT = performance.now(); pressX = e.clientX; pressY = e.clientY;
    el.classList.add('is-pressed');
  }, true);
  device.addEventListener('pointermove', e => {
    if (pressEl && (Math.abs(e.clientX - pressX) > 8 || Math.abs(e.clientY - pressY) > 8)) { pressEl.classList.remove('is-pressed'); pressEl = null; }
  }, true);
  const release = () => { if (!pressEl) return; const el = pressEl; pressEl = null; const d = performance.now() - pressT; setTimeout(() => el.classList.remove('is-pressed'), Math.max(0, 110 - d)); };
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => device.addEventListener(t, release, true));

  /* 마우스로 가로 스크롤 영역 드래그 */
  let dragSuppress = false;
  function enableDragScroll(el, snap) {
    let down = false, sx = 0, sl = 0, moved = false, lastX = 0, lastT = 0, v = 0, startI = 0;
    el.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = el.scrollLeft; startI = snap ? Math.round(sl / snap()) : 0; lastX = e.clientX; lastT = performance.now(); v = 0;
    });
    window.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = (e.clientX - sx) / scaleOf();
      if (!moved && Math.abs(dx) > 5) { moved = true; el.style.scrollSnapType = 'none'; el.style.scrollBehavior = 'auto'; }
      if (moved) { el.scrollLeft = sl - dx; const now = performance.now(); v = (e.clientX - lastX) / Math.max(1, now - lastT); lastX = e.clientX; lastT = now; }
    });
    window.addEventListener('pointerup', () => {
      if (!down) return; down = false;
      if (!moved) return;
      dragSuppress = true; setTimeout(() => dragSuppress = false, 60);
      if (snap) {
        const w = snap(); let i = Math.round((el.scrollLeft - v * 120 / scaleOf()) / w);
        i = Math.max(startI - 1, Math.min(startI + 1, i)); const target = i * w;
        el.scrollTo({ left: target, behavior: 'smooth' });
        setTimeout(() => { el.style.scrollSnapType = ''; }, 420);
      } else {
        let vel = -v * 16 / scaleOf();
        const step = () => { if (Math.abs(vel) < .4) return; el.scrollLeft += vel; vel *= .92; requestAnimationFrame(step); };
        requestAnimationFrame(step);
        el.style.scrollBehavior = '';
      }
    });
  }
  device.addEventListener('click', e => { if (dragSuppress) { e.stopPropagation(); e.preventDefault(); } }, true);

  /* ---------------- 토스트 ---------------- */
  let toastT = 0;
  function toast(msg) {
    const t = $('#toast'); t.innerHTML = '<i class="ic m i-leaf16"></i><span>' + msg + '</span>'; t.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-show'), 2000);
  }

  /* ---------------- 라우터 ---------------- */
  const hooks = {};
  const stack = [];
  let busy = false;
  const EASE = 'cubic-bezier(.32,.72,0,1)';
  const TR = {
    push: { dur: 480, inK: [{ transform: 'translateX(100%)', boxShadow: '-20px 0 40px rgba(0,0,0,0)' }, { transform: 'translateX(0)', boxShadow: '-20px 0 40px rgba(0,0,0,.08)' }], outK: [{ transform: 'translateX(0)' }, { transform: 'translateX(-28%)' }], dim: .14 },
    modal: { dur: 520, inK: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], outK: [{ transform: 'scale(1)', borderRadius: '0px' }, { transform: 'scale(.94)', borderRadius: '30px' }], dim: .3 },
    fade: { dur: 420, inK: [{ opacity: 0, transform: 'scale(1.03)' }, { opacity: 1, transform: 'scale(1)' }], outK: [{ opacity: 1 }, { opacity: 1 }], dim: 0 },
    tab: { dur: 240, inK: [{ opacity: 0 }, { opacity: 1 }], outK: [{ opacity: 1 }, { opacity: 0 }], dim: 0 }
  };
  const scr = id => document.getElementById('s-' + id);
  const curId = () => stack.length ? stack[stack.length - 1].id : null;

  function setStatus(id) {
    const sb = $('#statusbar');
    sb.classList.toggle('light', scr(id).dataset.sb === 'light');
  }
  function dimLayer(el, to, dur, reverse) {
    if (!to) return null;
    const d = document.createElement('div'); d.className = 'dimmer'; el.appendChild(d);
    d.animate([{ opacity: reverse ? to : 0 }, { opacity: reverse ? 0 : to }], { duration: dur, easing: EASE, fill: 'forwards' });
    return d;
  }
  async function transition(fromId, toId, type, dir) {
    const from = fromId && scr(fromId), to = scr(toId), t = TR[type] || TR.push;
    $('#blocker').classList.add('on');
    to.classList.add('is-active');
    setStatus(toId);
    if (!from || from === to) { $('#blocker').classList.remove('on'); return; }
    const opt = { duration: t.dur, easing: EASE, fill: 'both' };
    let a1, a2, dm;
    if (dir > 0) {
      to.style.zIndex = 3; from.style.zIndex = 2;
      a1 = to.animate(t.inK, opt); a2 = from.animate(t.outK, opt); dm = dimLayer(from, t.dim, t.dur);
    } else {
      from.style.zIndex = 3; to.style.zIndex = 2;
      a1 = from.animate(t.inK.slice().reverse(), opt); a2 = to.animate(t.outK.slice().reverse(), opt); dm = dimLayer(to, t.dim, t.dur, true);
    }
    await Promise.all([a1.finished, a2.finished]).catch(() => {});
    from.classList.remove('is-active');
    [a1, a2].forEach(a => a.cancel());
    from.style.zIndex = to.style.zIndex = '';
    dm && dm.remove();
    $('#blocker').classList.remove('on');
  }
  async function go(id, o = {}) {
    if (busy) return; busy = true; fabCloseAll && fabCloseAll();
    const fromId = curId();
    const type = o.type || 'push';
    if (fromId && hooks[fromId] && hooks[fromId].leave) hooks[fromId].leave();
    if (hooks[id] && hooks[id].enter) hooks[id].enter(o.data || {});
    if (o.replace) stack.pop();
    if (o.root) stack.length = 0;
    stack.push({ id, type: o.backType || type });
    await transition(fromId, id, type, 1);
    if (hooks[id] && hooks[id].shown) hooks[id].shown(o.data || {});
    busy = false;
  }
  async function back(o = {}) {
    if (busy || stack.length < 2) return; busy = true;
    const top = stack.pop(), prev = curId();
    if (hooks[top.id] && hooks[top.id].leave) hooks[top.id].leave();
    if (hooks[prev] && hooks[prev].resume) hooks[prev].resume(o.data || {});
    await transition(top.id, prev, top.type, -1);
    busy = false;
  }
  async function goHome(o = {}) {
    fabCloseAll();
    if (busy) return;
    const top = stack[stack.length - 1];
    if (!top || top.id === 'home') return;
    busy = true;
    if (hooks[top.id] && hooks[top.id].leave) hooks[top.id].leave();
    stack.length = 0; stack.push({ id: 'home', type: 'tab' });
    if (hooks.home.resume) hooks.home.resume(o);
    await transition(top.id, 'home', top.type === 'tab' ? 'tab' : top.type, -1);
    if (hooks.home.shown) hooks.home.shown(o);
    busy = false;
  }
  async function goTab(id, data, tr) {
    fabCloseAll();
    if (busy || curId() === id) return;
    tr = tr || { type: 'tab', dir: 1 };
    const fromId = curId(); busy = true;
    if (hooks[fromId] && hooks[fromId].leave) hooks[fromId].leave();
    if (hooks[id] && hooks[id].enter) hooks[id].enter(data || {});
    stack.length = 0; stack.push({ id, type: 'tab' });
    await transition(fromId, id, tr.type, tr.dir);
    if (hooks[id] && hooks[id].shown) hooks[id].shown(data || {});
    busy = false;
  }

  /* 공통 액션 위임 */
  device.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'back') back();
    else if (act === 'home') goHome();
    else if (act === 'voice') go('voice', { type: 'modal' });
    else if (act === 'photo') go('photo', { type: 'modal' });
    else if (act === 'search-focus') goTab('search', { focus: true });
    else if (act === 'skip-review') { if (FLOW && !flowDone) endFlow(); else goHome(); }
  });
  device.addEventListener('click', e => {
    const p = e.target.closest('[data-product]'); if (!p) return;
    if (e.target.closest('.heart,.c3-go')) return;
    openDetail(p.dataset.product);
  });
  function openDetail(id, o = {}) { go('detail', Object.assign({ data: { id } }, o)); }

  /* ---------------- 탭 바 ---------------- */
  const TB = [['home', 51, 'home_off', 'home_on'], ['shop', 121, 'tb_shop', 'tb_shop_on'], ['face', 269, 'tb_face', 'tb_face_on'], ['cog', 339, 'tb_cog', 'tb_cog_on']];
  const FABS = [['photo', 'fab_cam', -53, -30, '사진으로 검색'], ['voice', 'fab_mic', 0, -48, '음성으로 검색'], ['type', 'fab_type', 52, -30, '키보드로 검색']];
  $$('.tabbar').forEach(nav => {
    const act = nav.dataset.active;
    nav.insertAdjacentHTML('beforebegin', '<div class="tb-scrim"></div>');
    nav.innerHTML = TB.map(([k, x, off, on]) => `<button class="tb press-ic ${k === 'home' ? 'home' : ''}${act === k ? ' is-on' : ''}" data-tb="${k}" style="left:${x}px" aria-label="${k}">${ic(off, 1, 'off')}${ic(on, 1, 'on')}</button>`).join('')
      + `<button class="tb-plus" data-tb="plus" aria-label="검색 방법 열기">${ic('fab_plus', 1)}</button>`
      + `<div class="tb-pop">${FABS.map(([k, icn, dx, dy, lab], i) => `<button class="tb-fab ${k === 'voice' ? 'mic' : ''}" data-fab="${k}" aria-label="${lab}" style="--dx:${dx}px;--dy:${dy - 30}px;--dl:${[40, 0, 80][i]}ms">${ic(icn, 1)}</button>`).join('')}</div>`;
  });
  function fabOpen(nav, on) {
    if (!nav) return;
    nav.classList.toggle('is-open', on);
    const scrim = nav.previousElementSibling; if (scrim && scrim.classList.contains('tb-scrim')) scrim.classList.toggle('on', on);
    $('.tb-plus', nav).setAttribute('aria-label', on ? '닫기' : '검색 방법 열기');
    if (on) vibrate(8);
  }
  function fabCloseAll() { $$('.tabbar.is-open').forEach(n => fabOpen(n, false)); }
  device.addEventListener('click', e => {
    if (e.target.closest('.tb-scrim')) { fabCloseAll(); return; }
    const f = e.target.closest('[data-fab]');
    if (f) {
      const k = f.dataset.fab;
      setTimeout(() => {
        fabCloseAll();
        if (k === 'photo') go('photo', { type: 'modal' });
        else if (k === 'voice') go('voice', { type: 'modal' });
        else if (curId() === 'search') { const inp = $('#searchBar'); inp && inp.click(); }
        else goTab('search', { focus: true });
      }, 140);
      return;
    }
    const b = e.target.closest('[data-tb]'); if (!b) return;
    const k = b.dataset.tb, nav = b.closest('.tabbar');
    if (k === 'plus') { fabOpen(nav, !nav.classList.contains('is-open')); return; }
    fabCloseAll();
    if (k === 'home') { if (curId() === 'home') scrollHomeTop(); else goTab('home'); }
    else if (k === 'shop') { if (curId() === 'search') return; goTab('search', {}); }
    else if (k === 'face') { if (curId() !== 'mypage') goTab('mypage'); else $('#mpScroll').scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (k === 'cog') { if (curId() !== 'settings') goTab('settings'); }
  });

  /* =========================================================
     홈
     ========================================================= */
  const homeTabs = ['recent', 'popular', 'similar'];
  let homeTab = 'recent';
  const heartHTML = on => `<button class="heart press-ic${on ? ' is-on' : ''}" aria-label="찜">${ic('heart_sel1', 0, 'h-on')}${ic('heart_dis', 0, 'h-off')}<span class="burst">${[0, 60, 120, 180, 240, 300].map(r => `<i style="--r:${r}deg"></i>`).join('')}</span></button>`;
  const c1HTML = c => `<div class="c1 press-card" data-product="${c.id}" style="background:${c.bg}"><div class="c1-img"><img src="${IMG(P[c.id].img)}" style="top:${c.top}%" alt="">${heartHTML(c.heart)}</div><div class="c1-txt"><b class="trim">${c.title}</b><span class="trim">${c.sub}</span></div></div>`;

  function renderRecent() {
    const wk = state.week;
    $('#paneRecent').innerHTML = `
      <div class="bn1-wrap stg"><div class="bn1" id="bn1">${loopBanners().map(([b, i, clone]) => `
        <div class="bn1-item press-card${clone ? ' is-clone' : ''}" data-product="${b.id}" style="background:${b.bg}"${clone ? ' aria-hidden="true"' : ''}>
          <div class="bn1-img"><img src="${IMG(P[b.id].img)}" alt=""></div>
          <div class="bn1-foot"><div class="bn1-txt"><b class="trim">${b.title}</b><span class="trim">${b.sub}</span></div><div class="pager"><span class="trim">${i + 1} / 5</span></div></div>
        </div>`).join('')}</div></div>
      <div class="sec stg" style="margin-top:20px">
        <div class="sec-head"><b class="trim">최근 한 달 동안 가장 자주 찾았어요</b>${ic('chev28')}</div>
        <div class="cards-h hscroll" style="margin-top:8px">${D.frequent.map(c1HTML).join('')}</div>
      </div>
      <div class="sec stg" style="margin-top:28px">
        <div class="sec-head"><b class="trim">최근에 마신 차를 다시 만나보세요</b>${ic('chev28')}</div>
        <div style="display:flex;flex-direction:column;gap:16px;margin-top:16px">${D.history.map(g => `
          <div class="hist-group"><div class="hist-date trim">${g.date}</div>${g.items.map(it => { const p = P[it.id]; return `
            <div class="c3 press-card" data-product="${it.id}"><div class="c3-body"><div class="c3-img"><img src="${IMG(p.img)}" alt=""></div>
              <div class="c3-txt"><div class="t"><span class="brand trim">${p.brand}</span><b class="name trim">${it.id === 'yeonip' ? p.name : p.name}</b><span class="meta">${it.meta}</span></div>
              <div class="rate">${ic('star12')}<span class="trim"><em>${it.rating}</em> (${it.count})</span></div></div></div>
              <button class="c3-go" data-brew="${it.id}" aria-label="다시 우리기">${ic('card_chev')}</button></div>`; }).join('')}</div>`).join('')}
        </div>
      </div>`;
    /* 무한 루프 배너: [5] 1 2 3 4 5 [1] — 양끝 복제 카드에 도착하면 보이지 않게 실제 카드로 순간 이동 */
    const bn = $('#bn1');
    enableDragScroll(bn, () => 390);
    const jumpTo = pos => {
      bn.style.scrollSnapType = 'none'; bn.style.scrollBehavior = 'auto';
      bn.scrollLeft = pos * 390;
      requestAnimationFrame(() => { bn.style.scrollSnapType = ''; bn.style.scrollBehavior = ''; });
    };
    const settle = () => {
      const pos = Math.round(bn.scrollLeft / 390);
      if (Math.abs(bn.scrollLeft - pos * 390) > 2) return;
      if (pos === 0) jumpTo(5); else if (pos === 6) jumpTo(1);
    };
    let settleT = 0;
    bn.addEventListener('scroll', () => { clearTimeout(settleT); settleT = setTimeout(settle, 140); }, { passive: true });
    if ('onscrollend' in window) bn.addEventListener('scrollend', settle);
    jumpTo(1);
    bn.addEventListener('pointerdown', () => { bnHold = performance.now(); });
    $$('#paneRecent .cards-h').forEach(el => enableDragScroll(el));
  }
  let bnHold = 0;
  function loopBanners() {
    const B = D.recentBanners, n = B.length;
    return [[B[n - 1], n - 1, true]].concat(B.map((b, i) => [b, i, false]), [[B[0], 0, true]]);
  }
  setInterval(() => {
    if (curId() !== 'home' || homeTab !== 'recent' || busy || performance.now() - bnHold < 6000) return;
    const bn = $('#bn1'); if (!bn) return;
    const pos = Math.round(bn.scrollLeft / 390);
    bn.scrollTo({ left: Math.min(6, pos + 1) * 390, behavior: 'smooth' }); // 5 → 복제된 1로 계속 오른쪽 이동 후 루프
  }, 4500);

  function rankHTML(f) {
    return (D.ranks[f] || []).map((r, i) => { const p = P[r[0]]; const d = r[3]; return `
      <div class="rank press-card" data-product="${p.id}"><div class="rank-l"><span class="rank-n${i > 2 ? ' k' : ''}">${i + 1}</span>
        <div class="rank-img"><img src="${IMG(p.img)}" alt=""></div>
        <div class="rank-t"><div class="tt"><span class="brand trim">${p.brand}</span><b class="name trim">${p.name}</b></div><span class="rt">★ ${r[1]} (${r[2]}개)</span></div></div>
        <span class="rank-d${d.indexOf('▼') === 0 ? ' dn' : d.indexOf('▲') === 0 ? ' up' : ''}">${d}</span></div>`; }).join('');
  }
  function renderPopular() {
    $('#panePopular').innerHTML = `
      <div class="bn2 hscroll stg" id="bn2">${D.popularBanners.map((b, i) => `
        <div class="bn2-item press-card" data-product="${b.id}" style="background:${b.bg}">
          <div class="bn2-wrap"><span class="bn2-num trim">${i + 1}</span><div class="bn2-img"><img src="${IMG(P[b.id].img)}" alt=""></div></div>
          <div class="bn2-txt"><b class="trim">${b.title}</b><span class="trim">${b.sub}</span></div></div>`).join('')}</div>
      <div class="sec stg" style="margin-top:20px">
        <div class="sec-head"><b class="trim">지금 인기 있는 차를 모아봤어요</b>${ic('chev28')}</div>
        <div class="pills hscroll" id="rankPills" style="margin-top:12px;width:390px;margin-left:-16px;padding:0 16px">${D.rankFilters.map(f => `<button class="pill press${f === '잎차형' ? ' is-on' : ''}" data-f="${f}"><span class="trim">${f}</span></button>`).join('')}</div>
        <div class="rank-list" id="rankList">${rankHTML('잎차형')}</div>
      </div>
      <div class="sec stg" style="margin-top:28px">
        <div class="sec-head"><b class="trim">종류별 인기 차를 추천할게요</b>${ic('chev28')}</div>
        <div class="cards-h hscroll" style="margin-top:12px">${D.kindCards.map(c1HTML).join('')}</div>
      </div>`;
    const bn2 = $('#bn2'); enableDragScroll(bn2, () => 305); enableDragScroll($('#rankPills'));
    // 가운데 카드는 또렷하게, 양옆 카드는 살짝 작고 흐리게 — 스크롤 위치에 따라 연속적으로 변화
    const bn2Items = $$('.bn2-item', bn2); let bn2Raf = 0;
    const bn2Fx = () => { bn2Raf = 0; const c = bn2.scrollLeft; bn2Items.forEach((it, i) => { const d = Math.min(1, Math.abs(i * 305 - c) / 305); it.style.setProperty('--sc', (1 - d * .07).toFixed(4)); it.style.opacity = 1 - d * .35; }); };
    bn2.addEventListener('scroll', () => { if (!bn2Raf) bn2Raf = requestAnimationFrame(bn2Fx); }, { passive: true }); bn2Fx();
    $$('#panePopular .cards-h').forEach(el => enableDragScroll(el));
    $('#rankPills').addEventListener('click', e => {
      const b = e.target.closest('.pill'); if (!b || b.classList.contains('is-on')) return;
      $$('.pill', $('#rankPills')).forEach(x => x.classList.toggle('is-on', x === b));
      b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      const list = $('#rankList');
      const old = $$('.rank', list);
      old.forEach((el, i) => el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(-12px)' }], { duration: 140, delay: i * 18, easing: 'ease-in', fill: 'forwards' }));
      setTimeout(() => {
        list.innerHTML = rankHTML(b.dataset.f);
        $$('.rank', list).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 55, easing: EASE, fill: 'backwards' }));
      }, 200);
    });
  }
  function renderSimilar() {
    $('#paneSimilar').innerHTML = `
      <div class="sec stg"><div class="taste"><small class="trim">최근 12번의 맛 기록을 바탕으로</small><b class="trim">김희진님의 취향을 정리했어요</b>
        <div class="tags">${D.tasteTags.map(t => `<button class="tag press" data-tag="${t.slice(1)}"><span class="trim">${t}</span></button>`).join('')}</div></div></div>
      <div class="sec stg" style="margin-top:12px">
        <div class="sec-head"><b class="trim">내 취향에 어울리는 차를 골라봤어요</b>${ic('chev28')}</div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">${D.matches.map(m => `
          <div class="c4 press-card" data-product="${m.id}"><div class="c4-img"><img src="${IMG(P[m.id].img)}" ${m.top === null ? 'class="cover"' : `style="top:${m.top}%"`} alt=""></div>
            <div class="c4-t"><span class="pct">내 입맛과  ${m.pct}% 일치하는</span><b class="name">${m.name}</b>
              <div class="rows">${m.rows.map(r => `<div class="row">${r.map(([t, on]) => `<span class="otag${on ? '' : ' off'}"><span class="trim">${t}</span></span>`).join('')}</div>`).join('')}</div></div></div>`).join('')}
        </div>
      </div>
      <div class="sec stg" style="margin-top:28px">
        <div class="sec-head"><b class="trim">비슷한 취향의 사람들의 후기를 만나보세요</b>${ic('chev28')}</div>
        <div class="rv-row hscroll" style="margin-top:12px">${D.peerReviews.map(r => `
          <div class="prv press-card"><div class="prv-h"><div class="av"><img src="${IMG(r.av)}" alt=""></div><div><b>${r.name}</b><span>${r.sub}</span></div></div><p>${r.text}</p></div>`).join('')}</div>
      </div>`;
    $$('#paneSimilar .hscroll').forEach(el => enableDragScroll(el));
    $('#paneSimilar').addEventListener('click', e => {
      const t = e.target.closest('[data-tag]'); if (!t) return;
      const k = t.dataset.tag; const isFilter = D.resultFilters.indexOf(k) >= 0;
      goTab('search', {}).then(() => submitSearch(isFilter ? '' : k, isFilter ? k : null));
    });
  }

  /* 하트 / 다시 우리기 */
  device.addEventListener('click', e => {
    const h = e.target.closest('.heart');
    if (h) {
      e.stopPropagation();
      const on = !h.classList.contains('is-on');
      h.classList.toggle('is-on', on); h.classList.remove('pop');
      if (on) { void h.offsetWidth; h.classList.add('pop'); vibrate(10); }
      return;
    }
    const g = e.target.closest('[data-brew]');
    if (g) { e.stopPropagation(); state.vkOverride = g.dataset.vk || null; openBrew(g.dataset.brew); }
  });

  function setHomeTab(name, instant) {
    if (name === homeTab && !instant) return;
    const oldI = homeTabs.indexOf(homeTab), newI = homeTabs.indexOf(name);
    const oldP = $(`.pane[data-pane="${homeTab}"]`), newP = $(`.pane[data-pane="${name}"]`);
    homeTab = name;
    $$('#homeChips .tchip').forEach(c => c.classList.toggle('is-on', c.dataset.tab === name));
    const chip = $(`#homeChips .tchip[data-tab="${name}"]`);
    const chips = $('#homeChips');
    chips.scrollTo({ left: Math.max(0, chip.offsetLeft - (390 - chip.offsetWidth) / 2), behavior: instant ? 'auto' : 'smooth' });
    newP.classList.add('is-on');
    updateHeadShadow();
    if (instant || oldP === newP) { $$('.pane').forEach(p => p.classList.toggle('is-on', p === newP)); return; }
    const dx = newI > oldI ? 1 : -1;
    newP.style.zIndex = 2; oldP.style.zIndex = 1;
    oldP.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-24 * dx}px)` }], { duration: 220, easing: 'ease-in' }).finished.then(() => { oldP.classList.remove('is-on'); oldP.style.zIndex = ''; });
    newP.animate([{ opacity: 0, transform: `translateX(${32 * dx}px)` }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE });
    stagger(newP);
  }
  function stagger(pane) {
    $$('.stg', pane).slice(0, 5).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 60 + i * 60, easing: EASE, fill: 'backwards' }));
  }
  $('#homeChips').addEventListener('click', e => { const c = e.target.closest('.tchip'); if (c) setHomeTab(c.dataset.tab); });
  function updateHeadShadow() {
    const p = $(`.pane[data-pane="${homeTab}"]`);
    $('#homeHead').classList.toggle('is-scrolled', p.scrollTop > 4);
  }
  $$('.pane').forEach(p => p.addEventListener('scroll', updateHeadShadow, { passive: true }));
  function scrollHomeTop() { $(`.pane[data-pane="${homeTab}"]`).scrollTo({ top: 0, behavior: 'smooth' }); }

  hooks.home = {
    enter() { $$('.pane').forEach(p => p.scrollTop = 0); updateHeadShadow(); },
    resume() { $$('.pane').forEach(p => p.scrollTop = 0); updateHeadShadow(); }
  };
  renderRecent(); renderPopular(); renderSimilar();
  enableDragScroll($('#homeChips'));
  setHomeTab('recent', true);

  /* =========================================================
     검색
     ========================================================= */
  const sInput = $('#searchInput'), sBar = $('#searchBar');
  let sFocused = false;
  function renderRecentChips() {
    const box = $('#recentChips');
    box.innerHTML = state.recent.map(k => `<div class="kw press" data-kw="${k}"><span class="trim">${k}</span><button class="x" data-del="${k}" aria-label="삭제">${ic('chip_x', 1, 'c-c6')}</button></div>`).join('');
    $$('.kw .ic', box).forEach(i => i.style.color = '#c6c6c6');
    $('#emptyRecent').classList.toggle('on', !state.recent.length);
  }
  $('#cats').innerHTML = D.categories.map((c, i) => {
    const pos = [[16, 0], [138, 0], [260, 0], [16, 81]][i];
    return `<button class="cat press${c.leaf ? ' leaf' : ''}" data-cat="${c.key}" style="left:${pos[0]}px;top:${pos[1]}px;background:${c.bg}">${ic(c.icon)}<span>${c.key}</span></button>`;
  }).join('');
  enableDragScroll($('#recentChips'));

  $('#recentChips').addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (del) {
      e.stopPropagation();
      const k = del.dataset.del; const chip = del.closest('.kw');
      chip.classList.add('is-out');
      state.recent = state.recent.filter(x => x !== k);
      setTimeout(renderRecentChips, 360);
      return;
    }
    const kw = e.target.closest('[data-kw]'); if (kw) { autoCancel(); submitSearch(kw.dataset.kw); }
  });
  $('#clearRecent').addEventListener('click', () => {
    $$('#recentChips .kw').forEach((c, i) => setTimeout(() => c.classList.add('is-out'), i * 50));
    state.recent = [];
    setTimeout(renderRecentChips, 420);
  });
  $('#cats').addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (c) { autoCancel(); submitSearch('', c.dataset.cat); } });

  /* 키보드 (한글 두벌식 · 디자인 좌표 그대로) */
  const KB = [
    [562, 36, [[16, 'ㅂ'], [53, 'ㅈ'], [89, 'ㄷ'], [125, 'ㄱ'], [162, 'ㅅ'], [197, 'ㅛ'], [234, 'ㅕ'], [270, 'ㅑ'], [306, 'ㅐ'], [343, 'ㅔ']]],
    [608, 35, [[34, 'ㅁ'], [71, 'ㄴ'], [107, 'ㅇ'], [143, 'ㄹ'], [180, 'ㅎ', 30], [216, 'ㅗ'], [252, 'ㅓ'], [288, 'ㅏ'], [325, 'ㅣ']]],
    [654, 35, [[16, 'shift', 41], [65, 'ㅋ'], [102, 'ㅌ'], [138, 'ㅊ'], [174, 'ㅍ', 30], [210, 'ㅠ'], [247, 'ㅜ', 30], [283, 'ㅡ'], [333, 'back', 41]]],
    [699, 36, [[16, '123', 41], [61, 'emoji', 41], [107, 'space', 181], [294, 'ok', 80]]]
  ];
  const SHIFT = { 'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ', 'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ' };
  let shift = false;
  const kb = $('#keyboard');
  kb.innerHTML = KB.map(([top, h, keys]) => keys.map(([x, k, w]) => {
    const lab = { shift: '⇧', back: '⌫', '123': '123', emoji: '☺', space: '스페이스', ok: '확인' }[k] || k;
    const cls = k === 'ok' ? 'ok' : ['shift', 'back', '123', 'emoji'].indexOf(k) >= 0 ? 'fn' : '';
    const small = ['123', 'space', 'ok'].indexOf(k) >= 0 ? ' small' : '';
    const pop = lab.length === 1 && !cls ? `<span class="pop">${lab}</span>` : '';
    return `<div class="key ${cls}${small}${k === 'shift' ? ' shift' : ''}" data-k="${k}" style="left:${x}px;top:${top - 540}px;width:${w || 31}px;height:${h}px"><span class="kl">${lab}</span>${pop}</div>`;
  }).join('')).join('') + '<i class="home-ind"></i>';
  function setShift(on) {
    shift = on; $('.key.shift', kb).classList.toggle('on', on);
    $$('.key', kb).forEach(k => { const b = k.dataset.k; if (SHIFT[b]) { const l = on ? SHIFT[b] : b; k.querySelector('.kl').textContent = l; const p = k.querySelector('.pop'); if (p) p.textContent = l; } });
  }
  /* 자동 타이핑 데모: 검색창을 누르면 '홍차' 입력 → 홍차 제품 추천 목록 → 결과 */
  const UNSHIFT = {}; Object.keys(SHIFT).forEach(k => UNSHIFT[SHIFT[k]] = k);
  const AUTO_FINAL = '홍차';
  let autoT = [], autoOn = false, jamo = [];
  function autoCancel() { autoT.forEach(clearTimeout); autoT = []; autoOn = false; }
  function flashKey(k, ms) {
    const el = $(`.key[data-k="${k}"]`, kb); if (!el) return;
    el.classList.add('is-down'); setTimeout(() => el.classList.remove('is-down'), ms || 110);
  }
  const sTyped = $('#searchTyped');
  let typingT = 0;
  const escH = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  function syncTyped(active) {
    const v = sInput.value;
    sTyped.innerHTML = v ? `<span>${escH(v).replace(/ /g, '&nbsp;')}</span><i class="cur"></i>` : `<i class="cur"></i><span class="ph">지금 어떤 차를 마시고 있나요?</span>`;
    if (active) { sTyped.classList.add('typing'); clearTimeout(typingT); typingT = setTimeout(() => sTyped.classList.remove('typing'), 450); }
  }
  function render() { sInput.value = Hangul.assemble(jamo); syncTyped(true); updateSuggest(); }
  function runAutoType() {
    autoCancel(); autoOn = true; jamo = []; render();
    let t = 700;
    const at = (d, fn) => { t += d; autoT.push(setTimeout(fn, t)); };
    const typeText = text => Hangul.disassemble(text).forEach(j => {
      const sh = UNSHIFT[j];
      if (sh) at(60, () => { setShift(true); flashKey('shift', 90); });
      at(sh ? 70 : 150 + Math.random() * 70, () => {
        flashKey(j === ' ' ? 'space' : (sh || j));
        if (sh) setShift(false);
        jamo.push(j); render(); vibrate(4);
      });
    });
    typeText(AUTO_FINAL);
    at(1500, () => flashKey('ok', 180));
    at(220, () => { autoOn = false; submitSearch(AUTO_FINAL); });
  }
  sInput.readOnly = true;
  kb.addEventListener('pointerdown', e => { if (e.target.closest('.key')) e.preventDefault(); });
  kb.addEventListener('mousedown', e => e.preventDefault());

  function focusSearch() {
    if (!sFocused) { sFocused = true; sBar.classList.remove('is-idle'); sBar.classList.add('is-focus'); kb.classList.add('on'); }
    try { sInput.focus({ preventScroll: true }); } catch (e) {}
    syncTyped(false); updateSuggest();
    if (!autoOn) runAutoType();
  }
  function blurSearch() {
    autoCancel();
    sFocused = false; sBar.classList.remove('is-focus'); sBar.classList.add('is-idle'); kb.classList.remove('on'); setShift(false);
    sInput.value = ''; jamo = [];
    sInput.blur(); updateSuggest();
  }
  sBar.addEventListener('click', e => { if (!e.target.closest('[data-act]')) focusSearch(); });
  sInput.addEventListener('keydown', e => { if (e.key === 'Escape') blurSearch(); else e.preventDefault(); });
  $('#s-search').addEventListener('pointerdown', e => {
    if (!sFocused) return;
    if (e.target.closest('#searchBar,#keyboard,.sg,.kw,.cat,#clearRecent,.tabbar,.tb-scrim')) return;
    blurSearch();
  });

  /* 자모 단위로 비교해서 '홍ㅊ'처럼 조합 중인 글자도 '홍차'에 걸리도록 */
  const jm = t => Hangul.disassemble(t).join('');
  Object.values(P).forEach(p => { p._s = jm((p.brand + ' ' + p.full + ' ' + (p.sg || '') + ' ' + (p.tags || '') + ' ' + p.type + ' ' + p.cat).replace(/\s/g, '')); });
  function matchProducts(q) {
    const toks = q.split(/\s+/).filter(Boolean).map(jm);
    if (!toks.length) return [];
    return Object.values(P).filter(p => toks.every(t => p._s.indexOf(t) >= 0))
      .map((p, i) => [p, i]).sort((a, b) => ((a[0].ord || 99) - (b[0].ord || 99)) || a[1] - b[1]).map(x => x[0]);
  }
  function hl(text, q) {
    const toks = q.split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
    if (!toks.length) return text;
    const esc = toks.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    return text.replace(new RegExp('(' + esc.join('|') + ')', 'g'), '<em>$1</em>');
  }
  let lastSg = '';
  function updateSuggest() {
    const q = sInput.value.trim();
    const box = $('#suggest');
    const show = !!q && sFocused;
    $('#searchIdle').classList.toggle('is-hidden', show);
    box.classList.toggle('on', show);
    if (!show) { $$('.sg', box).forEach(el => el.classList.remove('on')); lastSg = ''; clearTimeout(box._clr); box._clr = setTimeout(() => { if (!box.classList.contains('on')) box.innerHTML = ''; }, 220); return; }
    clearTimeout(box._clr);
    const list = matchProducts(q).filter(p => !p.sgHide).slice(0, 12);
    const key = q + '|' + list.map(p => p.id).join(',');
    if (key === lastSg) return; lastSg = key;
    const prevIds = $$('.sg', box).map(el => el.dataset.id);
    box.innerHTML = list.length ? list.map((p, i) => `<button class="sg${prevIds.indexOf(p.id) >= 0 ? ' on' : ''}" data-sq="${p.full}" data-id="${p.id}" style="top:${8 + i * 68}px"><span class="sg-img"><img src="${IMG(p.img)}" alt=""${p.fit ? ` style="object-fit:${p.fit}"` : ''}></span><span class="sg-t">${hl(p.sg && /홍차/.test(q) ? p.sg : p.full, q)}</span></button>`).join('') + (list.length ? `<i class="sg-end" style="top:${8 + list.length * 68}px"></i>` : '')
      : (autoOn ? '' : `<div class="sg-none">‘${q.replace(/</g, '&lt;')}’에 맞는 차를 찾지 못했어요.<br>확인을 누르면 전체 결과를 보여드릴게요.</div>`);
    requestAnimationFrame(() => $$('.sg', box).forEach((el, i) => setTimeout(() => el.classList.add('on'), i * 40)));
  }
  $('#suggest').addEventListener('click', e => { const s = e.target.closest('[data-sq]'); if (s) { autoCancel(); submitSearch(s.dataset.sq); } });

  function submitSearch(q, cat) {
    q = (q || '').trim();
    if (!q && !cat) { sBar.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 360, easing: 'ease-out' }); return; }
    if (q) { state.recent = [q].concat(state.recent.filter(x => x !== q)).slice(0, 8); }
    const from = curId();
    if (from === 'search') { kb.classList.remove('on'); go('results', { type: 'fade', data: { q, cat } }); }
    else go('results', { type: from === 'voice' ? 'fade' : 'push', replace: from === 'voice', backType: 'push', data: { q, cat } });
  }
  hooks.search = {
    enter(o) {
      renderRecentChips();
      sInput.value = o.q || '';
      lastSg = '';
      if (o.focus) { sFocused = false; requestAnimationFrame(focusSearch); }
      else blurSearch();
    },
    resume(o) { renderRecentChips(); sFocused = false; if (o && o.focus !== false) requestAnimationFrame(focusSearch); else blurSearch(); },
    leave() { autoCancel(); kb.classList.remove('on'); sFocused = false; sBar.classList.remove('is-focus'); sBar.classList.add('is-idle'); sInput.blur(); }
  };

  /* =========================================================
     검색 결과
     ========================================================= */
  let rq = '', rcat = null;
  function renderResults(animate) {
    const base = rq ? matchProducts(rq) : Object.values(P);
    const list = rcat ? base.filter(p => p.type === rcat || p.cat === rcat) : base;
    $('#resultQ').textContent = rq || rcat || '';
    $$('#resultChips .fchip').forEach(c => c.classList.toggle('is-on', c.dataset.f === rcat));
    const total = rq === '홍차' && !rcat ? '332,267' : list.length.toLocaleString();
    $('#resultTitle').innerHTML = `${rq || rcat} <span>검색 결과 ${total}개</span>`;
    const box = $('#resultList');
    box.innerHTML = list.length ? list.map(p => `
      <div class="c5 press-card" data-product="${p.id}"><div class="c5-img"><img src="${IMG(p.img)}" alt=""${p.fit ? ` style="object-fit:${p.fit}"` : ''}></div>
        <div class="c5-r"><div><div class="brand">${p.brand}</div><div class="name">${p.name}</div><div class="rt">★ ${p.rating} (${p.count}개)</div></div>
        <div class="rec">${ic('timer14')}<span class="trim">추천 ${p.rec} </span></div></div></div>`).join('')
      : `<div class="no-result">조건에 맞는 차가 없어요.<br>필터를 바꿔서 다시 찾아볼까요?</div>`;
    if (animate) $$('.c5, .no-result', box).forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 440, delay: 80 + i * 60, easing: EASE, fill: 'backwards' }));
  }
  $('#resultChips').innerHTML = D.resultFilters.map(f => `<button class="fchip press" data-f="${f}"><span class="trim">${f}</span></button>`).join('');
  enableDragScroll($('#resultChips'));
  $('#resultChips').addEventListener('click', e => {
    const c = e.target.closest('.fchip'); if (!c) return;
    if (!rq && rcat === c.dataset.f) return;
    rcat = rcat === c.dataset.f ? null : c.dataset.f;
    c.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    renderResults(true);
  });
  $('#resultBar').addEventListener('click', e => {
    if (e.target.closest('#resultClear')) return;
    const prev = stack.length > 1 ? stack[stack.length - 2].id : null;
    if (prev === 'search') back({ data: { q: rq, focus: true } }); else go('search', { type: 'fade', data: { q: rq, focus: true } });
  });
  $('#resultClear').addEventListener('click', e => {
    e.stopPropagation();
    const prev = stack.length > 1 ? stack[stack.length - 2].id : null;
    if (prev === 'search') back({ data: { q: '', focus: true } }); else go('search', { type: 'fade', data: { q: '', focus: true } });
  });
  hooks.results = {
    enter(o) {
      rq = o.q || ''; rcat = o.cat || null;
      if (!rcat && rq) { const m = matchProducts(rq); if (m.length && m.every(p => p.type === m[0].type)) rcat = m[0].type; }
      renderResults(false);
      $('#resultScroll').scrollTop = 0;
      const on = $('#resultChips .fchip.is-on'); $('#resultChips').scrollLeft = on ? Math.max(0, on.offsetLeft - 16) : 0;
    },
    shown() { $$('#resultList .c5, #resultList .no-result').forEach((el, i) => el.animate([{ opacity: .0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 50, easing: EASE, fill: 'backwards' })); }
  };

  /* =========================================================
     음성 검색
     ========================================================= */
  const vs = $('#s-voice');
  const BARS = [[216, 33], [224, 33], [232, 33], [240, 33], [248, 33], [256, 33], [264, 33], [208, 29], [200, 29], [192, 29], [184, 39], [176, 39], [168, 39], [160, 33], [152, 33], [144, 33], [136, 29], [128, 43], [120, 51], [112, 43], [104, 39], [96, 33], [88, 33], [80, 28], [72, 28], [64, 38], [56, 32], [48, 28], [40, 32], [32, 28], [24, 33], [16, 33], [8, 33], [0, 33], [-8, 33], [-16, 33], [-24, 33]];
  $('#vBars').innerHTML = BARS.map(([x, h], i) => `<i style="left:${x + 24}px;height:${h}px;--d:${(380 + (i * 137) % 420)}ms;--dl:-${(i * 91) % 600}ms"></i>`).join('');
  let vTimers = [];
  const vClear = () => { vTimers.forEach(clearTimeout); vTimers = []; };
  const VTEXT = '아마드티 얼그레이 홍차';
  function vStart() {
    vs.classList.add('is-listening'); vibrate(15);
    const heard = $('#vHeard'); heard.innerHTML = '“<span class="caret"></span>”';
    let n = 0;
    const typeNext = () => {
      n++; heard.innerHTML = '“' + VTEXT.slice(0, n) + (n < VTEXT.length ? '<span class="caret"></span>' : '') + '”';
      if (n < VTEXT.length) vTimers.push(setTimeout(typeNext, 75 + Math.random() * 70)); else vTimers.push(setTimeout(vFinish, 900));
    };
    vTimers.push(setTimeout(typeNext, 700));
  }
  function vFinish() {
    vClear(); vs.classList.add('is-done');
    $('#vHeard').innerHTML = '“' + VTEXT + '”';
    vTimers.push(setTimeout(() => submitSearch(VTEXT), 450));
  }
  $('#vMic').addEventListener('click', () => {
    if (!vs.classList.contains('is-listening')) vStart();
    else if (!vs.classList.contains('is-done')) vFinish();
  });
  hooks.voice = {
    enter() { vClear(); vs.classList.remove('is-listening', 'is-done'); $('#vHeard').innerHTML = ''; },
    shown() { },
    leave() { vClear(); }
  };

  /* =========================================================
     사진 검색
     ========================================================= */
  let camBusy = false;
  $('#camShutter').addEventListener('click', async () => {
    if (camBusy) return; camBusy = true;
    vibrate(20);
    $('#camFlash').animate([{ opacity: 0 }, { opacity: .9, offset: .25 }, { opacity: 0 }], { duration: 420, easing: 'ease-out' });
    $('#cam').classList.add('is-scanning'); if (camStream) $('#camLive').pause();
    const msg = $('#camMsg');
    msg.style.opacity = 0; await wait(250); msg.textContent = '제품을 찾고 있어요…'; msg.style.opacity = 1;
    await wait(1700);
    const found = FLOW || 'earlgrey';
    msg.style.opacity = 0; await wait(200); msg.textContent = josa(P[found].full, '을', '를') + ' 찾았어요'; msg.style.opacity = 1;
    vibrate([10, 30, 10]);
    await wait(650);
    openDetail(found, { type: 'fade', replace: true, backType: 'push' });
  });
  /* QR 체험: 실제 카메라 화면을 사용 (권한을 거절하거나 지원하지 않으면 제품 사진으로 대신 보여줌) */
  let camStream = null;
  async function camLive() {
    if (!FLOW || camStream || !(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) return;
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (curId() !== 'photo') { camStop(); return; }
      const v = $('#camLive'); v.srcObject = camStream; const pr = v.play(); if (pr && pr.catch) pr.catch(() => {});
      $('#cam').classList.add('is-live');
    } catch (e) { camStream = null; }
  }
  function camStop() { if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } $('#camLive').srcObject = null; $('#cam').classList.remove('is-live'); }
  $('#camFlashBtn').addEventListener('click', e => { e.currentTarget.classList.toggle('on'); });
  $('#camGallery').addEventListener('click', () => toast('앨범에서 고르기는 준비 중이에요'));
  hooks.photo = {
    enter() {
      camBusy = false; $('#cam').classList.remove('is-scanning'); $('#camMsg').textContent = '사각형 안에 제품이 들어올 수 있도록 해주세요'; $('#camMsg').style.opacity = 1;
      if (FLOW) { $('#camImg').src = IMG(P[FLOW].img); $('#s-photo').classList.toggle('flow-root', stack.length <= 1); camLive(); }
    },
    leave() { camStop(); }
  };

  /* =========================================================
     제품 상세
     ========================================================= */
  /* 후기 요약 링 아이콘 — 기존 시안 아이콘(png) + 같은 톤의 면 아이콘(svg) */
  const RING_PNG = { fire: ['fire32', 32, 13, 49], timer: ['timer28', 28, 15, 47], alert: ['alert28', 28, 15, 47], sweet: ['pineapple32', 32, 13, 49] };
  const wedges = () => [0, 1, 2, 3, 4, 5].map(k => { const a = (k * 60 - 90) * Math.PI / 180, d = .36, r = 9.2, c = Math.cos, n = Math.sin, f = v => v.toFixed(2);
    return `<path d="M${f(16 + 1.6 * c(a))} ${f(16 + 1.6 * n(a))}L${f(16 + r * c(a - d))} ${f(16 + r * n(a - d))}A${r} ${r} 0 0 1 ${f(16 + r * c(a + d))} ${f(16 + r * n(a + d))}Z"/>`; }).join('');
  const star8 = () => { let d = ''; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, r = i % 2 ? 5.2 : 13.5; d += (i ? 'L' : 'M') + (16 + r * Math.cos(a)).toFixed(2) + ' ' + (16 + r * Math.sin(a)).toFixed(2); } return d + 'Z'; };
  const W = '#fff';
  const RING_SVG = {
    citrus: `<circle cx="16" cy="16" r="13.5"/><circle cx="16" cy="16" r="11" fill="${W}"/>${wedges()}`,
    flower: `${[0, 72, 144, 216, 288].map(a => `<circle cx="${(16 + 7.4 * Math.cos((a - 90) * Math.PI / 180)).toFixed(2)}" cy="${(16 + 7.4 * Math.sin((a - 90) * Math.PI / 180)).toFixed(2)}" r="6"/>`).join('')}<circle cx="16" cy="16" r="4" fill="${W}"/><circle cx="16" cy="16" r="2.2"/>`,
    moon: `<path d="M19.5 3.5A12.8 12.8 0 1 0 28.6 21.4 10.2 10.2 0 0 1 19.5 3.5Z"/><path d="M24.5 4.5l1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1Z"/>`,
    milk: `<path d="M11 3h10v4.2l3.4 5.3V29H7.6V12.5L11 7.2Z"/><rect x="11" y="16" width="10" height="8" rx="1.5" fill="${W}"/><path d="M13.6 21.6c1-1.2 2-1.8 2.4-3.2.5 1.4 1.4 2 2.4 3.2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    honey: `${[[10.5, 11], [21.5, 11], [16, 20.5]].map(([x, y]) => `<path d="M${x} ${y - 6.6}l5.7 3.3v6.6L${x} ${y + 6.6}l-5.7-3.3v-6.6Z"/>`).join('')}<path d="M16 20.5v6.2a1.8 1.8 0 0 1-3.6 0" stroke="${W}" stroke-width="0" fill="none"/>`,
    grain: `<path d="M16 29V9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>${[9, 15, 21].map(y => `<ellipse cx="11.6" cy="${y}" rx="3" ry="5" transform="rotate(-35 11.6 ${y})"/><ellipse cx="20.4" cy="${y}" rx="3" ry="5" transform="rotate(35 20.4 ${y})"/>`).join('')}<ellipse cx="16" cy="5.2" rx="2.6" ry="4"/>`,
    drop: `<path d="M16 2.8C16 2.8 6.5 14.2 6.5 20a9.5 9.5 0 0 0 19 0C25.5 14.2 16 2.8 16 2.8Z"/><path d="M11.2 20.4a4.8 4.8 0 0 0 3.6 4.6" stroke="${W}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    leaf: `<path d="M27 4C13 4.5 5.5 11.5 5.5 20c0 2.6.8 4.6 1.8 6C8.7 19.6 13 15 19 12.5 13.6 16 10 20.6 8.9 27.3c1.6.9 3.6 1.2 5.4 1.2C24.5 28.5 27 17 27 4Z"/>`,
    heart: `<path d="M16 28.5S3.5 21 3.5 12.2A6.7 6.7 0 0 1 16 8.4a6.7 6.7 0 0 1 12.5 3.8C28.5 21 16 28.5 16 28.5Z"/>`,
    cookie: `<circle cx="16" cy="16" r="13"/>${[[11, 11, 2.1], [19.5, 10, 1.7], [21, 18.5, 2.2], [12.5, 20, 1.8], [16.5, 15, 1.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${W}"/>`).join('')}`,
    spice: `<path d="${star8()}"/><circle cx="16" cy="16" r="2.4" fill="${W}"/>`,
    ice: `<g stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none">${[0, 60, 120].map(a => `<g transform="rotate(${a} 16 16)"><path d="M16 3v26"/><path d="M12.4 6.4 16 9.6l3.6-3.2M12.4 25.6 16 22.4l3.6 3.2"/></g>`).join('')}</g>`,
    cherry: `<path d="M10 20.5C11.5 13 14.5 8 21 4.5M22 20C21.5 13.5 21 9 21 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M21 4.5c3-1.8 6.5-1.2 7.5 1-3 1.4-5.5 1.2-7.5-1Z"/><circle cx="9.5" cy="23" r="6"/><circle cx="22" cy="22.5" r="6"/><circle cx="7.6" cy="21" r="1.4" fill="${W}"/><circle cx="20.1" cy="20.5" r="1.4" fill="${W}"/>`,
    repeat: `<g stroke="currentColor" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15a10 10 0 0 1 17.5-6.6"/><path d="M26 17a10 10 0 0 1-17.5 6.6"/></g><path d="M25.8 3.6v8.2h-8.2Z"/><path d="M6.2 28.4v-8.2h8.2Z"/>`,
    weight: `<circle cx="16" cy="7.2" r="3.6" stroke="currentColor" stroke-width="2.6" fill="none"/><path d="M8.2 11.5h15.6a1.5 1.5 0 0 1 1.46 1.16l3.4 14.5A1.5 1.5 0 0 1 27.2 29H4.8a1.5 1.5 0 0 1-1.46-1.84l3.4-14.5A1.5 1.5 0 0 1 8.2 11.5Z"/><path d="M11.5 20.5h9" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>`,
    cup: `<path d="M5 12h17v8.5a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7Z"/><path d="M22 14.5h1.8a3.6 3.6 0 0 1 0 7.2H21.5" stroke="currentColor" stroke-width="2.4" fill="none"/><path d="M10 3.5c-1.2 1.6 1.2 2.6 0 4.6M15 3.5c-1.2 1.6 1.2 2.6 0 4.6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
  };
  const ringIcon = k => RING_PNG[k] ? (([n, sz, it]) => `<i class="ic i-${n} ri" style="width:${sz}px;height:${sz}px;top:${it}px"></i>`)(RING_PNG[k])
    : `<span class="ri ri-svg"><svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">${RING_SVG[k] || RING_SVG.leaf}</svg></span>`;
  const ringPctTop = k => RING_PNG[k] ? RING_PNG[k][3] : 48;
  const RC = 2 * Math.PI * 39.5;
  /* 후기 작성자·날짜·프로필 사진 — 제품마다 다르게, 같은 제품은 들어올 때마다 같은 조합 */
  const RV_NAMES = ['shadowhunter', 'foresrwalker', 'teatime_j', 'honeypear', 'mintcloud', 'dawn_cup', 'leafy_day', '오후의찻잔', '찻잎수집가', 'sleepy_owl', 'cozy_mug', 'morning_brew', '다정한고양이', 'chai_lover', 'steep_slow', 'hanok_tea', 'moonlit_tea', '찻물끓이는중', 'lemon_drop', 'biscuit_time', 'green_note', 'tea_diary', 'little_kettle', '보리보리', 'sunny_leaf', 'quiet_sip', '티타임요정', 'cup_of_calm', 'oolong_kid', '냥집사', 'bird_song', '참새방앗간'];
  const RV_WHEN = ['오늘', '어제', '2일 전', '3일 전', '4일 전', '5일 전', '1주 전', '2주 전', '3주 전', '한 달 전', '2달 전', '3달 전'];
  const PETS = ['pet1', 'pet2', 'pet3', 'pet4', 'pet5', 'pet6', 'pet7', 'pet8'];
  function seeded(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; }; }
  function pickN(arr, n, rnd) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); }
  let detailIO = null;
  function renderDetail(id) {
    const p = P[id];
    $('#detailTitle').textContent = p.name;
    const d = p.detail || P.earlgrey.detail;
    const stars = n => [0, 1, 2, 3, 4].map(i => `<i class="ic m i-star16${i < n ? '' : ' off'}"></i>`).join('');
    const won = n => n.toLocaleString('ko-KR') + '원';
    const shops = d.shops.slice().sort((x, y) => x[1] - y[1]);
    const rnd = seeded(id + '-rv');
    const names = pickN(RV_NAMES, d.reviews.length, rnd);
    const whens = pickN(RV_WHEN.map((w, i) => i), d.reviews.length, rnd).sort((a, b) => a - b).map(i => RV_WHEN[i]);
    const pets = pickN(PETS, PETS.length, rnd);       // 한 제품 안에서는 프로필 사진이 겹치지 않게
    const rvs = d.reviews.map(([st, text], i) => ({ stars: st, text, name: names[i], when: whens[i], av: pets[i % pets.length] }));
    $('#detailScroll').innerHTML = `
      <div class="d-img"><img id="dImg" src="${IMG(p.dimg || p.img)}"${p.dimg ? ' class="exact"' : ''} alt=""></div>
      <div class="d-info">
        <div class="d-brand">${p.brand}</div><div class="d-name">${p.name}</div>
        <p class="d-ing">${d.ing} </p>${d.brew ? `<p class="d-brew">${ic('timer14')}<span>${d.brew}</span></p>` : ''}
        <div class="d-meta"><span style="left:0">${ic('leaf16')}${p.cat}</span><span style="left:89px">${ic('kettle')}${p.type}</span>
          <button class="press-soft" id="dRate" style="left:165px;display:flex;gap:0;align-items:flex-start"><span style="display:flex;gap:4px">${ic('star16')}<span><em>${p.rating}</em> (${p.count}개)</span></span>${ic('chev16')}</button></div>
      </div>
      <div class="d-sec reveal-up" id="dTaste">
        <div class="sec-head" style="height:auto"><b class="trim">이런 맛이 느껴져요</b></div>
        <div class="taste-grid"><div class="tg-l">${d.taste.map(t => `<span>${t[0]}</span>`).join('')}</div>
          <div class="tg-dots">${d.taste.map(t => `<div class="tg-row">${[0, 1, 2, 3, 4].map(j => `<i style="left:${j * 32}px"></i>`).join('')}<i class="on" style="left:${t[2] * 32}px"></i></div>`).join('')}</div>
          <div class="tg-r">${d.taste.map(t => `<span>${t[1]}</span>`).join('')}</div></div>
        <p class="d-desc">${d.desc}</p>
      </div>
      <div class="d-sec reveal-up" id="dReviews">
        <div class="sec-head"><b class="trim">먼저 마셔본 사람들의 후기</b>${ic('chev28')}</div>
        <div class="rings">${d.rings.map(([icn, lab, pct], i) => `
          <div class="ring" data-p="${pct}"><svg viewBox="0 0 82 82"><circle class="tr" cx="41" cy="41" r="39.5"/><circle class="ar" cx="41" cy="41" r="39.5" transform="rotate(${[90, 0, 160, 0][i]} 41 41)" style="stroke-dasharray:${RC};stroke-dashoffset:${RC}"/></svg>
            ${ringIcon(icn)}<span class="rp" style="top:${ringPctTop(icn)}px">0%</span><span class="rl">${lab}</span></div>`).join('')}</div>
        <div class="rv-cards hscroll" id="dRvCards">
          <div class="rv-sum">${ic('star20')}<b>${p.rating}</b><span>(${p.count}명의 평가)</span></div>
          ${rvs.map(r => `<div class="rv-card press-card"><div class="h"><div class="av"><img src="${IMG(r.av)}" alt=""></div><div><b>${r.name}</b><div class="stars">${stars(r.stars)}<span>${r.when}</span></div></div></div>
            <p>${r.text}</p></div>`).join('')}
        </div>
      </div>
      <div class="d-sec reveal-up" style="width:356px">
        <div class="sec-head" style="width:356px"><b class="trim">구매처 한눈에 보기</b>${ic('chev28')}</div>
        <div class="shop-tbl">
          <div class="col c-name">${shops.map(x => `<span>${x[0]}</span>`).join('')}</div>
          <div class="col c-price">${shops.map((x, i) => `<span${i === 0 ? ' class="low"' : ''}>${won(x[1])}</span>`).join('')}</div>
          <div class="col c-ship">${shops.map(x => `<span>${x[2]}</span>`).join('')}</div>
        </div>
      </div>`;
    $$('.rv-card .stars i.off').forEach(i => i.classList.add('off'));
    enableDragScroll($('#dRvCards'));
    $('#dRate').addEventListener('click', () => { const s = $('#detailScroll'); s.scrollTo({ top: $('#dReviews').offsetTop - 110, behavior: 'smooth' }); });
    const sc = $('#detailScroll'); sc.scrollTop = 0;
    if (detailIO) detailIO.disconnect();
    detailIO = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('revealed');
      if (en.target.id === 'dReviews') animateRings(en.target);
      detailIO.unobserve(en.target);
    }), { root: sc, threshold: .18 });
    $$('.reveal-up', sc).forEach(el => detailIO.observe(el));
  }
  function animateRings(root) {
    $$('.ring', root).forEach((r, i) => {
      const pct = +r.dataset.p; const arc = r.querySelector('.ar'); const lab = r.querySelector('.rp');
      setTimeout(() => {
        arc.style.strokeDashoffset = RC * (1 - pct / 100);
        const t0 = performance.now();
        const step = now => { const k = Math.min(1, (now - t0) / 1200); const e = 1 - Math.pow(1 - k, 3); lab.textContent = Math.round(pct * e) + '%'; if (k < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }, 150 + i * 110);
    });
  }
  $('#detailScroll').addEventListener('scroll', e => {
    const y = e.target.scrollTop;
    $('#detailNav').classList.toggle('is-scrolled', y > 4);
    const img = $('#dImg'); if (img && y < 400 && !img.classList.contains('exact')) img.style.transform = `translateY(${y * .06}px) scale(${1 + Math.max(0, -y) * .002})`;
  }, { passive: true });
  $('#detailStart').addEventListener('click', () => { state.vkOverride = null; openBrew(state.product); });
  hooks.detail = {
    enter(o) { state.product = o.id || state.product; renderDetail(state.product); },
    shown() { }
  };

  /* =========================================================
     우리기 설정
     ========================================================= */
  /* 5단계 슬라이더 — 하나로 이어진 트랙, 드래그는 자유롭게 따라가고 손을 떼면 가까운 단계로 자동 스냅 */
  function makeSlider(el, labels, value, onChange, onRelease) {
    const W = parseFloat(getComputedStyle(el).width) || 356, R = 9, N = labels.length;
    const pos = k => R + (W - 2 * R) * (k - 1) / (N - 1);
    el.innerHTML = '<i class="trk"></i><i class="fill"></i><i class="knob"></i><span class="lab"></span>';
    const fill = $('.fill', el), knob = $('.knob', el), lab = $('.lab', el);
    let v = value;
    const place = x => {
      x = Math.min(W - R, Math.max(R, x));
      fill.style.width = x + 'px'; knob.style.left = x + 'px';
      const lw = lab.offsetWidth || 60; lab.style.left = Math.min(Math.max(x, lw / 2), W - lw / 2) + 'px';
    };
    const setLabel = k => { if (lab.textContent === labels[k - 1]) return; lab.textContent = labels[k - 1]; lab.classList.remove('swap'); void lab.offsetWidth; lab.classList.add('swap'); };
    const set = (k, silent) => {
      const changed = k !== v; v = k;
      setLabel(k); place(pos(k));
      if (changed && !silent) { vibrate(6); onChange && onChange(k); }
    };
    set(v, true);
    let drag = false;
    const xOf = e => (e.clientX - el.getBoundingClientRect().left) / scaleOf();
    const nearest = x => Math.min(N, Math.max(1, Math.round((x - R) / ((W - 2 * R) / (N - 1))) + 1));
    const track = x => {
      place(x);
      const k = nearest(x); setLabel(k);
      if (k !== v) { v = k; vibrate(4); onChange && onChange(k); }
    };
    el.addEventListener('pointerdown', e => {
      drag = true; el.setPointerCapture(e.pointerId);
      el.classList.add('is-drag', 'is-jump');           // 탭한 위치로는 부드럽게 이동
      track(xOf(e));
      setTimeout(() => el.classList.remove('is-jump'), 160);
    });
    el.addEventListener('pointermove', e => { if (drag) { el.classList.remove('is-jump'); track(xOf(e)); } });
    const up = () => {
      if (!drag) return; drag = false;
      el.classList.remove('is-drag', 'is-jump');
      set(v, true);                                     // 손을 떼면 가장 가까운 단계로 스냅
      onRelease && onRelease(v);
    };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return { set, get: () => v };
  }
  let slStr, slRep;
  function brewReady() { const s = state.settings; return !!(s.temp && s.guide); }
  function syncBrew() {
    const s = state.settings;
    $$('#s-brew .opt').forEach(o => o.classList.toggle('is-on', s[o.dataset.opt] === o.dataset.val));
    const btn = $('#brewStart'); const was = !btn.classList.contains('is-disabled'); const ready = brewReady();
    btn.classList.toggle('is-disabled', !ready);
    if (ready && !was) { btn.classList.remove('is-ready'); void btn.offsetWidth; btn.classList.add('is-ready'); }
  }
  $('#s-brew').addEventListener('click', e => {
    const o = e.target.closest('.opt'); if (!o) return;
    state.settings[o.dataset.opt] = o.dataset.val;
    o.classList.remove('bump'); void o.offsetWidth; o.classList.add('bump');
    vibrate(8); syncBrew();
  });
  /* 차종별 우려내는 영상 — 팬지꽃 · 히비스커스 · 녹차 · 홍차(보이차) · 캐모마일 중 제품에 맞는 영상 연결
     맞는 영상이 없는 제품은 색이 가장 비슷한 영상으로 진행하고 카운트다운 상단에 안내 */
  const VK_NAME = { pansy: '팬지꽃', hibiscus: '히비스커스', green: '녹차', black: '홍차', chamomile: '캐모마일' };
  const VK_TEA = { pansy: '팬지꽃차', hibiscus: '히비스커스차', green: '녹차', black: '홍차', chamomile: '캐모마일차' };
  const VK_MATCH = { pansy: 'pansy', morninghip: 'hibiscus', chamomile: 'chamomile', matcha: 'green', earlgrey: 'black', samda: 'black', martinez: 'black', fig: 'black', boseong: 'black', happyterrace: 'black', daehan: 'black', royal: 'black', tetley: 'black', lychee: 'black', dilmah_eg: 'black', dilmah: 'black', sakuranbo: 'black' };
  const VK_FALLBACK = { peach: 'hibiscus', ppong: 'green', yeonip: 'green', yangchul: 'green', sanghwang: 'black', dwaeji: 'black', yeongeun: 'black' };
  function videoKind() {
    if (state.vkOverride) return { kind: state.vkOverride, matched: true };
    const id = state.product;
    if (VK_MATCH[id]) return { kind: VK_MATCH[id], matched: true };
    return { kind: VK_FALLBACK[id] || 'black', matched: false };
  }
  function openBrew(id) {
    state.product = id || state.product;
    go('brew', { type: 'modal' });
  }
  $('#brewStart').addEventListener('click', () => {
    if (!brewReady()) {
      const s = state.settings;
      $$('#s-brew .opt-row').forEach(row => {
        const key = $('.opt', row).dataset.opt; if (s[key]) return;      // 아직 고르지 않은 줄만 흔들어 알려줌
        row.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
        $$('.opt', row).forEach(o => o.animate([{ boxShadow: '0 0 0 0 rgba(100,193,50,0)' }, { boxShadow: '0 0 0 3px rgba(100,193,50,.45)' }, { boxShadow: '0 0 0 0 rgba(100,193,50,0)' }], { duration: 900 }));
      });
      toast(!s.temp && !s.guide ? '마실 온도와 준비 방법을 골라주세요' : !s.temp ? '어떤 온도로 마실지 골라주세요' : '차 준비를 도와드릴지 골라주세요');
      return;
    }
    bgmPrime(); startBrewing();
  });
  $('#brewDefault').addEventListener('click', async () => {
    bgmPrime();
    state.settings.temp = 'hot'; state.settings.guide = 'none'; syncBrew();
    $$('#s-brew .opt.is-on').forEach(o => { o.classList.remove('bump'); void o.offsetWidth; o.classList.add('bump'); });
    slStr.set(3); slRep.set(3);
    state.settings.strength = 3; state.settings.repeat = 3;
    await wait(520); startBrewing();
  });
  /* 배경음악 — 타이머가 흐르는 동안 바흐 전주곡 C장조 재생 (assets/audio/bach-prelude-c.mp3)
     3·2·1 카운트다운 동안은 조용히 있다가 타이머가 시작되는 순간 재생.
     iOS·Safari 자동재생 제한 때문에 시작 버튼을 누를 때 소리 없이 한 번 재생/정지해서 오디오를 깨워 둠 */
  const bgm = $('#bgm'); let bgmRaf = 0, bgmWant = false;
  function bgmPrime() {
    if (bgm.error || !bgm.paused) return;
    bgm.volume = 0;
    const pr = bgm.play();
    const off = () => { if (!bgmWant) { bgm.pause(); try { bgm.currentTime = 0; } catch (e) {} } };
    if (pr && pr.then) pr.then(off).catch(() => {}); else off();
  }
  function bgmFade(to, ms, done) {
    cancelAnimationFrame(bgmRaf);
    const from = bgm.volume, t0 = performance.now();
    const step = now => { const k = Math.min(1, (now - t0) / ms); bgm.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k < 1) bgmRaf = requestAnimationFrame(step); else done && done(); };
    bgmRaf = requestAnimationFrame(step);
  }
  function bgmStart(restart) {
    if (bgm.error) return;
    bgmWant = true;
    if (bgm.paused) { if (restart) { try { bgm.currentTime = 0; } catch (e) {} } bgm.volume = 0; }
    const pr = bgm.play(); if (pr && pr.catch) pr.catch(() => {});
    bgmFade(.55, 2500);
  }
  function bgmStop(ms) { bgmWant = false; if (bgm.paused) return; bgmFade(0, ms || 1400, () => { if (!bgmWant) bgm.pause(); }); }
  function startBrewing() {
    state.timer.round = 1; state.timer.rounds = [];
    go('count', { type: 'fade', replace: true, backType: 'fade' });
  }
  hooks.brew = {
    enter() {
      const p = P[state.product];
      $('#brewTitle').innerHTML = `${josa(p.name, '을', '를')}<br>맛있게 우릴 준비를 하고 있어요`;
      state.settings = { temp: null, guide: null, strength: 3, repeat: 3 };   // 온도·준비 방법 모두 선택 안 된 상태로 시작
      syncBrew();
      slStr = makeSlider($('#slStrength'), D.strengthLabels, 3, k => state.settings.strength = k);
      slRep = makeSlider($('#slRepeat'), D.repeatLabels, 3, k => state.settings.repeat = k);
    }
  };

  /* =========================================================
     카운트다운
     ========================================================= */
  const CC = 2 * Math.PI * 78.5;
  let countRaf = 0;
  hooks.count = {
    enter() {
      cancelAnimationFrame(countRaf);
      const vk = videoKind(), first = state.timer.round === 1;
      $('#countBg').src = `assets/img/v_${vk.kind}.jpg`;
      if (vid.dataset.kind !== vk.kind) { vid.dataset.kind = vk.kind; vid.poster = `assets/img/v_${vk.kind}.jpg`; vid.src = `assets/video/${vk.kind}.mp4`; try { vid.load(); } catch (e) {} }
      const note = $('#vkNote');
      note.classList.remove('on');
      if (!vk.matched && first) {
        note.innerHTML = `<i class="ic m i-leaf16"></i><span>이 차종 영상은 준비 중이라 ${VK_NAME[vk.kind]} 영상으로 진행해요</span>`;
        requestAnimationFrame(() => note.classList.add('on'));
      }
      const arc = $('#countArc'); arc.style.strokeDasharray = CC; arc.style.strokeDashoffset = 0;
      $('#countNum').textContent = '3';
      const ring = $('#s-count .count-ring'); ring.getAnimations().forEach(x => x.cancel()); ring.style.opacity = 1;
    },
    shown() {
      const arc = $('#countArc'), num = $('#countNum');
      const t0 = performance.now(); let last = 3;
      const pop = () => num.animate([{ transform: 'scale(1.5)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.34,1.56,.64,1)' });
      pop(); vibrate(10);
      const step = now => {
        const k = Math.min(1, (now - t0) / 3000);
        arc.style.strokeDashoffset = -CC * k;
        const n = 3 - Math.floor(k * 3);
        if (n !== last && n > 0) { last = n; num.textContent = n; pop(); vibrate(10); }
        if (k < 1) countRaf = requestAnimationFrame(step);
        else {
          $('#s-count .count-ring').animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.15)' }], { duration: 300, fill: 'forwards' });
          setTimeout(() => go('timer', { type: 'fade', replace: true, backType: 'fade', data: { round: state.timer.round } }), 220);
        }
      };
      countRaf = requestAnimationFrame(step);
    },
    leave() { cancelAnimationFrame(countRaf); }
  };

  /* =========================================================
     타이머
     ========================================================= */
  const RPOS = [[20, 166], [154, 166], [20, 201], [154, 201], [20, 237]];
  const tc = $('#timerCard');
  let tipI = 0, tipT = 0;
  function renderRounds() {
    const T = state.timer, total = state.settings.repeat;
    $('#tcRounds').innerHTML = RPOS.map(([x, y], i) => {
      const n = i + 1; const done = T.rounds[i] != null; const cur = n === T.round && !done;
      const time = done ? fmt(T.rounds[i]) : cur ? fmt(T.dur) : '00:00:00';
      return `<div class="tc-rd${cur ? ' is-cur' : ''}${done ? ' is-done' : ''}" style="left:${x}px;top:${y}px;${n > Math.max(total, T.round) && !done ? 'opacity:.6' : ''}"><b>${n}회차</b><span>${time}</span></div>`;
    }).join('');
    $('#tcRoundS').textContent = T.round + '회차';
    $('#tcRoundTimeS').textContent = fmt(T.dur);
  }
  function drawBig(ms) {
    const s = fmt(ms); const el = $('#tcBig');
    if (el.textContent !== s) el.textContent = s;
  }
  /* 우려내는 영상과 타이머를 동기화: 영상 종료 3초 전에 타이머가 00:00:00이 되며 알림창이 뜸 */
  const vid = $('#steepVid');
  const ALARM_LEAD = 3;
  const vEnd = () => Math.max(1, (isFinite(vid.duration) && vid.duration ? vid.duration : 29.8) - ALARM_LEAD);
  let autoPressT = 0;
  function tick() {
    const T = state.timer;
    if (T.running) {
      if (T.video) {
        const t = vid.currentTime, end = vEnd();
        T.remain = T.dur * Math.max(0, 1 - t / end);
        if (t >= end) { T.remain = 0; drawBig(0); finishRound(); return; }
      } else {
        T.remain = T.endAt - performance.now();
        if (T.remain <= 0) { T.remain = 0; drawBig(0); finishRound(); return; }
      }
    }
    drawBig(T.remain);
    T.raf = requestAnimationFrame(tick);
  }
  function setRunning(on) {
    const T = state.timer;
    if (on && !T.running) T.endAt = performance.now() + T.remain;
    T.running = on;
    tc.classList.toggle('is-running', on);
    if (T.video) {
      if (on) {
        const pr = vid.play();
        if (pr && pr.catch) pr.catch(() => { T.video = false; T.endAt = performance.now() + T.remain; });
      } else vid.pause();
    }
  }
  function autoPress(btn) {
    btn.classList.add('is-pressed'); vibrate(12);
    setTimeout(() => { btn.classList.remove('is-pressed'); btn.click(); }, 230);
  }
  function finishRound() {
    const T = state.timer;
    cancelAnimationFrame(T.raf);
    T.rounds[T.round - 1] = T.dur - T.remain;
    T.running = false; tc.classList.remove('is-running'); // 영상은 남은 3초 동안 알림창 뒤에서 계속 재생
    renderRounds();
    clearTimeout(autoPressT); autoPressT = setTimeout(() => autoPress($('#alarmDone')), 4000);
    vibrate([200, 100, 200]);
    const next = T.round + 1;
    $('#alarmDesc').innerHTML = next <= 5 ? `티백을 제거하고 차를 즐겨주세요. 다시 시작하고 싶다면<br>재생 버튼을 눌러 ${next}회차를 이어갈 수 있어요.` : '티백을 제거하고 차를 즐겨주세요.<br>오늘 준비한 회차를 모두 우렸어요.';
    $('#alarmMore').style.display = next <= 5 ? '' : 'none';
    $('#alarm').classList.add('on'); $('#statusbar').classList.add('muted');
  }
  $('#tcPlay').addEventListener('click', () => { const T = state.timer; if (T.remain <= 0) return; setRunning(!T.running); vibrate(8); });
  $('#tcStop').addEventListener('click', () => { if (state.timer.remain > 0) { if (state.timer.video) vid.pause(); finishRound(); } });
  $('#tcToggle').addEventListener('click', () => tc.classList.toggle('is-expanded'));
  $('#timerDone').addEventListener('click', () => toReview());
  $('#alarmDone').addEventListener('click', () => { clearTimeout(autoPressT); $('#alarm').classList.remove('on'); $('#statusbar').classList.remove('muted'); setTimeout(toReview, 160); });
  $('#alarmMore').addEventListener('click', () => {
    clearTimeout(autoPressT); bgmStop(700);
    $('#alarm').classList.remove('on'); $('#statusbar').classList.remove('muted');
    state.timer.round += 1;
    setTimeout(() => go('count', { type: 'fade', replace: true, backType: 'fade' }), 200);
  });
  function toReview() {
    const T = state.timer;
    if (T.rounds[T.round - 1] == null && T.dur - T.remain > 500) T.rounds[T.round - 1] = T.dur - T.remain;
    go('review', { type: 'modal', replace: true, backType: 'modal' });
  }
  function nextTip(first) {
    const p = $('#tipText');
    const L = state.timer.tips || D.tips;
    if (first) { p.textContent = L[tipI % L.length]; return; }
    p.classList.add('out');
    setTimeout(() => {
      // 문구 길이에 맞춰 카드 높이를 부드럽게 변경 (카드는 아래 기준이라 위쪽 가장자리가 함께 오르내림)
      const card = $('#tipCard'), h0 = card.offsetHeight;
      tipI++; p.textContent = L[tipI % L.length];
      const h1 = card.offsetHeight;
      if (h0 !== h1) card.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 520, easing: EASE });
      setTimeout(() => p.classList.remove('out'), h0 !== h1 ? 220 : 0);
    }, 420);
  }
  hooks.timer = {
    enter(o) {
      const T = state.timer, s = state.settings, p = P[state.product];
      T.round = (o && o.round) || T.round || 1;
      T.dur = (D.strengthSecs[s.strength - 1] || 194) * 1000 + (s.temp === 'cold' ? 60000 : 0);
      T.remain = T.dur;
      T.video = !vid.error; T.running = false;
      try { vid.pause(); vid.currentTime = 0; } catch (e) {}
      clearTimeout(autoPressT);
      /* 영상이 없는 차종이면 타이머 화면의 차 이름·팁은 배경 영상 차종을 따르고, 후기 기록에서만 실제 제품으로 돌아감 */
      const vk = videoKind(), shown = vk.matched ? p.name : VK_TEA[vk.kind];
      $('#tcName').textContent = shown; $('#tcNameS').textContent = shown;
      if (T.round === 1 || !T.tips || T.tipKind !== vk.kind) {
        const L = (D.kindTips[vk.kind] || D.tips).slice();
        for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
        T.tips = L; T.tipKind = vk.kind;
      }
      $('#tcMeta').textContent = `${p.type} | ${s.temp === 'cold' ? '차갑게' : '따뜻하게'} | ${D.strengthMeta[s.strength - 1]} `;
      tc.classList.add('is-expanded');
      renderRounds(); drawBig(T.remain);
      $('#alarm').classList.remove('on');
      tipI = (T.round - 1) * 2; nextTip(true);
      clearInterval(tipT); tipT = setInterval(() => nextTip(false), 8000);
    },
    shown() {
      setRunning(true);
      bgmStart(state.timer.round === 1);   // 타이머 시작과 동시에 음악 시작 (다음 회차는 이어서 재생)
      cancelAnimationFrame(state.timer.raf); state.timer.raf = requestAnimationFrame(tick);
      $$('#timerStack > *').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: i * 90, easing: EASE, fill: 'backwards' }));
    },
    leave() { cancelAnimationFrame(state.timer.raf); setRunning(false); vid.pause(); clearInterval(tipT); clearTimeout(autoPressT); bgmStop(); }
  };
  document.addEventListener('visibilitychange', () => { /* 타이머는 endAt 기준이라 백그라운드에서도 정확 */ });

  /* =========================================================
     후기 기록
     ========================================================= */
  hooks.review = {
    enter() {
      const p = P[state.product], s = state.settings, T = state.timer;
      $('#rvImg').src = IMG(p.rimg || p.img); $('#rvImg').classList.toggle('exact', !!p.rimg); $('#rvImg').style.objectPosition = p.rpos || ''; $('#rvImg').classList.toggle('pos', !!p.rpos);
      $('#s-review').style.setProperty('--rbg', p.rbg || p.color); $('#rvName').textContent = p.full;
      $('#rvMeta').textContent = `${p.type} | ${s.temp === 'cold' ? '차갑게' : '따뜻하게'} | ${D.strengthMeta[s.strength - 1]}`;
      const total = T.rounds.reduce((a, b) => a + (b || 0), 0);
      $('#rvTime').textContent = fmt(total || T.dur);
      $('#reviewScroll').scrollTop = 0; $('#rvBar').classList.remove('is-scrolled');
      state.review = [3, 3, 3, 3];   // 모든 정도 항목은 '보통(가운데)'으로 시작
      $('#rvQs').innerHTML = D.reviewQs.map((q, i) => `<div class="rv-q"><div class="qt">${q.q}</div><div class="seg-slider" data-i="${i}"></div></div>`).join('');
      $$('#rvQs .seg-slider').forEach((el, i) => makeSlider(el, D.reviewQs[i].labels, 3, k => { state.review[i] = k; }));
    },
    shown() {
      $$('#rvQs .rv-q').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 80 + i * 70, easing: EASE, fill: 'backwards' }));
    }
  };
  $('#reviewScroll').addEventListener('scroll', e => $('#rvBar').classList.toggle('is-scrolled', e.target.scrollTop > 8), { passive: true });
  /* 기록하기 → 마이페이지 '이번 주에 즐긴 차' 카드로 이동해서 오늘 칸에 도장 */
  $('#reviewSave').addEventListener('click', () => { if (FLOW && !flowDone) endFlow(); else goTab('mypage', { recorded: true }, { type: 'modal', dir: -1 }); });

  /* QR 체험 종료 화면 */
  function endFlow() {
    const p = P[FLOW];
    $('#endImg').src = IMG(p.dimg || p.img);
    toast('오늘의 맛을 기록했어요');
    go('end', { type: 'modal', root: true });
  }
  hooks.end = {
    shown() { $$('#s-end .end-img, #s-end .end-txt > *').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: i * 90, easing: EASE, fill: 'backwards' })); }
  };
  $('#endAgain').addEventListener('click', () => { location.href = location.pathname + '?flow=' + FLOW_KEY; });
  $('#endHome').addEventListener('click', () => { flowDone = true; goTab('home'); });

  /* =========================================================
     마이페이지
     ========================================================= */
  const FAVS = [['캐모마일 차', 'steep_chamomile', '04:12:34', 'chamomile'], ['모닝힙 블렌드', 'steep_hibiscus', '02:24:02', 'morninghip'], ['얼그레이 홍차', 'steep_earlgrey', '03:25:74', 'earlgrey']];
  $('#mpFavs').innerHTML = FAVS.map(([n, img, t, id, vk]) => `<button class="fav press-card" data-brew="${id}"${vk ? ` data-vk="${vk}"` : ''}><span class="fav-img"><img src="${IMG(img)}" alt=""></span><span class="fav-name">${n}</span><span class="fav-time">${ic('timer12')}<span class="trim">${t}</span></span></button>`).join('');
  enableDragScroll($('#mpFavs'));
  function renderMyWeek() {
    const w = state.week;
    $('#mpWeekDiff').textContent = `지난주보다 ${w.diff}잔 더 마셨어요`;
    $('#mpWeekCount').textContent = `이번 주에 ${w.count}잔의 차를 즐겼어요`;
    $('#mpWeekDays').innerHTML = w.days.map((d, i) => `<div class="wd${w.on[i] ? ' is-on' : ''}${i === w.today ? ' is-today' : ''}">${ic('cup_off', 1)}<span class="trim">${d}</span></div>`).join('');
    $('#mpBrews').textContent = 21 + w.count;
  }
  $('#mpWeekBtn').addEventListener('click', () => goTab('home').then(() => setHomeTab('similar')));
  $('#mpEdit').addEventListener('click', () => toast('프로필 편집은 준비 중이에요'));
  hooks.mypage = {
    enter() { renderMyWeek(); $('#mpScroll').scrollTop = 0; },
    shown(o) {
      if (!(o && o.recorded)) { $$('#s-mypage .mp-sec, #s-mypage .mp-sec2').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 60 + i * 80, easing: EASE, fill: 'backwards' })); return; }
      const w = state.week, i = w.today, sc = $('#mpScroll'), card = $('#s-mypage .mp-week');
      const y = card.offsetTop - sc.offsetTop - 120;
      if (y > 0) sc.scrollTo({ top: y, behavior: 'smooth' });
      card.animate([{ boxShadow: '0 4px 8px 2px rgba(0,0,0,.03)' }, { boxShadow: '0 0 0 2px rgba(100,193,50,.4), 0 8px 20px 2px rgba(0,0,0,.06)' }, { boxShadow: '0 4px 8px 2px rgba(0,0,0,.03)' }], { duration: 1600, delay: 300, easing: 'ease-in-out' });
      setTimeout(() => {
        if (!w.on[i]) { w.on[i] = 1; w.count += 1; w.diff += 1; }
        const d = $$('#mpWeekDays .wd')[i]; d.classList.add('is-on', 'stamp');
        $('#mpWeekCount').textContent = `이번 주에 ${w.count}잔의 차를 즐겼어요`;
        $('#mpWeekDiff').textContent = `지난주보다 ${w.diff}잔 더 마셨어요`;
        $('#mpBrews').textContent = 21 + w.count;
        vibrate([12, 40, 12]);
        toast('오늘의 맛을 기록했어요');
      }, 650);
    }
  };

  /* =========================================================
     설정
     ========================================================= */
  const SETS = [['account', 'set_account', '내 계정'], ['bell', 'set_bell', '알림'], ['mode', 'set_mode', '화면 모드'], ['terms', 'set_terms', '이용 약관'], ['send', 'set_send', '충돌 보고서 보내기']];
  $('#setList').innerHTML = SETS.map(([k, icn, lab]) => `<button class="set-row" data-set="${k}">${ic(icn, 1)}<span class="lbl trim">${lab}</span>${ic('set_chev', 1, 'chev')}</button>`).join('');
  $('#setList').addEventListener('pointerdown', e => { const r = e.target.closest('.set-row'); if (r) { r.classList.add('is-pressed'); const up = () => { setTimeout(() => r.classList.remove('is-pressed'), 120); window.removeEventListener('pointerup', up); }; window.addEventListener('pointerup', up); } });
  $('#setList').addEventListener('click', e => {
    const r = e.target.closest('.set-row'); if (!r) return;
    const lab = r.querySelector('.lbl').textContent;
    toast(r.dataset.set === 'send' ? '충돌 보고서를 보냈어요' : `${lab} 설정은 준비 중이에요`);
  });
  $('#setLogout').addEventListener('click', () => toast('시연용 계정이라 로그아웃할 수 없어요'));
  hooks.settings = {
    shown() { $$('#setList .set-row').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 45, easing: EASE, fill: 'backwards' })); }
  };

  /* =========================================================
     온보딩 → 홈
     ========================================================= */
  async function boot() {
    const sp = scr('splash'), home = scr('home');
    sp.classList.add('is-active'); stack.push({ id: 'splash', type: 'fade' });
    setStatus('splash');
    const logo = $('.splash-logo');
    logo.animate([{ opacity: 0, transform: 'translate(-50%,-50%) translateY(14px) scale(.94)' }, { opacity: 1, transform: 'translate(-50%,-50%)' }], { duration: 900, easing: EASE, fill: 'both' });
    let skipped = false;
    const done = new Promise(r => { sp.addEventListener('click', () => { skipped = true; r(); }, { once: true }); setTimeout(r, 1900); });
    await done;
    if (FLOW) {
      if (hooks.photo.enter) { stack.length = 0; stack.push({ id: 'photo', type: 'fade' }); hooks.photo.enter(); }
      const ph = scr('photo'); ph.classList.add('is-active'); ph.style.zIndex = 2; setStatus('photo');
      const a2 = sp.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: 'ease', fill: 'forwards' });
      await a2.finished; sp.classList.remove('is-active'); ph.style.zIndex = '';
      toast('제품 사진을 사각형 안에 맞추고 촬영 버튼을 눌러주세요');
      return;
    }
    home.classList.add('is-active'); home.style.zIndex = 2;
    stack.length = 0; stack.push({ id: 'home', type: 'tab' });
    setStatus('home');
    const a = sp.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 520, easing: 'ease', fill: 'forwards' });
    logo.animate([{ transform: 'translate(-50%,-50%) scale(1)' }, { transform: 'translate(-50%,-50%) scale(1.08)' }], { duration: 520, easing: EASE, fill: 'forwards' });
    $('#homeHead').animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 160, easing: EASE, fill: 'backwards' });
    stagger($('#paneRecent'));
    $('#s-home .tabbar').animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 640, delay: 220, easing: EASE, fill: 'backwards' });
    await a.finished;
    sp.classList.remove('is-active'); home.style.zIndex = '';
  }
  boot();

  /* 전시 모드: 홈 화면에 추가한 웹 앱(또는 ?kiosk)으로 실행하면, 2분 동안 아무도 만지지 않을 때 처음 화면으로 돌아감
     (타이머·카운트다운이 진행 중일 때는 기다렸다가 돌아감) */
  const KIOSK = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches || /[?&]kiosk\b/.test(location.search);
  if (KIOSK && !FLOW) {
    let idleT = 0;
    const IDLE = 120000;
    const arm = () => { clearTimeout(idleT); idleT = setTimeout(check, IDLE); };
    const check = () => {
      const id = curId();
      if (id === 'home' && stack.length === 1 && homeTab === 'recent' && $('#paneRecent').scrollTop < 4) { arm(); return; }
      if (id === 'timer' || id === 'count') { idleT = setTimeout(check, 15000); return; }
      location.reload();
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(t => window.addEventListener(t, arm, { passive: true, capture: true }));
    arm();
  }

  /* 오프라인 캐시 (전시용 아이폰에서 홈 화면에 추가해 인터넷 없이 실행) — http(s)로 열었을 때만 */
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const tell = w => w && w.addEventListener('statechange', () => { if (w.state === 'activated') setTimeout(() => toast('오프라인에서도 열 수 있도록 준비됐어요'), 400); });
      tell(reg.installing); reg.addEventListener('updatefound', () => tell(reg.installing));
    }).catch(() => {});
  }

  // 디버그/데모용: URL 해시로 특정 화면 바로 열기 (#detail, #brew, #timer ...)
  window.MT = { go, back, goHome, goTab, state, setHomeTab, openDetail, openBrew, submitSearch };
})();
