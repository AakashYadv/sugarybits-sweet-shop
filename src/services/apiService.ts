import { RegisterData, Sweet, User, Address, PaymentDetails, OrderStatus } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL;


/* ---------- AUTH ---------- */

async function register(data: RegisterData): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }

  const json = await res.json();
  localStorage.setItem("user", JSON.stringify(json.user));
  return json.user;
}

async function login(identifier: string): Promise<User> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier }),
  });

  if (!res.ok) throw new Error("Login failed");

  const json = await res.json();
  localStorage.setItem("user", JSON.stringify(json.user));
  return json.user;
}

function logout() {
  localStorage.removeItem("user");
}

function getCurrentUser(): User | null {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

/* ---------- SWEETS ---------- */

async function getSweets(filters?: any): Promise<Sweet[]> {
  const params = new URLSearchParams(filters || {}).toString();
  const res = await fetch(`${API_BASE}/api/sweets?${params}`);
  return res.json();
}

async function addSweet(sweet: Partial<Sweet>) {
  const res = await fetch(`${API_BASE}/api/sweets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sweet),
  });
  return res.json();
}

async function updateSweet(sweet: Sweet) {
  const res = await fetch(`${API_BASE}/api/sweets/${sweet.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sweet),
  });
  return res.json();
}

async function deleteSweet(id: string) {
  await fetch(`${API_BASE}/api/sweets/${id}`, { method: "DELETE" });
}

async function restockSweet(id: string, amount: number) {
  const res = await fetch(`${API_BASE}/api/sweets/${id}/restock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}

/* ---------- CART ---------- */

async function getCart(userId: string) {
  const res = await fetch(`${API_BASE}/api/cart/${userId}`);
  return res.json();
}

async function addToCart(userId: string, sweet: Sweet) {
  const res = await fetch(`${API_BASE}/api/cart/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sweetId: sweet.id }),
  });
  return res.json();
}

async function updateCartItemQuantity(userId: string, id: string, quantity: number) {
  const res = await fetch(`${API_BASE}/api/cart/${userId}/item/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  return res.json();
}

/* ---------- WISHLIST ---------- */

async function getWishlist(userId: string) {
  const res = await fetch(`${API_BASE}/api/wishlist/${userId}`);
  return res.json();
}

async function toggleWishlist(userId: string, sweetId: string) {
  const res = await fetch(`${API_BASE}/api/wishlist/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sweetId }),
  });
  return res.json();
}

/* ---------- ORDERS ---------- */

async function createOrder(userId: string, address: Address, items: any[]) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, items, shippingAddress: address }),
  });
  return res.json();
}

async function getOrders(user: User) {
  const params = new URLSearchParams({
    userId: user.id,
    role: user.role,
  });
  const res = await fetch(`${API_BASE}/api/orders?${params}`);
  return res.json();
}

async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

/* ---------- EXPORT ---------- */

export const sweetService = {
  register,
  login,
  logout,
  getCurrentUser,

  getSweets,
  addSweet,
  updateSweet,
  deleteSweet,
  restockSweet,

  getCart,
  addToCart,
  updateCartItemQuantity,

  getWishlist,
  toggleWishlist,

  createOrder,
  getOrders,
  updateOrderStatus,
};
