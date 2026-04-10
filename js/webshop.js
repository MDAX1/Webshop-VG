/* =========================================================
   CONFIG
========================================================= */
const API = "https://dummyjson.com/products";

/* =========================================================
   CART STORAGE
========================================================= */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateBadge();
}

/* =========================================================
   BADGE (GLOBAL)
========================================================= */
function updateBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;

  const total = getCart().reduce((sum, i) => sum + i.quantity, 0);

  badge.textContent = total;
  badge.style.display = total ? "inline-block" : "none";
}

/* =========================================================
   TOAST (MODERN FEEDBACK)
========================================================= */
function toast(msg) {
  let wrap = document.getElementById("toast-wrap");

  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast-wrap";
    wrap.style.cssText = `
      position:fixed; bottom:20px; right:20px;
      display:flex; flex-direction:column; gap:10px;
      z-index:9999;
    `;
    document.body.appendChild(wrap);
  }

  const el = document.createElement("div");
  el.textContent = msg;

  el.style.cssText = `
    background:#0d6efd;
    color:#fff;
    padding:10px 18px;
    border-radius:12px;
    box-shadow:0 8px 20px rgba(0,0,0,.3);
    transform:translateY(20px);
    opacity:0;
    transition:all .4s ease;
  `;

  wrap.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  }, 50);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    setTimeout(() => el.remove(), 400);
  }, 2000);
}

/* =========================================================
   CHANGE QUANTITY
========================================================= */
function changeQty(product, delta) {
  let cart = getCart();
  let item = cart.find(i => i.id === product.id);

  if (!item && delta > 0) {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1
    });
    toast("Added to cart");
  } else if (item) {
    item.quantity += delta;

    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== product.id);
      toast("Removed from cart");
    }
  }

  saveCart(cart);
  renderProducts();
  renderCart();
}

/* =========================================================
   PRODUCTS (INDEX PAGE)
========================================================= */
function renderProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  fetch(API)
    .then(res => res.json())
    .then(data => {
      container.innerHTML = "";

      data.products.forEach(p => {
        const cartItem = getCart().find(i => i.id === p.id);

        const el = document.createElement("div");
        el.className = "col-md-3";

        el.innerHTML = `
        <div class="card product-card h-100 bg-secondary text-light border-0 shadow">

          <div class="img-wrap">
            <img src="${p.thumbnail}" class="card-img-top">
          </div>

          <div class="card-body d-flex flex-column">
            <h6 class="fw-bold">${p.title}</h6>
            <p class="text-info">${p.price} kr</p>

            ${
              cartItem
                ? `
                <div class="d-flex justify-content-center align-items-center gap-2 mt-auto">
                  <button class="btn btn-light btn-sm">−</button>
                  <span class="fw-bold">${cartItem.quantity}</span>
                  <button class="btn btn-light btn-sm">+</button>
                </div>`
                : `
                <button class="btn btn-primary mt-auto">Add to Cart</button>`
            }

            <a href="pages/product.html?id=${p.id}" 
               class="btn btn-outline-light btn-sm mt-2">
               View Product
            </a>
          </div>
        </div>`;

        // EVENTS
        if (cartItem) {
          el.querySelectorAll("button")[0].onclick = () => changeQty(p, -1);
          el.querySelectorAll("button")[1].onclick = () => changeQty(p, 1);
        } else {
          el.querySelector("button").onclick = () => changeQty(p, 1);
        }

        container.appendChild(el);
      });
    });
}

/* =========================================================
   CART PAGE
========================================================= */
function renderCart() {
  const container = document.getElementById("cart-container");
  const summary = document.getElementById("cart-summary");

  if (!container) return;

  const cart = getCart();
  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML = `
      <div class="text-center py-5">
        <h4>Your cart is empty</h4>
        <a href="../index.html" class="btn btn-primary mt-3">Go shopping</a>
      </div>`;
    summary.innerHTML = "";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.quantity;

    const el = document.createElement("div");
    el.className = "cart-item card bg-secondary text-light mb-3 p-3";

    el.innerHTML = `
      <div class="d-flex align-items-center gap-3">

        <img src="${item.thumbnail}" class="cart-img">

        <div class="flex-grow-1">
          <h6>${item.title}</h6>
          <small>${item.price} kr</small>
        </div>

        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-light btn-sm">−</button>
          <span>${item.quantity}</span>
          <button class="btn btn-light btn-sm">+</button>
        </div>
      </div>`;

    el.querySelectorAll("button")[0].onclick = () => changeQty(item, -1);
    el.querySelectorAll("button")[1].onclick = () => changeQty(item, 1);

    container.appendChild(el);
  });

  summary.innerHTML = `
    <div class="card bg-secondary p-4 text-light shadow">
      <h4>Total: <span class="text-info">${total} kr</span></h4>
      <a href="order.html" class="btn btn-primary mt-3 w-100">
        Proceed to Checkout
      </a>
    </div>`;
}

/* =========================================================
   PRODUCT PAGE
========================================================= */
function renderProductPage() {
  const el = document.getElementById("product-detail");
  if (!el) return;

  const id = new URLSearchParams(location.search).get("id");

  fetch(`${API}/${id}`)
    .then(res => res.json())
    .then(p => {
      el.innerHTML = `
        <div class="card bg-secondary text-light p-4 shadow-lg product-detail">

          <img src="${p.thumbnail}" class="mb-4 big-img">

          <h2>${p.title}</h2>
          <p class="opacity-75">${p.description}</p>

          <h4 class="text-info">${p.price} kr</h4>

          <button class="btn btn-primary mt-3">
            Add to Cart
          </button>
        </div>`;

      el.querySelector("button").onclick = () => changeQty(p, 1);
    });
}

/* =========================================================
   RECIPE PAGE
========================================================= */
function renderRecipe() {
  const el = document.getElementById("recipe-products");
  if (!el) return;

  const data = JSON.parse(localStorage.getItem("lastOrder")) || [];

  if (!data.length) {
    el.innerHTML = "<h4>No products found</h4>";
    return;
  }

  data.forEach(item => {
    el.innerHTML += `
      <div class="col-md-3">
        <div class="card bg-secondary text-light p-3 shadow product-card">
          <img src="${item.thumbnail}">
          <h6>${item.title}</h6>
          <p>${item.quantity} pcs</p>
        </div>
      </div>`;
  });
}

/* =========================================================
   ORDER SUBMIT
========================================================= */
const form = document.getElementById("order-form");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    localStorage.setItem("lastOrder", JSON.stringify(getCart()));
    localStorage.removeItem("cart");

    window.location.href = "/pages/recipe.html";
  });
}

/* =========================================================
   INIT
========================================================= */
updateBadge();
renderProducts();
renderCart();
renderProductPage();
renderRecipe();