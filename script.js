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
  return `USD ${value}`;
}

const cart = loadCart();

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

  cart.forEach((item, index) => {
    total += item.price;
    const listItem = document.createElement('li');
    listItem.innerHTML = `${item.name} - ${formatCurrency(item.price)} <button data-index="${index}" class="remove-btn">Quitar</button>`;
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
      const itemIndex = Number(event.target.dataset.index);
      cart.splice(itemIndex, 1);
      saveCart(cart);
      renderCart();
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

const applyForm = document.getElementById('apply-form');
const applyMessage = document.getElementById('apply-message');
if (applyForm && applyMessage) {
  applyForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(applyForm);
    const applicantName = formData.get('name');
    applyMessage.textContent = `¡Gracias por postularte, ${applicantName}! Te contactaremos pronto.`;
    applyForm.reset();
  });
}

renderCart();
