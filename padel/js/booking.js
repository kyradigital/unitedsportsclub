/* ============================================================
   United Sports Club — Booking System JS
   ============================================================ */

/* ---------- SUPABASE ---------- */
// Same values as uscportal/index.html
const SUPABASE_URL      = 'https://itzfanrkpvpfucgkbkff.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZhbnJrcHZwZnVjZ2tia2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTk1NjgsImV4cCI6MjEwOTA5NTU2OH0.e1BzYQDZUxQUv4I1vrAGyRXwrUlel0zubrTkRXJPSeM';
const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser    = null;
let currentProfile = null;

/* ---------- In-memory store ---------- */
const bookingsStore = [];

/* ---------- Booked slots (per court, from Supabase) ---------- */
const bookedSlots = { 1: new Set(), 2: new Set(), 3: new Set() };

/* ---------- Pricing ---------- */
const MEMBER_PRICE     = 500; // KES per person per 30-min slot
const NON_MEMBER_PRICE = 700; // KES per person per 30-min slot

/* ---------- Time slots: 10:00 AM → 12:30 AM ---------- */
const OPEN_HOUR = 10;

function buildSlots() {
  const slots = [];
  const hours = [];
  for (let h = OPEN_HOUR; h < 24; h++) hours.push(h);
  hours.push(0); // midnight = 12:00 AM
  for (const h of hours) {
    for (const m of ['00', '30']) {
      if (h === 0 && m === '30') { slots.push(makeSlot(h, m)); return slots; }
      slots.push(makeSlot(h, m));
    }
  }
  return slots;
}

function makeSlot(h, m) {
  const h12       = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const finalAmpm = h === 0 ? 'AM' : h >= 12 ? 'PM' : 'AM';
  return { display: `${h12}:${m}`, ampm: finalAmpm, value: `${String(h).padStart(2,'0')}:${m}` };
}

const ALL_SLOTS = buildSlots();

/* ---------- Per-court selection state ---------- */
const courtState = {
  1: { anchor: null, selected: new Set() },
  2: { anchor: null, selected: new Set() },
  3: { anchor: null, selected: new Set() },
};

/* ---------- Selected date ---------- */
let selectedDate = todayStr();

function todayStr() { return new Date().toISOString().split('T')[0]; }
function offsetDate(n) {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

/* ============================================================
   DATE PILLS
   ============================================================ */
function initDatePills() {
  const pills      = document.querySelectorAll('.date-pill[data-offset]');
  const otherBtn   = document.getElementById('otherDateBtn');
  const otherInput = document.getElementById('otherDateInput');

  pills.forEach(pill => {
    const offset = parseInt(pill.dataset.offset);
    const d = new Date(); d.setDate(d.getDate() + offset);
    pill.querySelector('.dp-day').textContent  = d.toLocaleDateString('en-KE', { weekday:'short' }).toUpperCase();
    pill.querySelector('.dp-date').textContent = d.toLocaleDateString('en-KE', { day:'numeric', month:'short' });
    pill.dataset.date = d.toISOString().split('T')[0];
  });

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      if (otherBtn)   otherBtn.classList.remove('active');
      if (otherInput) otherInput.style.display = 'none';
      pill.classList.add('active');
      selectedDate = pill.dataset.date;
      refreshAllSlots();
    });
  });

  if (otherBtn && otherInput) {
    otherInput.min = todayStr();
    otherBtn.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      otherBtn.classList.add('active');
      otherInput.style.display = 'block';
      otherInput.focus();
    });
    otherInput.addEventListener('change', () => {
      if (otherInput.value) { selectedDate = otherInput.value; refreshAllSlots(); }
    });
  }

  if (pills.length > 0) pills[0].classList.add('active');
}

/* ============================================================
   SLOT RENDERING
   ============================================================ */
