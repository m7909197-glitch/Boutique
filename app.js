/*
  ===========================================================
  RÉGLAGES — à modifier une seule fois
  ===========================================================
*/

// Ton numéro WhatsApp, au format international, SANS le "+",
// sans espace ni tiret. Exemple pour le Sénégal : "221771234567"
const WHATSAPP_NUMBER = "221771234567";

// Le lien CSV publié de ton Google Sheet (Fichier > Partager >
// Publier sur le web > choisis "Valeurs séparées par des virgules (.csv)").
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQHIG7gJfIVUt2pETk9yMEhS921tQbiIlLdby7upqzcHuCXVaYSpIq10J1rKGWNuZYUfk4xiozkojF9/pub?output=csv";

// ===========================================================
// À partir d'ici, tu n'as normalement rien à toucher.
// ===========================================================

let PRODUITS = []; // rempli automatiquement depuis ton Google Sheet au chargement de la page

const cart = {}; // { "produitId::indexCouleur": quantite }
const selectedColor = {}; // { produitId: indexCouleur } — couleur actuellement affichée sur chaque carte
let activeFilter = "Tous";

function formatPrice(n) {
  return n.toLocaleString("fr-FR") + " FCFA";
}

function getProduct(id) {
  return PRODUITS.find(function (p) { return p.id === id; });
}

// Une "clé panier" identifie un produit ET sa couleur, ex: "pashmina::1"
function makeKey(productId, colorIndex) {
  return productId + "::" + colorIndex;
}

function parseKey(key) {
  const parts = key.split("::");
  const productId = parts[0];
  const colorIndex = parts[1];
  const p = getProduct(productId);
  if (!p) return null;
  const couleur = p.couleurs[Number(colorIndex)];
  if (!couleur) return null;
  return { p: p, couleur: couleur, colorIndex: Number(colorIndex) };
}

// ---------- Construction de PRODUITS à partir des lignes du Google Sheet ----------
function texteVersBooleen(texte) {
  const valeur = (texte || "").trim().toLowerCase();
  return valeur === "oui" || valeur === "true" || valeur === "1";
}

function construireProduits(lignes) {
  const parId = {};
  const ordre = [];

  lignes.forEach(function (ligne) {
    const id = (ligne.id || "").trim();
    if (!id) return; // ignore les lignes vides ou incomplètes

    if (!parId[id]) {
      parId[id] = {
        id: id,
        nom: (ligne.nom || "").trim(),
        prix: Number(ligne.prix) || 0,
        description: (ligne.description || "").trim(),
        categorie: (ligne.categorie || "Autres").trim(),
        couleurs: []
      };
      ordre.push(id);
    }

    parId[id].couleurs.push({
      nom: (ligne.couleur_nom || "").trim(),
      hex: (ligne.couleur_hex || "#8A8577").trim(),
      image: (ligne.image || "").trim(),
      disponible: texteVersBooleen(ligne.disponible)
    });
  });

  return ordre.map(function (id) { return parId[id]; });
}

function chargerProduits() {
  Papa.parse(SHEET_CSV_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (resultat) {
      PRODUITS = construireProduits(resultat.data);
      renderPreview();
      renderTabs();
      renderGrid();
      renderCart();
    },
    error: function () {
      const compteur = document.getElementById("collection-count");
      if (compteur) {
        compteur.textContent = "Impossible de charger les produits pour le moment. Réessaie dans un instant.";
      }
    }
  });
}

// ---------- Aperçu sur la page d'accueil ----------
function renderPreview() {
  const previewGrid = document.getElementById("preview-grid");
  if (!previewGrid) return;

  // Un seul exemple par catégorie, dans l'ordre d'apparition dans le Sheet
  const dejaVu = {};
  const echantillons = [];
  PRODUITS.forEach(function (p) {
    if (!dejaVu[p.categorie]) {
      dejaVu[p.categorie] = true;
      echantillons.push(p);
    }
  });

  previewGrid.innerHTML = echantillons.map(function (p) {
    const couleur = p.couleurs[0];
    const imageStyle = couleur.image
      ? "background-image:url('" + couleur.image + "');background-size:cover;background-position:center;"
      : "background:linear-gradient(155deg, " + couleur.hex + " 0%, rgba(0,0,0,0.35) 100%);";
    return (
      '<button class="preview-card" data-cat="' + p.categorie + '">' +
        '<div class="preview-card__image" style="' + imageStyle + '">' + (couleur.image ? "" : p.nom) + '</div>' +
        '<p class="preview-card__cat">' + p.categorie + '</p>' +
        '<p class="preview-card__price">' + formatPrice(p.prix) + '</p>' +
      '</button>'
    );
  }).join("");

  previewGrid.querySelectorAll(".preview-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openCollectionPanel(btn.dataset.cat);
    });
  });
}

