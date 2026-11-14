/* ============================================================
   USC RESTAURANT — CHAPTER/MENU EXPERIENCE
   ============================================================ */

const SUPABASE_URL  = 'https://itzfanrkpvpfucgkbkff.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZhbnJrcHZwZnVjZ2tia2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTk1NjgsImV4cCI6MjEwOTA5NTU2OH0.e1BzYQDZUxQUv4I1vrAGyRXwrUlel0zubrTkRXJPSeM';
const WHATSAPP_NO   = '254722850525';

let supabaseClient = null;

/* ============================================================
   MENU DATA
   ============================================================ */
const menuData = [
  {
    category: 'STARTERS',
    type: 'VEG',
    sections: [
      {
        name: 'BHAJIA',
        items: [
          { name: 'Potato Bhajia',   prices: { Half: 350, Full: 650 } },
          { name: 'Cassava Bhajia',  prices: { Half: 350, Full: 650 } },
          { name: 'Yam Bhajia',      prices: { Half: 350, Full: 650 } },
          { name: 'Mix Bhajia',      prices: { Half: 400, Full: 750 } },
        ]
      },
      {
        name: 'CHIPS',
        items: [
          { name: 'Plain Chips',     prices: { Half: 300, Full: 550 } },
          { name: 'Masala Chips',    prices: { Half: 350, Full: 650 } },
          { name: 'Chips Mayai',     prices: { Half: 450, Full: 800 } },
        ]
      },
      {
        name: 'PANEER',
        items: [
          { name: 'Paneer Tikka',    prices: { Half: 850, Full: 1500 } },
          { name: 'Paneer 65',       prices: { Half: 850, Full: 1500 } },
        ]
      },
    ]
  },
  {
    category: 'STARTERS',
    type: 'NON-VEG',
    sections: [
      {
        name: 'CHICKEN',
        items: [
          { name: 'Chicken Tikka',   prices: { Half: 850, Full: 1500 } },
          { name: 'Chicken 65',      prices: { Half: 850, Full: 1500 } },
          { name: 'Chicken Wings',   prices: { Half: 850, Full: 1500 } },
          { name: 'Chicken Lollipop',prices: { Half: 900, Full: 1600 } },
        ]
      },
      {
        name: 'SEEKH',
        items: [
          { name: 'Seekh Kebab',     prices: { Half: 900, Full: 1600 } },
          { name: 'Beef Tikka',      prices: { Half: 950, Full: 1700 } },
        ]
      },
      {
        name: 'FISH & PRAWNS',
        items: [
          { name: 'Fish Tikka',      prices: { Half: 1000, Full: 1800 } },
          { name: 'Prawn Tikka',     prices: { Half: 1100, Full: 2000 } },
        ]
      },
    ]
  },
  {
    category: 'VEG MAINS',
    sections: [
      {
        name: 'PANEER',
        items: [
          { name: 'Paneer Butter Masala',   prices: { Half: 850, Full: 1500 } },
          { name: 'Palak Paneer',           prices: { Half: 850, Full: 1500 } },
          { name: 'Paneer Tikka Masala',    prices: { Half: 900, Full: 1600 } },
          { name: 'Kadai Paneer',           prices: { Half: 900, Full: 1600 } },
        ]
      },
      {
        name: 'DAL & VEGETABLES',
        items: [
          { name: 'Dal Tadka',              prices: { Half: 650, Full: 1200 } },
          { name: 'Dal Makhani',            prices: { Half: 700, Full: 1300 } },
          { name: 'Mix Vegetable',          prices: { Half: 750, Full: 1400 } },
          { name: 'Aloo Gobi',              prices: { Half: 700, Full: 1300 } },
          { name: 'Chana Masala',           prices: { Half: 700, Full: 1300 } },
        ]
      },
    ]
  },
  {
    category: 'NON-VEG MAINS',
    sections: [
      {
        name: 'CHICKEN',
        items: [
          { name: 'Butter Chicken',         prices: { Half: 950, Full: 1700 } },
          { name: 'Chicken Tikka Masala',   prices: { Half: 950, Full: 1700 } },
          { name: 'Kadai Chicken',          prices: { Half: 950, Full: 1700 } },
          { name: 'Chicken Do Pyaza',       prices: { Half: 950, Full: 1700 } },
          { name: 'Chicken Saag',           prices: { Half: 950, Full: 1700 } },
        ]
      },
      {
        name: 'MUTTON & BEEF',
        items: [
          { name: 'Mutton Curry',           prices: { Half: 1100, Full: 2000 } },
          { name: 'Mutton Rogan Josh',      prices: { Half: 1100, Full: 2000 } },
          { name: 'Beef Masala',            prices: { Half: 1050, Full: 1900 } },
        ]
      },
      {
        name: 'FISH & PRAWNS',
        items: [
          { name: 'Fish Curry',             prices: { Half: 1000, Full: 1800 } },
          { name: 'Prawn Masala',           prices: { Half: 1150, Full: 2100 } },
        ]
      },
    ]
  },
  {
    category: 'CHAAT & KULFI',
    sections: [
      {
        name: 'CHAAT',
        items: [
          { name: 'Pani Puri',              price: 450 },
          { name: 'Bhel Puri',              price: 450 },
          { name: 'Sev Puri',               price: 450 },
          { name: 'Dahi Puri',              price: 500 },
          { name: 'Ragda Pattice',          price: 500 },
        ]
      },
      {
        name: 'KULFI',
        items: [
          { name: 'Plain Kulfi',            price: 350 },
          { name: 'Mango Kulfi',            price: 400 },
          { name: 'Pista Kulfi',            price: 400 },
          { name: 'Rose Kulfi',             price: 400 },
        ]
      },
    ]
  },
  {
    category: 'ITALIAN',
    sections: [
      {
        name: 'PIZZA',
        items: [
          { name: 'Margherita',             prices: { Regular: 950, Large: 1500 } },
          { name: 'Farmhouse',              prices: { Regular: 1050, Large: 1700 } },
          { name: 'Paneer Tikka Pizza',     prices: { Regular: 1100, Large: 1800 } },
          { name: 'Chicken BBQ',            prices: { Regular: 1100, Large: 1800 } },
          { name: 'Spicy Chicken',          prices: { Regular: 1100, Large: 1800 } },
          { name: 'Beef & Mushroom',        prices: { Regular: 1150, Large: 1900 } },
        ]
      },
      {
        name: 'PASTA',
        items: [
          { name: 'Spaghetti Bolognese',    price: 950 },
          { name: 'Pasta Arrabiata',        price: 850 },
          { name: 'Fettuccine Alfredo',     price: 900 },
          { name: 'Pasta Pesto',            price: 900 },
        ]
      },
    ]
  },
  {
    category: 'BIRYANI',
    sections: [
      {
        name: 'VEG BIRYANI',
        items: [
          { name: 'Vegetable Biryani',      prices: { Half: 750, Full: 1400 } },
          { name: 'Paneer Biryani',         prices: { Half: 850, Full: 1550 } },
        ]
      },
      {
        name: 'NON-VEG BIRYANI',
        items: [
          { name: 'Chicken Biryani',        prices: { Half: 900, Full: 1650 } },
          { name: 'Mutton Biryani',         prices: { Half: 1050, Full: 1900 } },
          { name: 'Beef Biryani',           prices: { Half: 1000, Full: 1850 } },
          { name: 'Prawn Biryani',          prices: { Half: 1100, Full: 2000 } },
        ]
      },
    ]
  },
  {
    category: 'NAAN',
    sections: [
      {
        name: 'BREADS',
        items: [
          { name: 'Plain Naan',             price: 150 },
          { name: 'Butter Naan',            price: 180 },
          { name: 'Garlic Naan',            price: 200 },
          { name: 'Cheese Naan',            price: 250 },
          { name: 'Stuffed Paratha',        price: 300 },
          { name: 'Puri (2 pc)',            price: 200 },
          { name: 'Steamed Rice',           price: 300 },
          { name: 'Jeera Rice',             price: 350 },
        ]
      },
    ]
  },
  {
    category: 'KOROGA',
    sections: [
      {
        name: 'KOROGA SPECIAL',
        items: [
          { name: 'Chicken Koroga',         prices: { Half: 1200, Full: 2200 } },
          { name: 'Beef Koroga',            prices: { Half: 1200, Full: 2200 } },
          { name: 'Goat Koroga',            prices: { Half: 1300, Full: 2400 } },
          { name: 'Mix Koroga',             prices: { Half: 1350, Full: 2500 } },
        ]
      },
    ]
  },
];

