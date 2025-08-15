import type {
  LocalStorageData,
  User,
  Product,
  Chat,
  WishlistItem,
  OrderForm,
  Order,
  LogisticsCompany,
  Message,
} from './types';

// Re-export types for easier importing
export type {
  User,
  Product,
  Chat,
  WishlistItem,
  OrderForm,
  Order,
  LogisticsCompany,
  Message,
} from './types';

const LOCAL_STORAGE_KEY = 'harvestlink_data';

// Initial data for simulation
const initialData: LocalStorageData = {
  sellerApplications: [],
  chats: [],
  wishlist: [],
  orderForms: [],
  orders: [],
  logisticsCompanies: [
    {
      id: 'logistics-1',
      name: 'FastTrack Delivery',
      price: 15.99,
      deliveryTime: '1-2 business days',
      description: 'Express delivery service for urgent orders',
    },
    {
      id: 'logistics-2',
      name: 'EcoShip Green',
      price: 8.99,
      deliveryTime: '3-5 business days',
      description: 'Environmentally friendly shipping with carbon offset',
    },
    {
      id: 'logistics-3',
      name: 'Standard Courier',
      price: 5.99,
      deliveryTime: '5-7 business days',
      description: 'Reliable standard delivery service',
    },
    {
      id: 'logistics-4',
      name: 'Premium Express',
      price: 24.99,
      deliveryTime: 'Same day delivery',
      description: 'Same day delivery for orders placed before 2 PM',
    },
  ],
  loggedInUserId: null,
  adminNotification: false,
};

// Function to get data from localStorage
export const getLocalStorageData = (): LocalStorageData => {
  if (typeof window === 'undefined') {
    return initialData; // Return initial data on server
  }

  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    return JSON.parse(data) as LocalStorageData;
  }
  // If no data, initialize and save
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
};

// Function to set data to localStorage
export const setLocalStorageData = (data: LocalStorageData): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }
};

// Helper functions for specific data types
// export const getUsers = (): User[] => getLocalStorageData().users
// export const setUsers = (users: User[]): void => {
//   const data = getLocalStorageData()
//   data.users = users
//   setLocalStorageData(data)
// }

// export const getProducts = (): Product[] => getLocalStorageData().products;
// export const setProducts = (products: Product[]): void => {
//   const data = getLocalStorageData();
//   data.products = products;
//   setLocalStorageData(data);
// }

// export const getSellerApplications = (): SellerApplication[] =>
//   getLocalStorageData().sellerApplications;
// export const setSellerApplications = (
//   applications: SellerApplication[],
// ): void => {
//   const data = getLocalStorageData();
//   data.sellerApplications = applications;
//   setLocalStorageData(data);
// };

// export const getChats = (): Chat[] => getLocalStorageData().chats;
// export const setChats = (chats: Chat[]): void => {
//   const data = getLocalStorageData();
//   data.chats = chats;
//   setLocalStorageData(data);
// };

// export const getWishlist = (): WishlistItem[] => getLocalStorageData().wishlist;
// export const setWishlist = (wishlist: WishlistItem[]): void => {
//   const data = getLocalStorageData();
//   data.wishlist = wishlist;
//   setLocalStorageData(data);
// };

// export const getLoggedInUserId = (): string | null => getLocalStorageData().loggedInUserId
// export const setLoggedInUserId = (userId: string | null): void => {
//   const data = getLocalStorageData()
//   data.loggedInUserId = userId
//   setLocalStorageData(data)
// }

export const getAdminNotification = (): boolean => getLocalStorageData().adminNotification
export const setAdminNotification = (status: boolean): void => {
  const data = getLocalStorageData()
  data.adminNotification = status
  setLocalStorageData(data)
}

// Utility to generate unique IDs
export const generateId = (): string =>
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);

// // Logistics companies functions
export const getLogisticsCompanies = (): LogisticsCompany[] =>
  getLocalStorageData().logisticsCompanies || [];
export const setLogisticsCompanies = (companies: LogisticsCompany[]): void => {
  const data = getLocalStorageData();
  data.logisticsCompanies = companies;
  setLocalStorageData(data);
};

// Function to get current user
// export const getCurrentUser = (): User | null => {
//   const userId = getLoggedInUserId()
//   if (!userId) return null
//   return getUsers().find((user) => user.id === userId) || null
// }

// Function to get user by ID
// export const getUserById = (id: string): User | undefined => {
//   return getUsers().find((user) => user.id === id)
// }

// Function to get product by ID
// export const getProductById = (id: string): Product | undefined => {
//   return getProducts().find((product) => product.id === id)
// }

// Function to get seller by ID
// export const getSellerById = (id: string): User | undefined => {
//   const user = getUserById(id)
//   return user && user.role === "seller" ? user : undefined
// }

// Function to get verified sellers
// export const getVerifiedSellers = (): User[] => {
//   return getUsers().filter((user) => user.role === "seller" && user.isVerifiedSeller)
// }

// Order Forms functions
export const getOrderForms = (): OrderForm[] =>
  getLocalStorageData().orderForms || [];
export const setOrderForms = (orderForms: OrderForm[]): void => {
  const data = getLocalStorageData();
  data.orderForms = orderForms;
  setLocalStorageData(data);
};

// Orders functions
export const getOrders = (): Order[] => getLocalStorageData().orders || [];
export const setOrders = (orders: Order[]): void => {
  const data = getLocalStorageData();
  data.orders = orders;
  setLocalStorageData(data);
};
