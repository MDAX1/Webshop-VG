/* ============================================================
   CART HELPERS  –  LocalStorage
   ============================================================ */

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1,
    });
  }
  saveCart(cart);
  showToast(`"${product.title}" added to cart!`);
}

function removeFromCart(id) {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  saveCart([]);
  renderCart();
}

function updateQuantity(id, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart(cart);
  renderCart();
}

/* ============================================================
   CART BADGE  –  shows item count in navbar
   ============================================================ */
function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const total = getCart().reduce((sum, i) => sum + i.quantity, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? "inline-block" : "none";
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(message) {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText =
      "position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText =
    "background:#0d6efd;color:#fff;padding:.75rem 1.25rem;border-radius:.5rem;box-shadow:0 4px 12px rgba(0,0,0,.3);font-size:.9rem;opacity:1;transition:opacity .4s;";
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 400);
  }, 2000);
}

/* ============================================================
   PRODUCT LIST  –  index.html
   ============================================================ */
const productContainer = document.getElementById("products");

if (productContainer) {
  fetch("https://dummyjson.com/products")
    .then((res) => res.json())
    .then((data) => {
      data.products.forEach((product) => {
        const col = document.createElement("div");
        col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
        col.innerHTML = `
          <div class="card h-100 bg-secondary text-light border-0 shadow">
            <img src="${product.thumbnail}" class="card-img-top"
                 style="height:200px;object-fit:cover;" alt="${product.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text fw-bold">${product.price} kr</p>
              <div class="mt-auto d-flex gap-2">
                <button class="btn btn-primary flex-grow-1 add-to-cart-btn">
                  🛒 Add to Cart
                </button>
                <a href="pages/order.html?id=${product.id}"
                   class="btn btn-outline-light">Buy</a>
              </div>
            </div>
          </div>`;

        // Attach add-to-cart event
        col
          .querySelector(".add-to-cart-btn")
          .addEventListener("click", () => addToCart(product));

        productContainer.appendChild(col);
      });
    });
}

/* ============================================================
   ORDER PAGE  –  order.html
   ============================================================ */
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (productId) {
  fetch(`https://dummyjson.com/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      const form = document.getElementById("order-form");
      if (form) {
        const title = document.createElement("h4");
        title.className = "mb-3 text-info";
        title.textContent = "Product: " + product.title;
        form.prepend(title);
      }
    });
}

/* ============================================================
   ORDER FORM VALIDATION  –  order.html
   ============================================================ */
const form = document.getElementById("order-form");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let isValid = true;

    const fields = [
      {
        id: "name",
        errId: "name-error",
        min: 2,
        max: 50,
        label: "Name must be 2–50 chars.",
      },
      {
        id: "email",
        errId: "email-error",
        label: "Invalid email.",
        isEmail: true,
      },
      {
        id: "phone",
        errId: "phone-error",
        label: "Phone: digits, -, () only, max 20.",
        isPhone: true,
      },
      {
        id: "street",
        errId: "street-error",
        min: 2,
        max: 50,
        label: "Address must be 2–50 chars.",
      },
      {
        id: "city",
        errId: "city-error",
        min: 2,
        max: 20,
        label: "City must be 2–20 chars.",
      },
      {
        id: "zipcode",
        errId: "zipcode-error",
        label: "Zip must be exactly 5 digits.",
        isZip: true,
      },
    ];

    fields.forEach(
      ({ id, errId, min, max, label, isEmail, isPhone, isZip }) => {
        const el = document.getElementById(id);
        const errEl = document.getElementById(errId);
        if (!el || !errEl) return;
        errEl.textContent = "";
        const val = el.value.trim();

        if (isEmail && (!val.includes("@") || val.length > 50)) {
          errEl.textContent = label;
          isValid = false;
        } else if (isPhone && !/^[0-9\-() ]{1,20}$/.test(val)) {
          errEl.textContent = label;
          isValid = false;
        } else if (isZip && !/^[0-9]{5}$/.test(val)) {
          errEl.textContent = label;
          isValid = false;
        } else if (min && (val.length < min || val.length > max)) {
          errEl.textContent = label;
          isValid = false;
        }
      },
    );

    if (isValid) {
      clearCart();
      window.location.href = "/pages/thankyou.html";
    }
  });
}

/* ============================================================
   CART PAGE  –  cart.html
   ============================================================ */
function renderCart() {
  const container = document.getElementById("cart-container");
  const summary = document.getElementById("cart-summary");
  if (!container) return;

  const cart = getCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5 opacity-75">
        <p class="fs-4">Your cart is empty.</p>
        <a href="../index.html" class="btn btn-primary mt-2">Go shopping</a>
      </div>`;
    if (summary) summary.innerHTML = "";
    return;
  }

  cart.forEach((item) => {
    const lineTotal = (item.price * item.quantity).toFixed(2);
    const row = document.createElement("div");
    row.className = "card bg-secondary text-light border-0 shadow mb-3";
    row.innerHTML = `
      <div class="card-body d-flex align-items-center gap-3 flex-wrap">
        <img src="${item.thumbnail}" alt="${item.title}"
             style="width:80px;height:80px;object-fit:cover;border-radius:.5rem;">
        <div class="flex-grow-1">
          <h5 class="mb-1">${item.title}</h5>
          <p class="mb-0 text-info fw-bold">${item.price} kr × ${item.quantity}
            = <span class="text-white">${lineTotal} kr</span></p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-light btn-sm" data-action="dec" data-id="${item.id}">−</button>
          <span class="fs-5 fw-bold">${item.quantity}</span>
          <button class="btn btn-outline-light btn-sm" data-action="inc" data-id="${item.id}">+</button>
        </div>
        <button class="btn btn-danger btn-sm" data-action="remove" data-id="${item.id}">🗑</button>
      </div>`;
    container.appendChild(row);
  });

  // Event delegation for all cart buttons
  container.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "inc") updateQuantity(id, 1);
      if (action === "dec") updateQuantity(id, -1);
      if (action === "remove") removeFromCart(id);
    });
  });

  // Summary
  const grandTotal = cart
    .reduce((sum, i) => sum + i.price * i.quantity, 0)
    .toFixed(2);

  if (summary) {
    summary.innerHTML = `
      <div class="card bg-secondary text-light border-0 shadow p-4">
        <h4 class="mb-3">Summary</h4>
        <p class="fs-5 mb-3">Total:
          <strong class="text-info">${grandTotal} kr</strong>
        </p>
        <a href="order.html" class="btn btn-primary btn-lg mb-2">Proceed to Order</a>
        <button id="clear-cart-btn" class="btn btn-outline-danger">
          Clear Cart
        </button>
      </div>`;
    document
      .getElementById("clear-cart-btn")
      .addEventListener("click", clearCart);
  }
}

// Init badge on every page load
updateCartBadge();

// Init cart page rendering
if (document.getElementById("cart-container")) {
  renderCart();
}
