const API_BASE_URL = "https://fakestoreapi.com";

export async function fetchProducts({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/products`, {
    signal,
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`Product service returned ${response.status}.`);
  }
  const products = await response.json();
  if (!Array.isArray(products)) {
    throw new Error("The product service returned an unexpected response.");
  }
  return products;
}
