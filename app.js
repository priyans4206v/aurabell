// ==========================================================================
//   AURABELL JAVASCRIPT LOGIC
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize state
  initAuth();
  updateCartUI();

  // Scroll logic for navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.add('scrolled'); // keep it solid or transparent? Let's keep it responsive to scroll
      navbar.classList.remove('scrolled');
      if(window.scrollY > 50) navbar.classList.add('scrolled');
    }
  });
});

/* ==========================================================================
   NAVIGATION / MOBILE MENU
   ========================================================================== */
function toggleMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  
  hamburger.classList.toggle('active');
  overlay.classList.toggle('active');
  
  // Prevent body scroll when menu is open
  if (overlay.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

function closeMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('mobileOverlay');
  
  hamburger.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}


/* ==========================================================================
   CART SYSTEM
   ========================================================================== */
let cart = JSON.parse(localStorage.getItem('aurabell_cart')) || [];

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
  
  if (sidebar.classList.contains('active')) {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    updateCartUI();
  } else {
    document.body.style.overflow = '';
  }
}

function addToCart(name, price) {
  // Check if item exists
  const existingItemIndex = cart.findIndex(item => item.name === name);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: Date.now().toString(),
      name: name,
      price: price,
      quantity: 1,
      image: name.includes('Tint') ? 'images/lip-tint.jpg' : 'images/eyeliner.png'
    });
  }
  
  saveCart();
  updateCartUI();
  showToast(`${name} added to cart`);
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
}

function updateQuantity(id, change) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
      updateCartUI();
    }
  }
}

function saveCart() {
  localStorage.setItem('aurabell_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartCountIndicator = document.getElementById('cartCount');
  const cartTotal = document.getElementById('cartTotal');
  
  // Calculate totals
  let totalItems = 0;
  let totalPrice = 0;
  
  cart.forEach(item => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;
  });
  
  // Update badge
  cartCountIndicator.innerText = totalItems;
  if (totalItems > 0) {
    cartCountIndicator.classList.add('has-items');
  } else {
    cartCountIndicator.classList.remove('has-items');
  }
  
  // Render items
  if (cart.length === 0) {
    cartEmpty.style.display = 'flex';
    cartFooter.style.display = 'none';
    // Clear items except empty message
    Array.from(cartItemsContainer.children).forEach(child => {
      if (child.id !== 'cartEmpty') {
        child.remove();
      }
    });
  } else {
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';
    
    // Clear old items
    Array.from(cartItemsContainer.children).forEach(child => {
      if (child.id !== 'cartEmpty') {
        child.remove();
      }
    });
    
    // Build new HTML
    cart.forEach(item => {
      const actualImg = item.name.includes('Tint') ? 'images/lip-tint.jpg' : 'images/eyeliner.png';
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${actualImg}" alt="${item.name}" class="cart-item-img" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'70\\' height=\\'70\\'><rect fill=\\'%23e5c3c6\\' width=\\'70\\' height=\\'70\\'/></svg>'"/>
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" style="margin-left:auto;">Remove</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });
    
    // Update total price
    cartTotal.innerText = `$${totalPrice.toFixed(2)}`;
  }
}

/* ==========================================================================
   CHECKOUT MODAL
   ========================================================================== */
function checkout() {
  if (cart.length === 0) {
    showToast("Your cart is empty!");
    return;
  }
  // Close sidebar
  document.getElementById('cartSidebar').classList.remove('active');
  document.getElementById('cartOverlay').classList.remove('active');
  
  // Show Modal
  const modal = document.getElementById('checkoutModal');
  const overlay = document.getElementById('checkoutModalOverlay');
  
  overlay.classList.add('active');
  modal.classList.add('active');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const overlay = document.getElementById('checkoutModalOverlay');
  
  overlay.classList.remove('active');
  modal.classList.remove('active');
}

/* ==========================================================================
   AUTHENTICATION SYSTEM (Local Storage)
   ========================================================================== */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerText = '🙈';
  } else {
    input.type = 'password';
    btn.innerText = '👁';
  }
}

function switchToSignup() {
  document.getElementById('loginCard').style.display = 'none';
  document.getElementById('signupCard').style.display = 'block';
  document.getElementById('loginError').innerText = '';
}

function switchToLogin() {
  document.getElementById('signupCard').style.display = 'none';
  document.getElementById('loginCard').style.display = 'block';
  document.getElementById('signupError').innerText = '';
}

function handleSignup(event) {
  event.preventDefault();
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const errorEl = document.getElementById('signupError');
  
  // Get existing users
  let users = JSON.parse(localStorage.getItem('aurabell_users')) || [];
  
  // Check if exists
  if (users.find(u => u.email === email)) {
    errorEl.innerText = 'Account with this email already exists.';
    return;
  }
  
  // Save new user
  const newUser = { name, email, password };
  users.push(newUser);
  localStorage.setItem('aurabell_users', JSON.stringify(users));
  
  // Login the user
  loginUser(newUser);
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  
  let users = JSON.parse(localStorage.getItem('aurabell_users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    loginUser(user);
  } else {
    errorEl.innerText = 'Invalid email or password.';
  }
}

function loginUser(user) {
  localStorage.setItem('aurabell_currentUser', JSON.stringify(user));
  document.getElementById('loginForm').reset();
  document.getElementById('signupForm').reset();
  initAuth();
  showToast(`Welcome, ${user.name}!`);
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function logout() {
  localStorage.removeItem('aurabell_currentUser');
  initAuth();
  showToast('You have been logged out.');
}

function initAuth() {
  const currentUser = JSON.parse(localStorage.getItem('aurabell_currentUser'));
  const loginCard = document.getElementById('loginCard');
  const signupCard = document.getElementById('signupCard');
  const loggedInCard = document.getElementById('loggedInCard');
  const userGreeting = document.getElementById('userGreeting');
  const greetingText = document.getElementById('greetingText');
  const loginNavLink = document.getElementById('loginNavLink');
  
  if (currentUser) {
    // Show logged-in UI
    loginCard.style.display = 'none';
    signupCard.style.display = 'none';
    loggedInCard.style.display = 'block';
    
    // Update Navbar
    userGreeting.style.display = 'flex';
    greetingText.innerText = `Hi, ${currentUser.name.split(' ')[0]}`;
    loginNavLink.innerText = 'Account';
  } else {
    // Show Login UI
    loginCard.style.display = 'block';
    signupCard.style.display = 'none';
    loggedInCard.style.display = 'none';
    
    // Update Navbar
    userGreeting.style.display = 'none';
    loginNavLink.innerText = 'Login';
  }
}

/* ==========================================================================
   UTILS
   ========================================================================== */
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
