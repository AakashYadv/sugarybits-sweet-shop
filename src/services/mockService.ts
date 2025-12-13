import { Sweet, SweetFilter, User, Order, CartItem, Address, OrderStatus, RegisterData } from '../types';

// Use relative URL so requests go through the Vite Proxy (defined in vite.config.ts)
// This resolves CORS issues and "Failed to fetch" network errors.
const API_URL = '/api';

class ApiService {
  
  private async request(endpoint: string, options?: RequestInit) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        ...options,
      });
      
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        // Handle non-JSON responses (usually server errors like 404 or 500 html pages)
        const text = await res.text();
        if (!res.ok) {
             console.error("Server returned non-JSON error:", text);
             throw new Error(`Server Error (${res.status}): ${text.substring(0, 200)}`);
        }
        return text; 
      }

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (e: any) {
      console.error("API Request Failed:", e);
      // If it is a network error (server down, wrong port), fetch throws a TypeError
      if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
        throw new Error("Cannot connect to server. Is the backend running on port 3001?");
      }
      throw e;
    }
  }

  // --- Auth ---

  async register(data: RegisterData): Promise<User> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if(response && response.user) {
        localStorage.setItem('sb_current_user_id', response.user.id);
        return response.user;
    }
    throw new Error("Invalid response from server during registration");
  }

  async login(identifier: string): Promise<User> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
    localStorage.setItem('sb_current_user_id', response.user.id);
    return response.user;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('sb_current_user_id');
  }

  getCurrentUser(): User | null {
    return null; 
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.request(`/users/${id}`);
    } catch {
      return null;
    }
  }

  // --- Sweets ---

  async getSweets(filters?: SweetFilter): Promise<Sweet[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());

    return this.request(`/sweets?${params.toString()}`);
  }

  async addSweet(sweet: Omit<Sweet, 'id'>): Promise<Sweet> {
    return this.request('/sweets', {
      method: 'POST',
      body: JSON.stringify(sweet)
    });
  }

  async updateSweet(updated: Sweet): Promise<Sweet> {
    return this.request(`/sweets/${updated.id}`, {
      method: 'PUT',
      body: JSON.stringify(updated)
    });
  }

  async deleteSweet(id: string): Promise<void> {
    await this.request(`/sweets/${id}`, { method: 'DELETE' });
  }

  async restockSweet(id: string, amount: number): Promise<Sweet> {
    return this.request(`/sweets/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  // --- Cart ---

  async getCart(userId: string): Promise<CartItem[]> {
    return this.request(`/cart/${userId}`);
  }

  async addToCart(userId: string, sweet: Sweet): Promise<CartItem[]> {
    return this.request(`/cart/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ sweetId: sweet.id })
    });
  }

  async updateCartItemQuantity(userId: string, sweetId: string, quantity: number): Promise<CartItem[]> {
    return this.request(`/cart/${userId}/item/${sweetId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity })
    });
  }

  async clearCart(userId: string): Promise<void> {
    await this.request(`/cart/${userId}`, { method: 'DELETE' });
  }

  // --- Wishlist ---

  async toggleWishlist(userId: string, sweetId: string): Promise<string[]> {
    return this.request(`/wishlist/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ sweetId })
    });
  }

  async getWishlist(userId: string): Promise<string[]> {
    return this.request(`/wishlist/${userId}`);
  }

  // --- Orders ---

  async createOrder(userId: string, address: Address, cartItems: CartItem[]): Promise<Order> {
    const user = await this.getUserById(userId);
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        username: user?.username || 'Guest',
        items: cartItems,
        totalAmount,
        shippingAddress: address
      })
    });
  }

  async getOrders(user: User): Promise<Order[]> {
    return this.request(`/orders?userId=${user.id}&role=${user.role}`);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }
}

export const sweetService = new ApiService();