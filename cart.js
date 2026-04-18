/* =========================================================
   MAISON NAJM — Cart (localStorage-backed, vanilla JS)
   ========================================================= */
const Cart = (() => {
  'use strict';

  const KEY = 'najm_cart';

  const PRODUCTS = {
    'ignition':     { id: 'ignition',     name: 'Ignition',      price: 590, image: 'ignition.jpg' },
    'obsidian-noir':{ id: 'obsidian-noir', name: 'Obsidian Noir', price: 650, image: 'obsidian-noir.jpg' },
    'desert-storm': { id: 'desert-storm',  name: 'Desert Storm',  price: 840, image: 'desert-storm.jpg' },
  };

  function items() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  }

  function save(arr) { localStorage.setItem(KEY, JSON.stringify(arr)); }

  function addItem(id, qty) {
    qty = qty || 1;
    const cart = items();
    const row = cart.find(r => r.id === id);
    if (row) row.qty += qty;
    else cart.push({ id: id, qty: qty });
    save(cart);
    refresh();
  }

  function changeQty(id, delta) {
    const cart = items();
    const row = cart.find(r => r.id === id);
    if (!row) return;
    row.qty += delta;
    if (row.qty < 1) cart.splice(cart.indexOf(row), 1);
    save(cart);
    refresh();
  }

  function removeItem(id) {
    save(items().filter(r => r.id !== id));
    refresh();
  }

  function count() { return items().reduce(function(s, r) { return s + r.qty; }, 0); }

  function total() {
    return items().reduce(function(s, r) {
      var p = PRODUCTS[r.id];
      return s + (p ? p.price * r.qty : 0);
    }, 0);
  }

  /* ---- UI ---- */

  function refresh() {
    updateBadge();
    renderDrawer();
  }

  function updateBadge() {
    var badge = document.getElementById('cartBadge');
    if (!badge) return;
    var c = count();
    badge.textContent = c;
    badge.style.display = c > 0 ? 'flex' : 'none';
  }

  function renderDrawer() {
    var container = document.getElementById('cartItems');
    var footer = document.getElementById('cartFooter');
    if (!container) return;

    var list = items();

    if (list.length === 0) {
      container.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = '';

    var html = '';
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      var p = PRODUCTS[r.id];
      if (!p) continue;
      html +=
        '<div class="cart-item">' +
          '<img src="' + p.image + '" alt="' + p.name + '" />' +
          '<div class="cart-item-info">' +
            '<h4>' + p.name + '</h4>' +
            '<div class="cart-item-qty">' +
              '<button data-action="dec" data-id="' + p.id + '">\u2212</button>' +
              '<span>' + r.qty + '</span>' +
              '<button data-action="inc" data-id="' + p.id + '">+</button>' +
            '</div>' +
            '<p class="cart-item-price">AED ' + (p.price * r.qty).toLocaleString() + '</p>' +
          '</div>' +
          '<button class="cart-item-remove" data-action="remove" data-id="' + p.id + '" aria-label="Remove">\u00d7</button>' +
        '</div>';
    }
    container.innerHTML = html;

    var totalEl = footer && footer.querySelector('.cart-total-amount');
    if (totalEl) totalEl.textContent = 'AED ' + total().toLocaleString();
  }

  function open()  {
    var d = document.getElementById('cartDrawer');
    var o = document.getElementById('cartOverlay');
    if (d) d.classList.add('open');
    if (o) o.classList.add('open');
  }

  function close() {
    var d = document.getElementById('cartDrawer');
    var o = document.getElementById('cartOverlay');
    if (d) d.classList.remove('open');
    if (o) o.classList.remove('open');
  }

  /* ---- Init ---- */

  function init() {
    var toggle = document.getElementById('cartToggle');
    if (toggle) toggle.addEventListener('click', open);

    var closeBtn = document.getElementById('cartClose');
    if (closeBtn) closeBtn.addEventListener('click', close);

    var overlay = document.getElementById('cartOverlay');
    if (overlay) overlay.addEventListener('click', close);

    var itemsEl = document.getElementById('cartItems');
    if (itemsEl) {
      itemsEl.addEventListener('click', function(e) {
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.dataset.action;
        var id = btn.dataset.id;
        if (action === 'inc') changeQty(id, 1);
        else if (action === 'dec') changeQty(id, -1);
        else if (action === 'remove') removeItem(id);
      });
    }

    var checkout = document.querySelector('.cart-checkout');
    if (checkout) {
      checkout.addEventListener('click', function() {
        if (count() === 0) return;
        save([]);
        refresh();
        close();
        alert('Thank you. Your order has been placed.');
      });
    }

    /* Product-page quantity selector */
    var qtyVal = document.getElementById('qtyValue');
    var incBtn = document.getElementById('qtyInc');
    var decBtn = document.getElementById('qtyDec');
    if (qtyVal && incBtn && decBtn) {
      incBtn.addEventListener('click', function() {
        qtyVal.textContent = Math.min(10, parseInt(qtyVal.textContent) + 1);
      });
      decBtn.addEventListener('click', function() {
        qtyVal.textContent = Math.max(1, parseInt(qtyVal.textContent) - 1);
      });
    }

    /* Add to Cart button on product pages */
    var atcBtn = document.querySelector('.add-to-cart');
    if (atcBtn) {
      atcBtn.addEventListener('click', function() {
        var id = this.dataset.product;
        var qty = parseInt((qtyVal && qtyVal.textContent) || '1');
        addItem(id, qty);
        this.textContent = 'ADDED';
        this.classList.add('added');
        var self = this;
        setTimeout(function() {
          self.textContent = 'ADD TO CART';
          self.classList.remove('added');
        }, 1600);
        open();
      });
    }

    refresh();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { addItem: addItem, removeItem: removeItem, open: open, close: close, PRODUCTS: PRODUCTS };
})();
