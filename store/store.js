import { firebaseConfig, PRODUCTS_PATH } from './config.js';

const productsGrid = document.getElementById('productsGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');

let products = [];

function productCard(p) {
  const priceMain = Number(p.hasDiscount ? p.priceAfter : p.priceBefore).toFixed(2);
  const priceBefore = p.hasDiscount ? Number(p.priceBefore).toFixed(2) : null;

  const wrapper = document.createElement('div');
  wrapper.className = 'product';
  wrapper.innerHTML = `
    <img src="${p.imageUrl}" alt="${p.name}" />
    <div class="content">
      <div class="title">${p.name}</div>
      <div class="desc">${p.description}</div>
      <div class="price-row">
        ${priceBefore ? `<span class="price-before">${priceBefore}</span>` : ''}
        <span class="${p.hasDiscount ? 'price-after' : ''}">${priceMain}</span>
        ${p.hasDiscount ? `<span class="badge discount">خصم</span>` : `<span class="badge">سعر عادي</span>`}
      </div>
      <div class="actions">
        <a class="btn primary" href="${p.payhipUrl}" target="_blank" rel="noopener">شراء عبر Payhip</a>
      </div>
    </div>
  `;
  return wrapper;
}

function renderProducts(list) {
  productsGrid.innerHTML = '';
  if (!list || list.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  list.forEach(p => productsGrid.appendChild(productCard(p)));
}

function applySearch() {
  const q = (searchInput.value || '').trim().toLowerCase();
  if (!q) return renderProducts(products);
  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(q));
  renderProducts(filtered);
}

searchInput.addEventListener('input', applySearch);

async function fetchProducts() {
  const url = `${firebaseConfig.databaseURL}/${PRODUCTS_PATH}.json`;
  const res = await fetch(url);
  const data = await res.json();
  const list = data ? Object.values(data) : [];
  products = list;
  renderProducts(products);
}

// مبدئيًا: جلب مرة واحدة عند التحميل
fetchProducts();

// ملاحظة: لو تريد تحديث لحظي، يمكن استخدام long-polling بسيط:
setInterval(fetchProducts, 5000); // يجلب كل 5 ثوانٍ (اختياري)