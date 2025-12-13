export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
}

export interface RegisterData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export enum SweetCategory {
  CHOCOLATE = 'Chocolate',
  GUMMY = 'Gummy',
  HARD_CANDY = 'Hard Candy',
  PASTRY = 'Pastry',
  SUGAR_FREE = 'Sugar Free'
}

export interface SweetFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// --- New E-Commerce Types ---

export interface CartItem extends Sweet {
  cartQuantity: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled'
}

export interface Order {
  id: string;
  userId: string;
  username: string; // Snapshot for display
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  status: OrderStatus;
  createdAt: number;
}