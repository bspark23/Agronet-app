import type { LocalStorageData, User, Product, SellerApplication, Chat, WishlistItem, OrderForm, Order, LogisticsCompany, Message } from "./types"

// Re-export types for easier importing
export type { User, Product, SellerApplication, Chat, WishlistItem, OrderForm, Order, LogisticsCompany, Message } from "./types"

const LOCAL_STORAGE_KEY = "harvestlink_data"

// Initial data for simulation
const initialData: LocalStorageData = {
  users: [
    {
      id: "admin-1",
      name: "Adaoma",
      email: "adaoma2826@gmail.com",
      password: "Blessing2008", // Simulated password
      role: "admin",
    },
    {
      id: "buyer-1",
      name: "Chika",
      email: "chika@example.com",
      password: "password123",
      role: "buyer",
    },
    {
      id: "seller-1",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      role: "seller",
      isVerifiedSeller: true,
    },
    {
      id: "buyer-2",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "password123",
      role: "buyer",
    },
  ],
  products: [
    {
      id: "prod-1",
      name: "Organic Tomatoes",
      description: "Freshly picked organic tomatoes, perfect for salads and sauces.",
      price: 3.99,
      quantity: 100,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Vegetables",
    },
    {
      id: "prod-2",
      name: "Farm Fresh Eggs (Dozen)",
      description: "Pasture-raised eggs from happy hens. Large, brown, and delicious.",
      price: 5.5,
      quantity: 50,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Dairy & Eggs",
    },
    {
      id: "prod-3",
      name: "Local Honey (500g)",
      description: "Pure, unfiltered local honey. Great for allergies and sweetening.",
      price: 12.0,
      quantity: 30,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Pantry",
    },
    {
      id: "prod-4",
      name: "Freshly Baked Sourdough Bread",
      description: "Artisan sourdough bread, baked fresh daily with natural yeast.",
      price: 6.75,
      quantity: 20,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Baked Goods",
    },
    {
      id: "prod-5",
      name: "Organic Apples (per lb)",
      description: "Crisp and sweet organic apples, perfect for snacking or baking.",
      price: 2.49,
      quantity: 150,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Fruits",
    },
    {
      id: "prod-6",
      name: "Grass-Fed Beef (1lb ground)",
      description: "Premium grass-fed ground beef, lean and flavorful.",
      price: 9.99,
      quantity: 40,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Meat",
    },
    {
      id: "prod-7",
      name: "Handmade Artisan Soap",
      description: "Natural, handmade soap with essential oils. Various scents available.",
      price: 7.0,
      quantity: 60,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Crafts",
    },
    {
      id: "prod-8",
      name: "Fresh Basil Plant",
      description: "A live basil plant, perfect for your kitchen garden.",
      price: 4.5,
      quantity: 25,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Plants",
    },
    {
      id: "prod-9",
      name: "Blueberry Jam (Homemade)",
      description: "Sweet and tangy homemade blueberry jam, made with fresh berries.",
      price: 8.5,
      quantity: 35,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Pantry",
    },
    {
      id: "prod-10",
      name: "Organic Carrots (Bunch)",
      description: "Sweet and crunchy organic carrots, great for snacking.",
      price: 2.2,
      quantity: 80,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Vegetables",
    },
    {
      id: "prod-11",
      name: "Freshly Roasted Coffee Beans (12oz)",
      description: "Medium roast, ethically sourced coffee beans. Rich and aromatic.",
      price: 15.0,
      quantity: 25,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Beverages",
    },
    {
      id: "prod-12",
      name: "Hand-Knitted Wool Scarf",
      description: "Warm and cozy hand-knitted scarf made from local wool.",
      price: 45.0,
      quantity: 10,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Crafts",
    },
    {
      id: "prod-13",
      name: "Organic Strawberries (1lb)",
      description: "Sweet, juicy organic strawberries, perfect for summer.",
      price: 4.75,
      quantity: 70,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Fruits",
    },
    {
      id: "prod-14",
      name: "Homemade Granola (1lb)",
      description: "Crunchy and healthy homemade granola with nuts and dried fruits.",
      price: 9.25,
      quantity: 30,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Pantry",
    },
    {
      id: "prod-15",
      name: "Fresh Cut Flowers (Bouquet)",
      description: "Beautiful seasonal bouquet, freshly cut from the farm.",
      price: 25.0,
      quantity: 15,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Flowers",
    },
    {
      id: "prod-16",
      name: "Organic Potatoes (5lb bag)",
      description: "Versatile organic potatoes, great for roasting or mashing.",
      price: 6.0,
      quantity: 60,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Vegetables",
    },
    {
      id: "prod-17",
      name: "Artisan Cheese (Cheddar, 8oz)",
      description: "Sharp and creamy artisan cheddar cheese, aged to perfection.",
      price: 11.5,
      quantity: 20,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Dairy & Eggs",
    },
    {
      id: "prod-18",
      name: "Fresh Baked Cookies (Dozen)",
      description: "Assorted fresh baked cookies, soft and chewy.",
      price: 9.0,
      quantity: 25,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Baked Goods",
    },
    {
      id: "prod-19",
      name: "Organic Pears (per lb)",
      description: "Sweet and juicy organic pears, perfect for a healthy snack.",
      price: 2.99,
      quantity: 90,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Fruits",
    },
    {
      id: "prod-20",
      name: "Homemade Pickles (Jar)",
      description: "Crisp and tangy homemade dill pickles.",
      price: 7.5,
      quantity: 30,
      image: "/placeholder.svg?height=400&width=600",
      sellerId: "seller-1",
      category: "Pantry",
    },
  ],
  sellerApplications: [],
  chats: [],
  wishlist: [],
  orderForms: [],
  orders: [],
  logisticsCompanies: [
    {
      id: "logistics-1",
      name: "FastTrack Delivery",
      price: 15.99,
      deliveryTime: "1-2 business days",
      description: "Express delivery service for urgent orders"
    },
    {
      id: "logistics-2", 
      name: "EcoShip Green",
      price: 8.99,
      deliveryTime: "3-5 business days",
      description: "Environmentally friendly shipping with carbon offset"
    },
    {
      id: "logistics-3",
      name: "Standard Courier",
      price: 5.99,
      deliveryTime: "5-7 business days", 
      description: "Reliable standard delivery service"
    },
    {
      id: "logistics-4",
      name: "Premium Express",
      price: 24.99,
      deliveryTime: "Same day delivery",
      description: "Same day delivery for orders placed before 2 PM"
    }
  ],
  loggedInUserId: null,
  adminNotification: false,
}

