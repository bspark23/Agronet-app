// User types
export type UserRole = 'buyer' | 'farmer' | 'admin';
export type AccountStatus = 'pending' | 'active' | 'banned';
export type FarmerApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  emailVerified: boolean;
  accountStatus: AccountStatus;
  role: UserRole;
  farmerApplicationStatus?: FarmerApplicationStatus;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
  _id: string;
  farmerId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  ratingsAverage: number;
  ratingsCount: number;
  createdAt: string;
  updatedAt: string;
}

// Order types
export type OrderStatus = 'pending' | 'shipped' | 'delivered';

export interface Order {
  _id: string;
  productId: string;
  buyerId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  _id: string;
  productId: string;
  buyerId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  _id: string;
  threadId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageThread {
  _id: string;
  buyerId: string;
  farmerId: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

// Farmer application types
export interface FarmerApplication {
  _id: string;
  userId: string | User; // Can be populated with User object
  farmName: string;
  farmLocation: string;
  farmSize: string;
  cropsGrown: string[];
  experience: number;
  contactPhone: string;
  description: string;
  status: FarmerApplicationStatus;
  idCardUrl?: string;
  proofOfFarmUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Special response type for farmer applications (backend returns different format)
export interface FarmerApplicationResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Frontend specific types
export interface WishlistItem {
  userId: string;
  productId: string;
}

export interface Chat {
  id: string;
  participants: [string, string]; // [userId1, userId2]
  messages: Message[];
  lastMessageAt: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface OrderForm {
  id: string
  productId: string
  productName: string
  productPrice: number
  productImage: string
  productDescription: string
  quantity: number
  totalPrice: number
  sellerId: string
  buyerId: string
  status: "pending" | "accepted" | "rejected"
  createdAt: number
}

export interface LogisticsCompany {
  id: string
  name: string
  price: number
  deliveryTime: string
  description: string
}

export interface Order {
  id: string
  orderFormId: string
  buyerId: string
  sellerId: string
  productId: string
  quantity: number
  totalPrice: number
  paymentStatus: "pending" | "completed" | "failed"
  logisticsCompanyId?: string
  status: "pending" | "paid" | "shipped" | "delivered"
  createdAt: number
  paidAt?: number
}

export interface LocalStorageData {
  users: User[]
  products: Product[]
  sellerApplications: SellerApplication[]
  chats: Chat[]
  wishlist: WishlistItem[]
  orderForms: OrderForm[]
  orders: Order[]
  logisticsCompanies: LogisticsCompany[]
  loggedInUserId: string | null
  adminNotification: boolean // Flag for new seller applications
export interface RegisterForm {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface CreateProductForm {
  farmerId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface CreateOrderForm {
  productId: string;
  buyerId: string;
  quantity: number;
  totalPrice: number;
}

export interface CreateReviewForm {
  productId: string;
  buyerId: string;
  rating: number;
  comment: string;
}

export interface CreateFarmerApplicationForm {
  userId: string;
  farmName: string;
  farmLocation: string;
  farmSize: string;
  cropsGrown: string[];
  experience: number;
  contactPhone: string;
  description: string;
  idCardUrl?: string;
  proofOfFarmUrl?: string;
}