function buildSlotGrid(courtId) {
  const grid = document.getElementById(`slotGrid${courtId}`);
  if (!grid) return;
  grid.innerHTML = '';
  const state  = courtState[courtId];
  const booked = bookedSlots[courtId] || new Set();
  ALL_SLOTS.forEach((slot, idx) => {
    const isBooked = booked.has(slot.value);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.disabled = isBooked;
    btn.className = 'slot-btn' + (isBooked ? ' booked' : '') + (state.selected.has(idx) ? ' selected' : '');
    btn.setAttribute('data-idx', idx);
    if (isBooked) {
      btn.innerHTML = `<span>${slot.display}</span><span style="font-size:.58rem;opacity:.6;display:block">Booked</span>`;
    } else {
      btn.innerHTML = `<span>${slot.display}</span><span style="font-size:.6rem;opacity:.7;display:block">${slot.ampm}</span>`;
    }
    if (!isBooked) btn.addEventListener('click', () => handleSlotClick(courtId, idx));
    grid.appendChild(btn);
  });
  updateConfirmStrip(courtId);
}

function refreshAllSlots() {
  [1, 2, 3].forEach(id => {
    courtState[id].anchor   = null;
    courtState[id].selected = new Set();
    buildSlotGrid(id);
  });
  loadBookedSlots(selectedDate);
}

/* ---------- Consecutive selection ---------- */
function handleSlotClick(courtId, idx) {
  const state = courtState[courtId];
  const sel   = state.selected;

  if (sel.size === 0) {
    state.anchor = idx; sel.add(idx);
  } else if (sel.has(idx)) {
    const maxSel = Math.max(...sel);
    if (idx === maxSel) { sel.delete(idx); if (sel.size === 0) state.anchor = null; }
    else { for (let i = idx; i <= maxSel; i++) sel.delete(i); if (sel.size === 0) state.anchor = null; }
  } else {
    const maxSel = Math.max(...sel);
    const minSel = Math.min(...sel);
    if (idx === maxSel + 1)       { sel.add(idx); }
    else if (idx > maxSel + 1 || idx < minSel) { sel.clear(); state.anchor = idx; sel.add(idx); }
  }
  buildSlotGrid(courtId);
}

/* ---------- Confirm strip ---------- */
function updateConfirmStrip(courtId) {
  const strip = document.getElementById(`confirmStrip${courtId}`);
  if (!strip) return;
  const sel   = courtState[courtId].selected;
  const count = sel.size;

  if (count < 2) { strip.classList.remove('show'); return; }

  const idxArr     = [...sel].sort((a, b) => a - b);
  const startSlot  = ALL_SLOTS[idxArr[0]];
  const endSlotIdx = idxArr[idxArr.length - 1] + 1;
  const endTime    = endSlotIdx < ALL_SLOTS.length
    ? ALL_SLOTS[endSlotIdx].display + ' ' + ALL_SLOTS[endSlotIdx].ampm : '1:00 AM';
  const startTime  = `${startSlot.display} ${startSlot.ampm}`;
  const hours      = count / 2;
  const dateLabel  = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' });
  const fromPrice  = count * MEMBER_PRICE;

  strip.querySelector('.confirm-info').innerHTML =
    `<strong>${hours >= 1 ? (hours === 1 ? '1 hr' : hours + ' hrs') : count * 30 + ' min'} · ${startTime} – ${endTime}</strong><br>${dateLabel} · from KES ${fromPrice.toLocaleString()} per person`;
  strip.classList.add('show');
}

/* ============================================================
   PLAYER STATE & MANAGEMENT
   ============================================================ */
let bookingCourtId = 1;
let playerCount    = 1;
let playerData     = [{ name: '', membership: 'nonmember', userId: null, username: null }];

function adjustPlayerCount(delta) {
  const next = Math.max(1, Math.min(4, playerCount + delta));
  if (next === playerCount) return;
  playerCount = next;

  while (playerData.length < playerCount)
    playerData.push({ name: '', membership: 'nonmember', userId: null, username: null });
  playerData = playerData.slice(0, playerCount);

  document.getElementById('playerCountDisplay').textContent = playerCount;
  document.getElementById('playerDecBtn').disabled = playerCount <= 1;
  document.getElementById('playerIncBtn').disabled = playerCount >= 4;
  renderPlayerRows();
  updateModalPrice();
}
window.adjustPlayerCount = adjustPlayerCount;


