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
   BADGE
========================================================= */
function updateBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;

  const total = getCart().reduce((sum, i) => sum + i.quantity, 0);
  badge.textContent = total;
  badge.style.display = total ? "inline-block" : "none";
}

/* =========================================================
   TOAST
========================================================= */
function toast(msg) {
  let wrap = document.getElementById("toast");

  if (!wrap) {
    wrap = document.createElement("div");
    wrap.id = "toast";
    wrap.style.cssText = `
      position:fixed; bottom:20px; right:20px;
      z-index:9999;
    `;
    document.body.appendChild(wrap);
  }

  const el = document.createElement("div");
  el.textContent = msg;
  el.style.cssText = `
    background:#0d6efd;
    color:#fff;
    padding:10px 15px;
    border-radius:10px;
    margin-top:10px;
    opacity:0;
    transform:translateY(10px);
    transition:.3s;
  `;

  wrap.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  }, 50);

  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 2000);
}

/* =========================================================
   CHANGE QUANTITY (FIXED)
========================================================= */
function changeQty(product, delta) {
  let cart = getCart();
  let item = cart.find((i) => i.id === product.id);

  if (!item && delta > 0) {
    cart.push({
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1,
    });
    toast("Added to cart");
  } else if (item) {
    item.quantity += delta;

    if (item.quantity <= 0) {
      cart = cart.filter((i) => i.id !== product.id);
      toast("Removed from cart");
    }
  }

  saveCart(cart);
  renderProducts();
  renderCart();
}

/* =========================================================
   PRODUCTS (INDEX)
========================================================= */
function renderProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  fetch(API)
    .then((res) => res.json())
    .then((data) => {
      container.innerHTML = "";

      data.products.forEach((p) => {
        const cartItem = getCart().find((i) => i.id === p.id);

        const el = document.createElement("div");
        el.className = "col-md-3";

        el.innerHTML = `
        <div class="card bg-secondary text-light p-3 h-100">

          <img src="${p.thumbnail}" class="product-thumb">

          <h6 class="mt-2">${p.title}</h6>
          <p class="text-info">${p.price} kr</p>

          ${
            cartItem
              ? `
              <div class="d-flex gap-2">
                <button class="btn btn-light btn-sm">−</button>
                <span>${cartItem.quantity}</span>
                <button class="btn btn-light btn-sm">+</button>
              </div>`
              : `
              <button class="btn btn-primary">Add to cart</button>`
          }

          <a href="pages/product.html?id=${p.id}" 
             class="btn btn-outline-light mt-2">
             View
          </a>

        </div>`;

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
   CART PAGE (FIXED IMAGE SIZE)
========================================================= */
function renderCart() {
  const container = document.getElementById("cart-container");
  const summary = document.getElementById("cart-summary");

  if (!container) return;

  const cart = getCart();
  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML = "<h4>Your cart is empty</h4>";
    summary.innerHTML = "";
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.quantity;

    const el = document.createElement("div");
    el.className = "card bg-secondary text-light p-3 mb-3";

    el.innerHTML = `
      <div class="d-flex align-items-center gap-3">

        <img src="${item.thumbnail}" class="cart-img">

        <div class="flex-grow-1">
          <h6>${item.title}</h6>
          <p>${item.price} kr</p>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-light btn-sm">−</button>
          <span>${item.quantity}</span>
          <button class="btn btn-light btn-sm">+</button>
        </div>

      </div>
    `;

    el.querySelectorAll("button")[0].onclick = () => changeQty(item, -1);
    el.querySelectorAll("button")[1].onclick = () => changeQty(item, 1);

    container.appendChild(el);
  });

  summary.innerHTML = `
    <h4>Total: ${total} kr</h4>
    <a href="order.html" class="btn btn-primary">Checkout</a>
  `;
}

/* =========================================================
   PRODUCT PAGE (FIXED + SMALLER IMAGE)
========================================================= */
function renderProductPage() {
  const el = document.getElementById("product-detail");
  if (!el) return;

  const id = new URLSearchParams(location.search).get("id");

  fetch(`${API}/${id}`)
    .then((res) => res.json())
    .then((p) => {
      const product = {
        id: p.id,
        title: p.title,
        price: p.price,
        thumbnail: p.thumbnail,
      };

      el.innerHTML = `
        <div class="row align-items-center">

          <div class="col-md-6 text-center">
            <img src="${p.thumbnail}" class="product-big">
          </div>

          <div class="col-md-6">
            <h2>${p.title}</h2>
            <p>${p.description}</p>
            <h3 class="text-info">${p.price} kr</h3>

            <div class="d-flex gap-2">
              <button id="minus" class="btn btn-light">−</button>
              <span id="qty">0</span>
              <button id="plus" class="btn btn-light">+</button>
            </div>
          </div>

        </div>
      `;

      function updateUI() {
        const item = getCart().find((i) => i.id === product.id);
        document.getElementById("qty").textContent = item ? item.quantity : 0;
      }

      document.getElementById("plus").onclick = () => {
        changeQty(product, 1);
        updateUI();
      };

      document.getElementById("minus").onclick = () => {
        changeQty(product, -1);
        updateUI();
      };

      updateUI();
    });
}

/* =========================================================
   RECIPE PAGE
========================================================= */
function renderRecipe() {
  const el = document.getElementById("recipe-products");
  if (!el) return;

  const data = JSON.parse(localStorage.getItem("lastOrder")) || [];

  data.forEach((item) => {
    el.innerHTML += `
      <div class="col-md-3">
        <div class="card bg-secondary text-light p-3">
          <img src="${item.thumbnail}" class="product-thumb">
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
