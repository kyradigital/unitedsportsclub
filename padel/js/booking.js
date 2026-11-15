/* USC court booking — step-by-step flow: sport → time → players → confirm. */

const SUPABASE_URL      = 'https://itzfanrkpvpfucgkbkff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZhbnJrcHZwZnVjZ2tia2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTk1NjgsImV4cCI6MjEwOTA5NTU2OH0.e1BzYQDZUxQUv4I1vrAGyRXwrUlel0zubrTkRXJPSeM';

/* Local design preview (http://localhost/...?preview): skips sign-in and never writes a booking. */
const PREVIEW = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has('preview');

const MEMBER_PRICE     = 500; // KES per person per 30-min slot
const NON_MEMBER_PRICE = 700;
const TEAM_SIZE = 4;
const MIN_SLOTS = 2;          // minimum booking is one hour

const SPORTS = {
  padel: {
    name: 'Padel', sub: '2 courts · doubles', img: 'images/court1.webp',
    courts: [
      { id: 1, name: 'Court 1', img: 'images/court1.webp' },
      { id: 2, name: 'Court 2', img: 'images/court2.webp' },
    ],
  },
  pickleball: {
    name: 'Pickleball', sub: '1 court · doubles', img: 'images/pickleball.webp',
    courts: [{ id: 3, name: 'Pickleball', img: 'images/pickleball.webp' }],
  },
};

const $ = id => document.getElementById(id);
/* No pinch-zoom (iOS ignores user-scalable) */
['gesturestart', 'gesturechange'].forEach(t => document.addEventListener(t, e => e.preventDefault()));

