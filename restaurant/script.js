["gesturestart", "gesturechange"].forEach(t => document.addEventListener(t, e => e.preventDefault()));
/* USC Restaurant — guided ordering. Menu content lives in menu-data.js. */

const SUPABASE_URL  = 'https://itzfanrkpvpfucgkbkff.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZhbnJrcHZwZnVjZ2tia2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTk1NjgsImV4cCI6MjEwOTA5NTU2OH0.e1BzYQDZUxQUv4I1vrAGyRXwrUlel0zubrTkRXJPSeM';

const $ = id => document.getElementById(id);
const fmt = n => 'KES ' + Number(n).toLocaleString('en-US');
const escH = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const titleCase = s => s.toLowerCase().replace(/(^|[\s(&/-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const ARROW = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>';
const BACK_ARROW = '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4"><path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6"/></svg>';

/* Veg / non-veg icons: "leaf" and "drumstick-bite" from Font Awesome Free 6.5.1
   by @fontawesome — https://fontawesome.com — License: CC BY 4.0 (https://fontawesome.com/license/free) */
const ICON_PATHS = {
  veg: 'M272 96c-78.6 0-145.1 51.5-167.7 122.5c33.6-17 71.5-26.5 111.7-26.5h88c8.8 0 16 7.2 16 16s-7.2 16-16 16H288 216s0 0 0 0c-16.6 0-32.7 1.9-48.3 5.4c-25.9 5.9-49.9 16.4-71.4 30.7c0 0 0 0 0 0C38.3 298.8 0 364.9 0 440v16c0 13.3 10.7 24 24 24s24-10.7 24-24V440c0-48.7 20.7-92.5 53.8-123.2C121.6 392.3 190.3 448 272 448l1 0c132.1-.7 239-130.9 239-291.4c0-42.6-7.5-83.1-21.1-119.6c-2.6-6.9-12.7-6.6-16.2-.1C455.9 72.1 418.7 96 376 96L272 96z',
  nonveg: 'M160 265.2c0 8.5-3.4 16.6-9.4 22.6l-26.8 26.8c-12.3 12.3-32.5 11.4-49.4 7.2C69.8 320.6 65 320 60 320c-33.1 0-60 26.9-60 60s26.9 60 60 60c6.3 0 12 5.7 12 12c0 33.1 26.9 60 60 60s60-26.9 60-60c0-5-.6-9.8-1.8-14.5c-4.2-16.9-5.2-37.1 7.2-49.4l26.8-26.8c6-6 14.1-9.4 22.6-9.4H336c6.3 0 12.4-.3 18.5-1c11.9-1.2 16.4-15.5 10.8-26c-8.5-15.8-13.3-33.8-13.3-53c0-61.9 50.1-112 112-112c8 0 15.7 .8 23.2 2.4c11.7 2.5 24.1-5.9 22-17.6C494.5 62.5 422.5 0 336 0C238.8 0 160 78.8 160 176v89.2z',
};
function mark(diet, size = 15) {
  const veg = diet === 'veg';
  return `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 512 512" fill="currentColor" role="img" aria-label="${veg ? 'Vegetarian' : 'Non-vegetarian'}"><path d="${ICON_PATHS[veg ? 'veg' : 'nonveg']}"/></svg>`;
}

function dietOf(name, fallback) {
  if (/egg ?plant|soya/i.test(name)) return 'veg';
  if (/\b(eggs?|mutton|chicken|fish|prawns?|shrimp|lamb|khima|kheema)\b/i.test(name)) return 'nonveg';
  return fallback;
}

/* ---------- Data ---------- */
const STEPS = [
  { title: 'Starters', next: 'Continue to Mains',  skip: 'Skip to Mains' },
  { title: 'Mains',    next: 'Continue to Extras', skip: 'Skip to Extras' },
  { title: 'Extras',   next: 'Review Order',       skip: 'Review Order' },
];
const STEP_KEYS = ['starters', 'mains', 'extras'];
const ITEMS = [];
const SECS = [];
const SEL = {};

/* Sub-type shortcuts shown under the category tiles when at least two dishes match. */
const TAG_IMG = { Kebabs: 'images/menu/type-kebabs' };
const TAGS = [
  ['Kebabs', /kebab|mishakiki|boti/i], ['Wings', /wings/i], ['Sausages', /sausage/i], ['Lollipops', /lollipop/i],
  ['Samosas', /samosa/i], ['Tikka & Tandoori', /tikka|tandoori/i], ['Chilly', /chill?[yi]/i], ['Pousin', /pousin/i],
  ['Paneer', /paneer/i], ['Egg', /\beggs?\b/i], ['Chapati', /chapati/i], ['Cheese', /cheese/i],
  ['Tea & Coffee', /\btea\b|coffee|\bmilk\b/i], ['Butter', /butter|makhni/i], ['Masala', /masala/i], ['Paka', /\bpaka\b/i],
  ['Karai & Handi', /karai|handi/i], ['Khima', /khima|kheema/i], ['Methi & Palak', /methi|palak/i], ['Mushroom', /mushroom/i],
  ['Aloo', /aloo|potato|bateta/i], ['Daal', /daal/i], ['Kienyeji', /kienyeji/i], ['Boneless', /boneless/i],
  ['King Prawns', /\(king\)|king prawn/i], ['Queen Prawns', /\(queen\)|queen prawn/i], ['Prawns', /prawn|shrimp/i],
];

function buildData() {
  const add = (step, group, sec, catName) => {
    const m = sec.name.match(/^([^(]+)\((.+)\)\s*$/);
    let title = titleCase(m ? m[1].trim() : sec.name);
    let note = m ? m[2].trim() : '';
    if (note && note === note.toUpperCase()) note = titleCase(note);
    if (title === 'Other' && catName) title = 'More ' + titleCase(catName);
    const s = { id: SECS.length, step, group, title, note, ids: [] };
    sec.items.forEach(item => {
      s.ids.push(ITEMS.length);
      ITEMS.push({ item, diet: dietOf(item.n, group === 'nonveg' ? 'nonveg' : 'veg'), sec: s.id });
    });
    SECS.push(s);
  };
  menuData[0].sections.forEach(s => add(1, s.type === 'VEG' ? 'veg' : 'nonveg', s));
  menuData[1].sections.forEach(s => add(2, 'veg', s));
  menuData[2].sections.forEach(s => add(2, 'nonveg', s));
  menuData.slice(3).forEach(c => c.sections.forEach(s => add(3, 'all', s, c.name)));

  const base = s => `${STEP_KEYS[s.step - 1]}-${slugify(s.title)}`;
  const counts = {};
  SECS.forEach(s => { counts[base(s)] = (counts[base(s)] || 0) + 1; });
  SECS.forEach(s => { s.img = 'images/menu/' + base(s) + (counts[base(s)] > 1 && s.note ? '-' + slugify(s.note) : ''); });
}

const groupSecs = (step, group) => SECS.filter(s => s.step === step && s.group === group);
const groupIds = (step, group) => groupSecs(step, group).flatMap(s => s.ids);
const groupName = (step, group) => (group === 'veg' ? 'Veg ' : group === 'nonveg' ? 'Non-Veg ' : '') + STEPS[step - 1].title;

function tagsFor(step, group) {
  const ids = groupIds(step, group);
  const titles = groupSecs(step, group).map(s => s.title.toLowerCase());
  return TAGS.map(([label, re], k) => ({ k, label, ids: ids.filter(id => re.test(ITEMS[id].item.n)) }))
    .filter(t => t.ids.length >= 2 && t.ids.length < ids.length && !titles.includes(t.label.toLowerCase()))
    .sort((a, b) => b.ids.length - a.ids.length)
    .slice(0, 8);
}

/* ---------- Images (optional photos dropped into images/menu/) ---------- */
const IMG_FALLBACK = { 'images/menu/starters-veg': 'images/chips.webp', 'images/menu/mains-veg': 'images/paneermakhni.webp', 'images/menu/starters-chips': 'images/chips.webp' };
const imgCache = new Map();
const CUTOUT = new Set(['starters-poultry', 'starters-mutton', 'starters-lamb-chop', 'starters-fish', 'type-kebabs', 'starters-breakfast', 'starters-sandwiches', 'starters-paneer-starters', 'starters-chapatis', 'starters-bhajia', 'starters-potatoes', 'starters-chips']);
function probe(base) {
  if (!imgCache.has(base)) {
    imgCache.set(base, new Promise(resolve => {
      const exts = ['webp', 'png', 'jpg', 'jpeg'];
      const img = new Image();
      let i = 0;
      const next = () => {
        if (i >= exts.length) return resolve(IMG_FALLBACK[base] || null);
        const url = `${base}.${exts[i++]}`;
        img.onload = () => resolve(url);
        img.onerror = next;
        img.src = url;
      };
      next();
    }));
  }
  return imgCache.get(base);
}
function hydrateImages(root) {
  root.querySelectorAll('[data-img]').forEach(el => probe(el.dataset.img).then(url => {
    if (!url || !el.isConnected) return;
    el.style.backgroundImage = `url("${url}")`;
    el.classList.add('has-img');
    if (CUTOUT.has(el.dataset.img.split('/').pop())) el.classList.add('cutout');
  }));
}

/* ---------- Dish rows ---------- */
const ADD_BTN = '<button type="button" class="add-btn" data-act="inc" aria-label="Add">+</button>';
const stepperHTML = qty => `<div class="stepper"><button type="button" data-act="dec" aria-label="Remove one">−</button><span>${qty}</span><button type="button" data-act="inc" aria-label="Add one">+</button></div>`;

function dishHTML(id) {
  const { item, diet } = ITEMS[id];
  const sizes = item.sizes ? Object.entries(item.sizes) : [];
  const styles = (item.styles || []).map(s => [s, null]);
  const sel = SEL[id] || {};
  const opts = (kind, list, chosen) => list.length ? `<div class="opts" data-kind="${kind}">${list.map(([label, p], i) =>
    `<button type="button" class="opt${(chosen ? chosen === label : i === 0) ? ' on' : ''}" data-act="opt" data-val="${escH(label)}"${p != null ? ` data-price="${p}"` : ''}>${escH(label)}</button>`).join('')}</div>` : '';
  return `
    <div class="dish" data-id="${id}" data-name="${escH(item.n.toLowerCase())}">
      <div class="dish-main">
        <div class="dish-title">${mark(diet)}<span class="dish-name">${escH(item.n)}</span></div>
        ${opts('size', sizes, sel.size)}${opts('style', styles, sel.style)}
      </div>
      <div class="dish-side">
        <div class="dish-price"></div>
        <div class="dish-ctl" data-qty="0">${ADD_BTN}</div>
      </div>
    </div>`;
}

function cardSel(card) {
  const id = Number(card.dataset.id);
  const s  = card.querySelector('.opts[data-kind="size"] .opt.on');
  const st = card.querySelector('.opts[data-kind="style"] .opt.on');
  const size = s ? s.dataset.val : '';
  const style = st ? st.dataset.val : '';
  const price = s ? Number(s.dataset.price) : Number(ITEMS[id].item.p);
  return { id, size, style, price, key: `${id}|${size}|${style}` };
}

function refreshCard(card) {
  const sel = cardSel(card);
  const line = cart.find(c => c.key === sel.key);
  const qty = line ? line.qty : 0;
  card.querySelector('.dish-price').textContent = fmt(sel.price);
  const ctl = card.querySelector('.dish-ctl');
  if (Number(ctl.dataset.qty) !== qty) {
    ctl.dataset.qty = qty;
    ctl.innerHTML = qty > 0 ? stepperHTML(qty) : ADD_BTN;
  }
  card.classList.toggle('in-cart', cart.some(c => c.id === sel.id));
}

/* ---------- Stage screens ---------- */
const parse = route => { const p = route.split('-'); return { type: p[0], a: p[1], b: p[2], c: p[3] }; };
const stepOf = route => { const r = parse(route); return r.type === 'sec' ? SECS[Number(r.a)].step : Number(r.a); };
function parentOf(route) {
  const r = parse(route);
  if (r.type === 'pick') return `ch-${r.a}`;
  if (r.type === 'cats') return r.b === 'all' ? `ch-${r.a}` : `pick-${r.a}`;
  if (r.type === 'sec') { const s = SECS[Number(r.a)]; return `cats-${s.step}-${s.group}`; }
  if (r.type === 'tag') return `cats-${r.a}-${r.b}`;
  if (r.type === 'order') return lastMenu;
  if (r.type === 'otype') return 'order';
  if (r.type === 'odetails') return 'otype';
  return 'ch-1';
}

function headHTML(route, eyebrow, title) {
  const n = stepOf(route);
  return `
    <div class="stage-head">
      <button type="button" class="back-btn" data-act="back">${BACK_ARROW}<span>Back</span></button>
      <div class="menu-title"><span class="menu-step">${escH(eyebrow)}</span><h2>${escH(title)}</h2></div>
      <div class="mini-dots">${[1, 2, 3].map(k => `<span class="${k < n ? 'done' : k === n ? 'active' : ''}"></span>`).join('')}</div>
    </div>`;
}
const searchHTML = label => `
  <label class="search">
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7.5"/><path stroke-linecap="round" d="M20.5 20.5l-4-4"/></svg>
    <input class="search-input" type="text" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="${escH(label)}" aria-label="${escH(label)}"/>
    <button type="button" class="search-clear" data-act="search-clear" aria-label="Clear search" hidden>
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  </label>`;
const footHTML = (n, extra = '', label) => `
  <div class="stage-foot">${extra}
    <button type="button" class="menu-next" data-act="continue">${label || STEPS[n - 1].next}${ARROW}</button>
  </div>`;

function pickHTML(route) {
  const n = stepOf(route);
  const card = group => {
    const secs = groupSecs(n, group);
    const dishes = secs.reduce((t, s) => t + s.ids.length, 0);
    return `
      <button type="button" class="pick-card" data-act="go" data-to="cats-${n}-${group}">
        <span class="pick-art" data-img="images/menu/${STEP_KEYS[n - 1]}-${group}"><span class="pick-art-ico">${mark(group, 44)}</span></span>
        <span class="pick-info">
          <span class="pick-name">${mark(group, 16)}${group === 'veg' ? 'Veg' : 'Non-Veg'}</span>
          <span class="pick-sub">${plural(secs.length, 'category', 'categories')} · ${plural(dishes, 'dish', 'dishes')}</span>
        </span>
      </button>`;
  };
  return headHTML(route, `Step ${n} of 3`, STEPS[n - 1].title) + `
    <div class="stage-body">
      <h3 class="stage-lead">Veg or Non-Veg?</h3>
      <div class="pick-grid">${card('veg')}${card('nonveg')}</div>
      ${footHTML(n, '', STEPS[n - 1].skip)}
    </div>`;
}

function inCartCount(ids) {
  return cart.reduce((t, c) => t + (ids.includes(c.id) ? c.qty : 0), 0);
}

function catsHTML(route) {
  const r = parse(route), n = Number(r.a), group = r.b;
  const secs = groupSecs(n, group);
  const tags = group === 'all' ? [] : tagsFor(n, group);
  const other = group === 'veg' ? 'nonveg' : 'veg';
  const tiles = secs.map(s => {
    const q = inCartCount(s.ids);
    return `
      <button type="button" class="tile" data-act="go" data-to="sec-${s.id}" data-sec="${s.id}">
        <span class="tile-bg" data-img="${s.img}"></span>
        ${group !== 'all' ? `<span class="tile-ico">${mark(group, 64)}</span>` : ''}
        <span class="tile-badge"${q ? '' : ' hidden'}>${q}</span>
        <span class="tile-text">
          <span class="tile-name">${escH(s.title)}</span>
          <span class="tile-count">${s.note && s.note.length < 22 ? escH(s.note) + ' · ' : ''}${plural(s.ids.length, 'dish', 'dishes')}</span>
        </span>
      </button>`;
  }).join('');
  return headHTML(route, `Step ${n} of 3`, groupName(n, group)) + `
    <div class="stage-body">
      ${searchHTML('Search ' + STEPS[n - 1].title.toLowerCase())}
      <div class="browse">
        <div class="tile-grid${secs.length <= 4 ? ' few' : ''}">${tiles}</div>
        ${tags.length ? `
        <div class="type-block">
          <div class="type-title">Or browse by type</div>
          <div class="type-chips">${tags.map(t => `<button type="button" class="type-chip" data-act="go" data-to="tag-${n}-${group}-${t.k}">${TAG_IMG[t.label] ? `<i class="chip-img" data-img="${TAG_IMG[t.label]}"></i>` : ''}${escH(t.label)}<span>${t.ids.length}</span></button>`).join('')}</div>
        </div>` : ''}
      </div>
      <div class="dish-list results" hidden></div>
      <p class="empty" hidden>No dishes match your search.</p>
      ${footHTML(n, group !== 'all' ? `<button type="button" class="ghost-btn" data-act="go" data-to="cats-${n}-${other}">${mark(other, 14)}Switch to ${groupName(n, other)}</button>` : '')}
    </div>`;
}

function listHTML(route) {
  const r = parse(route);
  let n, group, title, note = '', ids;
  if (r.type === 'sec') {
    const s = SECS[Number(r.a)];
    n = s.step; group = s.group; title = s.title; note = s.note; ids = s.ids;
  } else {
    n = Number(r.a); group = r.b;
    const [label, re] = TAGS[Number(r.c)];
    title = label;
    ids = groupIds(n, group).filter(id => re.test(ITEMS[id].item.n));
  }
  return headHTML(route, groupName(n, group), title) + `
    <div class="stage-body">
      ${note ? `<p class="stage-note">${escH(note)}</p>` : ''}
      ${ids.length > 8 ? searchHTML('Search ' + title.toLowerCase()) : ''}
      <div class="dish-list">${ids.map(dishHTML).join('')}</div>
      <p class="empty" hidden>No dishes match your search.</p>
      ${footHTML(n, `<button type="button" class="ghost-btn" data-act="back">${BACK_ARROW}More ${groupName(n, group)}</button>`)}
    </div>`;
}

function renderStage(route) {
  const stage = $('stage');
  const type = parse(route).type;
  stage.innerHTML = FLOW[type] ? FLOW[type]() : type === 'pick' ? pickHTML(route) : type === 'cats' ? catsHTML(route) : listHTML(route);
  stage.querySelectorAll('.dish').forEach(refreshCard);
  if (type === 'order') paintOrder(true);
  if ((type === 'otype' || type === 'odetails') && !cart.length) { stage.innerHTML = FLOW.order(); paintOrder(true); }
  hydrateImages(stage);
}

/* ---------- Search ---------- */
function applySearch(raw) {
  const stage = $('stage');
  const q = raw.trim().toLowerCase();
  stage.querySelector('.search-clear').hidden = !raw;
  const empty = stage.querySelector('.empty');
  const results = stage.querySelector('.results');
  if (results) {
    const n = stepOf(current);
    const ids = q ? ITEMS.map((it, id) => id).filter(id => SECS[ITEMS[id].sec].step === n && ITEMS[id].item.n.toLowerCase().includes(q)) : [];
    stage.querySelector('.browse').hidden = !!q;
    results.hidden = !q || !ids.length;
    results.innerHTML = ids.map(dishHTML).join('');
    results.querySelectorAll('.dish').forEach(refreshCard);
    empty.hidden = !q || ids.length > 0;
  } else {
    let hits = 0;
    stage.querySelectorAll('.dish').forEach(d => {
      const ok = !q || d.dataset.name.includes(q);
      d.classList.toggle('miss', !ok);
      if (ok) hits++;
    });
    empty.hidden = hits > 0;
  }
}

/* ---------- Cart ---------- */
let cart = [];

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

function renderCart() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

  document.querySelectorAll('.dish').forEach(refreshCard);
  document.querySelectorAll('.tile[data-sec]').forEach(tile => {
    const q = inCartCount(SECS[Number(tile.dataset.sec)].ids);
    const badge = tile.querySelector('.tile-badge');
    badge.hidden = !q;
    badge.textContent = q;
  });

  const bc = $('bar-count');
  if (bc.textContent !== String(count)) { bc.classList.remove('bump'); void bc.offsetWidth; bc.classList.add('bump'); }
  bc.textContent = count;
  bc.hidden = !count;
  $('bar-total').textContent = fmt(total);
  $('bar').classList.toggle('has-items', count > 0);
  if (current === 'order') paintOrder();
}

function orderLinesHTML() {
  return cart.length ? cart.map((c, i) => `
    <div class="line oline" data-key="${escH(c.key)}" style="--i:${i}">
      <div class="line-top">
        <div class="line-info">${mark(ITEMS[c.id].diet)}
          <div><div class="line-name">${escH(c.name)}</div>
          ${c.size || c.style ? `<div class="line-sub">${escH([c.size, c.style].filter(Boolean).join(' · '))}</div>` : ''}</div>
        </div>
        <div class="line-price">${fmt(c.price * c.qty)}</div>
      </div>
      <div class="line-bottom">
        <div class="stepper"><button type="button" data-act="cart-dec" aria-label="Remove one">−</button><span>${c.qty}</span><button type="button" data-act="cart-inc" aria-label="Add one">+</button></div>
        <button type="button" class="line-del" data-act="cart-del" aria-label="Remove ${escH(c.name)}">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
        </button>
      </div>
      <textarea class="note" rows="1" maxlength="160" placeholder="Requests, e.g. no onions, no garlic" aria-label="Requests for ${escH(c.name)}">${escH(c.comment)}</textarea>
    </div>`).join('') : '<div class="cart-empty">Nothing here yet.</div>';
}

/* ---------- Order flow: notes → dine in / takeaway → details → sent ---------- */
const FLOW_ROUTES = ['order', 'otype', 'odetails', 'odone', 'loading'];
const ORDER = { type: null, name: '', phone: '', people: '2', time: '' };
let lastMenu = 'ch-1', busy = false, interTimer = null, lastOrder = null;
const cartTotal = () => cart.reduce((s, c) => s + c.qty * c.price, 0);
const cartCount = () => cart.reduce((s, c) => s + c.qty, 0);

const ICONS = {
  dine: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="24" cy="26" r="11"/><circle cx="24" cy="26" r="6.5" opacity=".45"/><path d="M6 8v9a3 3 0 006 0V8M9 17v23"/><path d="M42 8c-3 0-5 4-5 10v5h5V8zM42 23v17"/></svg>',
  take: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 16h28l-2.5 25h-23L10 16z"/><path d="M17 20v-6a7 7 0 0114 0v6"/><path d="M19 30l4 4 7-8" opacity=".55"/></svg>',
  check: '<svg viewBox="0 0 52 52" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle class="tick-ring" cx="26" cy="26" r="23"/><path class="tick-mark" d="M15 27l7 7 15-16"/></svg>',
};

const flowHead = (title, back = true) => `
  <div class="stage-head">
    ${back ? `<button type="button" class="back-btn" data-act="back">${BACK_ARROW}<span>Back</span></button>` : '<span></span>'}
    <div class="menu-title"><h2>${escH(title)}</h2></div><span></span>
  </div>`;

function defaultTime() {
  const d = new Date(Date.now() + 30 * 60000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const FLOW = {
  order: () => flowHead('Your Order') + `
    <div class="stage-body flow-body">
      <div class="olist" id="olist">${orderLinesHTML()}</div>
      <div class="flow-foot" id="ofoot"></div>
    </div>`,
  otype: () => flowHead('How would you like it?') + `
    <div class="stage-body flow-body">
      <div class="type-grid">
        <button type="button" class="type-card" data-act="otype" data-type="dine_in" style="--i:0">
          <span class="type-ico">${ICONS.dine}</span><span class="type-name">Dine in</span><span class="type-sub">Served at the club</span>
        </button>
        <button type="button" class="type-card" data-act="otype" data-type="takeaway" style="--i:1">
          <span class="type-ico">${ICONS.take}</span><span class="type-name">Takeaway</span><span class="type-sub">Packed for collection</span>
        </button>
      </div>
    </div>`,
  odetails: () => {
    const dine = ORDER.type === 'dine_in';
    if (!ORDER.time) ORDER.time = defaultTime();
    const f = (k, label, type, extra = '') => `
      <div class="input-group${k === 'name' || k === 'phone' ? ' full-width' : ''}" style="--i:${['name', 'phone', 'people', 'time'].indexOf(k)}">
        <label for="f-${k}">${label}</label>
        <input id="f-${k}" data-f="${k}" class="modern-input" type="${type}" value="${escH(ORDER[k] || '')}" ${extra}/>
      </div>`;
    return flowHead(dine ? 'Dine in' : 'Takeaway') + `
      <div class="stage-body flow-body">
        <div class="customer-info-grid details">
          ${f('name', 'Name', 'text', 'autocomplete="name" maxlength="80" placeholder="Your name"')}
          ${f('phone', 'Phone', 'tel', 'autocomplete="tel" maxlength="20" placeholder="07xx xxx xxx"')}
          ${dine ? f('people', 'People', 'number', 'min="1" max="50" inputmode="numeric"') : ''}
          ${f('time', dine ? 'Serving time' : 'Collection time', 'time')}
        </div>
        <div class="flow-foot">
          <div class="flow-total"><span>${plural(cartCount(), 'item', 'items')}</span><b>${fmt(cartTotal())}</b></div>
          <button type="button" class="menu-next" data-act="send">Send order${ARROW}</button>
        </div>
      </div>`;
  },
  odone: () => {
    const o = lastOrder || {};
    return `
    <div class="stage-body flow-body done-body">
      <div class="done-tick">${ICONS.check}</div>
      <h2 class="done-title">Order sent</h2>
      <div class="done-no">Order #${escH(o.id ?? '')}</div>
      <div class="done-card">
        <div class="done-row"><span>${o.type === 'dine_in' ? 'Dine in' : 'Takeaway'}</span><b>${escH(o.time || '')}</b></div>
        <div class="done-row"><span>${escH(o.name || '')}</span><b>${fmt(o.total || 0)}</b></div>
      </div>
      <p class="done-note">The kitchen has your order.</p>
      <button type="button" class="ghost-btn" data-act="restart">Back to menu</button>
    </div>`;
  },
  loading: () => '',
};

function paintOrder(first) {
  const list = $('olist'), foot = $('ofoot');
  if (!list) return;
  if (!first) {
    list.innerHTML = orderLinesHTML();
    list.querySelectorAll('.oline').forEach(l => l.classList.add('still'));
  }
  foot.innerHTML = cart.length
    ? `<div class="flow-total"><span>${plural(cartCount(), 'item', 'items')}</span><b>${fmt(cartTotal())}</b></div>
       <button type="button" class="menu-next" data-act="to-type">Proceed${ARROW}</button>`
    : `<button type="button" class="menu-next" data-act="restart">Browse the menu${ARROW}</button>`;
}

function interlude(text, route) {
  if (busy) return;
  busy = true;
  const stage = $('stage');
  stage.classList.add('leaving');
  setTimeout(() => {
    stage.classList.remove('leaving');
    stage.dataset.route = 'loading';
    stage.innerHTML = `<div class="loader-screen"><svg class="loader-ring" viewBox="0 0 50 50"><circle cx="25" cy="25" r="21"/><circle class="fill" cx="25" cy="25" r="21"/></svg><div class="loader-text">${escH(text)}</div></div>`;
    stage.classList.remove('active'); void stage.offsetWidth; stage.classList.add('active');
    window.scrollTo(0, 0);
  }, 180);
  interTimer = setTimeout(() => { busy = false; route && go(route); }, 2000);
}

async function sendOrder() {
  if (busy) return;
  const fields = ['name', 'phone', 'time'].concat(ORDER.type === 'dine_in' ? ['people'] : []);
  const bad = fields.filter(k => !String(ORDER[k] || '').trim() || (k === 'phone' && String(ORDER.phone).replace(/\D/g, '').length < 9));
  if (bad.length) {
    bad.forEach(k => $('f-' + k)?.classList.add('invalid'));
    $('f-' + bad[0])?.focus();
    return;
  }
  const payload = {
    p_type: ORDER.type, p_name: ORDER.name.trim(), p_phone: ORDER.phone.trim(),
    p_people: ORDER.type === 'dine_in' ? Math.max(1, parseInt(ORDER.people, 10) || 1) : null,
    p_time: ORDER.time,
    p_items: cart.map(c => ({ name: c.name, size: c.size || null, style: c.style || null, qty: c.qty, price: c.price, note: c.comment.trim() || null })),
    p_total: cartTotal(),
  };
  const preview = new URLSearchParams(location.search).has('preview') && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  interlude('Sending your order', null);
  const started = Date.now();
  let id = null, err = null;
  try {
    if (preview) id = 'TEST';
    else {
      sb = sb || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
      const res = await sb.rpc('place_order', payload);
      if (res.error) err = res.error; else id = res.data;
    }
  } catch (x) { err = x; }
  setTimeout(() => {
    busy = false;
    if (err) { console.error(err); alert('Your order could not be sent. Please check your connection and try again.'); current = null; go('odetails', false); return; }
    lastOrder = { id, type: ORDER.type, name: payload.p_name, time: payload.p_time, total: payload.p_total };
    cart = []; ORDER.time = ''; renderCart();
    history.replaceState({ s: 'ch-1' }, '');
    go('odone');
  }, Math.max(0, 2000 - (Date.now() - started)));
}

/* ---------- Navigation ---------- */
let current = null;
let navTimer = null;
const elOf = route => route.startsWith('ch-') ? $(route) : $('stage');

function show(route) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'leaving'));
  const isChapter = route.startsWith('ch-');
  document.body.classList.toggle('ch-mode', isChapter);
  document.body.classList.toggle('flow-mode', FLOW_ROUTES.includes(parse(route).type));
  if (!isChapter && !FLOW_ROUTES.includes(parse(route).type)) lastMenu = route;
  $('stage').dataset.route = parse(route).type;
  const el = elOf(route);
  if (!isChapter) { renderStage(route); void el.offsetWidth; }
  el.classList.add('active');
  window.scrollTo(0, 0);
}

function go(route, push = true) {
  if (route === current && !navTimer) return;
  clearTimeout(navTimer);
  clearTimeout(interTimer);
  busy = false;
  const from = current && elOf(current);
  if (from) from.classList.add('leaving');
  current = route;
  if (push) history.pushState({ s: route }, '');
  navTimer = setTimeout(() => { navTimer = null; show(route); }, from ? 180 : 0);
}

window.addEventListener('popstate', e => {
  if (busy) { history.pushState({ s: current }, ''); return; }
  go((e.state && e.state.s) || 'ch-1', false);
});

/* ---------- Events ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const card = el.closest('.dish');
  const line = el.closest('.line');
  const lineSel = () => cart.find(c => c.key === line.dataset.key);

  switch (el.dataset.act) {
    case 'go': go(el.dataset.to); break;
    case 'back': go(parentOf(current)); break;
    case 'continue': {
      const n = stepOf(current);
      if (n < 3) go(`ch-${n + 1}`); else go('order');
      break;
    }
    case 'opt': {
      el.parentElement.querySelectorAll('.opt').forEach(o => o.classList.toggle('on', o === el));
      const sel = cardSel(card);
      SEL[sel.id] = { size: sel.size, style: sel.style };
      refreshCard(card);
      break;
    }
    case 'inc': changeQty(cardSel(card), 1); break;
    case 'dec': changeQty(cardSel(card), -1); break;
    case 'cart-inc': changeQty(lineSel(), 1); break;
    case 'cart-dec': changeQty(lineSel(), -1); break;
    case 'cart-del': cart = cart.filter(c => c.key !== line.dataset.key); renderCart(); break;
    case 'cart-open': go('order'); break;
    case 'to-type': if (cart.length) interlude('Getting things ready', 'otype'); break;
    case 'otype': ORDER.type = el.dataset.type; el.classList.add('chosen'); setTimeout(() => go('odetails'), 260); break;
    case 'send': sendOrder(); break;
    case 'restart': go('ch-1'); break;
    case 'search-clear': {
      const input = $('stage').querySelector('.search-input');
      input.value = '';
      applySearch('');
      input.focus();
      break;
    }
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.classList.contains('search-input')) applySearch(t.value);
  else if (t.classList.contains('note')) {
    const line = cart.find(c => c.key === t.closest('.line').dataset.key);
    if (line) line.comment = t.value;
    t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px';
  } else if (t.classList.contains('modern-input')) { t.classList.remove('invalid'); ORDER[t.dataset.f] = t.value; }
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
    sb = sb || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
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
    if (!ORDER.name) ORDER.name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || name;
    const { data: ph } = await sb.from('profiles').select('phone').eq('id', user.id).single();
    if (!ORDER.phone && ph?.phone) ORDER.phone = ph.phone;
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
/* Reorder: ?reorder=<order id> puts a past order (your own) back in the cart */
async function loadReorder(id) {
  try {
    sb = sb || window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return false;
    const { data: o } = await sb.from('restaurant_orders').select('items').eq('id', id).maybeSingle();
    let missing = 0;
    (o?.items || []).forEach(it => {
      const idx = ITEMS.findIndex(x => x.item.n === it.name);
      if (idx < 0) { missing++; return; }
      const item = ITEMS[idx].item;
      const size = it.size && item.sizes && it.size in item.sizes ? it.size : (item.sizes ? Object.keys(item.sizes)[0] : '');
      const style = it.style && (item.styles || []).includes(it.style) ? it.style : (item.styles ? item.styles[0] : '');
      const price = size ? Number(item.sizes[size]) : Number(item.p);
      const key = `${idx}|${size}|${style}`;
      const qty = Math.max(1, Math.min(20, it.qty | 0));
      const line = cart.find(c => c.key === key);
      if (line) line.qty += qty;
      else cart.push({ key, id: idx, name: item.n, size, style, price, qty, comment: it.note || '' });
    });
    renderCart();
    if (missing) setTimeout(() => alert(`${missing} item${missing > 1 ? 's are' : ' is'} no longer on the menu.`), 2000);
    return cart.length > 0;
  } catch (err) { console.warn('Reorder failed', err); return false; }
}

function init() {
  try {
    buildData();
    renderCart();
  } catch (err) {
    console.error('Menu failed to build', err);
  }
  initAuth();
  const rid = new URLSearchParams(location.search).get('reorder');
  const reorder = /^\d+$/.test(rid || '') ? loadReorder(Number(rid)) : Promise.resolve(false);
  history.replaceState({ s: 'ch-1' }, '');
  Promise.all([reorder, new Promise(r => setTimeout(r, 1500))]).then(([ok]) => {
    $('splash').classList.add('hidden');
    setTimeout(() => $('splash').remove(), 700);
    if (ok) { history.pushState({ s: 'order' }, ''); go('order', false); } else go('ch-1', false);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