function renderPlayerRows() {
  const container = document.getElementById('playersContainer');
  if (!container) return;
  container.innerHTML = '';
  playerData.forEach((p, i) => {
    const div = document.createElement('div');
    div.className = 'player-row';
    div.setAttribute('data-idx', i);
    if (p.name) {
      div.innerHTML = `
        <div class="player-chip">
          <div class="player-chip-avatar">${esc(p.name[0].toUpperCase())}</div>
          <div class="player-chip-info">
            <div class="player-chip-name">${esc(p.name)}</div>
            <div class="player-chip-tag ${p.membership === 'member' ? 'is-member' : ''}">
              ${p.membership === 'member' ? '✦ Member · KES 500' : 'Non-Member · KES 700'}
            </div>
          </div>
          <button type="button" class="player-chip-remove" onclick="removePlayer(${i})">✕</button>
        </div>`;
    } else {
      div.innerHTML = `
        <div class="player-search-wrap">
          <div class="player-search-label">Player ${i + 1}</div>
          <div style="position:relative">
            <input type="text" class="player-search-input form-control"
              placeholder="Search by name or username…"
              oninput="handlePlayerSearch(${i}, this.value)"
              autocomplete="off"/>
            <div class="player-dropdown" id="playerDrop${i}"></div>
          </div>
        </div>`;
    }
    container.appendChild(div);
  });
}

