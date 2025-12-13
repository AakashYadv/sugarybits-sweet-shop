import { Sweet, SweetCategory, SweetFilter, User, UserRole, Order, CartItem, Address, OrderStatus, RegisterData } from '../types.ts';

// Initial Mock Data
const INITIAL_SWEETS: Sweet[] = [
  {
    id: '1',
    name: 'Rainbow Gummy Bears',
    category: SweetCategory.GUMMY,
    description: 'Soft, chewy, and bursting with fruit flavors. A classic treat for all ages.',
    price: 3.50,
    quantity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    name: 'Dark Chocolate Truffles',
    category: SweetCategory.CHOCOLATE,
    description: 'Rich 70% cocoa truffles dusted with premium cocoa powder. Melt in your mouth luxury.',
    price: 12.00,
    quantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '3',
    name: 'Sour Apple Rings',
    category: SweetCategory.GUMMY,
    description: 'Tangy apple flavor with a sugar coating that packs a punch.',
    price: 4.25,
    quantity: 0, // Out of stock demo
    imageUrl: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '4',
    name: 'Peppermint Swirls',
    category: SweetCategory.HARD_CANDY,
    description: 'Classic holiday starlight mints. Refreshing and long-lasting.',
    price: 2.00,
    quantity: 200,
    imageUrl: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '5',
    name: 'Raspberry Macarons',
    category: SweetCategory.PASTRY,
    description: 'Delicate french cookies with ganache filling. Crispy shell, chewy center.',
    price: 15.00,
    quantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '6',
    name: 'Sugar Free Lollipops',
    category: SweetCategory.SUGAR_FREE,
    description: 'All the fun without the sugar. Fruit flavored swirls.',
    price: 5.50,
    quantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80'
  }
];

