import { fetchProducts } from "./api.js";

const state = {
  products: [],
  category: "all",
  query: "",
  sort: "featured",
  cart: loadCart(),
  requestController: null
};

const elements = {
  grid: document.querySelector("#product-grid"),
  loading: document.querySelector("#loading-grid"),
  error: document.querySelector("#error-banner"),
  errorMessage: document.querySelector("#error-message"),
  empty: document.querySelector("#empty-state"),
  resultsCount: document.querySelector("#results-count"),
  search: document.querySelector("#search-input"),
  sort: document.querySelector("#sort-select"),
  categoryTabs: document.querySelector("#category-tabs"),
  cartCount: document.querySelector("#cart-count"),
  cartSection: document.querySelector("#cart-section"),
  cartItems: document.querySelector("#cart-items"),
  cartTotal: document.querySelector("#cart-total"),
  toast: document.querySelector("#toast")
};

let toastTimer;
function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem("northstar-cart") || "[]");
    return Array.isArray(parsed) ? parsed.filter(item =>
      item && Number.isInteger(item.id) && Number.isInteger(item.quantity) && item.quantity > 0
    ) : [];
  } catch {
    return [];
  }
}
function saveCart() {
  try {
    localStorage.setItem("northstar-cart", JSON.stringify(state.cart));
  } catch {
    showToast("Cart could not be saved in this browser.");
  }
}
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}
function formatPrice(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
function categoryLabel(category) {
  return category === "jewelery" ? "Jewelry" : category.replace(/^./, character => character.toUpperCase());
}
function setLoading(isLoading) {
  elements.loading.hidden = !isLoading;
  elements.loading.setAttribute("aria-busy", String(isLoading));
  elements.grid.setAttribute("aria-busy", String(isLoading));
  if (isLoading) {
    elements.error.hidden = true;
    elements.empty.hidden = true;
  }
}
async function loadProducts() {
  if (state.requestController) state.requestController.abort();
  state.requestController = new AbortController();
  setLoading(true);
  try {
    state.products = await fetchProducts({ signal: state.requestController.signal });
    renderProducts();
  } catch (error) {
    if (error.name === "AbortError") return;
    elements.errorMessage.textContent = `${error.message} Check your internet connection and retry.`;
    elements.error.hidden = false;
    elements.resultsCount.textContent = "Products are currently unavailable.";
    elements.grid.replaceChildren();
  } finally {
    if (!state.requestController.signal.aborted) setLoading(false);
  }
}
function filteredProducts() {
  const query = state.query.trim().toLocaleLowerCase();
  const results = state.products.filter(product => {
    const matchesCategory = state.category === "all" || product.category === state.category;
    const matchesQuery = `${product.title} ${product.description} ${product.category}`.toLocaleLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });
  switch (state.sort) {
    case "price-asc": results.sort((a, b) => a.price - b.price); break;
    case "price-desc": results.sort((a, b) => b.price - a.price); break;
    case "title-asc": results.sort((a, b) => a.title.localeCompare(b.title)); break;
    case "rating-desc": results.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0)); break;
  }
  return results;
}
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  const imageWrap = document.createElement("div");
  imageWrap.className = "product-image-wrap";
  const image = document.createElement("img");
  image.className = "product-image";
  image.src = product.image;
  image.alt = product.title;
  image.loading = "lazy";
  image.addEventListener("error", () => { image.hidden = true; }, { once: true });
  imageWrap.append(image);

  const category = document.createElement("p");
  category.className = "product-category";
  category.textContent = categoryLabel(product.category);
  const title = document.createElement("h3");
  title.className = "product-title";
  title.textContent = product.title;
  const rating = document.createElement("p");
  rating.className = "product-rating";
  const score = Number(product.rating?.rate || 0);
  rating.textContent = `★ ${score.toFixed(1)} `;
  const count = document.createElement("span");
  count.textContent = `(${product.rating?.count || 0} reviews)`;
  rating.append(count);

  const bottom = document.createElement("div");
  bottom.className = "product-bottom";
  const price = document.createElement("strong");
  price.className = "product-price";
  price.textContent = formatPrice(product.price);
  const addButton = document.createElement("button");
  addButton.className = "add-button";
  addButton.type = "button";
  addButton.textContent = "+ Add to cart";
  addButton.setAttribute("aria-label", `Add ${product.title} to cart`);
  addButton.addEventListener("click", () => addToCart(product));
  bottom.append(price, addButton);
  card.append(imageWrap, category, title, rating, bottom);
  return card;
}
function renderProducts() {
  const products = filteredProducts();
  const fragment = document.createDocumentFragment();
  products.forEach(product => fragment.append(createProductCard(product)));
  elements.grid.replaceChildren(fragment);
  elements.resultsCount.textContent = `${products.length} product${products.length === 1 ? "" : "s"} found`;
  elements.empty.hidden = products.length > 0;
}
function addToCart(product) {
  const existing = state.cart.find(item => item.id === product.id);
  if (existing) existing.quantity += 1;
  else state.cart.push({ id: product.id, title: product.title, price: product.price, quantity: 1 });
  saveCart();
  renderCart();
  showToast(`${product.title} added to cart.`);
}
function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  elements.cartCount.textContent = String(count);
  elements.cartCount.setAttribute("aria-label", `${count} items in cart`);
  const fragment = document.createDocumentFragment();
  state.cart.forEach(item => {
    const li = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = `${item.title} × ${item.quantity}`;
    const price = document.createElement("strong");
    price.textContent = formatPrice(item.price * item.quantity);
    li.append(name, price);
    fragment.append(li);
  });
  elements.cartItems.replaceChildren(fragment);
  elements.cartTotal.textContent = formatPrice(state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
}
elements.search.addEventListener("input", event => {
  state.query = event.target.value;
  renderProducts();
});
document.querySelector("#search-form").addEventListener("submit", event => {
  event.preventDefault();
  state.query = elements.search.value;
  renderProducts();
});
elements.categoryTabs.addEventListener("click", event => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  state.category = button.dataset.category;
  elements.categoryTabs.querySelectorAll("button[data-category]").forEach(tab => {
    const active = tab === button;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
});
elements.sort.addEventListener("change", event => {
  state.sort = event.target.value;
  renderProducts();
});
document.querySelector("#clear-filters").addEventListener("click", () => {
  state.category = "all";
  state.query = "";
  state.sort = "featured";
  elements.search.value = "";
  elements.sort.value = "featured";
  elements.categoryTabs.querySelectorAll("button[data-category]").forEach(tab => {
    const active = tab.dataset.category === "all";
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
  renderProducts();
});
document.querySelector("#retry-button").addEventListener("click", loadProducts);
document.querySelector("#cart-button").addEventListener("click", () => {
  elements.cartSection.hidden = false;
  elements.cartSection.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#cart-title").focus?.();
});
document.querySelector("#close-cart").addEventListener("click", () => { elements.cartSection.hidden = true; });
document.querySelector("#clear-cart").addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
  showToast("Your cart has been cleared.");
});

renderCart();
loadProducts();
