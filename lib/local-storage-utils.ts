import type { Product, User, WishlistItem } from './types';

// Fallback data for when API is not available
const fallbackProducts: Product[] = [
  {
    _id: '1',
    farmerId: 'farmer1',
    name: 'Fresh Organic Tomatoes',
    description:
      'Locally grown organic tomatoes, perfect for salads and cooking.',
    price: 2.99,
    quantity: 50,
    images: ['/images/fruit-market.jpg'],
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061], // NYC coordinates
    },
    ratingsAverage: 4.5,
    ratingsCount: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    farmerId: 'farmer2',
    name: 'Sweet Corn',
    description: 'Fresh sweet corn harvested this morning.',
    price: 1.99,
    quantity: 30,
    images: ['/images/rice-terraces.jpg'],
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
    },
    ratingsAverage: 4.8,
    ratingsCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    farmerId: 'farmer3',
    name: 'Organic Carrots',
    description: 'Fresh organic carrots, perfect for juicing or cooking.',
    price: 3.49,
    quantity: 25,
    images: ['/images/fruit-market.jpg'],
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
    },
    ratingsAverage: 4.2,
    ratingsCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    farmerId: 'farmer4',
    name: 'Fresh Lettuce',
    description: 'Crisp, fresh lettuce for your salads.',
    price: 1.99,
    quantity: 40,
    images: ['/images/rice-terraces.jpg'],
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
    },
    ratingsAverage: 4.6,
    ratingsCount: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Local storage keys
const STORAGE_KEYS = {
  USER: 'agronet_user',
  PRODUCTS: 'agronet_products',
  WISHLIST: 'agronet_wishlist',
  CART: 'agronet_cart',
} as const;

// User management
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user from localStorage:', error);
    return null;
  }
};

export const setUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;

  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  } catch (error) {
    console.error('Error setting user in localStorage:', error);
  }
};

export const clearUser = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Products management
export const getProducts = (): Product[] => {
  if (typeof window === 'undefined') return fallbackProducts;

  try {
    const productsData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return productsData ? JSON.parse(productsData) : fallbackProducts;
  } catch (error) {
    console.error('Error getting products from localStorage:', error);
    return fallbackProducts;
  }
};

export const setProducts = (products: Product[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error setting products in localStorage:', error);
  }
};

export const addProduct = (product: Product): void => {
  const products = getProducts();
  const updatedProducts = [...products, product];
  setProducts(updatedProducts);
};

export const updateProduct = (
  productId: string,
  updates: Partial<Product>,
): void => {
  const products = getProducts();
  const updatedProducts = products.map(product =>
    product._id === productId ? { ...product, ...updates } : product,
  );
  setProducts(updatedProducts);
};

export const deleteProduct = (productId: string): void => {
  const products = getProducts();
  const updatedProducts = products.filter(product => product._id !== productId);
  setProducts(updatedProducts);
};

// Wishlist management
export const getWishlist = (): WishlistItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const wishlistData = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return wishlistData ? JSON.parse(wishlistData) : [];
  } catch (error) {
    console.error('Error getting wishlist from localStorage:', error);
    return [];
  }
};

export const setWishlist = (wishlist: WishlistItem[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
  } catch (error) {
    console.error('Error setting wishlist in localStorage:', error);
  }
};

export const addToWishlist = (userId: string, productId: string): void => {
  const wishlist = getWishlist();
  const exists = wishlist.some(
    item => item.userId === userId && item.productId === productId,
  );

  if (!exists) {
    const updatedWishlist = [...wishlist, { userId, productId }];
    setWishlist(updatedWishlist);
  }
};

export const removeFromWishlist = (userId: string, productId: string): void => {
  const wishlist = getWishlist();
  const updatedWishlist = wishlist.filter(
    item => !(item.userId === userId && item.productId === productId),
  );
  setWishlist(updatedWishlist);
};

export const isInWishlist = (userId: string, productId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.some(
    item => item.userId === userId && item.productId === productId,
  );
};

