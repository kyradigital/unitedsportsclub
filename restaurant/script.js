/* USC Restaurant — guided ordering. Menu content lives in menu-data.js. */

const SUPABASE_URL  = 'https://itzfanrkpvpfucgkbkff.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZhbnJrcHZwZnVjZ2tia2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTk1NjgsImV4cCI6MjEwOTA5NTU2OH0.e1BzYQDZUxQUv4I1vrAGyRXwrUlel0zubrTkRXJPSeM';
const WHATSAPP_NO   = '254722850525';

const $ = id => document.getElementById(id);
const fmt = n => 'KES ' + Number(n).toLocaleString('en-US');
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const titleCase = s => s.toLowerCase().replace(/(^|[\s(&/-])([a-z])/g, (m, a, b) => a + b.toUpperCase());

/* ---------- Veg / non-veg marks (Indian food labelling symbols) ---------- */
function mark(diet, size = 17) {
  const veg = diet === 'veg';
  const art = veg
    ? '<path d="M20.5 3.2c.6 9.800-3 17-10 17-1.700 0-3.300-.5-4.600-1.400C4.700 17.500 4 15.800 4 14 4 7.500 10.500 3.200 20.500 3.200z" fill="#35bd5e"/><path d="M20.5 3.200c.6 9.800-3 17-10 17-1.700 0-3.300-.5-4.600-1.400C10 16 16 10.500 20.500 3.200z" fill="#249a48"/><path d="M4 21.600C6.400 15.500 10.500 10.800 16 8" fill="none" stroke="#0f6a31" stroke-width="1.600" stroke-linecap="round"/>'
    : '<path d="M9.900 14.100l-4.300 4.300" stroke="#f4ead9" stroke-width="2.800" stroke-linecap="round"/><circle cx="4.300" cy="18.200" r="2" fill="#f4ead9"/><circle cx="5.800" cy="19.700" r="2" fill="#f4ead9"/><path d="M14.500 2.500c3.900 0 7 3.100 7 7 0 3.300-2.300 6.200-6 6.800-2 .3-3.600-.3-4.800-1.500L9 13.100C7.800 11.900 7.200 10.300 7.500 8.300 8.100 4.800 11.200 2.500 14.500 2.500z" fill="#cf7a2c"/><path d="M21.500 9.500c0 3.300-2.300 6.200-6 6.800-2 .3-3.600-.3-4.800-1.500 5 .5 9.300-2.300 10.800-5.300z" fill="#a85a1c"/><path d="M12.500 5.800c1.300-.9 3-1.100 4.500-.5" fill="none" stroke="#f0b06a" stroke-width="1.300" stroke-linecap="round"/>';
  return `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" role="img" aria-label="${veg ? 'Vegetarian' : 'Non-vegetarian'}">${art}</svg>`;
}

function dietOf(name, fallback) {
  if (/egg ?plant|soya/i.test(name)) return 'veg';
  if (/\b(eggs?|mutton|chicken|fish|prawns?|shrimp|lamb|khima|kheema)\b/i.test(name)) return 'nonveg';
  return fallback || 'veg';
}

/* ---------- Build menus ---------- */
const ITEMS = [];
let secSeq = 0;

function dishHTML(item, secDiet, sec) {
  const id = ITEMS.length;
  const diet = dietOf(item.n, secDiet);
  ITEMS.push({ item, diet, sec });
  const sizes = item.sizes ? Object.entries(item.sizes) : [];
  const price = sizes.length ? sizes[0][1] : item.p;
  const opts = (kind, list) => list.length ? `<div class="opts" data-kind="${kind}">${list.map(([label, p], i) =>
    `<button type="button" class="opt${i === 0 ? ' on' : ''}" data-act="opt" data-val="${escH(label)}"${p != null ? ` data-price="${p}"` : ''}>${escH(label)}</button>`).join('')}</div>` : '';
  return `
    <div class="dish" data-id="${id}" data-name="${escH(item.n.toLowerCase())}">
      <div class="dish-main">
        <div class="dish-title">${mark(diet)}<span class="dish-name">${escH(item.n)}</span></div>
        ${opts('size', sizes)}${opts('style', (item.styles || []).map(s => [s, null]))}
      </div>
      <div class="dish-side">
        <div class="dish-price">${fmt(price)}</div>
        <div class="dish-ctl"><button type="button" class="add-btn" data-act="inc" aria-label="Add">+</button></div>
      </div>
    </div>`;
}

function sectionHTML(sec, diet) {
  const id = secSeq++;
  const m = sec.name.match(/^([^(]+)\((.+)\)\s*$/);
  const title = titleCase(m ? m[1].trim() : sec.name);
  let note = m ? m[2].trim() : '';
  if (note && note === note.toUpperCase()) note = titleCase(note);
  return `
    <div class="sec" data-sec="${id}" data-title="${escH(sec.name.toLowerCase())}">
      <button type="button" class="sec-head" data-act="sec" aria-expanded="false">
        <span class="sec-text">
          <span class="sec-name">${escH(title)}</span>
          ${note ? `<span class="sec-note">${escH(note)}</span>` : ''}
        </span>
        <span class="sec-meta">
          <span class="sec-badge" hidden></span>
          <span class="sec-count">${sec.items.length} ${sec.items.length === 1 ? 'dish' : 'dishes'}</span>
          <span class="sec-chev"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg></span>
        </span>
      </button>
      <div class="sec-body"><div class="sec-inner">${sec.items.map(it => dishHTML(it, diet, id)).join('')}</div></div>
    </div>`;
}

const STEP_INFO = [
  { title: 'Starters', next: 'Continue to Mains',  search: 'Search starters' },
  { title: 'Mains',    next: 'Continue to Extras', search: 'Search mains' },
  { title: 'Extras',   next: 'Review Order',       search: 'Search extras' },
];

function buildMenus() {
  const starters = menuData[0].sections;
  const steps = [
    [ { label: 'Veg', diet: 'veg', sections: starters.filter(s => s.type === 'VEG') },
      { label: 'Non-Veg', diet: 'nonveg', sections: starters.filter(s => s.type === 'NON-VEG') } ],
    [ { label: 'Veg', diet: 'veg', sections: menuData[1].sections },
      { label: 'Non-Veg', diet: 'nonveg', sections: menuData[2].sections } ],
    menuData.slice(3).map(c => ({ label: titleCase(c.name), sections: c.sections })),
  ];

  $('menus').innerHTML = steps.map((tabs, i) => {
    const n = i + 1, info = STEP_INFO[i];
    const segmented = tabs.length === 2;
    return `
    <section id="menu-${n}" class="screen menu">
      <div class="menu-head"><div class="menu-head-inner">
        <div class="menu-head-row">
          <button type="button" class="back-btn" data-act="go" data-to="ch-${n}">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/></svg>
            <span>Back</span>
          </button>
          <div class="menu-title"><span class="menu-step">Step ${n} of 3</span><h2>${info.title}</h2></div>
          <div class="mini-dots">${[1, 2, 3].map(k => `<span class="${k < n ? 'done' : k === n ? 'active' : ''}"></span>`).join('')}</div>
        </div>
        <div class="menu-tools">
        <label class="search">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7.500"/><path stroke-linecap="round" d="M20.500 20.500l-4-4"/></svg>
          <input class="search-input" type="text" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="${info.search}" aria-label="${info.search}"/>
          <button type="button" class="search-clear" data-act="search-clear" aria-label="Clear search" hidden>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </label>
        <div class="tabs ${segmented ? 'seg' : 'chips'}">
          ${tabs.map((t, k) => `<button type="button" class="tab${k === 0 ? ' on' : ''}" data-act="tab" data-i="${k}">${t.diet ? mark(t.diet, 20) : ''}${escH(t.label)}</button>`).join('')}
        </div>
        </div>
      </div></div>
      <div class="menu-body">
        ${tabs.map((t, k) => `<div class="tab-panel${k === 0 ? ' on' : ''}">${t.sections.map(s => sectionHTML(s, t.diet)).join('')}</div>`).join('')}
        <p class="empty" hidden>No dishes match your search.</p>
        <button type="button" class="menu-next" data-act="continue">${info.next}
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.500"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    </section>`;
  }).join('');
}

/* ---------- Cart ---------- */
let cart = [];

function cardSel(card) {
  const id = Number(card.dataset.id);
  const s  = card.querySelector('.opts[data-kind="size"] .opt.on');
  const st = card.querySelector('.opts[data-kind="style"] .opt.on');
  const size = s ? s.dataset.val : '';
  const style = st ? st.dataset.val : '';
  const price = s ? Number(s.dataset.price) : Number(ITEMS[id].item.p);
  return { id, size, style, price, key: `${id}|${size}|${style}` };
}

function changeQty(sel, delta) {
  let line = cart.find(c => c.key === sel.key);
  if (!line && delta > 0) {
    line = { key: sel.key, id: sel.id, name: ITEMS[sel.id].item.n, size: sel.size, style: sel.style, price: sel.price, qty: 0, comment: '' };
    cart.push(line);
  }
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter(c => c !== line);
  renderCart();
}

const stepperHTML = qty => `<div class="stepper"><button type="button" data-act="dec" aria-label="Remove one">−</button><span>${qty}</span><button type="button" data-act="inc" aria-label="Add one">+</button></div>`;

function refreshCard(card) {
  const sel = cardSel(card);
  const line = cart.find(c => c.key === sel.key);
  const qty = line ? line.qty : 0;
  card.querySelector('.dish-price').textContent = fmt(sel.price);
  const ctl = card.querySelector('.dish-ctl');
  if (Number(ctl.dataset.qty || 0) !== qty) {
    ctl.dataset.qty = qty;
    ctl.innerHTML = qty > 0 ? stepperHTML(qty) : '<button type="button" class="add-btn" data-act="inc" aria-label="Add">+</button>';
  }
  card.classList.toggle('in-cart', cart.some(c => c.id === sel.id));
}

function renderCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

  document.querySelectorAll('.dish').forEach(refreshCard);

  const perSec = {};
  cart.forEach(c => { const s = ITEMS[c.id].sec; perSec[s] = (perSec[s] || 0) + c.qty; });
  document.querySelectorAll('.sec').forEach(sec => {
    const n = perSec[sec.dataset.sec] || 0;
    const badge = sec.querySelector('.sec-badge');
    badge.hidden = !n;
    badge.textContent = n;
  });

  const bc = $('bar-count');
  if (bc.textContent !== String(count)) { bc.classList.remove('bump'); void bc.offsetWidth; bc.classList.add('bump'); }
  bc.textContent = count;
  bc.hidden = !count;
  $('bar-total').textContent = fmt(total);
  $('bar').classList.toggle('has-items', count > 0);
  $('modal-total').textContent = fmt(total);

  $('cart-items-list').innerHTML = cart.length ? cart.map(c => `
    <div class="line" data-key="${escH(c.key)}">
      <div class="line-top">
        <div class="line-info">${mark(ITEMS[c.id].diet)}
          <div><div class="line-name">${escH(c.name)}</div>
          ${c.size || c.style ? `<div class="line-sub">${escH([c.size, c.style].filter(Boolean).join(' · '))}</div>` : ''}</div>
        </div>
        <div class="line-price">${fmt(c.price * c.qty)}</div>
      </div>
      <div class="line-bottom">
        <input class="note" type="text" placeholder="Add a note (e.g. no onions)" value="${escH(c.comment)}" aria-label="Note for ${escH(c.name)}"/>
        <div class="stepper"><button type="button" data-act="cart-dec" aria-label="Remove one">−</button><span>${c.qty}</span><button type="button" data-act="cart-inc" aria-label="Add one">+</button></div>
        <button type="button" class="line-del" data-act="cart-del" aria-label="Remove ${escH(c.name)}">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
        </button>
      </div>
    </div>`).join('') : '<div class="cart-empty">Nothing here yet. Add dishes from the menu.</div>';
}

function openCart() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  if (!$('order-date').value) $('order-date').value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  if (!$('order-time-now').value) $('order-time-now').value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  $('cart-modal').classList.add('open');
  $('cart-modal').setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}
