const cart = [];

const cartItemsElement = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const clearCartButton = document.getElementById('clear-cart');
const applyForm = document.getElementById('apply-form');
const applyMessage = document.getElementById('apply-message');

function formatCurrency(value) {
  return `USD ${value}`;
}

function renderCart() {
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
  renderCart();
}

document.querySelectorAll('.btn-add').forEach((button) => {
  button.addEventListener('click', (event) => {
    const product = event.currentTarget.closest('.product-card');
    addToCart(product.dataset.name, Number(product.dataset.price));
  });
});

cartItemsElement.addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-btn')) {
    const itemIndex = Number(event.target.dataset.index);
    cart.splice(itemIndex, 1);
    renderCart();
  }
});

clearCartButton.addEventListener('click', () => {
  cart.length = 0;
  renderCart();
});

applyForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(applyForm);
  const applicantName = formData.get('name');
  applyMessage.textContent = `¡Gracias por postularte, ${applicantName}! Te contactaremos pronto.`;
  applyForm.reset();
});

renderCart();