// Cart management
export const getCart = (): any[] => {
  if (typeof window === 'undefined') return [];

  try {
    const cartData = localStorage.getItem(STORAGE_KEYS.CART);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
    return [];
  }
};

export const setCart = (cart: any[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error('Error setting cart in localStorage:', error);
  }
};

export const addToCart = (productId: string, quantity: number = 1): void => {
  const cart = getCart();
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  setCart(cart);
};

export const removeFromCart = (productId: string): void => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.productId !== productId);
  setCart(updatedCart);
};

export const updateCartItemQuantity = (
  productId: string,
  quantity: number,
): void => {
  const cart = getCart();
  const updatedCart = cart.map(item =>
    item.productId === productId ? { ...item, quantity } : item,
  );
  setCart(updatedCart);
};

export const clearCart = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CART);
};

// Utility functions
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;

  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

export const getCurrentUserId = (): string | null => {
  const user = getUser();
  return user?._id || null;
};

// User management functions
export const getUserById = (userId: string): User | undefined => {
  if (typeof window === 'undefined') return undefined;

  try {
    // For now, we'll use the current user if the ID matches
    const currentUser = getUser();
    if (currentUser && currentUser._id === userId) {
      return currentUser;
    }

    // In a real app, you'd fetch from API or have a users cache
    // For now, return undefined if not found
    return undefined;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return undefined;
  }
};

// Admin notification functions
export const getAdminNotification = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const notification = localStorage.getItem('agronet_admin_notification');
    return notification === 'true';
  } catch (error) {
    console.error('Error getting admin notification:', error);
    return false;
  }
};

export const setAdminNotification = (value: boolean): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('agronet_admin_notification', value.toString());
  } catch (error) {
    console.error('Error setting admin notification:', error);
  }
};

// Chat management functions
export const getChats = (): any[] => {
  if (typeof window === 'undefined') return [];

  try {
    const chatsData = localStorage.getItem('agronet_chats');
    return chatsData ? JSON.parse(chatsData) : [];
  } catch (error) {
    console.error('Error getting chats from localStorage:', error);
    return [];
  }
};

export const setChats = (chats: any[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('agronet_chats', JSON.stringify(chats));
  } catch (error) {
    console.error('Error setting chats in localStorage:', error);
  }
};

// Seller applications management
export const getSellerApplications = (): any[] => {
  if (typeof window === 'undefined') return [];

  try {
    const applicationsData = localStorage.getItem(
      'agronet_seller_applications',
    );
    return applicationsData ? JSON.parse(applicationsData) : [];
  } catch (error) {
    console.error(
      'Error getting seller applications from localStorage:',
      error,
    );
    return [];
  }
};

export const setSellerApplications = (applications: any[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(
      'agronet_seller_applications',
      JSON.stringify(applications),
    );
  } catch (error) {
    console.error('Error setting seller applications in localStorage:', error);
  }
};

// Product management functions
export const getProductById = (productId: string): Product | undefined => {
  const products = getProducts();
  return products.find(product => product._id === productId);
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Verified sellers functions
export const getVerifiedSellers = (): User[] => {
  if (typeof window === 'undefined') return [];

  try {
    const usersData = localStorage.getItem('agronet_users');
    if (usersData) {
      const users = JSON.parse(usersData);
      return users.filter(
        (user: User) =>
          user.role === 'farmer' && user.farmerApplicationStatus === 'approved',
      );
    }
    return [];
  } catch (error) {
    console.error('Error getting verified sellers from localStorage:', error);
    return [];
  }
};

// Users management functions
export const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];

  try {
    const usersData = localStorage.getItem('agronet_users');
    return usersData ? JSON.parse(usersData) : [];
  } catch (error) {
    console.error('Error getting users from localStorage:', error);
    return [];
  }
};

export const setUsers = (users: User[]): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('agronet_users', JSON.stringify(users));
  } catch (error) {
    console.error('Error setting users in localStorage:', error);
  }
};
