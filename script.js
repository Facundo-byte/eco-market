const CART_STORAGE_KEY = 'ecoMarketCart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatCurrency(value) {
  return `ARS ${Number(value).toLocaleString('es-AR')}`;
}

const cart = loadCart();

function cartGroupedItems() {
  const grouped = new Map();

  cart.forEach((item) => {
    const current = grouped.get(item.name);
    if (current) {
      current.quantity += 1;
    } else {
      grouped.set(item.name, { ...item, quantity: 1 });
    }
  });

  return Array.from(grouped.values());
}

function renderCart() {
  const cartItemsElement = document.getElementById('cart-items');
  const cartTotalElement = document.getElementById('cart-total');

  if (!cartItemsElement || !cartTotalElement) {
    return;
  }

  cartItemsElement.innerHTML = '';

  if (cart.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'Tu carrito está vacío.';
    cartItemsElement.appendChild(emptyItem);
    cartTotalElement.textContent = formatCurrency(0);
    return;
  }

  let total = 0;

  cartGroupedItems().forEach((item) => {
    total += item.price * item.quantity;
    const listItem = document.createElement('li');
    listItem.innerHTML = `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)} <button data-name="${item.name}" class="remove-btn">Quitar 1</button>`;
    cartItemsElement.appendChild(listItem);
  });

  cartTotalElement.textContent = formatCurrency(total);
}

function addToCart(name, price) {
  cart.push({ name, price });
  saveCart(cart);
  renderCart();
}

document.querySelectorAll('.btn-add').forEach((button) => {
  if (!(button instanceof HTMLButtonElement)) {
    return;
  }

  button.addEventListener('click', (event) => {
    const product = event.currentTarget.closest('.product-card');
    if (!product) {
      return;
    }

    addToCart(product.dataset.name, Number(product.dataset.price));
  });
});

const cartItemsElement = document.getElementById('cart-items');
if (cartItemsElement) {
  cartItemsElement.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-btn')) {
      const itemName = event.target.dataset.name;
      const itemIndex = cart.findIndex((item) => item.name === itemName);
      if (itemIndex >= 0) {
        cart.splice(itemIndex, 1);
        saveCart(cart);
        renderCart();
      }
    }
  });
}

const clearCartButton = document.getElementById('clear-cart');
if (clearCartButton) {
  clearCartButton.addEventListener('click', () => {
    cart.length = 0;
    saveCart(cart);
    renderCart();
  });
}

const checkoutForm = document.getElementById('checkout-form');
const checkoutMessage = document.getElementById('checkout-message');
if (checkoutForm && checkoutMessage) {
  checkoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      checkoutMessage.textContent = 'No podés pagar con el carrito vacío.';
      checkoutMessage.className = 'status-error';
      return;
    }

    checkoutMessage.textContent = 'Creando pago en Mercado Pago...';
    checkoutMessage.className = 'status-ok';

    const email = document.getElementById('payer-email')?.value?.trim();

    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartGroupedItems(),
          email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la preferencia.');
      }

      window.location.href = data.initPoint || data.sandboxInitPoint;
    } catch (error) {
      checkoutMessage.textContent = `No se pudo iniciar el pago: ${error.message}`;
      checkoutMessage.className = 'status-error';
    }
  });
}

const applyForm = document.getElementById('apply-form');
const applyMessage = document.getElementById('apply-message');
if (applyForm && applyMessage) {
  applyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(applyForm);
    applyMessage.textContent = `¡Gracias por postularte, ${formData.get('name')}! Te contactaremos pronto.`;
    applyMessage.className = 'status-ok';
    applyForm.reset();
  });
}

renderCart();
