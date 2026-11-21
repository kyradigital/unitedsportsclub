/* USC court booking — step-by-step flow: sport → time → players → confirm. */

const SUPABASE_URL      = 'https://itzfanrkpvpfucgkbkff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZhbnJrcHZwZnVjZ2tia2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTk1NjgsImV4cCI6MjEwOTA5NTU2OH0.e1BzYQDZUxQUv4I1vrAGyRXwrUlel0zubrTkRXJPSeM';

/* Local design preview (http://localhost/...?preview): skips sign-in and never writes a booking. */
const PREVIEW = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).has('preview');

const MEMBER_PRICE     = 500; // KES per person per 30-min slot (peak)
const NON_MEMBER_PRICE = 700;
const OFF_MEMBER       = 400; // off-peak: Mon–Fri, slots starting 10:00–15:30
const OFF_NON_MEMBER   = 550;
/* Must match slot_rate() in the database */
const isOffPeak = (date, slot) => { const dow = dateFrom(date).getDay(); return dow >= 1 && dow <= 5 && slot >= '10:00' && slot < '16:00'; };
const slotRate = (date, slot, member) => isOffPeak(date, slot) ? (member ? OFF_MEMBER : OFF_NON_MEMBER) : (member ? MEMBER_PRICE : NON_MEMBER_PRICE);
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
  weeks: 1,                      // weekly repeat count
  credit: 0,                     // wallet balance
  useCredit: false,
  hire: {},                      // { itemKey: qty }
  bundle: null,                  // chosen food bundle id
  join: null,                    // booking loaded from an invite link
};
let HIRE = [], BUNDLES = [];
const hireItems = () => HIRE.filter(h => h.sport === state.sport);
const hireTotal = () => hireItems().reduce((t, h) => t + (state.hire[h.key] || 0) * h.price, 0);
const bundleObj = () => BUNDLES.find(b => b.id === state.bundle) || null;
const bundlePrice = () => (state.weeks === 1 && bundleObj() ? bundleObj().price : 0);
const grandTotal = () => totalPrice() + hireTotal() + bundlePrice();

const sport = () => SPORTS[state.sport];
const court = () => sport().courts.find(c => c.id === state.court);
const validSel = () => state.sel.length >= MIN_SLOTS;
const playerPrice = p => (p.open ? 0 : state.sel.reduce((t, i) => t + slotRate(state.date, ALL_SLOTS[i].value, p.member), 0));
const openCount = () => state.players.filter(p => p && p.open).length;
const SITE = location.href.split('?')[0].split('#')[0];
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
      <div class="menu-title">${n ? `<span class="menu-step">Step ${n} of 4</span>` : ""}<h2>${escH(title)}</h2></div>
      <div class="mini-dots"${n ? "" : " style=\"visibility:hidden\""}>${[1, 2, 3, 4].map(k => `<span class="${k < n ? 'done' : k === n ? 'active' : ''}"></span>`).join('')}</div>
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
      <div class="offpeak-note" id="offpeak-note"></div>
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
      btn.classList.toggle('off', isOffPeak(state.date, ALL_SLOTS[idx].value));
    });
    el.querySelector('.court-free').textContent = state.loading ? 'Checking…' : free ? `${free / 2} hrs free` : 'Fully booked';
  });
  const note = $('offpeak-note');
  if (note) {
    const off = isOffPeak(state.date, '10:00');
    note.hidden = !off;
    note.innerHTML = off ? `<i></i>Off-peak until 16:00 · from ${fmt(OFF_MEMBER)} per person` : '';
  }
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
const LINK_ICON = '<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"/></svg>';
const X_ICON = '<svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>';