async function handlePlayerSearch(idx, query) {
  const dropEl = document.getElementById(`playerDrop${idx}`);
  if (!dropEl) return;
  const q = query.trim();
  if (q.length < 2) { dropEl.innerHTML = ''; dropEl.style.display = 'none'; return; }

  dropEl.style.display = 'block';
  dropEl.innerHTML = '<div class="pdrop-item pdrop-loading">Searching…</div>';

  const { data } = await sb.from('profiles')
    .select('id, first_name, last_name, username, is_member')
    .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,username.ilike.%${q}%`)
    .limit(5);

  if (!data || data.length === 0) {
    dropEl.innerHTML = `
      <div class="pdrop-item pdrop-noresult">No USC account found for "${esc(q)}"</div>
      <div class="pdrop-item pdrop-guest" onclick="addGuestPlayer(${idx},'${esc(q).replace(/'/g,"\\'")}')">
        + Add <strong>${esc(q)}</strong> as guest <span class="pdrop-guest-tag">Non-member</span>
      </div>`;
    return;
  }

  dropEl.innerHTML = data.map(prof => `
    <div class="pdrop-item" onclick="selectPlayer(${idx}, '${prof.id}', '${esc(prof.first_name)}', '${esc(prof.last_name)}', '${esc(prof.username)}', ${prof.is_member})">
      <div class="pdrop-avatar">${(prof.first_name[0]||'?').toUpperCase()}</div>
      <div class="pdrop-info">
        <div class="pdrop-name">${esc(prof.first_name)} ${esc(prof.last_name)}</div>
        <div class="pdrop-user">@${esc(prof.username)}</div>
      </div>
      <span class="pdrop-badge ${prof.is_member ? 'is-member' : ''}">${prof.is_member ? '✦ Member' : 'Non-Member'}</span>
    </div>`).join('') +
    `<div class="pdrop-item pdrop-guest" onclick="addGuestPlayer(${idx},'${esc(q).replace(/'/g,"\\'")}')">
      + Add "${esc(q)}" as guest (non-member)
    </div>`;
}

function selectPlayer(idx, userId, firstName, lastName, username, isMember) {
  playerData[idx] = {
    name: `${firstName} ${lastName}`,
    username, userId,
    membership: isMember ? 'member' : 'nonmember',
  };
  clearPlayersError();
  renderPlayerRows();
  updateModalPrice();
}

function addGuestPlayer(idx, name) {
  playerData[idx] = { name: name.trim(), username: null, userId: null, membership: 'nonmember' };
  clearPlayersError();
  renderPlayerRows();
  updateModalPrice();
}

function removePlayer(idx) {
  playerData[idx] = { name: '', username: null, userId: null, membership: 'nonmember' };
  renderPlayerRows();
  updateModalPrice();
}
window.removePlayer     = removePlayer;
window.selectPlayer     = selectPlayer;
window.addGuestPlayer   = addGuestPlayer;
window.handlePlayerSearch = handlePlayerSearch;

function calcTotalPrice() {
  const count = courtState[bookingCourtId]?.selected?.size || 0;
  return playerData.reduce((sum, p) =>
    sum + count * (p.membership === 'member' ? MEMBER_PRICE : NON_MEMBER_PRICE), 0);
}

function updateModalPrice() {
  const total  = calcTotalPrice();
  const priceEl = document.getElementById('summaryPriceEl');
  if (priceEl) priceEl.textContent = `KES ${total.toLocaleString()}`;

  // Show per-player breakdown
  let breakdownEl = document.querySelector('.price-breakdown');
  if (!breakdownEl) {
    breakdownEl = document.createElement('div');
    breakdownEl.className = 'price-breakdown';
    priceEl?.parentElement?.appendChild(breakdownEl);
  }
  const count = courtState[bookingCourtId]?.selected?.size || 0;
  const members    = playerData.filter(p => p.membership === 'member').length;
  const nonMembers = playerData.filter(p => p.membership === 'nonmember').length;
  const lines = [];
  if (members    > 0) lines.push(`${members} member${members > 1 ? 's' : ''} × KES ${(count * MEMBER_PRICE).toLocaleString()}`);
  if (nonMembers > 0) lines.push(`${nonMembers} non-member${nonMembers > 1 ? 's' : ''} × KES ${(count * NON_MEMBER_PRICE).toLocaleString()}`);
  breakdownEl.innerHTML = lines.join('<br>');
}

/* ============================================================
   BOOKING MODAL
   ============================================================ */
function openBookingModal(courtId) {
  bookingCourtId = courtId;
  const sel = courtState[courtId].selected;

  if (sel.size < 2) { showToast('Select at least 1 hour (2 slots) to book.'); return; }

  // Reset player state — pre-fill slot 0 with logged-in user
  playerCount = 1;
  const isMem = currentProfile?.is_member || false;
  playerData  = [{
    name:       currentProfile ? `${currentProfile.first_name} ${currentProfile.last_name}` : '',
    membership: isMem ? 'member' : 'nonmember',
    userId:     currentUser?.id || null,
    username:   currentProfile?.username || null,
  }];

  const idxArr     = [...sel].sort((a, b) => a - b);
  const startSlot  = ALL_SLOTS[idxArr[0]];
  const endSlotIdx = idxArr[idxArr.length - 1] + 1;
  const endDisplay = endSlotIdx < ALL_SLOTS.length
    ? ALL_SLOTS[endSlotIdx].display + ' ' + ALL_SLOTS[endSlotIdx].ampm : '1:00 AM';
  const count  = sel.size;
  const hours  = count / 2;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const COURT_NAMES = { 1: 'Court 1', 2: 'Court 2', 3: 'Pickleball' };
  set('summaryCourtEl', COURT_NAMES[courtId] || `Court ${courtId}`);
  set('summaryDateEl',  new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-KE',{ day:'numeric', month:'long', year:'numeric' }));
  set('summaryStartEl', `${startSlot.display} ${startSlot.ampm}`);
  set('summaryEndEl',   endDisplay);
  set('summaryDurEl',   hours === 1 ? '1 Hour' : `${hours} Hours`);

  // Render players and compute initial price
  document.getElementById('playerCountDisplay').textContent = playerCount;
  document.getElementById('playerDecBtn').disabled = true;
  document.getElementById('playerIncBtn').disabled = false;
  renderPlayerRows();
  updateModalPrice();

  // Remove stale breakdown from previous open
  document.querySelectorAll('.price-breakdown').forEach(el => el.remove());
  updateModalPrice();

  // Auto-fill contact info from logged-in user
  if (currentProfile) {
    const fillIfEmpty = (id, val) => {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = val || '';
    };
    fillIfEmpty('fullName', `${currentProfile.first_name} ${currentProfile.last_name}`);
    fillIfEmpty('phone',    currentProfile.phone);
    fillIfEmpty('email',    currentUser?.email);
  }

  const modal = document.getElementById('bookingModal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeBookingModal() {
  document.getElementById('bookingModal')?.classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('bookingForm')?.reset();
  document.querySelectorAll('.price-breakdown').forEach(el => el.remove());
  clearErrors();
}

window.openBookingModal  = openBookingModal;
window.closeBookingModal = closeBookingModal;

/* ---------- Validation helpers ---------- */
const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validPhone = v => /^[\+]?[\d\s\-\(\)]{7,15}$/.test(v);

function showFieldError(id, msg) {
  document.getElementById(id)?.classList.add('error');
  const e = document.getElementById(id + 'Err');
  if (e) { e.textContent = msg; e.classList.add('show'); }
}
function clearFieldError(id) {
  document.getElementById(id)?.classList.remove('error');
  document.getElementById(id + 'Err')?.classList.remove('show');
}
function clearErrors() {
  document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.form-error.show').forEach(el => el.classList.remove('show'));
}
function showPlayersError(msg) {
  const e = document.getElementById('playersErr');
  if (e) { e.textContent = msg; e.classList.add('show'); }
}
function clearPlayersError() {
  document.getElementById('playersErr')?.classList.remove('show');
}
window.clearPlayersError = clearPlayersError;

/* ── Auth init ── */
async function initAuth() {
  const { data:{ session } } = await sb.auth.getSession();
  if (!session) {
    // Redirect to portal if not logged in
    window.location.href = '../index.html';
    return;
  }
  currentUser = session.user;

  const { data: profile } = await sb.from('profiles')
    .select('first_name, last_name, username, phone, is_member')
    .eq('id', currentUser.id).single();
  currentProfile = profile;

  // Show user bar in header if element exists
  const bar = document.getElementById('userBar');
  if (bar && profile) {
    const isMem = profile.is_member;
    bar.innerHTML = `
      <span class="user-bar-name">Hi, ${profile.first_name}</span>
      <span class="user-bar-badge ${isMem ? 'member' : ''}">${isMem ? '✦ Member' : 'Non-Member'}</span>
      <a class="user-bar-portal" href="../index.html">← Portal</a>`;
    bar.style.display = 'flex';
  }
}

/* ── Load booked slots from Supabase ── */
async function loadBookedSlots(date) {
  bookedSlots[1] = new Set();
  bookedSlots[2] = new Set();
  bookedSlots[3] = new Set();

  const { data } = await sb.from('padel_bookings')
    .select('court_id, slots')
    .eq('date', date)
    .neq('status', 'cancelled');

  if (data) {
    data.forEach(b => {
      if (bookedSlots[b.court_id]) {
        (b.slots || []).forEach(s => bookedSlots[b.court_id].add(s));
      }
    });
  }

  // Re-render grids with booked slots marked
  [1, 2, 3].forEach(id => buildSlotGrid(id));
}

/* Live blur validation */
document.addEventListener('DOMContentLoaded', async () => {
  initDatePills();
  buildSlotGrid(1);
  buildSlotGrid(2);
  buildSlotGrid(3);

  // Auth + booked slots
  await initAuth();
  loadBookedSlots(selectedDate);

  const rules = [
    { id:'fullName',      test: v => v.trim().length >= 2, msg: 'Please enter your full name.' },
    { id:'phone',         test: v => validPhone(v),         msg: 'Enter a valid phone number.' },
    { id:'email',         test: v => validEmail(v),         msg: 'Enter a valid email address.' },
    { id:'dob',           test: v => v !== '',              msg: 'Please enter your date of birth.' },
    { id:'gender',        test: v => v !== '',              msg: 'Please select your gender.' },
    { id:'emergencyName', test: v => v.trim().length >= 2, msg: 'Enter emergency contact name.' },
    { id:'emergencyPhone',test: v => validPhone(v),         msg: 'Enter a valid emergency number.' },
  ];
  rules.forEach(({ id, test, msg }) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur',  () => { if (!test(el.value)) showFieldError(id, msg); else clearFieldError(id); });
    el.addEventListener('input', () => clearFieldError(id));
  });

  document.getElementById('bookingModal')?.addEventListener('click', e => { if (e.target.id === 'bookingModal') closeBookingModal(); });
  document.getElementById('successModal')?.addEventListener('click', e => { if (e.target.id === 'successModal') closeSuccessModal(); });
});

/* ---------- Submit ---------- */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    let valid = true;

    // Validate player names (each slot must be filled via search or guest)
    const unnamed = playerData.filter(p => !p.name || p.name.trim().length < 2);
    if (unnamed.length > 0) {
      showPlayersError(`Please add a name for every player. Search by name or add as guest.`);
      valid = false;
    }

    // Validate contact fields
    const fields = [
      { id:'fullName',      test: v => v.trim().length >= 2, msg: 'Please enter your full name.' },
      { id:'phone',         test: v => validPhone(v),         msg: 'Enter a valid phone number.' },
      { id:'email',         test: v => validEmail(v),         msg: 'Enter a valid email address.' },
      { id:'dob',           test: v => v !== '',              msg: 'Please enter your date of birth.' },
      { id:'gender',        test: v => v !== '',              msg: 'Please select your gender.' },
      { id:'emergencyName', test: v => v.trim().length >= 2, msg: 'Enter emergency contact name.' },
      { id:'emergencyPhone',test: v => validPhone(v),         msg: 'Enter a valid emergency number.' },
    ];
    fields.forEach(({ id, test, msg }) => {
      const el = document.getElementById(id);
      if (!el || !test(el.value)) { showFieldError(id, msg); valid = false; }
    });
    if (!valid) return;

    const sel        = courtState[bookingCourtId].selected;
    const idxArr     = [...sel].sort((a, b) => a - b);
    const count      = sel.size;
    const hours      = count / 2;
    const totalPrice = calcTotalPrice();
    const startSlot  = ALL_SLOTS[idxArr[0]];
    const endSlotIdx = idxArr[idxArr.length - 1] + 1;
    const endDisplay = endSlotIdx < ALL_SLOTS.length
      ? ALL_SLOTS[endSlotIdx].display + ' ' + ALL_SLOTS[endSlotIdx].ampm : '1:00 AM';

    const courtName = { 1: 'Court 1', 2: 'Court 2', 3: 'Pickleball' }[bookingCourtId] || `Court ${bookingCourtId}`;
    const slotValues = idxArr.map(i => ALL_SLOTS[i].value);
    const customerName = document.getElementById('fullName').value.trim();

    const booking = {
      id:         `USC-${Date.now()}`,
      court:      courtName,
      date:       selectedDate,
      startTime:  `${startSlot.display} ${startSlot.ampm}`,
      endTime:    endDisplay,
      duration:   hours,
      totalPrice,
      players:    playerData.map(p => ({ name: p.name.trim(), membership: p.membership })),
      customer: {
        fullName:       customerName,
        phone:          document.getElementById('phone').value.trim(),
        email:          document.getElementById('email').value.trim(),
        dob:            document.getElementById('dob').value,
        gender:         document.getElementById('gender').value,
        emergencyName:  document.getElementById('emergencyName').value.trim(),
        emergencyPhone: document.getElementById('emergencyPhone').value.trim(),
        notes:          document.getElementById('notes')?.value.trim() || '',
      },
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    };

    const submitBtn = document.getElementById('submitBookingBtn');
    submitBtn.classList.add('loading'); submitBtn.disabled = true;

    // Save to Supabase
    const { data: savedBooking, error: bookingErr } = await sb.from('padel_bookings').insert({
      court_id:          bookingCourtId,
      court_name:        courtName,
      date:              selectedDate,
      slots:             slotValues,
      start_time:        booking.startTime,
      end_time:          booking.endTime,
      duration_hours:    hours,
      total_price:       totalPrice,
      status:            'confirmed',
      booked_by_user_id: currentUser?.id || null,
      booked_by_name:    customerName,
    }).select().single();

    if (bookingErr) {
      console.error('[USC] Booking save failed:', bookingErr);
      showToast('Booking failed. Please try again.');
      submitBtn.classList.remove('loading'); submitBtn.disabled = false;
      return;
    }

    // Save players
    if (savedBooking) {
      await sb.from('booking_players').insert(
        playerData.map(p => ({
          booking_id:  savedBooking.id,
          user_id:     p.userId || null,
          player_name: p.name.trim(),
          is_member:   p.membership === 'member',
        }))
      );
      booking.id = savedBooking.id;
    }

    // Mark slots as booked locally immediately
    slotValues.forEach(v => bookedSlots[bookingCourtId].add(v));

    // Also keep localStorage in sync for legacy admin
    try {
      const stored = JSON.parse(localStorage.getItem('usc_bookings') || '[]');
      stored.push(booking);
      localStorage.setItem('usc_bookings', JSON.stringify(stored));
      window.dispatchEvent(new CustomEvent('usc_new_booking', { detail: booking }));
    } catch (ex) {}

    submitBtn.classList.remove('loading'); submitBtn.disabled = false;

    courtState[bookingCourtId].anchor   = null;
    courtState[bookingCourtId].selected = new Set();
    buildSlotGrid(bookingCourtId);

    closeBookingModal();
    showSuccessModal(booking);
  });
}

/* ---------- Success Modal ---------- */
function showSuccessModal(b) {
  const sm = document.getElementById('successModal');
  if (!sm) return;
  const dateStr = new Date(b.date + 'T00:00:00').toLocaleDateString('en-KE', { day:'numeric', month:'long', year:'numeric' });
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('sc-court',    b.court);
  set('sc-date',     dateStr);
  set('sc-start',    b.startTime);
  set('sc-end',      b.endTime);
  set('sc-duration', b.duration === 1 ? '1 Hour' : `${b.duration} Hours`);
  set('sc-total',    `KES ${b.totalPrice.toLocaleString()}`);
  set('sc-id',       b.id);

  if (b.players && b.players.length > 0) {
    const members    = b.players.filter(p => p.membership === 'member').length;
    const nonMembers = b.players.filter(p => p.membership === 'nonmember').length;
    const parts = [];
    if (members    > 0) parts.push(`${members} member${members > 1 ? 's' : ''}`);
    if (nonMembers > 0) parts.push(`${nonMembers} non-member${nonMembers > 1 ? 's' : ''}`);
    set('sc-players', parts.join(', '));
  }

  sm.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
  document.getElementById('successModal')?.classList.remove('open');
  document.body.style.overflow = '';
}
window.closeSuccessModal = closeSuccessModal;

/* ---------- Helpers ---------- */
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ---------- Toast ---------- */
function showToast(msg) {
  let t = document.getElementById('usc-toast');
  if (!t) {
    t = Object.assign(document.createElement('div'), { id: 'usc-toast' });
    t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(12px);background:var(--navy);color:#fff;padding:.7rem 1.5rem;border-radius:50px;font-size:.85rem;font-weight:600;z-index:9999;opacity:0;transition:all .3s ease;white-space:nowrap;box-shadow:0 4px 20px rgba(10,35,66,.3);pointer-events:none;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(12px)'; }, 3200);
}
window.showToast = showToast;