/* ============================================================
   VEG / NON-VEG INDICATOR SVGS
   ============================================================ */
const VEG_SVG  = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="#4caf50" stroke-width="1.6"/><circle cx="8" cy="8" r="4" fill="#4caf50"/></svg>`;
const NVEG_SVG = `<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="2" stroke="#c62828" stroke-width="1.6"/><polygon points="8,3.5 13,11.5 3,11.5" fill="#c62828"/></svg>`;

/* ============================================================
   CART
   ============================================================ */
let cart = [];

function addToCart(name, price, size) {
  const key = size ? `${name} (${size})` : name;
  const existing = cart.find(i => i.key === key);
  if (existing) { existing.qty++; }
  else { cart.push({ key, name, size: size || '', price, qty: 1 }); }
  updateCartUI();
}

function removeOneFromCart(key) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty--;
  if (item.qty <= 0) cart = cart.filter(i => i.key !== key);
  updateCartUI();
}

function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = getCartTotal();
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total').textContent = `KES ${total.toLocaleString()}`;
  document.getElementById('modal-total').textContent = `KES ${total.toLocaleString()}`;

  const bar = document.getElementById('cart-bar');
  if (count > 0) bar.classList.add('visible');
  else           bar.classList.remove('visible');

  const list = document.getElementById('cart-items-list');
  if (cart.length === 0) {
    list.innerHTML = '<div class="cart-empty">No items yet</div>';
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${item.size ? `<div class="cart-item-size">${item.size}</div>` : ''}
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn" onclick="removeOneFromCart('${esc(item.key)}')">−</button>
        <span style="min-width:22px;text-align:center;font-size:.82rem;font-weight:700;color:#fff">${item.qty}</span>
        <button class="cart-qty-btn" onclick="addToCart('${esc(item.name)}',${item.price},'${esc(item.size)}')">+</button>
        <div class="cart-item-price">KES ${(item.price * item.qty).toLocaleString()}</div>
        <button class="cart-remove-btn" onclick="removeFromCart('${esc(item.key)}')">✕</button>
      </div>
    </div>
  `).join('');

  /* update inline qty displays */
  document.querySelectorAll('[data-item-key]').forEach(el => {
    const key = el.getAttribute('data-item-key');
    const found = cart.find(i => i.key === key);
    const qty = found ? found.qty : 0;
    const disp = el.querySelector('.qty-display');
    if (disp) disp.textContent = qty;
  });
}