/* One position on the court: a filled player or an empty spot to tap */
function spotHTML(p, i) {
  if (p && p.open) {
    return `
      <div class="spot filled open${justAdded === i ? ' pop' : ''}" data-i="${i}">
        <button type="button" class="spot-x" data-act="remove" aria-label="Remove open spot">${X_ICON}</button>
        <span class="spot-av open-av">${LINK_ICON}</span>
        <span class="spot-name">Open spot</span>
        <span class="badge">Invite</span>
        <span class="spot-price">Pays on joining</span>
      </div>`;
  }
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
    <span class="foot-hint">${left ? `${left} more to add` : `Total ${fmt(totalPrice())}${openCount() ? ' + open spots' : ''}`}</span>
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
    sheet.querySelector('.results').innerHTML = OPEN_BTN;
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
          <div class="row"><span>Players</span><span>${members} member${members === 1 ? '' : 's'}, ${TEAM_SIZE - members - openCount()} non-member${TEAM_SIZE - members - openCount() === 1 ? '' : 's'}${openCount() ? `, ${openCount()} open` : ''}</span></div>
        </div>
        <div class="review-players">
          ${state.players.map(p => p.open
            ? `<div class="rp"><span class="avatar open-av">${LINK_ICON}</span><span class="rp-name">Open spot</span><span class="badge">Invite</span><span class="rp-price">On joining</span></div>`
            : `<div class="rp">${avatar(p)}<span class="rp-name">${escH(p.name)}${p.you ? ' (you)' : ''}</span>${badge(p)}<span class="rp-price">${fmt(playerPrice(p))}</span></div>`).join('')}
        </div>
        <div class="review-total"><span id="grand-label">Total${state.weeks > 1 ? ' per game' : ''}</span><b id="grand">${fmt(grandTotal())}</b></div>
      </div>
      <div class="extras" id="extras">${extrasHTML()}</div>
      <div class="repeat">
        <span class="repeat-label">Repeat weekly</span>
        <div class="repeat-pills">${[1, 2, 4, 8].map(w => `<button type="button" class="repeat-pill${state.weeks === w ? ' on' : ''}" data-act="weeks" data-w="${w}">${w === 1 ? 'Once' : w + ' weeks'}</button>`).join('')}</div>
      </div>
      ${state.credit > 0 ? `
      <button type="button" class="credit-toggle${state.useCredit ? ' on' : ''}" data-act="credit">
        <span class="ct-box"></span>
        <span class="ct-text">Use my credit<small>${fmt(state.credit)} available</small></span>
        <b id="credit-amt">${state.useCredit ? '− ' + fmt(Math.min(state.credit, grandTotal())) : ''}</b>
      </button>` : ''}
      <p class="fine">Per person, per 30 min: members ${fmt(MEMBER_PRICE)}, non-members ${fmt(NON_MEMBER_PRICE)}. Off-peak (Mon–Fri before 16:00): ${fmt(OFF_MEMBER)} / ${fmt(OFF_NON_MEMBER)}.</p>
      <div class="stage-foot">
        <button type="button" class="primary-btn" id="confirm-btn" data-act="confirm">Confirm booking</button>
      </div>
    </div>`;
}

/* Calendar time for a slot label on a given club day (after-midnight slots fall on the next date) */
function icsStamp(date, label) {
  const d = dateFrom(date);
  const [h, m] = label.split(':').map(Number);
  if (h < 10) d.setDate(d.getDate() + 1);
  return `${dateStr(d).replace(/-/g, '')}T${pad2(h)}${pad2(m)}00`;
}

function bookingText(b) {
  const dates = b.dates.map(longDate).join('\n');
  return `United Sports Club — ${b.sport}, ${b.court}\n${dates}\n${b.startTime} – ${b.endTime}\nPlayers: ${b.players.map(p => p.name).join(', ')}${b.open ? ` + ${b.open} open` : ''}`
    + (b.open && !PREVIEW ? `\n\nJoin here: ${SITE}?join=${b.id}` : '');
}

function downloadICS(b) {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const events = b.dates.map((d, k) => [
    'BEGIN:VEVENT',
    `UID:${b.id}-${k}@unitedsportsclub`,
    `DTSTAMP:${now}`,
    `DTSTART:${icsStamp(d, b.startTime)}`,
    `DTEND:${icsStamp(d, b.endTime)}`,
    `SUMMARY:${b.sport} at United Sports Club (${b.court})`,
    `DESCRIPTION:Players: ${b.players.map(p => p.name).join(', ')}`,
    'LOCATION:United Sports Club\\, Mombasa',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Your game starts in 1 hour', 'TRIGGER:-PT1H', 'END:VALARM',
    'END:VEVENT',
  ].join('\r\n'));
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//United Sports Club//Booking//EN', ...events, 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'usc-booking.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

async function shareLink(text, url) {
  if (navigator.share) { try { await navigator.share({ title: 'United Sports Club', text, url }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  try { await navigator.clipboard.writeText(url); toast('Invite link copied'); }
  catch (e) { window.open('https://wa.me/?text=' + encodeURIComponent(`${text}\n${url}`), '_blank', 'noopener'); }
}

async function enableAlerts(btn) {
  btn.disabled = true;
  try { await USCPush.enable(sb); btn.innerHTML = ICO.bell + 'Reminder on'; btn.classList.add('primary'); toast("We'll remind you 1 hour before"); }
  catch (e) { btn.disabled = false; if (e.message === 'blocked') toast('Notifications are blocked in your browser settings'); else if (e.message !== 'dismissed') toast("Couldn't turn on reminders on this device"); }
}
async function paintAlertsBtn() {
  const btn = $('alerts-btn'); if (!btn) return;
  if (await USCPush.state() === 'on') { btn.innerHTML = ICO.bell + 'Reminder on'; btn.classList.add('primary'); btn.disabled = true; }
}

const ICO = {
  bell: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>',
  link: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"/></svg>',
  cal: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M4 10h16M5 21h14a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v14a1 1 0 001 1z"/></svg>',
  chat: '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M21 12a8 8 0 01-11.8 7L4 20l1.1-4.6A8 8 0 1121 12z"/></svg>',
};

function extrasHTML() {
  const items = hireItems();
  const hire = items.length ? `
    <div class="ex-block">
      <div class="ex-head">Hire</div>
      ${items.map(h => { const q = state.hire[h.key] || 0; return `
      <div class="ex-row">
        <div class="ex-info"><span class="ex-name">${escH(h.name)}</span><span class="ex-price">${fmt(h.price)} each</span></div>
        <div class="ex-step"><button type="button" data-act="hire" data-k="${escH(h.key)}" data-d="-1"${q ? '' : ' disabled'} aria-label="Less">−</button><span>${q}</span><button type="button" data-act="hire" data-k="${escH(h.key)}" data-d="1"${q >= h.max_qty ? ' disabled' : ''} aria-label="More">+</button></div>
      </div>`; }).join('')}
    </div>` : '';
  const food = BUNDLES.length ? `
    <div class="ex-block">
      <div class="ex-head">Food after the game<small>Ready at ${escH(slotTime(state.sel[state.sel.length - 1] + 1))}</small></div>
      ${state.weeks > 1 ? '<p class="ex-note">Food bundles are for single bookings.</p>' : BUNDLES.map(b => `
      <button type="button" class="ex-bundle${state.bundle === b.id ? ' on' : ''}" data-act="bundle" data-id="${b.id}">
        <span class="ex-radio"></span>
        <span class="ex-info"><span class="ex-name">${escH(b.title)}</span><span class="ex-price">${escH(b.description || '')}</span></span>
        <b>${fmt(b.price)}</b>
      </button>`).join('')}
    </div>` : '';
  return hire + food;
}

function paintTotals() {
  const g = $('grand'); if (!g) return;
  g.textContent = fmt(grandTotal());
  $('grand-label').textContent = state.weeks > 1 ? 'Total per game' : 'Total';
  const c = $('credit-amt'); if (c) c.textContent = state.useCredit ? '− ' + fmt(Math.min(state.credit, grandTotal())) : '';
}

function doneHTML() {
  const b = state.last;
  const many = b.dates.length > 1;
  return `
    <div class="stage-body narrow">
      <div class="done-ico"><svg width="38" height="38" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div>
      <h3 class="stage-lead">${many ? `Booked for ${b.dates.length} weeks` : "You're booked!"}</h3>
      <div class="review-card">
        <div class="review-rows">
          <div class="row"><span>Court</span><span>${escH(b.sport)} · ${escH(b.court)}</span></div>
          <div class="row"><span>${many ? 'Dates' : 'Date'}</span><span>${b.dates.map(longDate).join('<br>')}</span></div>
          <div class="row"><span>Time</span><span>${escH(b.startTime)} – ${escH(b.endTime)}</span></div>
          <div class="row"><span>Players</span><span>${b.players.map(p => escH(p.name)).join(', ')}${b.open ? ` + ${b.open} open` : ''}</span></div>
        </div>
        ${b.hire && b.hire.length ? `<div class="review-rows" style="padding-top:0"><div class="row"><span>Hire</span><span>${b.hire.map(h => `${h.qty}× ${escH(h.name)}`).join('<br>')}</span></div></div>` : ''}
        ${b.bundle ? `<div class="review-rows" style="padding-top:0"><div class="row"><span>Food</span><span>${escH(b.bundle.title)}<br><small style="color:var(--muted);font-weight:500">Ready at ${escH(b.endTime)}</small></span></div></div>` : ''}
        <div class="review-total"><span>Total${many ? ' per game' : ''}</span><b>${fmt(b.totalPrice + (b.hireTotal || 0) + (b.bundle ? b.bundle.price : 0))}</b></div>
      </div>
      ${b.credit ? `<p class="fine">${fmt(b.credit)} paid with credit${b.dates.length > 1 ? ' (used across your games)' : ''}.</p>` : ''}
      ${b.skipped.length ? `<p class="fine warn">Already taken, not booked: ${b.skipped.map(longDate).join(', ')}</p>` : ''}
      <div class="share-row">
        ${b.open ? `<button type="button" class="share-btn primary" data-act="invite">${ICO.link}Invite players</button>` : ''}
        <button type="button" class="share-btn" data-act="calendar">${ICO.cal}Add to calendar</button>
        <button type="button" class="share-btn" data-act="whatsapp">${ICO.chat}WhatsApp</button>
        ${window.USCPush && USCPush.supported() && !PREVIEW ? `<button type="button" class="share-btn" data-act="alerts" id="alerts-btn">${ICO.bell}Remind me</button>` : ''}
      </div>
      <p class="fine">Add it to your calendar for a reminder 1 hour before.</p>
      <div class="stage-foot">
        <button type="button" class="primary-btn" data-act="again">Book another court</button>
        <a class="ghost-btn" href="../index.html">Back to dashboard</a>
      </div>
    </div>`;
}

/* ---------- Join an open spot from an invite link ---------- */
async function loadJoin() {
  const { data, error } = await sb.from('padel_bookings')
    .select('id, court_id, court_name, date, start_time, end_time, slots, status, booked_by_name, booking_players(player_name, user_id, is_member)')
    .eq('id', state.joinId).maybeSingle();
  if (error || !data) { toast('That invite link is not valid.'); return; }
  state.join = data;
}

function joinHTML() {
  const b = state.join;
  const players = b.booking_players || [];
  const already = players.some(p => p.user_id === me.id);
  const open = TEAM_SIZE - players.length;
  const past = b.date < dateStr(new Date());
  const price = (b.slots || []).reduce((t, s) => t + slotRate(b.date, s, me.member), 0);
  const reason = b.status === 'cancelled' ? 'This game was cancelled.' : past ? 'This game has already been played.'
    : already ? "You're already in this game." : open <= 0 ? 'This game is full.' : '';
  return headHTML('join', 'Join Game') + `
    <div class="stage-body narrow">
      <h3 class="stage-lead">${escH(b.booked_by_name || 'A friend')} invited you</h3>
      <div class="review-card">
        <div class="review-rows">
          <div class="row"><span>Court</span><span>${escH(b.court_name)}</span></div>
          <div class="row"><span>Date</span><span>${longDate(b.date)}</span></div>
          <div class="row"><span>Time</span><span>${escH(b.start_time)} – ${escH(b.end_time)}</span></div>
          <div class="row"><span>Players</span><span>${players.map(p => escH(p.player_name)).join(', ')}${open > 0 ? ` + ${open} open` : ''}</span></div>
        </div>
        ${reason ? '' : `<div class="review-total"><span>Your share</span><b>${fmt(price)}</b></div>`}
      </div>
      ${reason ? `<p class="fine">${reason}</p>` : '<p class="fine">Weekly games: you join every upcoming week with a free spot.</p>'}
      <div class="stage-foot">
        ${reason ? '' : '<button type="button" class="primary-btn" id="join-btn" data-act="join-game">Join this game</button>'}
        <button type="button" class="ghost-btn" data-act="again">Book your own court</button>
      </div>
    </div>`;
}

async function joinGame() {
  const btn = $('join-btn');
  btn.disabled = true; btn.textContent = 'Joining…';
  const { data, error } = PREVIEW ? { data: { joined: 1 } } : await sb.rpc('join_booking', { p_booking: state.join.id });
  if (error || !data?.joined) {
    btn.disabled = false; btn.textContent = 'Join this game';
    toast(error ? "Couldn't join. Please try again." : 'Sorry, the spot was just taken.');
    return;
  }
  toast(data.joined > 1 ? `You're in for ${data.joined} games` : "You're in!");
  await loadJoin();
  current = null;
  go('join', false);
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
  if (route === 'join') return !!state.join;
  return route === 'sport';
}