function closeCart() {
  $('cart-modal').classList.remove('open');
  $('cart-modal').setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
}

function placeOrder() {
  if (!cart.length) { alert('Please add some dishes to your order first.'); return; }
  const nameInput = $('cust-name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.classList.add('invalid');
    nameInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
    nameInput.focus({ preventScroll: true });
    return;
  }
  const date = $('order-date').value;
  const orderTime = $('order-time-now').value;
  const serveTime = $('order-time').value;
  const pax = $('cust-people').value || '1';
  const type = document.querySelector('.order-type-btn.active')?.textContent.trim() || 'Dine In';
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

  const lines = [
    '*USC PREMIUM ORDER*',
    '--------------------------',
    `👤 *Customer:* ${name}`,
    `👥 *Pax:* ${pax}`,
    `${type === 'Takeaway' ? '🥡' : '🍽'} *Order Type:* ${type}`,
  ];
  if (date) { const d = date.split('-'); lines.push(`📅 *Date:* ${d[2]}/${d[1]}/${d[0]}`); }
  if (orderTime) lines.push(`🕐 *Order Time:* ${orderTime}`);
  if (serveTime) lines.push(`⏰ *Serving Time:* ${serveTime}`);
  lines.push('--------------------------', '', '*ITEMS ORDERED:*');
  cart.forEach(c => {
    let l = `✅ ${c.qty}x ${c.name}`;
    if (c.size) l += ` (${c.size})`;
    if (c.style) l += ` - ${c.style}`;
    l += ` — ${fmt(c.price * c.qty)}`;
    lines.push(l);
    if (c.comment.trim()) lines.push(`   _Note: ${c.comment.trim()}_`);
  });
  lines.push('', `💰 *Grand Total: ${fmt(total)}*`);

  window.open(`https://wa.me/${WHATSAPP_NO}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
}

/* ---------- Search ---------- */
function applySearch(menu, raw) {
  const q = raw.trim().toLowerCase();
  menu.classList.toggle('searching', !!q);
  menu.querySelector('.search-clear').hidden = !raw;
  let any = false;
  menu.querySelectorAll('.sec').forEach(sec => {
    const whole = q && sec.dataset.title.includes(q);
    let hits = 0;
    sec.querySelectorAll('.dish').forEach(d => {
      const ok = !q || whole || d.dataset.name.includes(q);
      d.classList.toggle('miss', !ok);
      if (ok) hits++;
    });
    sec.classList.toggle('no-hit', !!q && !hits);
    if (hits) any = true;
  });
  menu.querySelector('.empty').hidden = !q || any;
}
function clearSearch(menu) {
  const input = menu.querySelector('.search-input');
  if (input.value || menu.classList.contains('searching')) { input.value = ''; applySearch(menu, ''); }
}

/* ---------- Navigation ---------- */
let current = null;
let navTimer = null;

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'leaving'));
  document.querySelectorAll('.menu').forEach(clearSearch);
  const isChapter = id.startsWith('ch-');
  document.body.classList.toggle('ch-mode', isChapter);
  $(id).classList.add('active');
  window.scrollTo(0, 0);
}

function go(id, push = true) {
  if (!$(id) || (id === current && !navTimer)) return;
  clearTimeout(navTimer);
  const from = current && $(current);
  if (from) from.classList.add('leaving');
  current = id;
  if (push) history.pushState({ s: id }, '');
  navTimer = setTimeout(() => { navTimer = null; show(id); }, from ? 200 : 0);
}

window.addEventListener('popstate', e => {
  if ($('cart-modal').classList.contains('open')) closeCart();
  go((e.state && e.state.s) || 'ch-1', false);
});

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  if (e.target.id === 'cart-modal') { closeCart(); return; }
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const card = el.closest('.dish');
  const line = el.closest('.line');
  const lineSel = () => cart.find(c => c.key === line.dataset.key);

  switch (act) {
    case 'go': go(el.dataset.to); break;
    case 'continue': {
      const n = Number(current.split('-')[1]);
      if (n < 3) go(`ch-${n + 1}`); else openCart();
      break;
    }
    case 'tab': {
      const menu = el.closest('.menu');
      clearSearch(menu);
      const i = Number(el.dataset.i);
      menu.querySelectorAll('.tab').forEach((t, k) => t.classList.toggle('on', k === i));
      menu.querySelectorAll('.tab-panel').forEach((p, k) => p.classList.toggle('on', k === i));
      el.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
      break;
    }
    case 'sec': {
      const open = el.parentElement.classList.toggle('open');
      el.setAttribute('aria-expanded', open);
      break;
    }
    case 'opt':
      el.parentElement.querySelectorAll('.opt').forEach(o => o.classList.toggle('on', o === el));
      refreshCard(card);
      break;
    case 'inc': changeQty(cardSel(card), 1); break;
    case 'dec': changeQty(cardSel(card), -1); break;
    case 'cart-inc': changeQty(lineSel(), 1); break;
    case 'cart-dec': changeQty(lineSel(), -1); break;
    case 'cart-del': cart = cart.filter(c => c.key !== line.dataset.key); renderCart(); break;
    case 'cart-open': openCart(); break;
    case 'cart-close': closeCart(); break;
    case 'clear':
      if (cart.length && confirm('Clear your entire order?')) { cart = []; renderCart(); }
      break;
    case 'order': placeOrder(); break;
    case 'otype':
      document.querySelectorAll('.order-type-btn').forEach(b => b.classList.toggle('active', b === el));
      break;
    case 'search-clear': {
      const menu = el.closest('.menu');
      clearSearch(menu);
      menu.querySelector('.search-input').focus();
      break;
    }
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.classList.contains('search-input')) applySearch(t.closest('.menu'), t.value);
  else if (t.classList.contains('note')) {
    const line = cart.find(c => c.key === t.closest('.line').dataset.key);
    if (line) line.comment = t.value;
  } else if (t.id === 'cust-name') t.classList.remove('invalid');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('cart-modal').classList.contains('open')) closeCart();
});

/* ---------- Auth ---------- */
let sb = null;

function navUserBar(name, isMember) {
  const initial = escH((name || '?')[0].toUpperCase());
  return `<div class="usc-account">
    <div class="usc-chip">
      <div class="usc-avatar${isMember ? ' is-member' : ''}">${initial}</div>
      <span class="usc-chip-name">${escH(name)}</span>
      <div class="usc-chip-sep"></div>
      <span class="usc-chip-role ${isMember ? 'member' : 'guest'}">${isMember ? 'Member' : 'Guest'}</span>
    </div>
    <button class="usc-logout" id="signout-btn" title="Sign out" aria-label="Sign out">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    </button>
  </div>`;
}

async function initAuth() {
  const navRight = document.querySelector('.usc-nav-right');
  if (!window.supabase || !navRight) return;
  try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      navRight.innerHTML = '<a href="../index.html" class="usc-back-link">Sign In</a>';
      return;
    }
    const user = session.user;
    const name = user.user_metadata?.first_name || user.email.split('@')[0];
    navRight.innerHTML = navUserBar(name, false);
    const { data: profile } = await sb.from('profiles').select('first_name, is_member').eq('id', user.id).single();
    if (profile) navRight.innerHTML = navUserBar(profile.first_name || name, !!profile.is_member);
  } catch (err) {
    console.warn('Auth unavailable', err);
  }
}

document.addEventListener('click', async e => {
  if (!e.target.closest('#signout-btn') || !sb) return;
  await sb.auth.signOut();
  window.location.href = '../index.html';
});

/* ---------- Init ---------- */
function init() {
  try {
    buildMenus();
    renderCart();
  } catch (err) {
    console.error('Menu failed to build', err);
  }
  initAuth();
  history.replaceState({ s: 'ch-1' }, '');
  setTimeout(() => {
    $('splash').classList.add('hidden');
    setTimeout(() => $('splash').remove(), 700);
    go('ch-1', false);
  }, 1500);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