/* Pickleball photo: "Pickleball Pros.jpg" by Picklerpeej, CC BY-SA 4.0, via Wikimedia Commons (cropped) */
const fmt = n => 'KES ' + Number(n).toLocaleString('en-US');
const escH = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad2 = n => String(n).padStart(2, '0');
const dateStr = d => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dateFrom = s => new Date(s + 'T00:00:00');
const longDate = s => dateFrom(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const ARROW = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>';
const BACK_ARROW = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/></svg>';
/* "table-tennis-paddle-ball" from Font Awesome Free 6.5.1 by @fontawesome — https://fontawesome.com — License: CC BY 4.0 */
const PADDLE = '<svg class="sport-ico" viewBox="0 0 640 512" fill="currentColor" aria-hidden="true"><path d="M480 288c-50.1 0-93.6 28.8-114.6 70.8L132.9 126.3l.6-.6 60.1-60.1c87.5-87.5 229.3-87.5 316.8 0c67.1 67.1 82.7 166.3 46.8 248.3C535.8 297.6 509 288 480 288zM113.3 151.9L354.1 392.7c-1.4 7.5-2.1 15.3-2.1 23.3c0 23.2 6.2 44.9 16.9 63.7c-3 .2-6.1 .3-9.2 .3H357c-33.9 0-66.5-13.5-90.5-37.5l-9.8-9.8c-13.1-13.1-34.6-12.4-46.8 1.7L152.2 501c-5.8 6.7-14.2 10.7-23 11s-17.500-3.1-23.8-9.4l-32-32c-6.3-6.3-9.7-14.9-9.4-23.8s4.300-17.2 11-23l66.6-57.7c14-12.2 14.8-33.7 1.7-46.8l-9.8-9.8c-24-24-37.500-56.6-37.500-90.5v-2.7c0-22.8 6.1-44.9 17.3-64.3zM480 320a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/></svg>';
const CAL = '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M4 10h16M5 21h14a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>';

/* ---------- Time slots: 10:00 → 00:30 (24-hour; last slot ends 01:00) ---------- */
const ALL_SLOTS = [];
for (const h of [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0]) {
  for (const m of [0, 30]) {
    ALL_SLOTS.push({ h, m, label: `${pad2(h)}:${pad2(m)}`, value: `${pad2(h)}:${pad2(m)}` });
  }
}
const slotTime = idx => idx < ALL_SLOTS.length ? ALL_SLOTS[idx].label : '01:00';

/* ---------- State ---------- */
let sb = null;
let me = null;      // { id, name, first, username, phone, email, member }
const state = {
  sport: null,
  date: dateStr(new Date()),
  court: null,
  sel: [],                       // selected slot indexes, ascending and consecutive
  booked: { 1: new Set(), 2: new Set(), 3: new Set() },
  loading: false,
  players: [null, null, null, null],
  editing: null,                 // index of the player slot with an open search
  last: null,                    // last confirmed booking, shown on the done screen
};

const sport = () => SPORTS[state.sport];
const court = () => sport().courts.find(c => c.id === state.court);
const validSel = () => state.sel.length >= MIN_SLOTS;
const rate = p => (p.member ? MEMBER_PRICE : NON_MEMBER_PRICE);
const playerPrice = p => state.sel.length * rate(p);
const totalPrice = () => state.players.reduce((t, p) => t + (p ? playerPrice(p) : 0), 0);
const teamFull = () => state.players.every(Boolean);
const timeRange = () => `${slotTime(state.sel[0])} – ${slotTime(state.sel[state.sel.length - 1] + 1)}`;
function duration() {
  const hrs = state.sel.length / 2;
  return hrs === 1 ? '1 hour' : `${hrs} hours`;
}

function isPast(slot) {
  if (state.date !== dateStr(new Date())) return false;
  if (slot.h === 0) return false; // after-midnight slots belong to the end of this club day
  const now = new Date();
  return slot.h * 60 + slot.m <= now.getHours() * 60 + now.getMinutes();
}
const isFree = (courtId, idx) => !state.booked[courtId].has(ALL_SLOTS[idx].value) && !isPast(ALL_SLOTS[idx]);

/* ---------- Toast ---------- */
let toastTimer = null;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ---------- Availability ---------- */
let loadSeq = 0;
async function loadBooked() {
  const seq = ++loadSeq;
  state.loading = true;
  paintSlots();
  let rows = [];
  if (sb) {
    const { data, error } = await sb.from('padel_bookings').select('court_id, slots').eq('date', state.date).neq('status', 'cancelled');
    if (error) { console.error('[USC] availability', error); if (!PREVIEW) toast("Couldn't load availability. Please try again."); }
    rows = data || [];
  }
  if (seq !== loadSeq) return;
  state.booked = { 1: new Set(), 2: new Set(), 3: new Set() };
  rows.forEach(b => (b.slots || []).forEach(s => state.booked[b.court_id]?.add(s)));
  state.sel = state.sel.filter(i => isFree(state.court, i));
  if (state.sel.length && state.sel[state.sel.length - 1] - state.sel[0] !== state.sel.length - 1) state.sel = [];
  state.loading = false;
  paintSlots();
}

/* ---------- Screens ---------- */
const STEP = { sport: 1, times: 2, team: 3, review: 4, done: 4 };
const PARENT = { times: 'sport', team: 'times', review: 'team' };

function headHTML(route, title) {
  const n = STEP[route];
  return `
    <div class="stage-head">
      <button type="button" class="back-btn" data-act="back">${BACK_ARROW}<span>Back</span></button>
      <div class="menu-title"><span class="menu-step">Step ${n} of 4</span><h2>${escH(title)}</h2></div>
      <div class="mini-dots">${[1, 2, 3, 4].map(k => `<span class="${k < n ? 'done' : k === n ? 'active' : ''}"></span>`).join('')}</div>
    </div>`;
}

function sportHTML() {
  const card = key => {
    const s = SPORTS[key];
    return `
      <button type="button" class="sport-card" data-act="sport" data-sport="${key}">
        ${PADDLE}
        <span class="sport-bg" data-img="${s.img}"></span>
        <span class="sport-text">
          <span class="sport-name">${s.name}</span>
          <span class="sport-sub">${s.sub}</span>
        </span>
      </button>`;
  };
  return `
    <div class="stage-body">
      <div class="hello">
        <h1>${me?.first ? `Hi ${escH(me.first)}, what` : 'What'} are we <em>playing?</em></h1>
      </div>
      <div class="sport-grid">${card('padel')}${card('pickleball')}</div>
    </div>`;
}

function datePillsHTML() {
  const today = new Date();
  const pills = [];
  let known = false;
  for (let i = 0; i < 3; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const ds = dateStr(d);
    if (ds === state.date) known = true;
    pills.push(`
      <button type="button" class="date-pill${ds === state.date ? ' on' : ''}" data-act="date" data-date="${ds}">
        <span class="dp-day">${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
        <span class="dp-date">${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </button>`);
  }
  pills.push(`
    <label class="date-pill${known ? '' : ' on'}">
      <span class="dp-day">${known ? 'Other date' : dateFrom(state.date).toLocaleDateString('en-GB', { weekday: 'short' })}</span>
      <span class="dp-date">${known ? CAL : dateFrom(state.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      <input type="date" id="other-date" min="${dateStr(today)}" value="${state.date}" aria-label="Choose another date"/>
    </label>`);
  return pills.join('');
}

function timesHTML() {
  const s = sport();
  const courtHTML = c => `
    <section class="court" data-court="${c.id}">
      <div class="court-head" data-img="${c.img}">
        <div class="court-head-text"><span class="court-name">${c.name}</span><span class="court-free"></span></div>
      </div>
      <div class="slots">
        <div class="slot-grid">${ALL_SLOTS.map((sl, idx) => `<button type="button" class="slot" data-act="slot" data-court="${c.id}" data-idx="${idx}">${sl.label}</button>`).join('')}</div>
      </div>
    </section>`;
  return headHTML('times', s.name) + `
    <div class="stage-body">
      <p class="stage-note">Tap a start time for one hour. Tap a later slot to extend.</p>
      <div class="date-row">${datePillsHTML()}</div>
      <div class="courts ${state.sport}${s.courts.length > 1 ? ' two' : ''}">${s.courts.map(courtHTML).join('')}</div>
    </div>`;
}

function paintSlots() {
  const stage = $('stage');
  stage.querySelectorAll('.court').forEach(el => {
    const id = Number(el.dataset.court);
    let free = 0;
    el.querySelector('.slots').classList.toggle('loading', state.loading);
    el.querySelectorAll('.slot').forEach(btn => {
      const idx = Number(btn.dataset.idx);
      const ok = isFree(id, idx);
      if (ok) free++;
      btn.disabled = !ok;
      btn.classList.toggle('on', state.court === id && state.sel.includes(idx));
      btn.title = ok ? '' : state.booked[id].has(ALL_SLOTS[idx].value) ? 'Booked' : 'Passed';
    });
    el.querySelector('.court-free').textContent = state.loading ? 'Checking…' : free ? `${free / 2} hrs free` : 'Fully booked';
  });
  paintBar();
}

function paintBar() {
  const show = current === 'times' && state.sel.length > 0 && !busy;
  $('bar').classList.toggle('show', show);
  if (!show) return;
  $('bar-label').textContent = `${court().name} · ${longDate(state.date)}`;
  $('bar-main').textContent = validSel() ? `${timeRange()} · ${duration()}` : `${slotTime(state.sel[0])} · pick one more slot`;
  $('bar-next').disabled = !validSel();
  $('bar-next-label').textContent = validSel() ? 'Continue' : 'Min 1 hour';
}

function summaryHTML() {
  return `
    <div class="summary">
      <span class="summary-ico">${CAL}</span>
      <div>
        <div class="summary-main">${sport().name} · ${court().name}</div>
        <div class="summary-sub">${longDate(state.date)} · ${timeRange()} · ${duration()}</div>
      </div>
    </div>`;
}

const badge = p => `<span class="badge${p.member ? ' member' : ''}">${p.member ? 'Member' : 'Non-member'}</span>`;
const avatar = p => `<span class="avatar${p.member ? ' member' : ''}">${escH((p.name[0] || '?').toUpperCase())}</span>`;

let justAdded = -1;
const X_ICON = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>';

/* One position on the court: a filled player or an empty spot to tap */
function spotHTML(p, i) {
  if (p) {
    return `
      <div class="spot filled${justAdded === i ? ' pop' : ''}" data-i="${i}">
        ${p.you ? '' : `<button type="button" class="spot-x" data-act="remove" aria-label="Remove ${escH(p.name)}">${X_ICON}</button>`}
        <span class="spot-av${p.member ? ' member' : ''}">${escH((p.name[0] || '?').toUpperCase())}</span>
        <span class="spot-name">${p.you ? 'You' : escH(p.name)}</span>
        ${badge(p)}
        <span class="spot-price">${fmt(playerPrice(p))}</span>
      </div>`;
  }
  return `
    <button type="button" class="spot empty" data-act="edit" data-i="${i}">
      <span class="spot-av plus">+</span>
      <span class="spot-name">Player ${i + 1}</span>
      <span class="spot-hint">Tap to add</span>
    </button>`;
}

function teamFootHTML() {
  const left = state.players.filter(p => !p).length;
  return `
    <span class="foot-hint">${left ? `${left} more to add` : `Total ${fmt(totalPrice())}`}</span>
    <button type="button" class="primary-btn" data-act="to-review"${left ? ' disabled' : ''}>Review booking${ARROW}</button>`;
}

function teamHTML() {
  return headHTML('team', 'Add Players') + `
    <div class="stage-body narrow">
      ${summaryHTML()}
      <div class="lineup ${state.sport}">
        <div class="lineup-net"></div>
        <div class="spots">${state.players.map(spotHTML).join('')}</div>
      </div>
      <div class="stage-foot" id="team-foot">${teamFootHTML()}</div>
    </div>`;
}

function paintTeam() {
  const stage = $('stage');
  stage.querySelector('.spots').innerHTML = state.players.map(spotHTML).join('');
  $('team-foot').innerHTML = teamFootHTML();
  const sheet = $('sheet');
  const open = state.editing !== null;
  if (open && !sheet.classList.contains('open')) {
    $('sheet-title').textContent = `Player ${state.editing + 1}`;
    const input = sheet.querySelector('.player-input');
    input.value = '';
    sheet.querySelector('.results').innerHTML = '';
    sheet.classList.add('open');
    input.focus();
  } else if (!open) {
    sheet.classList.remove('open');
    sheet.querySelector('.player-input').blur();
  }
}

/* Short loading screen between steps */
let interTimer = null;
let busy = false;
function interlude(text, route) {
  if (busy) return;
  busy = true;
  paintBar();
  const stage = $('stage');
  stage.classList.add('leaving');
  interTimer = setTimeout(() => {
    stage.classList.remove('active', 'leaving');
    stage.dataset.route = 'loading';
    stage.innerHTML = `
      <div class="loader-screen" role="status">
        <svg class="loader-ring" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="32"/><circle class="fill" cx="36" cy="36" r="32"/></svg>
        <div class="loader-text">${escH(text)}</div>
      </div>`;
    void stage.offsetWidth;
    stage.classList.add('active');
    window.scrollTo(0, 0);
    interTimer = setTimeout(() => { busy = false; go(route); }, 2000);
  }, 180);
}

function reviewHTML() {
  const members = state.players.filter(p => p.member).length;
  return headHTML('review', 'Confirm') + `
    <div class="stage-body narrow">
      <div class="review-card ticket">
        <div class="review-rows">
          <div class="row"><span>Sport</span><span>${sport().name}</span></div>
          <div class="row"><span>Court</span><span>${court().name}</span></div>
          <div class="row"><span>Date</span><span>${longDate(state.date)}</span></div>
          <div class="row"><span>Time</span><span>${timeRange()}</span></div>
          <div class="row"><span>Duration</span><span>${duration()}</span></div>
          <div class="row"><span>Players</span><span>${members} member${members === 1 ? '' : 's'}, ${TEAM_SIZE - members} non-member${TEAM_SIZE - members === 1 ? '' : 's'}</span></div>
        </div>
        <div class="review-players">
          ${state.players.map(p => `<div class="rp">${avatar(p)}<span class="rp-name">${escH(p.name)}${p.you ? ' (you)' : ''}</span>${badge(p)}<span class="rp-price">${fmt(playerPrice(p))}</span></div>`).join('')}
        </div>
        <div class="review-total"><span>Total</span><b>${fmt(totalPrice())}</b></div>
      </div>
      <p class="fine">Members ${fmt(MEMBER_PRICE)} · Non-members ${fmt(NON_MEMBER_PRICE)} per person, per 30 min</p>
      <div class="stage-foot">
        <button type="button" class="primary-btn" id="confirm-btn" data-act="confirm">Confirm booking</button>
      </div>
    </div>`;
}

function doneHTML() {
  const b = state.last;
  return `
    <div class="stage-body narrow">
      <div class="done-ico"><svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div>
      <h3 class="stage-lead">You're booked!</h3>
      <div class="review-card">
        <div class="review-rows">
          <div class="row"><span>Court</span><span>${escH(b.sport)} · ${escH(b.court)}</span></div>
          <div class="row"><span>Date</span><span>${longDate(b.date)}</span></div>
          <div class="row"><span>Time</span><span>${escH(b.startTime)} – ${escH(b.endTime)}</span></div>
          <div class="row"><span>Players</span><span>${b.players.map(p => escH(p.name)).join(', ')}</span></div>
        </div>
        <div class="review-total"><span>Total</span><b>${fmt(b.totalPrice)}</b></div>
      </div>
      <div class="done-ref">Booking ref: ${escH(b.id)}</div>
      <div class="stage-foot">
        <button type="button" class="primary-btn" data-act="again">Book another court</button>
        <a class="ghost-btn" href="../index.html">Back to dashboard</a>
      </div>
    </div>`;
}

/* Background photos: applied only if the file exists, otherwise the gradient shows. */
function hydrateImages(root) {
  root.querySelectorAll('[data-img]').forEach(el => {
    const img = new Image();
    img.onload = () => { if (el.isConnected) el.style.backgroundImage = `url("${el.dataset.img}")`; };
    img.src = el.dataset.img;
  });
}

/* ---------- Navigation ---------- */
let current = null;
let navTimer = null;

function allowed(route) {
  if (route === 'times') return !!state.sport;
  if (route === 'team') return !!state.sport && validSel();
  if (route === 'review') return !!state.sport && validSel() && teamFull();
  if (route === 'done') return !!state.last;
  return route === 'sport';
}

function show(route) {
  const stage = $('stage');
  stage.classList.remove('active', 'leaving');
  stage.dataset.route = route;
  state.editing = null;
  $('sheet').classList.remove('open');
  stage.innerHTML = { sport: sportHTML, times: timesHTML, team: teamHTML, review: reviewHTML, done: doneHTML }[route]();
  hydrateImages(stage);
  stage.querySelectorAll('.ticket .row, .ticket .rp, .ticket .review-total').forEach((el, k) => el.style.setProperty('--i', k));
  void stage.offsetWidth;
  stage.classList.add('active');
  window.scrollTo(0, 0);
  if (route === 'times') loadBooked(); else paintBar();
}

function go(route, push = true) {
  clearTimeout(interTimer);
  const wasBusy = busy;
  busy = false;
  if (!allowed(route)) route = 'sport';
  if (route === current && !navTimer && !wasBusy) return;
  clearTimeout(navTimer);
  const from = current;
  if (from) $('stage').classList.add('leaving');
  current = route;
  paintBar();
  if (push) history.pushState({ s: route }, '');
  navTimer = setTimeout(() => { navTimer = null; show(route); }, from ? 180 : 0);
}

window.addEventListener('popstate', e => go((e.state && e.state.s) || 'sport', false));

/* ---------- Slot selection ---------- */
function pickSlot(courtId, idx) {
  const free = i => i < ALL_SLOTS.length && isFree(courtId, i);
  const start = i => { state.court = courtId; state.sel = free(i + 1) ? [i, i + 1] : [i]; };
  const sel = state.sel;
  if (state.court !== courtId || !sel.length) start(idx);
  else {
    const min = sel[0], max = sel[sel.length - 1];
    if (idx === min) state.sel = [];
    else if (idx > min && idx <= max) state.sel = sel.filter(i => i <= idx);
    else if (idx > max) {
      let ok = true;
      for (let i = max + 1; i <= idx; i++) if (!free(i)) ok = false;
      if (ok) for (let i = max + 1; i <= idx; i++) state.sel.push(i);
      else start(idx);
    } else start(idx);
  }
  paintSlots();
}

/* ---------- Player search ---------- */
let searchTimer = null;
let searchSeq = 0;

function resultsHTML(q, rows) {
  const taken = new Set(state.players.filter(Boolean).map(p => p.userId).filter(Boolean));
  const list = rows.filter(r => !taken.has(r.id));
  const guest = `
    <button type="button" class="result guest" data-act="guest" data-name="${escH(q)}">
      <span class="avatar">+</span>
      <span class="result-info"><span class="result-name">Add "${escH(q)}" as a guest</span><span class="result-user" style="display:block">Guest</span></span>
      <span class="badge">Non-member</span>
    </button>`;
  return (list.length ? list.map(r => `
    <button type="button" class="result" data-act="pick" data-id="${escH(r.id)}">
      <span class="avatar${r.is_member ? ' member' : ''}">${escH((r.first_name?.[0] || '?').toUpperCase())}</span>
      <span class="result-info"><span class="result-name">${escH(r.first_name)} ${escH(r.last_name)}</span><span class="result-user" style="display:block">@${escH(r.username)}</span></span>
      <span class="badge${r.is_member ? ' member' : ''}">${r.is_member ? 'Member' : 'Non-member'}</span>
    </button>`).join('') : `<div class="result-note">No USC account found for "${escH(q)}".</div>`) + guest;
}

let lastRows = [];
function searchPlayers(input) {
  const box = input.closest('.sheet-panel').querySelector('.results');
  const q = input.value.trim().replace(/[,()%*\\]/g, '');
  clearTimeout(searchTimer);
  const seq = ++searchSeq;
  if (q.length < 2) { box.innerHTML = ''; return; }
  box.innerHTML = '<div class="result-note">Searching…</div>';
  searchTimer = setTimeout(async () => {
    let rows = [];
    if (sb) {
      const { data, error } = await sb.from('profiles')
        .select('id, first_name, last_name, username, is_member')
        .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(6);
      if (error) console.error('[USC] player search', error);
      rows = data || [];
    }
    if (seq !== searchSeq || !box.isConnected) return;
    lastRows = rows;
    box.innerHTML = resultsHTML(q, rows);
  }, 250);
}

function setPlayer(i, p) {
  if (i === null || i < 1) return;
  state.players[i] = p;
  state.editing = null;
  justAdded = i;
  paintTeam();
  justAdded = -1;
}

/* ---------- Confirm ---------- */
async function confirmBooking() {
  const btn = $('confirm-btn');
  btn.disabled = true;
  btn.textContent = 'Booking…';
  const fail = msg => { toast(msg); btn.disabled = false; btn.textContent = 'Confirm booking'; };

  const slotValues = state.sel.map(i => ALL_SLOTS[i].value);
  const booking = {
    id: `USC-${Date.now()}`,
    sport: sport().name,
    court: court().name,
    date: state.date,
    startTime: slotTime(state.sel[0]),
    endTime: slotTime(state.sel[state.sel.length - 1] + 1),
    duration: state.sel.length / 2,
    totalPrice: totalPrice(),
    players: state.players.map(p => ({ name: p.name, membership: p.member ? 'member' : 'nonmember' })),
    customer: { fullName: me.name, phone: me.phone || '', email: me.email || '' },
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };

  if (!PREVIEW) {
    const { data: taken, error: checkErr } = await sb.from('padel_bookings').select('slots')
      .eq('date', state.date).eq('court_id', state.court).neq('status', 'cancelled');
    if (checkErr) return fail('Booking failed. Please try again.');
    if ((taken || []).some(b => (b.slots || []).some(s => slotValues.includes(s)))) {
      toast('Sorry, that time was just taken. Please pick another.');
      state.sel = [];
      go('times');
      return;
    }
    const { data: saved, error } = await sb.from('padel_bookings').insert({
      court_id:          state.court,
      court_name:        booking.court,
      date:              state.date,
      slots:             slotValues,
      start_time:        booking.startTime,
      end_time:          booking.endTime,
      duration_hours:    booking.duration,
      total_price:       booking.totalPrice,
      status:            'confirmed',
      booked_by_user_id: me.id,
      booked_by_name:    me.name,
    }).select().single();
    if (error || !saved) { console.error('[USC] booking save failed', error); return fail('Booking failed. Please try again.'); }
    booking.id = saved.id;
    const { error: playersErr } = await sb.from('booking_players').insert(state.players.map(p => ({
      booking_id: saved.id, user_id: p.userId || null, player_name: p.name, is_member: p.member,
    })));
    if (playersErr) console.error('[USC] players save failed', playersErr);
    try {
      const stored = JSON.parse(localStorage.getItem('usc_bookings') || '[]');
      stored.push(booking);
      localStorage.setItem('usc_bookings', JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent('usc_new_booking', { detail: booking }));
    } catch (ex) { /* storage unavailable */ }
  }

  state.last = booking;
  state.sel = [];
  state.court = null;
  resetTeam();
  history.replaceState({ s: 'sport' }, '');
  go('done');
}

function resetTeam() {
  state.players = [{ name: me.name, username: me.username, userId: me.id, member: me.member, you: true }, null, null, null];
  state.editing = null;
}

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const slotEl = el.closest('[data-i]');
  const i = slotEl ? Number(slotEl.dataset.i) : state.editing;
  switch (el.dataset.act) {
    case 'back': go(PARENT[current] || 'sport'); break;
    case 'sport':
      if (state.sport !== el.dataset.sport) { state.sport = el.dataset.sport; state.court = null; state.sel = []; }
      go('times');
      break;
    case 'date':
      state.date = el.dataset.date; state.sel = [];
      $('stage').querySelector('.date-row').innerHTML = datePillsHTML();
      loadBooked();
      break;
    case 'slot': pickSlot(Number(el.dataset.court), Number(el.dataset.idx)); break;
    case 'to-team': if (validSel()) interlude('Processing times', 'team'); break;
    case 'edit': state.editing = i; paintTeam(); break;
    case 'sheet-close': state.editing = null; paintTeam(); break;
    case 'remove': if (i > 0) { state.players[i] = null; state.editing = null; paintTeam(); } break;
    case 'pick': {
      const r = lastRows.find(x => String(x.id) === el.dataset.id);
      if (r) setPlayer(i, { name: `${r.first_name} ${r.last_name}`.trim(), username: r.username, userId: r.id, member: !!r.is_member });
      break;
    }
    case 'guest': {
      const name = el.dataset.name.trim();
      if (name.length >= 2) setPlayer(i, { name, username: null, userId: null, member: false });
      break;
    }
    case 'to-review': if (teamFull()) interlude('Putting everything together', 'review'); break;
    case 'confirm': confirmBooking(); break;
    case 'again': state.last = null; go('sport'); break;
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && current === 'team' && state.editing !== null) { state.editing = null; paintTeam(); }
});
document.addEventListener('input', e => {
  if (e.target.classList.contains('player-input')) searchPlayers(e.target);
});
document.addEventListener('change', e => {
  if (e.target.id === 'other-date' && e.target.value) {
    state.date = e.target.value; state.sel = [];
    $('stage').querySelector('.date-row').innerHTML = datePillsHTML();
    loadBooked();
  }
});