function esc(s) {
  return String(s).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function toggleCart() {
  const modal = document.getElementById('cart-modal');
  modal.classList.toggle('open');
}

function setOrderType(btn) {
  document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function placeOrder() {
  if (cart.length === 0) { alert('Your cart is empty!'); return; }

  const name   = document.getElementById('cust-name').value.trim() || 'Guest';
  const date   = document.getElementById('order-date').value;
  const timeNow= document.getElementById('order-time-now').value;
  const serve  = document.getElementById('order-time').value;
  const people = document.getElementById('cust-people').value;
  const type   = document.querySelector('.order-type-btn.active')?.textContent || 'Dine In';

  let msg = `*United Sports Club — Restaurant Order*\n\n`;
  msg += `Name: ${name}\n`;
  msg += `Date: ${date || '—'}\n`;
  msg += `Order Time: ${timeNow || '—'}\n`;
  msg += `Serving Time: ${serve || '—'}\n`;
  msg += `Covers: ${people}\n`;
  msg += `Type: ${type}\n\n`;
  msg += `*Order:*\n`;
  cart.forEach(i => {
    msg += `• ${i.name}${i.size ? ` (${i.size})` : ''} ×${i.qty} — KES ${(i.price * i.qty).toLocaleString()}\n`;
  });
  msg += `\n*Total: KES ${getCartTotal().toLocaleString()}*`;

  window.open(`https://wa.me/${WHATSAPP_NO}?text=${encodeURIComponent(msg)}`);
}

/* ============================================================
   RENDER ITEM
   ============================================================ */
function renderItem(item, isVeg) {
  const hasSize = item.prices && Object.keys(item.prices).length > 1;
  const sizes   = hasSize ? Object.keys(item.prices) : null;
  const basePrice = hasSize
    ? item.prices[sizes[0]]
    : (item.price || (item.prices && Object.values(item.prices)[0]) || 0);

  const defaultSize = sizes ? sizes[0] : '';
  const itemKey = defaultSize ? `${item.name} (${defaultSize})` : item.name;

  const vegDot = isVeg !== undefined
    ? `<span class="item-veg-dot">${isVeg ? VEG_SVG : NVEG_SVG}</span>`
    : '';

  const sizePillsHtml = sizes ? `
    <div class="item-sizes">
      ${sizes.map((s, i) => `
        <button class="size-pill${i===0?' active':''}"
          onclick="selectSize(this, '${esc(item.name)}', '${esc(s)}', ${item.prices[s]})"
          data-size="${esc(s)}"
        >${s} · KES ${item.prices[s].toLocaleString()}</button>
      `).join('')}
    </div>` : '';

  const cartInCart = cart.find(i => i.key === itemKey);
  const qty = cartInCart ? cartInCart.qty : 0;

  return `
    <div class="item-card" data-item-key="${esc(itemKey)}" data-base-name="${esc(item.name)}">
      <div class="item-left">
        <div class="item-name-row">
          ${vegDot}
          <span class="item-name">${item.name}</span>
        </div>
        ${sizePillsHtml}
      </div>
      <div class="item-right">
        <div class="item-price" id="price-${esc(itemKey)}">KES ${basePrice.toLocaleString()}</div>
        ${qty > 0 ? `
          <div class="item-controls">
            <button class="qty-btn" onclick="handleRemove('${esc(itemKey)}')">−</button>
            <div class="qty-display">${qty}</div>
            <button class="qty-btn" onclick="handleAdd(this)">+</button>
          </div>
        ` : `
          <button class="item-add-btn" onclick="handleAdd(this)">+ Add</button>
        `}
      </div>
    </div>`;
}

function selectSize(btn, name, size, price) {
  const card = btn.closest('.item-card');
  card.querySelectorAll('.size-pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');

  const newKey = `${name} (${size})`;
  card.setAttribute('data-item-key', newKey);
  const priceEl = card.querySelector('.item-price');
  if (priceEl) priceEl.textContent = `KES ${price.toLocaleString()}`;
}

function handleAdd(btn) {
  const card  = btn.closest('.item-card');
  const key   = card.getAttribute('data-item-key');
  const name  = card.getAttribute('data-base-name');
  const priceText = card.querySelector('.item-price')?.textContent || 'KES 0';
  const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;
  const size  = key.includes('(') ? key.match(/\(([^)]+)\)/)?.[1] || '' : '';
  addToCart(name, price, size);
  reRenderItemControls(card, key);
}

function handleRemove(key) {
  removeOneFromCart(key);
  const card = document.querySelector(`[data-item-key="${CSS.escape(key)}"]`);
  if (card) reRenderItemControls(card, key);
}

function reRenderItemControls(card, key) {
  const right  = card.querySelector('.item-right');
  const priceEl= card.querySelector('.item-price');
  const priceHtml = priceEl ? priceEl.outerHTML : '';
  const item   = cart.find(i => i.key === key);
  const qty    = item ? item.qty : 0;

  right.innerHTML = priceHtml + (qty > 0 ? `
    <div class="item-controls">
      <button class="qty-btn" onclick="handleRemove('${esc(key)}')">−</button>
      <div class="qty-display">${qty}</div>
      <button class="qty-btn" onclick="handleAdd(this)">+</button>
    </div>
  ` : `
    <button class="item-add-btn" onclick="handleAdd(this)">+ Add</button>
  `);
}

/* ============================================================
   BUILD SECTIONS
   ============================================================ */
function buildSections(sections, isVeg) {
  return sections.map(sec => {
    const items = sec.items.map(item => renderItem(item, isVeg)).join('');
    return `
      <div class="category-wrapper open">
        <div class="category-header" onclick="this.parentElement.classList.toggle('open')">
          <span class="cat-name">${sec.name}<span class="cat-count">${sec.items.length} items</span></span>
          <svg class="cat-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>
        </div>
        <div class="category-content">${items}</div>
      </div>`;
  }).join('');
}

/* ============================================================
   BUILD MENUS
   ============================================================ */
function buildStarters() {
  const vegData   = menuData.find(c => c.category === 'STARTERS' && c.type === 'VEG');
  const nvegData  = menuData.find(c => c.category === 'STARTERS' && c.type === 'NON-VEG');
  document.getElementById('starters-veg').innerHTML   = buildSections(vegData.sections, true);
  document.getElementById('starters-nonveg').innerHTML= buildSections(nvegData.sections, false);
}

function buildMains() {
  const vegData  = menuData.find(c => c.category === 'VEG MAINS');
  const nvegData = menuData.find(c => c.category === 'NON-VEG MAINS');
  document.getElementById('mains-veg-content').innerHTML   = buildSections(vegData.sections, true);
  document.getElementById('mains-nonveg-content').innerHTML= buildSections(nvegData.sections, false);
}

function buildExtras() {
  const categories = ['CHAAT & KULFI', 'ITALIAN', 'BIRYANI', 'NAAN', 'KOROGA'];
  const tabs = document.getElementById('extras-tabs');
  const content = document.getElementById('extras-content');

  tabs.innerHTML = categories.map((cat, i) =>
    `<button class="type-tab${i===0?' active':''}" onclick="switchExtrasTab('${esc(cat)}', this)" data-ext-index="${i}">${cat}</button>`
  ).join('');

  content.innerHTML = categories.map((cat, i) =>
    `<div id="ext-${i}" class="${i===0?'':'type-hidden'}">${
      buildSections(menuData.find(c => c.category === cat)?.sections || [], undefined)
    }</div>`
  ).join('');

}

/* ============================================================
   MENU SWITCHING
   ============================================================ */
function switchStarterType(type, btn) {
  document.querySelectorAll('#starter-tabs .type-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('starters-veg').classList.toggle('type-hidden', type !== 'veg');
  document.getElementById('starters-nonveg').classList.toggle('type-hidden', type !== 'nonveg');
}

let mainsVegOpen    = false;
let mainsNvegOpen   = false;

function selectMainsType(type) {
  const hint = document.getElementById('mains-select-hint');
  if (hint) hint.style.display = 'none';

  if (type === 'veg') {
    mainsVegOpen = !mainsVegOpen;
    document.getElementById('pill-veg').classList.toggle('active', mainsVegOpen);
    document.getElementById('mains-veg-content').classList.toggle('type-hidden', !mainsVegOpen);
  } else {
    mainsNvegOpen = !mainsNvegOpen;
    document.getElementById('pill-nonveg').classList.toggle('active', mainsNvegOpen);
    document.getElementById('mains-nonveg-content').classList.toggle('type-hidden', !mainsNvegOpen);
  }

  if (!mainsVegOpen && !mainsNvegOpen) {
    if (hint) hint.style.display = '';
  }
}

function switchExtrasTab(cat, btn) {
  document.querySelectorAll('#extras-tabs .type-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const idx = parseInt(btn.getAttribute('data-ext-index') || '0', 10);
  document.querySelectorAll('#extras-content > div').forEach((el, i) => {
    el.classList.toggle('type-hidden', i !== idx);
  });
}

function filterMenu() {
  const q = (document.getElementById('menuSearch')?.value || '').toLowerCase().trim();
  document.querySelectorAll('#menu-1 .item-card').forEach(card => {
    const name = card.querySelector('.item-name')?.textContent?.toLowerCase() || '';
    card.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

/* ============================================================
   CHAPTER / MENU NAVIGATION
   ============================================================ */
let currentScreen = 'ch-1';

function showChapter(n) {
  const all = document.querySelectorAll('.chapter-screen, .menu-screen');

  /* hide current screen */
  all.forEach(el => {
    el.classList.remove('ch-visible', 'ms-visible');
  });

  document.body.classList.add('ch-mode');
  document.body.classList.remove('menu-mode');

  const ch = document.getElementById(`ch-${n}`);
  if (!ch) return;

  /* restart ken burns */
  const img = ch.querySelector('.ch-img');
  if (img) {
    img.style.animation = 'none';
    img.getBoundingClientRect();
    img.style.animation = '';
  }

  /* animate in */
  ch.classList.add('ch-enter');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      ch.classList.remove('ch-enter');
      ch.classList.add('ch-visible');
    });
  });

  currentScreen = `ch-${n}`;
  window.scrollTo(0, 0);
}

function showMenu(n) {
  const ch = document.getElementById(`ch-${n}`);

  /* exit chapter */
  if (ch) {
    ch.classList.add('ch-exit');
    setTimeout(() => ch.classList.remove('ch-visible', 'ch-exit'), 350);
  }

  setTimeout(() => {
    document.body.classList.remove('ch-mode');
    document.body.classList.add('menu-mode');

    document.querySelectorAll('.menu-screen').forEach(el => el.classList.remove('ms-visible'));
    const menu = document.getElementById(`menu-${n}`);
    if (menu) menu.classList.add('ms-visible');

    currentScreen = `menu-${n}`;
    window.scrollTo(0, 0);
  }, 300);
}

function doneWithMenu(n) {
  if (n >= 3) {
    toggleCart();
    return;
  }
  const menu = document.getElementById(`menu-${n}`);
  if (menu) menu.classList.remove('ms-visible');
  showChapter(n + 1);
}

/* ============================================================
   SEARCH FILTER
   ============================================================ */
// filterMenu already defined above

/* ============================================================
   AUTH
   ============================================================ */
function initAuth() {
  if (typeof window.supabase === 'undefined') return;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  supabaseClient.auth.getSession().then(({ data }) => {
    if (data?.session) buildNavUserBar(data.session.user);
  });
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session) buildNavUserBar(session.user);
    else {
      const bar = document.getElementById('nav-user-bar');
      if (bar) bar.remove();
    }
  });
}

