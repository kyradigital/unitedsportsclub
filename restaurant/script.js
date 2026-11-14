/* ============================================================
   USC RESTAURANT — STEP-BASED UX
   ============================================================ */

const SUPABASE_URL  = 'https://itzfanrkpvpfucgkbkff.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0emZhbnJrcHZwZnVjZ2tia2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1MTk1NjgsImV4cCI6MjEwOTA5NTU2OH0.e1BzYQDZUxQUv4I1vrAGyRXwrUlel0zubrTkRXJPSeM';
const WHATSAPP_NO   = '254722850525';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ============================================================
   MENU DATA
   ============================================================ */

const menuData = [
  {
    name: 'STARTERS',
    sections: [
      /* ---- VEG STARTERS ---- */
      { name: 'Breakfast', type: 'VEG', items: [
        { n: 'Veg Omelette', p: 350 },
        { n: 'Egg Omelette', p: 400 },
        { n: 'Egg Bhurji', p: 400 },
        { n: 'Omelette Sandwich', p: 500 },
        { n: 'Egg Sandwich', p: 500 },
        { n: 'Veg Sandwich', p: 450 },
        { n: 'Club Sandwich', p: 650 },
      ]},
      { name: 'Sandwiches', type: 'VEG', items: [
        { n: 'Veg Sandwich', p: 450 },
        { n: 'Cheese Sandwich', p: 500 },
        { n: 'Club Sandwich', p: 650 },
      ]},
      { name: 'Paneer', type: 'VEG', items: [
        { n: 'Paneer Tikka', sizes: { Half: 850, Full: 1500 } },
        { n: 'Paneer Malai Tikka', sizes: { Half: 900, Full: 1600 } },
        { n: 'Paneer Achari Tikka', sizes: { Half: 900, Full: 1600 } },
        { n: 'Paneer 65', sizes: { Half: 850, Full: 1500 } },
        { n: 'Chilli Paneer (Dry)', sizes: { Half: 900, Full: 1600 } },
        { n: 'Chilli Paneer (Gravy)', sizes: { Half: 900, Full: 1600 } },
      ]},
      { name: 'Chapatis', type: 'VEG', items: [
        { n: 'Plain Chapati', p: 100 },
        { n: 'Butter Chapati', p: 120 },
        { n: 'Veg Chapati Roll', p: 350 },
        { n: 'Egg Chapati Roll', p: 400 },
      ]},
      { name: 'Bhajia', type: 'VEG', items: [
        { n: 'Veg Bhajia', sizes: { Half: 350, Full: 600 } },
        { n: 'Onion Bhajia', sizes: { Half: 350, Full: 600 } },
        { n: 'Cassava Bhajia', sizes: { Half: 350, Full: 600 } },
        { n: 'Potato Bhajia', sizes: { Half: 350, Full: 600 } },
      ]},
      { name: 'Chips', type: 'VEG', items: [
        { n: 'Plain Chips', sizes: { Half: 300, Full: 500 } },
        { n: 'Masala Chips', sizes: { Half: 350, Full: 600 } },
        { n: 'Chilli Chips', sizes: { Half: 400, Full: 650 } },
        { n: 'Chilli Cheese Chips', sizes: { Half: 500, Full: 800 } },
      ]},
      { name: 'Potatoes', type: 'VEG', items: [
        { n: 'Veg Cutlet', sizes: { Half: 400, Full: 700 } },
        { n: 'Aloo Tikki', sizes: { Half: 400, Full: 700 } },
        { n: 'Aloo Chaat', sizes: { Half: 400, Full: 700 } },
      ]},
      { name: 'Sima', type: 'VEG', items: [
        { n: 'Plain Sima', p: 250 },
        { n: 'Butter Sima', p: 300 },
        { n: 'Sima & Maharagwe', p: 400 },
      ]},
      { name: 'Drinks', type: 'VEG', items: [
        { n: 'Juice (Fresh)', p: 300 },
        { n: 'Soda', p: 150 },
        { n: 'Water', p: 100 },
        { n: 'Chai / Tea', p: 150 },
        { n: 'Coffee', p: 200 },
        { n: 'Mango Lassi', p: 350 },
        { n: 'Rose Lassi', p: 350 },
        { n: 'Plain Lassi', p: 300 },
      ]},
      { name: 'Other Starters', type: 'VEG', items: [
        { n: 'Corn on Cob', p: 300 },
        { n: 'Veg Spring Roll', sizes: { '3 pcs': 400, '6 pcs': 750 } },
        { n: 'Chilli Mushroom (Dry)', sizes: { Half: 700, Full: 1200 } },
        { n: 'Chilli Mushroom (Gravy)', sizes: { Half: 700, Full: 1200 } },
      ]},
      /* ---- NON-VEG STARTERS ---- */
      { name: 'Poultry', type: 'NON-VEG', items: [
        { n: 'Chicken Tikka', sizes: { Half: 900, Full: 1700 } },
        { n: 'Chicken Malai Tikka', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Chicken Achari Tikka', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Chicken 65', sizes: { Half: 900, Full: 1700 } },
        { n: 'Chilli Chicken (Dry)', sizes: { Half: 950, Full: 1750 } },
        { n: 'Chilli Chicken (Gravy)', sizes: { Half: 950, Full: 1750 } },
        { n: 'Chicken Wings', sizes: { '4 pcs': 700, '8 pcs': 1300 } },
        { n: 'Chicken Strips', sizes: { Half: 850, Full: 1600 } },
        { n: 'Chicken Roll', p: 500 },
        { n: 'Chicken Sandwich', p: 650 },
      ]},
      { name: 'Mutton', type: 'NON-VEG', items: [
        { n: 'Mutton Tikka', sizes: { Half: 1100, Full: 2000 } },
        { n: 'Mutton Seek Kebab', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Mutton Chops', sizes: { Half: 1200, Full: 2200 } },
      ]},
      { name: 'Lamb Chop', type: 'NON-VEG', items: [
        { n: 'Lamb Chop', sizes: { Half: 1300, Full: 2400 } },
        { n: 'Lamb Seek Kebab', sizes: { Half: 1100, Full: 2000 } },
      ]},
      { name: 'Fish', type: 'NON-VEG', items: [
        { n: 'Fish Tikka', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Fish 65', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Fish Fry', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Prawn Starter', sizes: { Half: 1200, Full: 2200 } },
      ]},
    ]
  },
  {
    name: 'VEG MAINS',
    sections: [
      { name: 'Paneer Specialties', items: [
        { n: 'Paneer Butter Masala', sizes: { Half: 900, Full: 1600 } },
        { n: 'Palak Paneer', sizes: { Half: 900, Full: 1600 } },
        { n: 'Paneer Do Pyaza', sizes: { Half: 900, Full: 1600 } },
        { n: 'Shahi Paneer', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Kadai Paneer', sizes: { Half: 900, Full: 1600 } },
        { n: 'Paneer Tikka Masala', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Matar Paneer', sizes: { Half: 850, Full: 1500 } },
      ]},
      { name: 'Egg Specialties', items: [
        { n: 'Egg Curry', sizes: { Half: 500, Full: 900 } },
        { n: 'Egg Masala', sizes: { Half: 550, Full: 1000 } },
        { n: 'Egg Do Pyaza', sizes: { Half: 550, Full: 1000 } },
        { n: 'Omelette Curry', sizes: { Half: 500, Full: 900 } },
      ]},
      { name: 'Curries & Daals', items: [
        { n: 'Daal Makhani', sizes: { Half: 750, Full: 1300 } },
        { n: 'Daal Fry', sizes: { Half: 650, Full: 1150 } },
        { n: 'Daal Tadka', sizes: { Half: 600, Full: 1100 } },
        { n: 'Mixed Veg Curry', sizes: { Half: 700, Full: 1250 } },
        { n: 'Aloo Gobi', sizes: { Half: 650, Full: 1150 } },
        { n: 'Chana Masala', sizes: { Half: 650, Full: 1150 } },
        { n: 'Rajma Masala', sizes: { Half: 700, Full: 1250 } },
        { n: 'Veg Korma', sizes: { Half: 750, Full: 1350 } },
      ]},
      { name: 'Salads', items: [
        { n: 'Garden Salad', p: 400 },
        { n: 'Greek Salad', p: 500 },
        { n: 'Raita', p: 250 },
        { n: 'Boondi Raita', p: 300 },
      ]},
      { name: 'Rice', items: [
        { n: 'Steamed Rice', sizes: { Half: 300, Full: 500 } },
        { n: 'Jeera Rice', sizes: { Half: 400, Full: 700 } },
        { n: 'Veg Fried Rice', sizes: { Half: 500, Full: 900 } },
        { n: 'Egg Fried Rice', sizes: { Half: 550, Full: 950 } },
        { n: 'Veg Pulao', sizes: { Half: 500, Full: 900 } },
      ]},
    ]
  },
  {
    name: 'NON-VEG MAINS',
    sections: [
      { name: 'Chicken (Boneless)', items: [
        { n: 'Butter Chicken', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Chicken Tikka Masala', sizes: { Half: 1050, Full: 1900 } },
        { n: 'Chicken Kadai', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Chicken Do Pyaza', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Chicken Korma', sizes: { Half: 1050, Full: 1900 } },
        { n: 'Chicken Palak', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Chicken Handi', sizes: { Half: 1050, Full: 1900 } },
      ]},
      { name: 'Chicken (With Bones)', items: [
        { n: 'Chicken Curry', sizes: { Half: 900, Full: 1650 } },
        { n: 'Chicken Masala', sizes: { Half: 950, Full: 1700 } },
        { n: 'Chicken Karahi', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Chicken Pepper Fry', sizes: { Half: 950, Full: 1700 } },
      ]},
      { name: 'Fish', items: [
        { n: 'Fish Curry', sizes: { Half: 1000, Full: 1800 } },
        { n: 'Fish Masala', sizes: { Half: 1050, Full: 1900 } },
        { n: 'Fish Karahi', sizes: { Half: 1050, Full: 1900 } },
        { n: 'Prawn Curry', sizes: { Half: 1300, Full: 2300 } },
        { n: 'Prawn Masala', sizes: { Half: 1350, Full: 2400 } },
      ]},
      { name: 'Mutton', items: [
        { n: 'Mutton Curry', sizes: { Half: 1200, Full: 2200 } },
        { n: 'Mutton Masala', sizes: { Half: 1250, Full: 2300 } },
        { n: 'Mutton Rogan Josh', sizes: { Half: 1300, Full: 2400 } },
        { n: 'Mutton Karahi', sizes: { Half: 1300, Full: 2400 } },
        { n: 'Mutton Pepper Fry', sizes: { Half: 1250, Full: 2300 } },
      ]},
      { name: 'Prawns', items: [
        { n: 'Butter Garlic Prawns', sizes: { Half: 1400, Full: 2500 } },
        { n: 'Prawn Pepper Fry', sizes: { Half: 1350, Full: 2400 } },
      ]},
    ]
  },
  {
    name: 'CHAAT & KULFI',
    sections: [
      { name: 'Chaat', items: [
        { n: 'Papdi Chaat', p: 400 },
        { n: 'Dahi Puri', p: 400 },
        { n: 'Pani Puri', p: 300 },
        { n: 'Bhel Puri', p: 350 },
        { n: 'Sev Puri', p: 350 },
        { n: 'Aloo Chaat', p: 400 },
        { n: 'Dahi Bhalla', p: 450 },
      ]},
      { name: 'Kulfi', items: [
        { n: 'Malai Kulfi', p: 300 },
        { n: 'Mango Kulfi', p: 300 },
        { n: 'Pista Kulfi', p: 350 },
        { n: 'Rose Kulfi', p: 300 },
        { n: 'Kulfi Falooda', p: 500 },
      ]},
    ]
  },
  {
    name: 'ITALIAN',
    sections: [
      { name: 'Pizza', items: [
        { n: 'Margherita', sizes: { '8"': 900, '12"': 1500 } },
        { n: 'Veg Supreme', sizes: { '8"': 1000, '12"': 1700 } },
        { n: 'Chicken Pizza', sizes: { '8"': 1100, '12"': 1900 } },
        { n: 'BBQ Chicken', sizes: { '8"': 1200, '12"': 2000 } },
        { n: 'Pepperoni', sizes: { '8"': 1200, '12"': 2000 } },
        { n: 'Meat Lovers', sizes: { '8"': 1400, '12"': 2400 } },
      ]},
      { name: 'Pasta', items: [
        { n: 'Veg Pasta Arrabbiata', p: 800 },
        { n: 'Veg Pasta Alfredo', p: 850 },
        { n: 'Chicken Pasta Arrabbiata', p: 1000 },
        { n: 'Chicken Pasta Alfredo', p: 1050 },
        { n: 'Prawn Pasta', p: 1300 },
      ]},
      { name: 'Garlic Bread', items: [
        { n: 'Plain Garlic Bread', p: 400 },
        { n: 'Cheese Garlic Bread', p: 500 },
        { n: 'Herb Garlic Bread', p: 450 },
      ]},
    ]
  },
  {
    name: 'BIRYANI',
    sections: [
      { name: 'Veg Biryani', items: [
        { n: 'Veg Biryani', sizes: { Half: 700, Full: 1200 } },
        { n: 'Paneer Biryani', sizes: { Half: 900, Full: 1600 } },
        { n: 'Mushroom Biryani', sizes: { Half: 850, Full: 1500 } },
      ]},
      { name: 'Non-Veg Biryani', items: [
        { n: 'Chicken Biryani', sizes: { Half: 900, Full: 1650 } },
        { n: 'Mutton Biryani', sizes: { Half: 1200, Full: 2200 } },
        { n: 'Fish Biryani', sizes: { Half: 1100, Full: 2000 } },
        { n: 'Prawn Biryani', sizes: { Half: 1400, Full: 2500 } },
        { n: 'Mixed Biryani', sizes: { Half: 1300, Full: 2400 } },
        { n: 'Egg Biryani', sizes: { Half: 750, Full: 1350 } },
      ]},
    ]
  },
  {
    name: 'NAAN',
    sections: [
      { name: 'Naan Varieties', items: [
        { n: 'Plain Naan', p: 150 },
        { n: 'Butter Naan', p: 180 },
        { n: 'Garlic Naan', p: 200 },
        { n: 'Cheese Naan', p: 300 },
        { n: 'Chilli Garlic Naan', p: 250 },
        { n: 'Stuffed Paneer Naan', p: 400 },
        { n: 'Kulcha', p: 200 },
        { n: 'Paratha', p: 180 },
        { n: 'Aloo Paratha', p: 300 },
      ]},
    ]
  },
  {
    name: 'KOROGA',
    sections: [
      { name: 'Koroga (serves 2–4)', items: [
        { n: 'Chicken Koroga', p: 2800 },
        { n: 'Goat Koroga', p: 3200 },
        { n: 'Mixed Koroga (Chicken + Goat)', p: 3600 },
        { n: 'Fish Koroga', p: 3000 },
        { n: 'Prawn Koroga', p: 3800 },
        { n: 'Veg Koroga', p: 2200 },
      ]},
    ]
  },
];

/* ============================================================
   CART STATE
   ============================================================ */

let cart = [];

function getItemKey(item, selectedSize, selectedStyle) {
  return `${item.n}|${selectedSize || ''}|${selectedStyle || ''}`;
}

function addToCart(itemName, price, selectedSize, selectedStyle) {
  const key = `${itemName}|${selectedSize || ''}|${selectedStyle || ''}`;
  const existing = cart.find(c => c.key === key);
  const label = selectedSize ? `${itemName} (${selectedSize})` : itemName;
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ key, name: label, price: Number(price), qty: 1 });
  }
  updateCartUI();
}

function removeOneFromCart(key) {
  const idx = cart.findIndex(c => c.key === key);
  if (idx < 0) return;
  cart[idx].qty--;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCartUI();
}

function removeFromCart(key) {
  cart = cart.filter(c => c.key !== key);
  updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
}

function updateCartUI() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);

  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-total').textContent = `KES ${total.toLocaleString()}`;
  document.getElementById('modal-total').textContent = `KES ${total.toLocaleString()}`;

  const bar = document.getElementById('cart-bar');
  if (count > 0) bar.classList.add('visible');
  else bar.classList.remove('visible');

  const list = document.getElementById('cart-items-list');
  if (!cart.length) {
    list.innerHTML = '<div class="empty-cart">Your selection is empty.<br>Add items from the menu above.</div>';
    return;
  }
  list.innerHTML = cart.map(c => `
    <div class="cart-item">
      <div class="cart-item-name">${c.name}</div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="removeOneFromCart('${c.key.replace(/'/g,"\\'")}')">−</button>
        <span class="qty-num">${c.qty}</span>
        <button class="qty-btn" onclick="addToCart('${c.name.replace(/'/g,"\\'")}', ${c.price}, '', '')">+</button>
        <button class="remove-btn" onclick="removeFromCart('${c.key.replace(/'/g,"\\'")}')">Remove</button>
      </div>
      <div class="cart-item-price">KES ${(c.price * c.qty).toLocaleString()}</div>
    </div>`).join('');
}

/* ============================================================
   CART MODAL
   ============================================================ */

function toggleCart() {
  const modal = document.getElementById('cart-modal');
  modal.classList.toggle('open');
  if (modal.classList.contains('open')) {
    const now = new Date();
    const dateEl = document.getElementById('order-date');
    const timeEl = document.getElementById('order-time-now');
    if (dateEl && !dateEl.value) dateEl.value = now.toISOString().split('T')[0];
    if (timeEl && !timeEl.value) timeEl.value = now.toTimeString().slice(0,5);
  }
}

let orderType = 'Dine In';
function setOrderType(btn) {
  document.querySelectorAll('.order-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  orderType = btn.textContent;
}

/* ============================================================
   PLACE ORDER (WhatsApp)
   ============================================================ */

function placeOrder() {
  if (!cart.length) { alert('Please add items to your order first.'); return; }
  const name   = document.getElementById('cust-name').value.trim() || 'Guest';
  const date   = document.getElementById('order-date').value;
  const tNow   = document.getElementById('order-time-now').value;
  const tServe = document.getElementById('order-time').value;
  const pax    = document.getElementById('cust-people').value || '1';

  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const lines = cart.map(c => `• ${c.name} x${c.qty} — KES ${(c.price * c.qty).toLocaleString()}`).join('\n');

  const msg = [
    '🍽️ *New Restaurant Order — USC Mombasa*',
    '',
    `👤 Name: ${name}`,
    `📅 Date: ${date}`,
    `🕐 Order Time: ${tNow}`,
    `🕑 Serving Time: ${tServe}`,
    `👥 Pax: ${pax}`,
    `🍴 Type: ${orderType}`,
    '',
    '*Order Items:*',
    lines,
    '',
    `💰 *Total: KES ${total.toLocaleString()}*`,
  ].join('\n');

  const url = `https://wa.me/${WHATSAPP_NO}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

/* ============================================================
   STEP NAVIGATION
   ============================================================ */

let currentStep = 1;

function goStep(n) {
  if (n === currentStep) return;
  const from = document.getElementById(`step-${currentStep}`);
  const to   = document.getElementById(`step-${n}`);

  from.classList.add('step-hidden');
  to.classList.remove('step-hidden');

  /* re-trigger animation */
  to.style.animation = 'none';
  to.offsetHeight; /* reflow */
  to.style.animation = '';

  currentStep = n;
  updateStepDots();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepDots() {
  for (let i = 1; i <= 3; i++) {
    const node = document.getElementById(`node-${i}`);
    if (i < currentStep)      node.className = 'step-node done';
    else if (i === currentStep) node.className = 'step-node active';
    else                        node.className = 'step-node';
  }
  document.getElementById('conn-12').className = 'step-connector' + (currentStep > 1 ? ' filled' : '');
  document.getElementById('conn-23').className = 'step-connector' + (currentStep > 2 ? ' filled' : '');
}

/* ============================================================
   STARTER TYPE SWITCH
   ============================================================ */

let starterType = 'veg';

function switchStarterType(type, btn) {
  starterType = type;
  document.querySelectorAll('#starter-tabs .type-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('starters-veg').classList.toggle('type-hidden', type !== 'veg');
  document.getElementById('starters-nonveg').classList.toggle('type-hidden', type !== 'nonveg');
}

/* ============================================================
   MAINS TYPE SELECTION (toggle accordion)
   ============================================================ */

function selectMainsType(type) {
  const vegCard    = document.getElementById('choice-veg');
  const nvCard     = document.getElementById('choice-nonveg');
  const vegContent = document.getElementById('mains-veg-content');
  const nvContent  = document.getElementById('mains-nonveg-content');

  if (type === 'veg') {
    const wasSelected = vegCard.classList.contains('selected');
    vegCard.classList.toggle('selected');
    document.getElementById('toggle-veg').textContent = wasSelected ? '+' : '−';
    vegContent.classList.toggle('type-hidden', wasSelected);
  } else {
    const wasSelected = nvCard.classList.contains('selected');
    nvCard.classList.toggle('selected');
    document.getElementById('toggle-nonveg').textContent = wasSelected ? '+' : '−';
    nvContent.classList.toggle('type-hidden', wasSelected);
  }
}

/* ============================================================
   EXTRAS CATEGORY TABS
   ============================================================ */

function openExtrasCategory(idx, btn) {
  document.querySelectorAll('#extras-tabs .type-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('[id^="extras-block-"]').forEach(b => b.classList.add('type-hidden'));
  document.getElementById(`extras-block-${idx}`).classList.remove('type-hidden');
}

/* ============================================================
   CATEGORY ACCORDION TOGGLE
   ============================================================ */

function toggleCat(id) {
  const wrapper = document.getElementById(id);
  if (!wrapper) return;
  wrapper.classList.toggle('open');
}

/* ============================================================
   RENDER ITEM
   ============================================================ */

function renderItem(item) {
  const hasSizes  = item.sizes && Object.keys(item.sizes).length > 0;
  const hasStyles = item.styles && item.styles.length > 0;

  let defaultSize  = hasSizes  ? Object.keys(item.sizes)[0] : null;
  let defaultPrice = hasSizes  ? Object.values(item.sizes)[0] : item.p;
  let priceLabel   = defaultPrice ? `KES ${Number(defaultPrice).toLocaleString()}` : '';

  /* safe ids for use in inline handlers */
  const uid = Math.random().toString(36).slice(2, 8);

  let controls = '';

  if (hasSizes) {
    const btns = Object.entries(item.sizes).map(([label, price], i) => `
      <button class="portion-btn${i === 0 ? ' active' : ''}"
        onclick="changeSize('${uid}', '${label}', ${price}, this)">${label} · KES ${Number(price).toLocaleString()}</button>`
    ).join('');
    controls += `<div class="portion-select" id="ps-${uid}">${btns}</div>`;
  }

  if (hasStyles) {
    const opts = item.styles.map(s => `<option value="${s}">${s}</option>`).join('');
    controls += `<div class="style-select"><select id="ss-${uid}">${opts}</select></div>`;
  }

  controls += `<button class="add-btn" onclick="handleAdd('${uid}', '${item.n.replace(/'/g,"\\'")}', ${defaultPrice || 0})">+ Add</button>`;

  return `
    <div class="food-item" id="fi-${uid}">
      <div class="item-name">${item.n}</div>
      ${!hasSizes && defaultPrice ? `<div class="item-price">KES ${Number(defaultPrice).toLocaleString()}</div>` : ''}
      <div class="item-controls" data-price="${defaultPrice || 0}" data-size="${defaultSize || ''}">${controls}</div>
    </div>`;
}

function changeSize(uid, label, price, btn) {
  document.querySelectorAll(`#ps-${uid} .portion-btn`).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const controls = btn.closest('.item-controls');
  controls.dataset.price = price;
  controls.dataset.size  = label;
}

function handleAdd(uid, name, defaultPrice) {
  const controls  = document.querySelector(`#fi-${uid} .item-controls`);
  const price     = Number(controls.dataset.price) || defaultPrice;
  const size      = controls.dataset.size || '';
  const styleEl   = document.getElementById(`ss-${uid}`);
  const style     = styleEl ? styleEl.value : '';
  addToCart(name, price, size, style);

  /* flash feedback on the button */
  const btn = controls.querySelector('.add-btn');
  const orig = btn.textContent;
  btn.textContent = '✓ Added';
  btn.style.background = '#2a7a3a';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 800);
}

/* ============================================================
   BUILD SECTIONS HTML
   ============================================================ */

function buildSections(sections, prefix) {
  return sections.map((sec, i) => {
    const id = `cat-${prefix}-${i}`;
    const count = sec.items.length;
    return `
      <div class="category-wrapper" id="${id}">
        <div class="category-header" onclick="toggleCat('${id}')">
          <span class="cat-title">${sec.name} <span class="cat-count">${count} items</span></span>
          <svg class="cat-chevron" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </div>
        <div class="category-content">
          <div class="items-grid">${sec.items.map(renderItem).join('')}</div>
        </div>
      </div>`;
  }).join('');
}

/* ============================================================
   FILTER / SEARCH (applies to current step's visible items)
   ============================================================ */

function filterMenu() {
  const q = document.getElementById('menuSearch').value.toLowerCase().trim();
  document.querySelectorAll('#step-1 .food-item').forEach(el => {
    const name = el.querySelector('.item-name').textContent.toLowerCase();
    el.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

/* ============================================================
   BUILD STEPS
   ============================================================ */

function buildStarters() {
  const starter = menuData[0];
  const vegSecs   = starter.sections.filter(s => s.type === 'VEG');
  const nvegSecs  = starter.sections.filter(s => s.type === 'NON-VEG');
  document.getElementById('starters-veg').innerHTML   = buildSections(vegSecs,  'sv');
  document.getElementById('starters-nonveg').innerHTML = buildSections(nvegSecs, 'sn');
}

function buildMains() {
  const veg   = menuData[1];
  const nveg  = menuData[2];
  document.getElementById('mains-veg-content').innerHTML   = buildSections(veg.sections,  'mv');
  document.getElementById('mains-nonveg-content').innerHTML = buildSections(nveg.sections, 'mn');
}

function buildExtras() {
  const extras = menuData.slice(3); /* Chaat, Italian, Biryani, Naan, Koroga */
  const nav     = document.getElementById('extras-tabs');
  const content = document.getElementById('extras-content');

  extras.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'type-tab' + (i === 0 ? ' active' : '');
    btn.textContent = cat.name;
    btn.onclick = () => openExtrasCategory(i, btn);
    nav.appendChild(btn);

    const block = document.createElement('div');
    block.id = `extras-block-${i}`;
    if (i !== 0) block.classList.add('type-hidden');
    block.innerHTML = buildSections(cat.sections, `ex${i}`);
    content.appendChild(block);
  });
}

/* ============================================================
   AUTH
   ============================================================ */

async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  buildNavUserBar(session?.user ?? null);
  sb.auth.onAuthStateChange((_event, session) => buildNavUserBar(session?.user ?? null));
}

function buildNavUserBar(user) {
  const right = document.querySelector('.usc-nav-right');
  if (!right) return;
  if (!user) { right.innerHTML = ''; return; }
  const initial = (user.email || 'U')[0].toUpperCase();
  right.innerHTML = `
    <div id="user-chip">
      <div class="user-avatar">${initial}</div>
      <button class="signout-btn" onclick="doSignOut()">Sign out</button>
    </div>`;
}

async function doSignOut() {
  await sb.auth.signOut();
  window.location.href = '../index.html';
}

/* ============================================================
   SPLASH & INIT
   ============================================================ */

function runSplash() {
  return new Promise(resolve => {
    setTimeout(() => {
      const splash = document.getElementById('splash');
      splash.classList.add('exit');
      setTimeout(() => {
        splash.style.display = 'none';
        resolve();
      }, 580);
    }, 2200);
  });
}

async function init() {
  buildStarters();
  buildMains();
  buildExtras();
  updateCartUI();
  initAuth();
  await runSplash();
  const app = document.getElementById('app');
  app.classList.remove('app-hidden');
  app.classList.add('app-visible');
}

document.addEventListener('DOMContentLoaded', init);