/* ---------- Auth ---------- */
function paintUserBar() {
  $('userBar').innerHTML = `
    <div class="usc-account">
      <div class="usc-chip">
        <div class="usc-avatar${me.member ? ' is-member' : ''}">${escH((me.first[0] || '?').toUpperCase())}</div>
        <span class="usc-chip-name">${escH(me.first)}</span>
        <div class="usc-chip-sep"></div>
        <span class="usc-chip-role ${me.member ? 'member' : 'guest'}">${me.member ? 'Member' : 'Guest'}</span>
      </div>
      <button class="usc-logout" id="signout-btn" title="Sign out" aria-label="Sign out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>`;
}

document.addEventListener('click', async e => {
  if (!e.target.closest('#signout-btn') || !sb || PREVIEW) return;
  await sb.auth.signOut();
  window.location.href = '../index.html';
});

async function initAuth() {
  if (window.supabase) sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  if (PREVIEW) {
    me = { id: null, name: 'Preview Player', first: 'Preview', username: 'preview', phone: '', email: '', member: true };
    return true;
  }
  if (!sb) { toast("Couldn't connect. Please check your connection and reload."); return false; }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { window.location.href = '../index.html'; return false; }
  const user = session.user;
  const { data: p } = await sb.from('profiles').select('first_name, last_name, username, phone, is_member').eq('id', user.id).single();
  const first = p?.first_name || user.user_metadata?.first_name || user.email.split('@')[0];
  me = {
    id: user.id,
    name: `${first} ${p?.last_name || ''}`.trim(),
    first,
    username: p?.username || null,
    phone: p?.phone || '',
    email: user.email,
    member: !!p?.is_member,
  };
  return true;
}

/* ---------- Init ---------- */
async function init() {
  const minSplash = new Promise(r => setTimeout(r, 1500));
  let ok = false;
  try { ok = await initAuth(); } catch (err) { console.error('[USC] auth', err); toast('Something went wrong. Please reload.'); }
  if (!ok) return;
  paintUserBar();
  resetTeam();
  await minSplash;
  history.replaceState({ s: 'sport' }, '');
  $('splash').classList.add('hidden');
  setTimeout(() => $('splash').remove(), 700);
  go('sport', false);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
