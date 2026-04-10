
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (!badge) return;
  const total = getCart().reduce((sum, item) => sum + item.quantity, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? "inline-block" : "none";
}

const col = document.createElement("div");
col.className = "col-12 col-sm-6 col-md-4 col-lg-3 mb-4";
col.innerHTML = `
  <div class="card h-100 bg-secondary text-light border-0">
    <img src="${product.thumbnail}" class="card-img-top"
         style="height:200px;object-fit:cover;">
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">${product.title}</h5>
      <p class="card-text fw-bold">${product.price} kr</p>
      <button class="btn btn-primary mt-auto add-btn">🛒 Lägg i varukorg</button>
    </div>
  </div>`;

col.querySelector(".add-btn").addEventListener("click", () => {
  addToCart(product);
});

productContainer.appendChild(col);

// Kör badge-uppdatering vid varje sidladdning
updateCartBadge();

const productContainer = document.getElementById("products");

if (productContainer) {
  fetch("https://dummyjson.com/products")
    .then((res) => res.json())
    .then((data) => {
      data.products.forEach((product) => {
        const card = `
        <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
          <div class="card h-100">
            <img src="${product.thumbnail}" class="card-img-top" style="height:200px; object-fit:cover;">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text">${product.price} kr</p>
              <a href="pages/order.html?id=${product.id}" class="btn btn-primary mt-auto">Buy</a>
            </div>
          </div>
        </div>
        `;
        productContainer.innerHTML += card;
      });
    });
}

// HÄMTA VALD PRODUKT
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (productId) {
  fetch(`https://dummyjson.com/products/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      const form = document.getElementById("order-form");

      if (form) {
        const title = document.createElement("h4");
        title.textContent = "Product: " + product.title;
        form.prepend(title);
      }
    });
}

// FORM VALIDERING

const form = document.getElementById("order-form");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let isValid = true;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const street = document.getElementById("street").value.trim();
    const city = document.getElementById("city").value.trim();
    const zipcode = document.getElementById("zipcode").value.trim();

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const phoneError = document.getElementById("phone-error");
    const streetError = document.getElementById("street-error");
    const cityError = document.getElementById("city-error");
    const zipcodeError = document.getElementById("zipcode-error");

    // Återställning
    nameError.textContent = "";
    emailError.textContent = "";
    phoneError.textContent = "";
    streetError.textContent = "";
    cityError.textContent = "";
    zipcodeError.textContent = "";

    // VALIDERING

    // Namn (2–50 längd)
    if (name.length < 2 || name.length > 50) {
      nameError.textContent = "Namnet måste vara 2–50 tecken.";
      isValid = false;
    }

    // Epost
    if (!email.includes("@") || email.length > 50) {
      emailError.textContent = "Ogiltig e-post.";
      isValid = false;
    }

    // Telefon
    const phoneRegex = /^[0-9\-() ]{1,20}$/;
    if (!phoneRegex.test(phone)) {
      phoneError.textContent =
        "Telefon får bara innehålla siffror, -, () och max 20 tecken.";
      isValid = false;
    }

    // Gatuadress
    if (street.length < 2 || street.length > 50) {
      streetError.textContent = "Adress måste vara 2–50 tecken.";
      isValid = false;
    }

    // Ort
    if (city.length < 2 || city.length > 20) {
      cityError.textContent = "Ort måste vara 2–20 tecken.";
      isValid = false;
    }

    // Postnummer
    const zipRegex = /^[0-9]{5}$/;
    if (!zipRegex.test(zipcode)) {
      zipcodeError.textContent = "Postnummer måste vara exakt 5 siffror.";
      isValid = false;
    }

    // Om allt är ok skicka meddelande
    if (isValid) {
      window.location.href = "/pages/thankyou.html";
    }
  });
}