// Migration function to move data from old key to new key
const migrateOldData = (): void => {
  if (typeof window === "undefined") return
  
  const oldData = localStorage.getItem("agronet_data")
  const newData = localStorage.getItem(LOCAL_STORAGE_KEY)
  
  // If we have old data but no new data, migrate it
  if (oldData && !newData) {
    try {
      const parsedOldData = JSON.parse(oldData)
      // Ensure the data has the correct structure
      const migratedData = {
        ...initialData,
        ...parsedOldData,
        // Ensure logistics companies exist
        logisticsCompanies: parsedOldData.logisticsCompanies || initialData.logisticsCompanies
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migratedData))
      console.log("Successfully migrated data from agronet_data to harvestlink_data")
    } catch (error) {
      console.error("Error migrating old data:", error)
    }
  }
}

// Function to get data from localStorage
export const getLocalStorageData = (): LocalStorageData => {
  if (typeof window === "undefined") {
    return initialData // Return initial data on server
  }
  
  // Run migration first
  migrateOldData()
  
  const data = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (data) {
    return JSON.parse(data) as LocalStorageData
  }
  // If no data, initialize and save
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData))
  return initialData
}

// Function to set data to localStorage
export const setLocalStorageData = (data: LocalStorageData): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
  }
}

// Helper functions for specific data types
export const getUsers = (): User[] => getLocalStorageData().users
export const setUsers = (users: User[]): void => {
  const data = getLocalStorageData()
  data.users = users
  setLocalStorageData(data)
}

export const getProducts = (): Product[] => getLocalStorageData().products
export const setProducts = (products: Product[]): void => {
  const data = getLocalStorageData()
  data.products = products
  setLocalStorageData(data)
}

export const getSellerApplications = (): SellerApplication[] => getLocalStorageData().sellerApplications
export const setSellerApplications = (applications: SellerApplication[]): void => {
  const data = getLocalStorageData()
  data.sellerApplications = applications
  setLocalStorageData(data)
}

export const getChats = (): Chat[] => getLocalStorageData().chats
export const setChats = (chats: Chat[]): void => {
  const data = getLocalStorageData()
  data.chats = chats
  setLocalStorageData(data)
}

export const getWishlist = (): WishlistItem[] => getLocalStorageData().wishlist
export const setWishlist = (wishlist: WishlistItem[]): void => {
  const data = getLocalStorageData()
  data.wishlist = wishlist
  setLocalStorageData(data)
}

export const getLoggedInUserId = (): string | null => getLocalStorageData().loggedInUserId
export const setLoggedInUserId = (userId: string | null): void => {
  const data = getLocalStorageData()
  data.loggedInUserId = userId
  setLocalStorageData(data)
}

export const getAdminNotification = (): boolean => getLocalStorageData().adminNotification
export const setAdminNotification = (status: boolean): void => {
  const data = getLocalStorageData()
  data.adminNotification = status
  setLocalStorageData(data)
}

// Utility to generate unique IDs
export const generateId = (): string =>
  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

// Logistics companies functions
export const getLogisticsCompanies = (): LogisticsCompany[] => getLocalStorageData().logisticsCompanies || []
export const setLogisticsCompanies = (companies: LogisticsCompany[]): void => {
  const data = getLocalStorageData()
  data.logisticsCompanies = companies
  setLocalStorageData(data)
}

// Function to get current user
export const getCurrentUser = (): User | null => {
  const userId = getLoggedInUserId()
  if (!userId) return null
  return getUsers().find((user) => user.id === userId) || null
}

// Function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return getUsers().find((user) => user.id === id)
}

// Function to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return getProducts().find((product) => product.id === id)
}

// Function to get seller by ID
export const getSellerById = (id: string): User | undefined => {
  const user = getUserById(id)
  return user && user.role === "seller" ? user : undefined
}

// Function to get verified sellers
export const getVerifiedSellers = (): User[] => {
  return getUsers().filter((user) => user.role === "seller" && user.isVerifiedSeller)
}

// Order Forms functions
export const getOrderForms = (): OrderForm[] => getLocalStorageData().orderForms || []
export const setOrderForms = (orderForms: OrderForm[]): void => {
  const data = getLocalStorageData()
  data.orderForms = orderForms
  setLocalStorageData(data)
}

// Orders functions
export const getOrders = (): Order[] => getLocalStorageData().orders || []
export const setOrders = (orders: Order[]): void => {
  const data = getLocalStorageData()
  data.orders = orders
  setLocalStorageData(data)
}
