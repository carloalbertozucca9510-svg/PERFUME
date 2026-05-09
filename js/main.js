/* =====================================================
   FEMME by VISTORIA — main.js
   ===================================================== */

/* --- Custom Cursor --- */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mousedown', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.8)');
  document.addEventListener('mouseup',   () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
})();

/* --- Scroll Reveal --- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => observer.observe(el));
})();

/* --- Hamburger / Mobile Menu --- */
(function initHamburger() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  document.querySelectorAll('[data-close-menu]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

/* --- Cart State --- */
const cart = { items: [], unitPrice: 380 };

function getCartTotal() {
  return cart.items.reduce((sum, item) => sum + item.qty * cart.unitPrice, 0);
}

function getCartCount() {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = getCartCount();
}

function updateCartTotal() {
  const el = document.getElementById('cartTotal');
  if (el) el.textContent = 'AED ' + getCartTotal().toLocaleString();
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (cart.items.length === 0) {
    container.innerHTML = '<p class="cart-drawer__empty">Your cart is empty.</p>';
    return;
  }

  container.innerHTML = cart.items.map((item, idx) => `
    <div class="cart-item" data-idx="${idx}">
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__sub">EAU DE PARFUM · 50ML</div>
        <div class="cart-item__controls">
          <button class="cart-item__qty-btn" data-action="dec" data-idx="${idx}">&#8722;</button>
          <div class="cart-item__qty">${item.qty}</div>
          <button class="cart-item__qty-btn" data-action="inc" data-idx="${idx}">&#43;</button>
          <button class="cart-item__remove" data-action="remove" data-idx="${idx}" aria-label="Remove item" style="margin-left:12px;">&#x2715;</button>
        </div>
      </div>
      <div class="cart-item__price">AED ${(item.qty * cart.unitPrice).toLocaleString()}</div>
    </div>
  `).join('');

  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx    = parseInt(btn.dataset.idx, 10);
      const action = btn.dataset.action;
      if (action === 'inc') {
        cart.items[idx].qty += 1;
      } else if (action === 'dec') {
        cart.items[idx].qty -= 1;
        if (cart.items[idx].qty < 1) cart.items.splice(idx, 1);
      } else if (action === 'remove') {
        cart.items.splice(idx, 1);
      }
      renderCartItems();
      updateCartTotal();
      updateCartBadge();
    });
  });
}

/* --- Cart Drawer open / close --- */
(function initCartDrawer() {
  const cartBtn     = document.getElementById('cartBtn');
  const cartClose   = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer  = document.getElementById('cartDrawer');
  if (!cartDrawer) return;

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartBtn)     cartBtn.addEventListener('click', openCart);
  if (cartClose)   cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
})();

/* --- Product Grid: Add to Cart buttons --- */
(function initProductGrid() {
  function openCartDrawer() {
    const cartDrawer  = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartDrawer)  cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
    btn.addEventListener('click', () => {
      const existing = cart.items.find(i => i.name === 'FEMME');
      if (existing) {
        existing.qty += 1;
      } else {
        cart.items.push({ name: 'FEMME', qty: 1 });
      }
      renderCartItems();
      updateCartTotal();
      updateCartBadge();
      openCartDrawer();
    });
  });
})();

