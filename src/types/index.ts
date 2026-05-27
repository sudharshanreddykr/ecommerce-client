// API Response types
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  code?: string;
  timestamp?: string;
  errors?: ApiError[];
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
}

export interface ApiError {
  field?: string;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  availableQuantity?: number;
  heldQuantity?: number;
  soldQuantity?: number;
  isOutOfStock?: boolean;
  sku: string;
  userId: string;
  creator?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  quantity?: number;
  sku?: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI state types
export interface UiState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface CheckoutDraft {
  email: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryInstructions: string;
  paymentMethod: 'dummy-card' | 'cash-on-delivery';
}

export interface OrderLineItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  status: 'processing' | 'paid' | 'shipped';
  placedAt: string;
  total: number;
  itemCount: number;
  items: OrderLineItem[];
  shippingAddress: Omit<CheckoutDraft, 'paymentMethod'>;
  paymentMethod: CheckoutDraft['paymentMethod'];
}

export interface SearchSuggestion {
  label: string;
  query: string;
  matchType: 'name' | 'sku' | 'description';
  productId: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartEvent {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  quantity: number;
  createdAt: string;
}

export interface CheckoutHoldItem {
  productId: string;
  productName: string;
  quantity: number;
  baseQuantity: number;
}

export interface CheckoutHold {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  items: CheckoutHoldItem[];
}