function show(route) {
  const stage = $('stage');
  stage.classList.remove('active', 'leaving');
  stage.dataset.route = route;
  state.editing = null;
  $('sheet').classList.remove('open');
  stage.innerHTML = { sport: sportHTML, times: timesHTML, team: teamHTML, review: reviewHTML, done: doneHTML, join: joinHTML }[route]();
  hydrateImages(stage);
  stage.querySelectorAll('.ticket .row, .ticket .rp, .ticket .review-total').forEach((el, k) => el.style.setProperty('--i', k));
  void stage.offsetWidth;
  stage.classList.add('active');
  window.scrollTo(0, 0);
  if (route === 'times') loadBooked(); else paintBar();
  if (route === 'done' && window.USCPush) paintAlertsBtn().catch(() => {});
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

const OPEN_BTN = `
  <button type="button" class="result guest open-opt" data-act="open-spot">
    <span class="avatar">${'<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1"/></svg>'}</span>
    <span class="result-info"><span class="result-name">Leave open</span><span class="result-user" style="display:block">Invite a friend with a link</span></span>
  </button>`;
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
    </button>`).join('') : `<div class="result-note">No USC account found for "${escH(q)}".</div>`) + guest + OPEN_BTN;
}

let lastRows = [];
function searchPlayers(input) {
  const box = input.closest('.sheet-panel').querySelector('.results');
  const q = input.value.trim().replace(/[,()%*\\]/g, '');
  clearTimeout(searchTimer);
  const seq = ++searchSeq;
  if (q.length < 2) { box.innerHTML = OPEN_BTN; return; }
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

  booking.weeks = state.weeks;
  booking.credit = PREVIEW && state.useCredit ? Math.min(state.credit, grandTotal()) : 0;
  booking.hire = hireItems().filter(h => state.hire[h.key]).map(h => ({ name: h.name, qty: state.hire[h.key], price: h.price }));
  booking.hireTotal = hireTotal();
  booking.bundle = state.weeks === 1 && bundleObj() ? { title: bundleObj().title, price: bundleObj().price } : null;
  booking.open = openCount();
  booking.dates = [state.date];
  booking.skipped = [];
  booking.players = state.players.filter(p => !p.open).map(p => ({ name: p.name }));
  if (!PREVIEW) {
    const { data: res, error } = await sb.rpc('book_court', {
      p_court: state.court, p_date: state.date, p_slots: slotValues,
      p_start: booking.startTime, p_end: booking.endTime, p_weeks: state.weeks,
      p_players: state.players.filter(p => !p.open).map(p => ({ user_id: p.userId || null, name: p.name })),
      p_use_credit: state.useCredit && state.credit > 0,
      p_hire: hireItems().filter(h => state.hire[h.key]).map(h => ({ key: h.key, qty: state.hire[h.key] })),
      p_bundle: state.weeks === 1 ? state.bundle : null,
    });
    if (error || !res) { console.error('[USC] booking failed', error); return fail('Booking failed. Please try again.'); }
    if (!res.booked.length) {
      toast('Sorry, that time was just taken. Please pick another.');
      state.sel = [];
      go('times');
      return;
    }
    booking.id = res.booked[0].id;
    booking.dates = res.booked.map(b => b.date);
    booking.skipped = res.skipped;
    booking.totalPrice = res.total;
    booking.credit = res.credit || 0;
    state.credit = Math.max(0, state.credit - booking.credit);
  } else {
    for (let w = 1; w < state.weeks; w++) { const d = dateFrom(state.date); d.setDate(d.getDate() + 7 * w); booking.dates.push(dateStr(d)); }
  }

  state.last = booking;
  state.sel = [];
  state.court = null;
  resetTeam();
  history.replaceState({ s: 'sport' }, '');
  go('done');
}

function resetTeam() {
  state.weeks = 1;
  state.useCredit = false;
  state.hire = {};
  state.bundle = null;
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
    case 'open-spot': if (i !== null && i > 0) setPlayer(i, { open: true, name: 'Open spot', member: false }); break;
    case 'weeks':
      state.weeks = Number(el.dataset.w);
      $('stage').querySelectorAll('.repeat-pill').forEach(b => b.classList.toggle('on', b === el));
      if (state.weeks > 1) state.bundle = null;
      $('extras').innerHTML = extrasHTML();
      paintTotals();
      break;
    case 'hire': {
      const h = HIRE.find(x => x.key === el.dataset.k); if (!h) break;
      state.hire[h.key] = Math.max(0, Math.min(h.max_qty, (state.hire[h.key] || 0) + Number(el.dataset.d)));
      $('extras').innerHTML = extrasHTML(); paintTotals();
      break;
    }
    case 'bundle': {
      const id = Number(el.dataset.id);
      state.bundle = state.bundle === id ? null : id;
      $('extras').innerHTML = extrasHTML(); paintTotals();
      break;
    }
    case 'alerts': enableAlerts(el); break;
    case 'invite': shareLink(`Join my ${state.last.sport} game at United Sports Club — ${longDate(state.last.date)}, ${state.last.startTime}`, `${SITE}?join=${state.last.id}`); break;
    case 'whatsapp': window.open('https://wa.me/?text=' + encodeURIComponent(bookingText(state.last)), '_blank', 'noopener'); break;
    case 'calendar': downloadICS(state.last); break;
    case 'join-game': joinGame(); break;
    case 'credit': {
      state.useCredit = !state.useCredit;
      el.classList.toggle('on', state.useCredit);
      paintTotals();
      break;
    }
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
    state.credit = 1500;
    return true;
  }
  if (!sb) { toast("Couldn't connect. Please check your connection and reload."); return false; }
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    try { if (state.joinId) sessionStorage.setItem('usc_return', location.href); } catch (e) {}
    window.location.href = '../index.html';
    return false;
  }
  const user = session.user;
  const [{ data: p }, { data: needPhone }] = await Promise.all([
    sb.from('profiles').select('first_name, last_name, username, phone, is_member, phone_verified').eq('id', user.id).single(),
    sb.rpc('phone_check_required'),
  ]);
  if (needPhone && p && !p.phone_verified) { window.location.href = '../index.html'; return false; }
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
  const { data: w } = await sb.from('wallets').select('balance').eq('user_id', user.id).maybeSingle();
  state.credit = w?.balance || 0;
  return true;
}

/* ---------- Init ---------- */
async function init() {
  const minSplash = new Promise(r => setTimeout(r, 1500));
  const jid = new URLSearchParams(location.search).get('join');
  if (jid && /^[0-9a-f-]{36}$/i.test(jid)) state.joinId = jid;
  let ok = false;
  try { ok = await initAuth(); } catch (err) { console.error('[USC] auth', err); toast('Something went wrong. Please reload.'); }
  if (!ok) return;
  paintUserBar();
  resetTeam();
  await minSplash;
  if (sb) {
    const [h, b] = await Promise.all([
      sb.from('hire_items').select('*').eq('active', true).order('sort'),
      sb.from('bundles').select('*').eq('active', true).order('sort'),
    ]);
    HIRE = h.data || []; BUNDLES = b.data || [];
  }
  if (state.joinId) await loadJoin();
  history.replaceState({ s: state.join ? 'join' : 'sport' }, '');
  $('splash').classList.add('hidden');
  setTimeout(() => $('splash').remove(), 700);
  go(state.join ? 'join' : 'sport', false);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