/* --- Quick View Modal --- */
(function initQuickViewModal() {
  const overlay    = document.getElementById('qvOverlay');
  const modal      = document.getElementById('qvModal');
  const closeBtn   = document.getElementById('qvClose');
  const imageEl    = document.getElementById('qvImage');
  const counter    = document.getElementById('qvCounter');
  const prevBtn    = document.getElementById('qvPrev');
  const nextBtn    = document.getElementById('qvNext');
  const qvMinus    = document.getElementById('qvMinus');
  const qvPlus     = document.getElementById('qvPlus');
  const qvQtyEl    = document.getElementById('qvQtyValue');
  const addBtn     = document.getElementById('qvAddToCart');
  const pricingEl  = modal ? modal.querySelector('.product__pricing') : null;
  const quantityEl = modal ? modal.querySelector('.quantity') : null;
  const noteEl     = modal ? modal.querySelector('.product__note') : null;

  if (!modal) return;

  const products = {
    1: { name: 'SOLARE',  label: 'VISTORIA · SOLARE · EAU DE PARFUM · 50ML',  tagline: 'Sun-drenched citrus meets the Amalfi coast.',       outOfStock: true  },
    2: { name: 'FIRENZE', label: 'VISTORIA · FIRENZE · EAU DE PARFUM · 50ML', tagline: 'The quiet elegance of a Florentine garden.',        outOfStock: true  },
    3: { name: 'FEMME',   label: 'VISTORIA · FEMME · EAU DE PARFUM · 50ML',   tagline: 'A fragrance that belongs to neither East nor West.', outOfStock: false },
    4: { name: 'RAB',     label: 'VISTORIA · RAB · EAU DE PARFUM · 50ML',     tagline: 'Ancient oud, sacred smoke, desert night.',           outOfStock: false },
  };

  const images = [
    '../images/product-1.jpeg',
    '../images/product-2.jpeg',
    '../images/product-3.jpeg',
    '../images/product-4.jpeg',
  ];

  let currentIdx = 0;
  let qvQty = 1;
  let currentProduct = null;

  function setImage(idx) {
    currentIdx = ((idx % images.length) + images.length) % images.length;
    imageEl.style.backgroundImage =
      `url('${images[currentIdx]}'), linear-gradient(160deg, coral 0%, teal 100%)`;
    counter.textContent = `${currentIdx + 1} / ${images.length}`;
  }

  function openModal(productNum) {
    currentProduct = products[productNum] || products[1];

    modal.querySelector('.qv-details__name').textContent    = currentProduct.name;
    modal.querySelector('.product__label').textContent      = currentProduct.label;
    modal.querySelector('.product__tagline em').textContent = currentProduct.tagline;

    if (currentProduct.outOfStock) {
      pricingEl.style.display  = 'none';
      quantityEl.style.display = 'none';
      addBtn.textContent = 'REGISTER YOUR INTEREST';
      noteEl.textContent = 'This fragrance is currently out of stock. Leave your details and we will notify you when it becomes available.';
    } else {
      pricingEl.style.display  = '';
      quantityEl.style.display = '';
      addBtn.textContent = 'ADD TO PRE-ORDER';
      noteEl.textContent = 'First edition · 500 bottles only';
    }

    currentIdx = 0;
    qvQty = 1;
    if (qvQtyEl) qvQtyEl.textContent = qvQty;
    setImage(0);
    modal.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-quick-view]').forEach(btn => {
    btn.addEventListener('click', () => openModal(parseInt(btn.dataset.quickView, 10)));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (overlay)  overlay.addEventListener('click', closeModal);

  if (prevBtn) prevBtn.addEventListener('click', () => setImage(currentIdx - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => setImage(currentIdx + 1));

  if (qvMinus) qvMinus.addEventListener('click', () => {
    if (qvQty > 1) { qvQty--; qvQtyEl.textContent = qvQty; }
  });
  if (qvPlus) qvPlus.addEventListener('click', () => {
    qvQty++; qvQtyEl.textContent = qvQty;
  });

  if (addBtn) addBtn.addEventListener('click', () => {
    if (currentProduct && currentProduct.outOfStock) {
      closeModal();
      return;
    }
    const existing = cart.items.find(i => i.name === currentProduct.name);
    if (existing) {
      existing.qty += qvQty;
    } else {
      cart.items.push({ name: currentProduct.name, qty: qvQty });
    }
    renderCartItems();
    updateCartTotal();
    updateCartBadge();
    closeModal();
    const cartDrawer  = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    if (cartDrawer)  cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
})();