// ---------- Onglets de catégorie (dans le panneau collection) ----------
function renderTabs() {
  const tabsEl = document.getElementById("category-tabs");
  if (!tabsEl) return;

  const categories = ["Tous"];
  PRODUITS.forEach(function (p) {
    if (categories.indexOf(p.categorie) === -1) categories.push(p.categorie);
  });

  tabsEl.innerHTML = categories.map(function (cat) {
    const active = cat === activeFilter ? "tab--active" : "";
    return '<button class="tab ' + active + '" data-cat="' + cat + '">' + cat + '</button>';
  }).join("");

  tabsEl.querySelectorAll(".tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      activeFilter = btn.dataset.cat;
      renderTabs();
      renderGrid();
    });
  });
}

// ---------- Grille de produits (dans le panneau collection) ----------
function renderCard(p) {
  const idx = selectedColor[p.id] || 0;
  const couleur = p.couleurs[idx];

  const imageStyle = couleur.image
    ? "background-image:url('" + couleur.image + "');background-size:cover;background-position:center;"
    : "background:linear-gradient(155deg, " + couleur.hex + " 0%, rgba(0,0,0,0.35) 100%);";

  const swatches = p.couleurs.map(function (c, i) {
    const active = i === idx ? "swatch--active" : "";
    const epuise = !c.disponible ? "swatch--epuise" : "";
    return (
      '<button class="swatch ' + active + ' ' + epuise + '" style="--swatch-color:' + c.hex + '" ' +
      'data-id="' + p.id + '" data-idx="' + i + '" aria-label="' + c.nom + (c.disponible ? "" : " (épuisé)") + '" title="' + c.nom + (c.disponible ? "" : " — épuisé") + '"></button>'
    );
  }).join("");

  const badge = !couleur.disponible
    ? '<span class="card__badge">Épuisé</span>'
    : "";

  const boutonDesactive = !couleur.disponible;

  return (
    '<article class="card">' +
      '<div class="card__image" style="' + imageStyle + '">' + badge + (couleur.image ? "" : p.nom) + '</div>' +
      '<p class="card__no">' + p.categorie + '</p>' +
      '<h3 class="card__name">' + p.nom + '</h3>' +
      '<p class="card__desc">' + p.description + '</p>' +
      '<p class="card__color-label">Couleur : ' + couleur.nom + '</p>' +
      '<div class="card__swatches">' + swatches + '</div>' +
      '<div class="card__foot">' +
        '<span class="card__price" style="--price-dot-color:' + couleur.hex + '">' + formatPrice(p.prix) + '</span>' +
        '<button class="card__add" data-id="' + p.id + '"' + (boutonDesactive ? " disabled" : "") + '>' + (boutonDesactive ? "Épuisé" : "Ajouter") + '</button>' +
      '</div>' +
    '</article>'
  );
}

