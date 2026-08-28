/*
  ===========================================================
  RÉGLAGES — à modifier une seule fois
  ===========================================================
  Ton numéro WhatsApp, au format international, SANS le "+",
  sans espace ni tiret. Exemple pour le Sénégal : "221771234567"
*/
const WHATSAPP_NUMBER = "221772595295";

// ===========================================================
// À partir d'ici, tu n'as normalement rien à toucher.
// ===========================================================

const cart = {}; // { "produitId::indexCouleur": quantite }
const selectedColor = {}; // { produitId: indexCouleur } — couleur actuellement affichée sur chaque carte
let activeFilter = "Tous";

function formatPrice(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function getProduct(id) {
  return PRODUITS.find(p => p.id === id);
}

// Une "clé panier" identifie un produit ET sa couleur, ex: "pashmina::1"
function makeKey(productId, colorIndex) {
  return `${productId}::${colorIndex}`;
}

function parseKey(key) {
  const [productId, colorIndex] = key.split("::");
  const p = getProduct(productId);
  if (!p) return null;
  const couleur = p.couleurs[Number(colorIndex)];
  return { p, couleur, colorIndex: Number(colorIndex) };
}

// ---------- Onglets de catégorie ----------
function renderTabs() {
  const tabsEl = document.getElementById("category-tabs");
  const categories = ["Tous", ...new Set(PRODUITS.map(p => p.categorie))];

  tabsEl.innerHTML = categories.map(cat => `
    <button class="tab ${cat === activeFilter ? "tab--active" : ""}" data-cat="${cat}">
      ${cat}
    </button>
  `).join("");

  tabsEl.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.cat;
      renderTabs();
      renderGrid();
    });
  });
}

// ---------- Grille de produits ----------
function renderCard(p) {
  const idx = selectedColor[p.id] || 0;
  const couleur = p.couleurs[idx];

  const imageStyle = couleur.image
    ? `background-image:url('${couleur.image}');background-size:cover;background-position:center;`
    : `background:linear-gradient(155deg, ${couleur.hex} 0%, rgba(0,0,0,0.35) 100%);`;

  const swatches = p.couleurs.map((c, i) => `
    <button
      class="swatch ${i === idx ? "swatch--active" : ""}"
      style="--swatch-color:${c.hex}"
      data-id="${p.id}"
      data-idx="${i}"
      aria-label="${c.nom}"
      title="${c.nom}"
    ></button>
  `).join("");

  return `
    <article class="card">
      <div class="card__image" style="${imageStyle}">${couleur.image ? "" : p.nom}</div>
      <p class="card__no">${p.categorie}</p>
      <h3 class="card__name">${p.nom}</h3>
      <p class="card__desc">${p.description}</p>
      <p class="card__color-label">Couleur : ${couleur.nom}</p>
      <div class="card__swatches">${swatches}</div>
      <div class="card__foot">
        <span class="card__price" style="--price-dot-color:${couleur.hex}">${formatPrice(p.prix)}</span>
        <button class="card__add" data-id="${p.id}">Ajouter</button>
      </div>
    </article>
  `;
}

function renderGrid() {
  const grid = document.getElementById("product-grid");
  const count = document.getElementById("collection-count");

  const visibles = activeFilter === "Tous"
    ? PRODUITS
    : PRODUITS.filter(p => p.categorie === activeFilter);

  count.textContent = visibles.length + (visibles.length > 1 ? " pièces" : " pièce");

  grid.innerHTML = visibles.map(p => renderCard(p)).join("");

  // Clic sur une pastille de couleur : change juste l'affichage de cette carte
  grid.querySelectorAll(".swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedColor[btn.dataset.id] = Number(btn.dataset.idx);
      renderGrid();
    });
  });

  // Clic sur "Ajouter" : ajoute la couleur actuellement affichée sur cette carte
  grid.querySelectorAll(".card__add").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = selectedColor[btn.dataset.id] || 0;
      addToCart(makeKey(btn.dataset.id, idx));
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
function addToCart(key) {
  cart[key] = (cart[key] || 0) + 1;
  renderCart();
}

function changeQty(key, delta) {
  if (!cart[key]) return;
  cart[key] += delta;
  if (cart[key] <= 0) delete cart[key];
  renderCart();
}

function removeFromCart(key) {
  delete cart[key];
  renderCart();
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [key, qty]) => {
    const variant = parseKey(key);
    return sum + (variant ? variant.p.prix * qty : 0);
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

  itemsEl.innerHTML = entries.map(([key, qty]) => {
    const variant = parseKey(key);
    if (!variant) return "";
    const { p, couleur } = variant;
    const swatchStyle = couleur.image
      ? `background-image:url('${couleur.image}');background-size:cover;background-position:center;`
      : `background:${couleur.hex};`;
    return `
      <div class="cart-item" data-key="${key}">
        <div class="cart-item__swatch" style="${swatchStyle}"></div>
        <div class="cart-item__info">
          <p class="cart-item__name">${p.nom}</p>
          <p class="cart-item__price">${couleur.nom} — ${formatPrice(p.prix)}</p>
        </div>
        <div class="cart-item__qty">
          <button class="qty-minus" data-key="${key}" aria-label="Diminuer la quantité">−</button>
          <span>${qty}</span>
          <button class="qty-plus" data-key="${key}" aria-label="Augmenter la quantité">+</button>
        </div>
        <button class="cart-item__remove" data-key="${key}">Retirer</button>
      </div>
    `;
  }).join("");

  itemsEl.querySelectorAll(".qty-minus").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.key, -1)));
  itemsEl.querySelectorAll(".qty-plus").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.key, 1)));
  itemsEl.querySelectorAll(".cart-item__remove").forEach(b => b.addEventListener("click", () => removeFromCart(b.dataset.key)));
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
  Object.entries(cart).forEach(([key, qty]) => {
    const variant = parseKey(key);
    if (variant) {
      const { p, couleur } = variant;
      lines.push(`• ${p.nom} (${couleur.nom}) x${qty} — ${formatPrice(p.prix * qty)}`);
    }
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
renderTabs();
renderGrid();
renderCart();