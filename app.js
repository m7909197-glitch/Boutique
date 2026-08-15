/*
  ===========================================================
  RÉGLAGES — à modifier une seule fois
  ===========================================================
  Ton numéro WhatsApp, au format international, SANS le "+",
  sans espace ni tiret. Exemple pour le Sénégal : "221771234567"
*/
const WHATSAPP_NUMBER = "221771234567";

// ===========================================================
// À partir d'ici, tu n'as normalement rien à toucher.
// ===========================================================

const cart = {}; // { productId: quantity }

function formatPrice(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function getProduct(id) {
  return PRODUITS.find(p => p.id === id);
}

// ---------- Rendu de la collection ----------
function renderGrid() {
  const grid = document.getElementById("product-grid");
  const count = document.getElementById("collection-count");
  count.textContent = PRODUITS.length + (PRODUITS.length > 1 ? " pièces" : " pièce");

  grid.innerHTML = PRODUITS.map((p, i) => {
    const no = String(i + 1).padStart(2, "0");
    const imageStyle = p.image
      ? `background-image:url('${p.image}');background-size:cover;background-position:center;`
      : `background:linear-gradient(155deg, ${p.couleur} 0%, rgba(0,0,0,0.35) 100%);`;
    return `
      <article class="card">
        <div class="card__image" style="${imageStyle}">${p.image ? "" : p.nom}</div>
        <p class="card__no">N°${no}</p>
        <h3 class="card__name">${p.nom}</h3>
        <p class="card__desc">${p.description}</p>
        <div class="card__foot">
          <span class="card__price">${formatPrice(p.prix)}</span>
          <button class="card__add" data-id="${p.id}">Ajouter</button>
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".card__add").forEach(btn => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
      btn.dataset.added = "true";
      btn.textContent = "Ajouté ✓";
      setTimeout(() => {
        btn.dataset.added = "false";
        btn.textContent = "Ajouter";
      }, 900);
    });
  });
}

// ---------- Panier ----------
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  renderCart();
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = getProduct(id);
    return sum + (p ? p.prix * qty : 0);
  }, 0);
}

function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function renderCart() {
  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const totalEl = document.getElementById("cart-total");
  const countEl = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");

  const entries = Object.entries(cart);
  countEl.textContent = cartCount();
  totalEl.textContent = formatPrice(cartTotal());
  checkoutBtn.disabled = entries.length === 0;

  if (entries.length === 0) {
    itemsEl.innerHTML = "";
    itemsEl.appendChild(emptyEl);
    return;
  }

  itemsEl.innerHTML = entries.map(([id, qty]) => {
    const p = getProduct(id);
    if (!p) return "";
    const swatchStyle = p.image
      ? `background-image:url('${p.image}');background-size:cover;background-position:center;`
      : `background:${p.couleur};`;
    return `
      <div class="cart-item" data-id="${id}">
        <div class="cart-item__swatch" style="${swatchStyle}"></div>
        <div class="cart-item__info">
          <p class="cart-item__name">${p.nom}</p>
          <p class="cart-item__price">${formatPrice(p.prix)}</p>
        </div>
        <div class="cart-item__qty">
          <button class="qty-minus" data-id="${id}" aria-label="Diminuer la quantité">−</button>
          <span>${qty}</span>
          <button class="qty-plus" data-id="${id}" aria-label="Augmenter la quantité">+</button>
        </div>
        <button class="cart-item__remove" data-id="${id}">Retirer</button>
      </div>
    `;
  }).join("");

  itemsEl.querySelectorAll(".qty-minus").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.id, -1)));
  itemsEl.querySelectorAll(".qty-plus").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.id, 1)));
  itemsEl.querySelectorAll(".cart-item__remove").forEach(b => b.addEventListener("click", () => removeFromCart(b.dataset.id)));
}

// ---------- Panneau panier : ouverture / fermeture ----------
const overlay = document.getElementById("cart-overlay");
const panel = document.getElementById("cart-panel");

function openCart() {
  overlay.classList.add("open");
  panel.classList.add("open");
}

function closeCart() {
  overlay.classList.remove("open");
  panel.classList.remove("open");
}

document.getElementById("cart-toggle").addEventListener("click", openCart);
document.getElementById("cart-close").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// ---------- Commande via WhatsApp ----------
function buildWhatsappMessage() {
  const lines = ["Bonjour, je souhaite commander :"];
  Object.entries(cart).forEach(([id, qty]) => {
    const p = getProduct(id);
    if (p) lines.push(`• ${p.nom} x${qty} — ${formatPrice(p.prix * qty)}`);
  });
  lines.push("", `Total : ${formatPrice(cartTotal())}`);
  return lines.join("\n");
}

document.getElementById("checkout-btn").addEventListener("click", () => {
  const message = encodeURIComponent(buildWhatsappMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
});

document.getElementById("contact-whatsapp").addEventListener("click", (e) => {
  e.preventDefault();
  window.open(`https://wa.me/${WHATSAPP_NUMBER}`, "_blank");
});

// ---------- Init ----------
renderGrid();
renderCart();