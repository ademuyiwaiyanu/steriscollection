import './style.css';

const menuToggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
const cartToggle = document.getElementById('cartToggle');
const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const loginNavLink = document.getElementById('loginNavLink');
const loginMobileLink = document.getElementById('loginMobileLink');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartEmptyMessage = document.getElementById('cartEmptyMessage');
const checkoutButton = document.getElementById('checkoutButton');
const newsletterForm = document.getElementById('newsletterForm');
const newsletterMessage = document.getElementById('newsletterMessage');
const detailsOverlay = document.getElementById('detailsOverlay');
const detailsDrawer = document.getElementById('detailsDrawer');
const closeDetails = document.getElementById('closeDetails');
const detailImage = document.getElementById('detailImage');
const detailName = document.getElementById('detailName');
const detailDescription = document.getElementById('detailDescription');
const detailPrice = document.getElementById('detailPrice');
const detailsAddToCart = document.getElementById('detailsAddToCart');

const USER_CART_KEY_PREFIX = 'cart_';
const GUEST_CART_KEY = `${USER_CART_KEY_PREFIX}guest`;
const SUBSCRIBERS_KEY = 'newsletterSubscribers';
const cart = [];

const getCurrentUserCartKey = () => {
  const currentUser = localStorage.getItem('loggedInUser');
  return currentUser ? `${USER_CART_KEY_PREFIX}${currentUser}` : GUEST_CART_KEY;
};

const migrateGuestCartToUser = () => {
  const currentUser = localStorage.getItem('loggedInUser');
  if (!currentUser) return;

  const guestCart = localStorage.getItem(GUEST_CART_KEY);
  if (!guestCart) return;

  try {
    const guestItems = JSON.parse(guestCart);
    if (!Array.isArray(guestItems) || !guestItems.length) {
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }

    const userKey = `${USER_CART_KEY_PREFIX}${currentUser}`;
    const storedUserCart = localStorage.getItem(userKey);
    const userItems = storedUserCart ? JSON.parse(storedUserCart) : [];

    if (!Array.isArray(userItems)) {
      localStorage.setItem(userKey, JSON.stringify(guestItems));
      localStorage.removeItem(GUEST_CART_KEY);
      return;
    }

    const merged = [...userItems];
    guestItems.forEach((guestItem) => {
      const existing = merged.find((item) => item.name === guestItem.name);
      if (existing) {
        existing.quantity = (existing.quantity || 0) + (guestItem.quantity || 0);
      } else {
        merged.push({ ...guestItem });
      }
    });

    localStorage.setItem(userKey, JSON.stringify(merged));
    localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
  }
};

const loadCartForCurrentUser = () => {
  migrateGuestCartToUser();
  const cartKey = getCurrentUserCartKey();
  if (!cartKey) return;

  const stored = localStorage.getItem(cartKey);
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed)) {
      cart.push(...parsed);
    }
  } catch {
    // ignore invalid stored data
  }
};

const saveCartForCurrentUser = () => {
  const cartKey = getCurrentUserCartKey();
  if (!cartKey) return;
  localStorage.setItem(cartKey, JSON.stringify(cart));
};

const getSubscribers = () => {
  const stored = localStorage.getItem(SUBSCRIBERS_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const addSubscriber = (email) => {
  const subscribers = getSubscribers();
  if (!subscribers.includes(email)) {
    subscribers.push(email);
    localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subscribers));
  }
};

const updateCartCount = () => {
  if (!cartCount) return;
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = String(quantity);
};

const getCartTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0);

const formatPrice = (value) => `₦${value.toLocaleString('en-US')}`;