function renderGrid() {
  const grid = document.getElementById("product-grid");
  const count = document.getElementById("collection-count");
  if (!grid || !count) return;

  const visibles = activeFilter === "Tous"
    ? PRODUITS
    : PRODUITS.filter(function (p) { return p.categorie === activeFilter; });

  count.textContent = visibles.length + (visibles.length > 1 ? " pièces" : " pièce");

  grid.innerHTML = visibles.map(function (p) { return renderCard(p); }).join("");

  grid.querySelectorAll(".swatch").forEach(function (btn) {
    btn.addEventListener("click", function () {
      selectedColor[btn.dataset.id] = Number(btn.dataset.idx);
      renderGrid();
    });
  });

  grid.querySelectorAll(".card__add").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const idx = selectedColor[btn.dataset.id] || 0;
      addToCart(makeKey(btn.dataset.id, idx));
      btn.textContent = "Ajouté ✓";
      setTimeout(function () {
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
  return Object.keys(cart).reduce(function (sum, key) {
    const variant = parseKey(key);
    return sum + (variant ? variant.p.prix * cart[key] : 0);
  }, 0);
}

function cartCount() {
  return Object.keys(cart).reduce(function (sum, key) { return sum + cart[key]; }, 0);
}

function renderCart() {
  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const totalEl = document.getElementById("cart-total");
  const countEl = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!itemsEl || !totalEl || !countEl || !checkoutBtn) return;

  const keys = Object.keys(cart);
  countEl.textContent = cartCount();
  totalEl.textContent = formatPrice(cartTotal());
  checkoutBtn.disabled = keys.length === 0;

  if (keys.length === 0) {
    itemsEl.innerHTML = "";
    if (emptyEl) itemsEl.appendChild(emptyEl);
    return;
  }

  itemsEl.innerHTML = keys.map(function (key) {
    const qty = cart[key];
    const variant = parseKey(key);
    if (!variant) return "";
    const p = variant.p;
    const couleur = variant.couleur;
    const swatchStyle = couleur.image
      ? "background-image:url('" + couleur.image + "');background-size:cover;background-position:center;"
      : "background:" + couleur.hex + ";";
    return (
      '<div class="cart-item" data-key="' + key + '">' +
        '<div class="cart-item__swatch" style="' + swatchStyle + '"></div>' +
        '<div class="cart-item__info">' +
          '<p class="cart-item__name">' + p.nom + '</p>' +
          '<p class="cart-item__price">' + couleur.nom + ' — ' + formatPrice(p.prix) + '</p>' +
        '</div>' +
        '<div class="cart-item__qty">' +
          '<button class="qty-minus" data-key="' + key + '" aria-label="Diminuer la quantité">−</button>' +
          '<span>' + qty + '</span>' +
          '<button class="qty-plus" data-key="' + key + '" aria-label="Augmenter la quantité">+</button>' +
        '</div>' +
        '<button class="cart-item__remove" data-key="' + key + '">Retirer</button>' +
      '</div>'
    );
  }).join("");

  itemsEl.querySelectorAll(".qty-minus").forEach(function (b) { b.addEventListener("click", function () { changeQty(b.dataset.key, -1); }); });
  itemsEl.querySelectorAll(".qty-plus").forEach(function (b) { b.addEventListener("click", function () { changeQty(b.dataset.key, 1); }); });
  itemsEl.querySelectorAll(".cart-item__remove").forEach(function (b) { b.addEventListener("click", function () { removeFromCart(b.dataset.key); }); });
}

// ---------- Panneaux (panier ET collection) : ouverture / fermeture ----------
function openPanel(overlayId, panelId) {
  document.getElementById(overlayId).classList.add("open");
  document.getElementById(panelId).classList.add("open");
}

function closePanel(overlayId, panelId) {
  document.getElementById(overlayId).classList.remove("open");
  document.getElementById(panelId).classList.remove("open");
}

document.getElementById("cart-toggle").addEventListener("click", function () {
  openPanel("cart-overlay", "cart-panel");
});
document.getElementById("cart-close").addEventListener("click", function () {
  closePanel("cart-overlay", "cart-panel");
});
document.getElementById("cart-overlay").addEventListener("click", function () {
  closePanel("cart-overlay", "cart-panel");
});

// ---------- Panneau collection : ouverture / fermeture ----------
function openCollectionPanel(categorie) {
  activeFilter = categorie || "Tous";
  renderTabs();
  renderGrid();
  openPanel("collection-overlay", "collection-panel");
}

document.getElementById("collection-toggle").addEventListener("click", function () {
  openCollectionPanel("Tous");
});
document.getElementById("hero-collection-btn").addEventListener("click", function () {
  openCollectionPanel("Tous");
});
document.getElementById("preview-collection-btn").addEventListener("click", function () {
  openCollectionPanel("Tous");
});
document.getElementById("collection-close").addEventListener("click", function () {
  closePanel("collection-overlay", "collection-panel");
});
document.getElementById("collection-overlay").addEventListener("click", function () {
  closePanel("collection-overlay", "collection-panel");
});

// ---------- Commande via WhatsApp ----------
function buildWhatsappMessage() {
  const lines = ["Bonjour, je souhaite commander :"];
  Object.keys(cart).forEach(function (key) {
    const qty = cart[key];
    const variant = parseKey(key);
    if (variant) {
      lines.push("• " + variant.p.nom + " (" + variant.couleur.nom + ") x" + qty + " — " + formatPrice(variant.p.prix * qty));
    }
  });
  lines.push("", "Total : " + formatPrice(cartTotal()));
  return lines.join("\n");
}

document.getElementById("checkout-btn").addEventListener("click", function () {
  const message = encodeURIComponent(buildWhatsappMessage());
  window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + message, "_blank");
});

document.getElementById("contact-whatsapp").addEventListener("click", function (e) {
  e.preventDefault();
  window.open("https://wa.me/" + WHATSAPP_NUMBER, "_blank");
});

// ---------- Init ----------
chargerProduits();
renderCart();