export type UserRole = "buyer" | "seller" | "admin"

export interface User {
  id: string
  name: string
  email: string
  password?: string // Only for simulation, never store in real app
  role: UserRole
  isVerifiedSeller?: boolean // For sellers
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image: string // URL
  sellerId: string
  category: string
}

export interface SellerApplication {
  id: string
  userId: string
  fullName: string
  email: string
  reason: string
  status: "pending" | "approved" | "rejected"
  appliedAt: number // Timestamp
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: number
}

export interface Chat {
  id: string
  participants: [string, string] // [userId1, userId2]
  messages: Message[]
  lastMessageAt: number
}

export interface WishlistItem {
  userId: string
  productId: string
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
}
