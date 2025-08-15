// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/auth/profile',
    },
    // User endpoints
    USERS: {
      BASE: '/user',
      CREATE: '/user',
      LIST: '/user',
      BY_ID: (id: string) => `/user/${id}`,
    },
    // Product endpoints
    PRODUCTS: {
      BASE: '/product',
      CREATE: '/product',
      LIST: '/product',
      BY_ID: (id: string) => `/product/${id}`,
      UPDATE: (id: string) => `/product/${id}`,
      DELETE: (id: string) => `/product/${id}`,
    },
    // Order endpoints
    ORDERS: {
      BASE: '/order',
      CREATE: '/order',
      LIST: '/order',
      BY_ID: (id: string) => `/order/${id}`,
      UPDATE: (id: string) => `/order/${id}`,
      DELETE: (id: string) => `/order/${id}`,
    },
    // Review endpoints
    REVIEWS: {
      BASE: '/review',
      CREATE: '/review',
      LIST: '/review',
      BY_ID: (id: string) => `/review/${id}`,
      UPDATE: (id: string) => `/review/${id}`,
      DELETE: (id: string) => `/review/${id}`,
    },
    // Message endpoints
    MESSAGES: {
      BASE: '/message',
      CREATE: '/message',
      LIST: '/message',
      BY_ID: (id: string) => `/message/${id}`,
      UPDATE: (id: string) => `/message/${id}`,
      DELETE: (id: string) => `/message/${id}`,
      MARK_READ: (id: string) => `/message/${id}/read`,
      UNREAD_COUNT: '/message/unread/count',
      // Thread endpoints
      THREADS: '/message/threads',
      CREATE_THREAD: '/message/thread',
      THREAD_BY_ID: (id: string) => `/message/thread/${id}`,
      THREAD_MESSAGES: (id: string) => `/message/thread/${id}/messages`,
      MARK_THREAD_READ: (id: string) => `/message/thread/${id}/mark-read`,
    },
    // Farmer application endpoints
    FARMER_APPLICATIONS: {
      BASE: '/farmer-application',
      CREATE: '/farmer-application',
      LIST: '/farmer-application',
      BY_ID: (id: string) => `/farmer-application/${id}`,
      UPDATE: (id: string) => `/farmer-application/${id}`,
      DELETE: (id: string) => `/farmer-application/${id}`,
      UPDATE_STATUS: (id: string) => `/farmer-application/${id}/status`,
    },
    // Admin endpoints
    ADMIN: {
      BASE: '/admin',
      DASHBOARD: '/admin/dashboard',
      USERS: '/admin/users',
      APPLICATIONS: '/admin/applications',
    },
    // Geolocation endpoints
    GEOLOCATION: {
      BASE: '/geolocation',
      NEARBY: '/geolocation/nearby',
    },
    // Wishlist endpoints
    WISHLIST: {
      BASE: '/wishlist',
      ADD: '/wishlist',
      LIST: '/wishlist',
      REMOVE: (productId: string) => `/wishlist/${productId}`,
      CHECK: (productId: string) => `/wishlist/check/${productId}`,
    },
  },
};

// HTTP headers for API requests
export const API_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  // Only use the JWT/token for Authorization; never fall back to user data
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('agronet_token');
    if (token) {
      return {
        ...API_HEADERS,
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return API_HEADERS;
};