function buildNavUserBar(user) {
  if (!user) return;
  let bar = document.getElementById('nav-user-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'nav-user-bar';
    bar.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const right = document.querySelector('.usc-nav-right');
    if (right) right.appendChild(bar);
  }
  bar.innerHTML = `
    <span style="font-size:.72rem;color:rgba(255,255,255,.45);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${user.email}</span>
    <button onclick="doSignOut()" style="font-size:.72rem;padding:4px 10px;border-radius:6px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.55);cursor:pointer;">Sign out</button>`;
}

function doSignOut() {
  if (supabaseClient) supabaseClient.auth.signOut();
}

/* ============================================================
   INIT
   ============================================================ */
function runSplash() {
  return new Promise(resolve => {
    setTimeout(() => {
      const splash = document.getElementById('splash');
      splash.classList.add('hidden');
      resolve();
    }, 2200);
  });
}

async function init() {
  /* set today's date */
  const dateInput = document.getElementById('order-date');
  if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

  /* set current time */
  const timeInput = document.getElementById('order-time-now');
  if (timeInput) {
    const now = new Date();
    timeInput.value = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  }

  /* build menu data */
  buildStarters();
  buildMains();
  buildExtras();

  /* init auth */
  initAuth();

  /* splash → chapter 1 */
  await runSplash();

  document.body.classList.add('ch-mode');
  const ch1 = document.getElementById('ch-1');
  if (ch1) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ch1.classList.add('ch-visible');
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