const renderCart = () => {
  if (!cartItemsContainer || !cartTotal || !cartEmptyMessage) return;

  if (!cart.length) {
    cartItemsContainer.innerHTML = '';
    cartEmptyMessage.classList.remove('hidden');
    cartTotal.textContent = formatPrice(0);
    return;
  }

  cartEmptyMessage.classList.add('hidden');
  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm uppercase tracking-[0.3em] text-slate-500">${item.name}</p>
              <p class="mt-1 text-base font-semibold text-white">${formatPrice(item.price)}</p>
              <p class="mt-2 text-sm text-slate-400">Quantity: ${item.quantity}</p>
            </div>
            <button type="button" data-name="${item.name}" class="remove-from-cart text-sm font-semibold text-pink-100 transition hover:text-white">Remove</button>
          </div>
        </div>
      `
    )
    .join('');

  cartTotal.textContent = formatPrice(getCartTotal());
};

loadCartForCurrentUser();
updateCartCount();
renderCart();

const openCartDrawer = () => {
  cartDrawer?.classList.remove('translate-x-full');
  cartDrawer?.classList.add('translate-x-0');
  cartDrawer?.setAttribute('aria-hidden', 'false');
  cartOverlay?.classList.remove('hidden');
};

const closeCartDrawer = () => {
  cartDrawer?.classList.remove('translate-x-0');
  cartDrawer?.classList.add('translate-x-full');
  cartDrawer?.setAttribute('aria-hidden', 'true');
  cartOverlay?.classList.add('hidden');
};

const openDetailsDrawer = () => {
  detailsDrawer?.classList.remove('translate-x-full');
  detailsDrawer?.classList.add('translate-x-0');
  detailsDrawer?.setAttribute('aria-hidden', 'false');
  detailsOverlay?.classList.remove('hidden');
};

const closeDetailsDrawer = () => {
  detailsDrawer?.classList.remove('translate-x-0');
  detailsDrawer?.classList.add('translate-x-full');
  detailsDrawer?.setAttribute('aria-hidden', 'true');
  detailsOverlay?.classList.add('hidden');
};

const openProductDetails = (button) => {
  const card = button.closest('.product-card');
  const name = card?.querySelector('h4')?.textContent?.trim() || '';
  const description = card?.querySelector('p.text-sm.leading-6')?.textContent?.trim() || '';
  const image = card?.querySelector('img')?.src || '';
  const priceText = card?.querySelector('.text-lg.font-semibold.text-white')?.textContent?.trim() || '';
  const price = Number(priceText.replace(/[^0-9]/g, '')) || 0;

  if (!name) return;
  if (detailImage) {
    detailImage.src = image;
    detailImage.alt = name;
  }
  if (detailName) detailName.textContent = name;
  if (detailPrice) detailPrice.textContent = formatPrice(price);
  if (detailDescription) detailDescription.textContent = description;
  if (detailsAddToCart) {
    detailsAddToCart.dataset.name = name;
    detailsAddToCart.dataset.price = String(price);
  }
  openDetailsDrawer();
};

const toggleMobileNav = () => {
  if (!mobileNav || !menuToggle) return;
  const isHidden = mobileNav.classList.toggle('hidden');
  menuToggle.setAttribute('aria-expanded', String(!isHidden));
  mobileNav.setAttribute('aria-hidden', String(isHidden));
};

const addToCart = (product) => {
  const existing = cart.find((item) => item.name === product.name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartCount();
  renderCart();
  saveCartForCurrentUser();
  openCartDrawer();
};

const removeFromCart = (name) => {
  const index = cart.findIndex((item) => item.name === name);
  if (index === -1) return;
  cart.splice(index, 1);
  updateCartCount();
  renderCart();
  saveCartForCurrentUser();
};

menuToggle?.addEventListener('click', toggleMobileNav);
cartToggle?.addEventListener('click', openCartDrawer);
closeCart?.addEventListener('click', closeCartDrawer);
cartOverlay?.addEventListener('click', closeCartDrawer);
closeDetails?.addEventListener('click', closeDetailsDrawer);
detailsOverlay?.addEventListener('click', closeDetailsDrawer);
checkoutButton?.addEventListener('click', () => {
  if (!cart.length) return;
  alert(
    'Thanks! Your order total is ' + formatPrice(getCartTotal()) + '.' +
      '\n\nPlease transfer your payment to the bank account shown in the cart and send your receipt to WhatsApp: +234 916 132 8636.'
  );
  cart.length = 0;
  saveCartForCurrentUser();
  updateCartCount();
  renderCart();
  closeCartDrawer();
});

detailsAddToCart?.addEventListener('click', () => {
  const name = detailsAddToCart.dataset.name;
  const price = Number(detailsAddToCart.dataset.price) || 0;
  if (!name) return;
  addToCart({ name, price });
  closeDetailsDrawer();
});

document.querySelectorAll('.add-to-cart').forEach((button) => {
  button.addEventListener('click', () => {
    const name = button.getAttribute('data-name');
    const price = Number(button.getAttribute('data-price')) || 0;
    if (!name) return;
    addToCart({ name, price });
  });
});

document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.matches('.view-details-btn')) {
    openProductDetails(target);
    return;
  }

  if (target.matches('.remove-from-cart')) {
    const name = target.getAttribute('data-name');
    if (!name) return;
    removeFromCart(name);
  }
});

newsletterForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const emailInput = newsletterForm.querySelector('input[type="email"]');
  if (!emailInput) return;
  const email = emailInput.value.trim();

  if (!email) {
    newsletterMessage.textContent = 'Please enter a valid email address.';
    return;
  }

  addSubscriber(email);
  newsletterMessage.textContent = `Thanks for subscribing, ${email}! We’ll keep you posted.`;
  emailInput.value = '';
});

const handleLogout = () => {
  localStorage.removeItem('loggedInUser');
  window.location.href = './login.html';
};

const currentUser = localStorage.getItem('loggedInUser');
if (currentUser) {
  if (loginNavLink) {
    loginNavLink.textContent = currentUser === 'admin' ? 'Admin' : 'Logout';
    loginNavLink.href = currentUser === 'admin' ? './admin.html' : '#';
    if (currentUser !== 'admin') {
      loginNavLink.addEventListener('click', (event) => {
        event.preventDefault();
        handleLogout();
      });
    }
  }

  if (loginMobileLink) {
    loginMobileLink.textContent = currentUser === 'admin' ? 'Admin' : 'Logout';
    loginMobileLink.href = currentUser === 'admin' ? './admin.html' : '#';
    if (currentUser !== 'admin') {
      loginMobileLink.addEventListener('click', (event) => {
        event.preventDefault();
        handleLogout();
      });
    }
  }
} else {
  if (loginNavLink) {
    loginNavLink.href = 'login.html';
    loginNavLink.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  if (loginMobileLink) {
    loginMobileLink.href = 'login.html';
    loginMobileLink.addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }
}

const syncAdminGalleryImages = () => {
  const storedImages = JSON.parse(localStorage.getItem('adminGalleryImages') || '[]');
  if (!storedImages.length) return;
  document.querySelectorAll('[data-admin-index]').forEach((image) => {
    const index = Number(image.dataset.adminIndex);
    if (!Number.isNaN(index) && storedImages[index]) {
      image.src = storedImages[index];
    }
  });
};

syncAdminGalleryImages();
