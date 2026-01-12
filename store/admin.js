import { firebaseConfig, PRODUCTS_PATH } from './config.js';

const form = document.getElementById('productForm');
const statusEl = document.getElementById('status');
const adminGrid = document.getElementById('adminProducts');

function showStatus(msg, type = 'info') {
  statusEl.textContent = msg;
  statusEl.style.color = type === 'error' ? '#ff5c7a' : '#8a94a6';
}

function adminCard(key, p) {
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
        <a class="btn" href="${p.payhipUrl}" target="_blank" rel="noopener">فتح على Payhip</a>
        <button class="btn danger" data-key="${key}">حذف</button>
      </div>
    </div>
  `;
  return wrapper;
}

async function fetchAdminProducts() {
  const url = `${firebaseConfig.databaseURL}/${PRODUCTS_PATH}.json`;
  const res = await fetch(url);
  const data = await res.json();
  adminGrid.innerHTML = '';

  if (!data) {
    adminGrid.innerHTML = `<div class="empty">لا توجد منتجات مضافة بعد.</div>`;
    return;
  }

  Object.entries(data).forEach(([key, p]) => {
    const card = adminCard(key, p);
    adminGrid.appendChild(card);
  });

  adminGrid.querySelectorAll('button.danger').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.getAttribute('data-key');
      try {
        const delUrl = `${firebaseConfig.databaseURL}/${PRODUCTS_PATH}/${key}.json`;
        const res = await fetch(delUrl, { method: 'DELETE' });
        if (!res.ok) throw new Error('DELETE failed');
        showStatus('تم حذف المنتج.');
        fetchAdminProducts();
      } catch (err) {
        showStatus('تعذر حذف المنتج.', 'error');
        console.error(err);
      }
    });
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const product = {
    imageUrl: document.getElementById('imageUrl').value.trim(),
    name: document.getElementById('name').value.trim(),
    description: document.getElementById('description').value.trim(),
    hasDiscount: document.getElementById('hasDiscount').value === 'true',
    priceBefore: Number(document.getElementById('priceBefore').value),
    priceAfter: Number(document.getElementById('priceAfter').value),
    payhipUrl: document.getElementById('payhipUrl').value.trim()
  };

  if (!product.imageUrl || !product.name || !product.description || !product.payhipUrl) {
    return showStatus('يرجى تعبئة جميع الحقول المطلوبة.', 'error');
  }
  if (product.hasDiscount && product.priceAfter >= product.priceBefore) {
    return showStatus('سعر بعد الخصم يجب أن يكون أقل من السعر قبل الخصم.', 'error');
  }

  try {
    const url = `${firebaseConfig.databaseURL}/${PRODUCTS_PATH}.json`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('POST failed');
    form.reset();
    showStatus('تم إضافة المنتج بنجاح.');
    fetchAdminProducts();
  } catch (err) {
    showStatus('حدث خطأ أثناء الإضافة.', 'error');
    console.error(err);
  }
});

// تحميل المنتجات عند فتح الصفحة
fetchAdminProducts();

// تحديث دوري اختياري
setInterval(fetchAdminProducts, 5000);