const STORAGE_KEYS = {
  SWEETS: 'sb_sweets_v3',
  USERS: 'sb_users_v3', // Stores list of registered users
  CURRENT_USER: 'sb_current_user_v3',
  ORDERS: 'sb_orders_v3',
  CARTS: 'sb_carts_v3',
  WISHLISTS: 'sb_wishlists_v3'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockBackendService {
  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.SWEETS)) {
      localStorage.setItem(STORAGE_KEYS.SWEETS, JSON.stringify(INITIAL_SWEETS));
    }
  }

  // --- Auth & User Management ---

  private getAllUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  }

  private saveUser(user: User) {
    const users = this.getAllUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  async register(data: RegisterData): Promise<User> {
    await delay(800);
    const users = this.getAllUsers();

    // Unique Checks
    if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
      throw new Error("Username already taken");
    }
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("Email already registered");
    }

    // Role assignment: simplistic "admin" check in username for demo, otherwise customer
    const role = data.username.toLowerCase().includes('admin') ? UserRole.ADMIN : UserRole.CUSTOMER;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role,
      token: `mock-jwt-${Date.now()}`
    };

    this.saveUser(newUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  }

  async login(identifier: string): Promise<User> {
    await delay(600);
    const users = this.getAllUsers();
    const searchTerm = identifier.toLowerCase();

    const user = users.find(u => 
      u.username.toLowerCase() === searchTerm || 
      u.email.toLowerCase() === searchTerm
    );

    if (!user) {
      // Fallback for initial demo experience if no users exist yet and they try "admin"
      if (users.length === 0 && identifier.toLowerCase() === 'admin') {
         const demoAdmin: User = {
           id: 'admin_demo',
           username: 'admin',
           email: 'admin@sugarybits.com',
           firstName: 'Admin',
           lastName: 'User',
           role: UserRole.ADMIN,
           token: `mock-jwt-${Date.now()}`
         };
         this.saveUser(demoAdmin);
         localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demoAdmin));
         return demoAdmin;
      }
      throw new Error("Invalid credentials");
    }

    // Update token on login
    const updatedUser = { ...user, token: `mock-jwt-${Date.now()}` };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    return updatedUser;
  }

  async logout(): Promise<void> {
    await delay(300);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return stored ? JSON.parse(stored) : null;
  }

  // --- Inventory (Sweets) ---

  async getSweets(filters?: SweetFilter): Promise<Sweet[]> {
    await delay(400);
    const data = localStorage.getItem(STORAGE_KEYS.SWEETS);
    let sweets: Sweet[] = data ? JSON.parse(data) : [];

    if (filters) {
      sweets = sweets.filter(sweet => {
        let matches = true;
        if (filters.search) {
          const term = filters.search.toLowerCase();
          matches = matches && (sweet.name.toLowerCase().includes(term) || sweet.description.toLowerCase().includes(term));
        }
        if (filters.category && filters.category !== 'All') {
          matches = matches && sweet.category === filters.category;
        }
        if (filters.minPrice !== undefined) matches = matches && sweet.price >= filters.minPrice;
        if (filters.maxPrice !== undefined) matches = matches && sweet.price <= filters.maxPrice;
        return matches;
      });
    }
    return sweets;
  }

  async addSweet(sweet: Omit<Sweet, 'id'>): Promise<Sweet> {
    await delay(400);
    const sweets = await this.getAllSweetsRaw();
    const newSweet = { ...sweet, id: Date.now().toString() };
    sweets.push(newSweet);
    this.saveSweets(sweets);
    return newSweet;
  }

  async updateSweet(updated: Sweet): Promise<Sweet> {
    await delay(400);
    const sweets = await this.getAllSweetsRaw();
    const index = sweets.findIndex(s => s.id === updated.id);
    if (index === -1) throw new Error('Sweet not found');
    sweets[index] = updated;
    this.saveSweets(sweets);
    return updated;
  }

  async deleteSweet(id: string): Promise<void> {
    await delay(400);
    const sweets = await this.getAllSweetsRaw();
    const filtered = sweets.filter(s => s.id !== id);
    this.saveSweets(filtered);
  }

  // --- Cart Management (Per User) ---
  
  private getCartKey(userId: string) { return `${STORAGE_KEYS.CARTS}_${userId}`; }

  async getCart(userId: string): Promise<CartItem[]> {
    const data = localStorage.getItem(this.getCartKey(userId));
    return data ? JSON.parse(data) : [];
  }

  async addToCart(userId: string, sweet: Sweet): Promise<CartItem[]> {
    const cart = await this.getCart(userId);
    const existing = cart.find(item => item.id === sweet.id);
    
    // Check stock
    const sweets = await this.getAllSweetsRaw();
    const stockItem = sweets.find(s => s.id === sweet.id);
    const currentQtyInCart = existing ? existing.cartQuantity : 0;

    if (!stockItem || stockItem.quantity < currentQtyInCart + 1) {
      throw new Error("Insufficient stock available");
    }

    if (existing) {
      existing.cartQuantity += 1;
    } else {
      cart.push({ ...sweet, cartQuantity: 1 });
    }
    
    localStorage.setItem(this.getCartKey(userId), JSON.stringify(cart));
    return cart;
  }

  async updateCartItemQuantity(userId: string, sweetId: string, quantity: number): Promise<CartItem[]> {
    let cart = await this.getCart(userId);
    if (quantity <= 0) {
      cart = cart.filter(item => item.id !== sweetId);
    } else {
      const item = cart.find(i => i.id === sweetId);
      if (item) {
        // Check stock limit
        const sweets = await this.getAllSweetsRaw();
        const stockItem = sweets.find(s => s.id === sweetId);
        if (stockItem && stockItem.quantity >= quantity) {
           item.cartQuantity = quantity;
        } else {
            throw new Error(`Only ${stockItem?.quantity} items available`);
        }
      }
    }
    localStorage.setItem(this.getCartKey(userId), JSON.stringify(cart));
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    localStorage.removeItem(this.getCartKey(userId));
  }

  // --- Wishlist Management ---

  async toggleWishlist(userId: string, sweetId: string): Promise<string[]> {
    const key = `${STORAGE_KEYS.WISHLISTS}_${userId}`;
    const raw = localStorage.getItem(key);
    let list: string[] = raw ? JSON.parse(raw) : [];
    
    if (list.includes(sweetId)) {
      list = list.filter(id => id !== sweetId);
    } else {
      list.push(sweetId);
    }
    localStorage.setItem(key, JSON.stringify(list));
    return list;
  }

  async getWishlist(userId: string): Promise<string[]> {
    const key = `${STORAGE_KEYS.WISHLISTS}_${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  // --- Order Management ---

  async createOrder(userId: string, address: Address, cartItems: CartItem[]): Promise<Order> {
    await delay(1000); // Simulate processing payment
    
    const sweets = await this.getAllSweetsRaw();
    
    // 1. Validate Stock Again (Transactional)
    for (const item of cartItems) {
      const stockItem = sweets.find(s => s.id === item.id);
      if (!stockItem || stockItem.quantity < item.cartQuantity) {
        throw new Error(`Stock changed for ${item.name}. Insufficient quantity.`);
      }
    }

    // 2. Deduct Stock
    for (const item of cartItems) {
      const stockItem = sweets.find(s => s.id === item.id);
      if (stockItem) {
        stockItem.quantity -= item.cartQuantity;
      }
    }
    this.saveSweets(sweets);

    // 3. Create Order
    const user = this.getCurrentUser();
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
    
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId,
      username: user?.username || 'Unknown',
      items: cartItems,
      totalAmount,
      shippingAddress: address,
      status: OrderStatus.PENDING,
      createdAt: Date.now()
    };

    const orders = await this.getAllOrdersRaw();
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // 4. Clear Cart
    await this.clearCart(userId);

    return newOrder;
  }

  async getOrders(user: User): Promise<Order[]> {
    await delay(500);
    const orders = await this.getAllOrdersRaw();
    if (user.role === UserRole.ADMIN) {
      return orders.sort((a, b) => b.createdAt - a.createdAt);
    }
    return orders.filter(o => o.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
    await delay(300);
    const orders = await this.getAllOrdersRaw();
    const order = orders.find(o => o.id === orderId);
    if (!order) throw new Error("Order not found");
    order.status = status;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return order;
  }

  async restockSweet(id: string, amount: number): Promise<Sweet> {
    await delay(300);
    const sweets = await this.getAllSweetsRaw();
    const sweet = sweets.find(s => s.id === id);
    if (!sweet) throw new Error('Sweet not found');
    sweet.quantity += amount;
    this.saveSweets(sweets);
    return sweet;
  }

  // --- Internal Helpers ---
  private async getAllSweetsRaw(): Promise<Sweet[]> {
    const data = localStorage.getItem(STORAGE_KEYS.SWEETS);
    return data ? JSON.parse(data) : [];
  }

  private saveSweets(sweets: Sweet[]) {
    localStorage.setItem(STORAGE_KEYS.SWEETS, JSON.stringify(sweets));
  }

  private async getAllOrdersRaw(): Promise<Order[]> {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }
}

export const sweetService = new MockBackendService();