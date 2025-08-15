import { API_CONFIG, getAuthHeaders } from './api-config';
import type {
  User,
  Product,
  Order,
  Review,
  Message,
  MessageThread,
  FarmerApplication,
  ApiResponse,
  PaginatedResponse,
  LoginForm,
  RegisterForm,
  CreateProductForm,
  CreateOrderForm,
  CreateReviewForm,
  CreateFarmerApplicationForm,
} from './types';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  try {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers,
    } as Record<string, string> | undefined;

    // If body is FormData, let the browser set Content-Type
    const isFormData = options.body instanceof FormData;
    if (isFormData) {
      // remove Content-Type if present
      if (headers) delete headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `HTTP error! status: ${response.status}`,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred');
  }
}

// Auth API
export const authApi = {
  login: async (
    credentials: LoginForm,
  ): Promise<{ user: User; token: string; message: string }> => {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  register: async (
    userData: RegisterForm,
  ): Promise<{ user: User; token: string; message: string }> => {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getProfile: async (): Promise<User> => {
    return apiRequest(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  },
};

// Users API
export const usersApi = {
  createUser: async (userData: RegisterForm): Promise<ApiResponse<User>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.USERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getUsers: async (limit = 100, offset = 0): Promise<User[]> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return apiRequest(`${API_CONFIG.ENDPOINTS.USERS.LIST}?${params}`);
  },

  getAllUsers: async (): Promise<User[]> => {
    // For cases like verified sellers where we need all users
    return apiRequest(API_CONFIG.ENDPOINTS.USERS.LIST);
  },

  getUser: async (id: string): Promise<User> => {
    return apiRequest(API_CONFIG.ENDPOINTS.USERS.BY_ID(id));
  },
};

// Products API
export const productsApi = {
  getProducts: async (): Promise<Product[]> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.LIST);
  },

  getProduct: async (id: string): Promise<Product> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  createProduct: async (
    productData: CreateProductForm,
  ): Promise<ApiResponse<Product>> => {
    // If productData contains a File in images[0], upload as multipart/form-data
    const hasFile =
      productData.images &&
      productData.images.length > 0 &&
      productData.images[0] instanceof File;

    if (hasFile) {
      const form = new FormData();
      form.append('farmerId', productData.farmerId);
      form.append('name', productData.name);
      form.append('description', productData.description);
      form.append('price', String(productData.price));
      form.append('quantity', String(productData.quantity));
      form.append('location', JSON.stringify(productData.location));
      // append file
      form.append('image', productData.images[0] as File);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS.CREATE}`;
      const headers = { ...getAuthHeaders() } as Record<string, string>;
      // If we're sending FormData, remove any Content-Type set by helpers so
      // the browser can set the correct multipart boundary header.
      if (form instanceof FormData) {
        // debug: log form entries so we can inspect what's being sent
        for (const pair of Array.from((form as FormData).entries())) {
          // avoid logging large binary content; show filename for file fields
          if (pair[1] instanceof File) {
            console.log('FormData entry:', pair[0], (pair[1] as File).name);
          } else {
            console.log('FormData entry:', pair[0], pair[1]);
          }
        }

        // remove any Content-Type headers regardless of casing
        delete headers['Content-Type'];
        delete headers['content-type'];
      }
      const response = await fetch(url, {
        method: 'POST',
        body: form,
        headers,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || data.error || 'Upload failed');
      return data;
    }

    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: async (
    id: string,
    productData: Partial<CreateProductForm>,
  ): Promise<ApiResponse<Product>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  },

  deleteProduct: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS.DELETE(id), {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersApi = {
  getOrders: async (): Promise<Order[]> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ORDERS.LIST);
  },

  getOrder: async (id: string): Promise<Order> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ORDERS.BY_ID(id));
  },

  createOrder: async (
    orderData: CreateOrderForm,
  ): Promise<ApiResponse<Order>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ORDERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  updateOrder: async (
    id: string,
    orderData: Partial<CreateOrderForm>,
  ): Promise<ApiResponse<Order>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ORDERS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  },

  deleteOrder: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ORDERS.DELETE(id), {
      method: 'DELETE',
    });
  },
};

// Reviews API
export const reviewsApi = {
  getReviews: async (): Promise<Review[]> => {
    return apiRequest(API_CONFIG.ENDPOINTS.REVIEWS.LIST);
  },

  getReview: async (id: string): Promise<Review> => {
    return apiRequest(API_CONFIG.ENDPOINTS.REVIEWS.BY_ID(id));
  },

  createReview: async (
    reviewData: CreateReviewForm,
  ): Promise<ApiResponse<Review>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.REVIEWS.CREATE, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  updateReview: async (
    id: string,
    reviewData: Partial<CreateReviewForm>,
  ): Promise<ApiResponse<Review>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.REVIEWS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(reviewData),
    });
  },

  deleteReview: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.REVIEWS.DELETE(id), {
      method: 'DELETE',
    });
  },
};

// Messages API
export const messagesApi = {
  // Thread operations
  getThreads: async (): Promise<ApiResponse<MessageThread[]>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.THREADS);
  },

  createThread: async (threadData: {
    buyerId: string;
    farmerId: string;
  }): Promise<ApiResponse<MessageThread>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.CREATE_THREAD, {
      method: 'POST',
      body: JSON.stringify(threadData),
    });
  },

  getThread: async (threadId: string): Promise<ApiResponse<MessageThread>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.THREAD_BY_ID(threadId));
  },

  getThreadMessages: async (
    threadId: string,
  ): Promise<ApiResponse<Message[]>> => {
    // Backend historically returned a raw array for this endpoint. Normalize
    // so callers always receive an ApiResponse<Message[]> shape.
    const resp = await apiRequest(
      API_CONFIG.ENDPOINTS.MESSAGES.THREAD_MESSAGES(threadId),
    );
    if (Array.isArray(resp)) {
      return { success: true, data: resp };
    }
    return resp as ApiResponse<Message[]>;
  },

  markThreadAsRead: async (threadId: string): Promise<ApiResponse<void>> => {
    return apiRequest(
      API_CONFIG.ENDPOINTS.MESSAGES.MARK_THREAD_READ(threadId),
      {
        method: 'PATCH',
      },
    );
  },

  // Message operations
  createMessage: async (messageData: {
    threadId?: string;
    receiverId: string;
    content: string;
    buyerId?: string;
    farmerId?: string;
  }): Promise<ApiResponse<Message>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.CREATE, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  getMessage: async (id: string): Promise<Message> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.BY_ID(id));
  },

  markMessageAsRead: async (id: string): Promise<ApiResponse<Message>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.MARK_READ(id), {
      method: 'PATCH',
    });
  },

  deleteMessage: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.DELETE(id), {
      method: 'DELETE',
    });
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    return apiRequest(API_CONFIG.ENDPOINTS.MESSAGES.UNREAD_COUNT);
  },
};

// Farmer Applications API
export const farmerApplicationsApi = {
  getApplications: async (): Promise<FarmerApplication[]> => {
    const response: ApiResponse<FarmerApplication[]> = await apiRequest(
      API_CONFIG.ENDPOINTS.FARMER_APPLICATIONS.LIST,
    );
    return response.data || [];
  },

  getApplication: async (id: string): Promise<FarmerApplication> => {
    const response: ApiResponse<FarmerApplication> = await apiRequest(
      API_CONFIG.ENDPOINTS.FARMER_APPLICATIONS.BY_ID(id),
    );
    if (!response.data) {
      throw new Error('Application not found');
    }
    return response.data;
  },

  createApplication: async (
    applicationData: CreateFarmerApplicationForm,
  ): Promise<ApiResponse<FarmerApplication>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.FARMER_APPLICATIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  updateApplication: async (
    id: string,
    applicationData: Partial<CreateFarmerApplicationForm>,
  ): Promise<ApiResponse<FarmerApplication>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.FARMER_APPLICATIONS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(applicationData),
    });
  },

  deleteApplication: async (id: string): Promise<ApiResponse<void>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.FARMER_APPLICATIONS.DELETE(id), {
      method: 'DELETE',
    });
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
  ): Promise<ApiResponse<FarmerApplication>> => {
    return apiRequest(
      API_CONFIG.ENDPOINTS.FARMER_APPLICATIONS.UPDATE_STATUS(id),
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
    );
  },
};

// Admin API
export const adminApi = {
  getDashboard: async (): Promise<ApiResponse<any>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
  },

  getUsers: async (): Promise<PaginatedResponse<User>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ADMIN.USERS);
  },

  getApplications: async (): Promise<PaginatedResponse<FarmerApplication>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.ADMIN.APPLICATIONS);
  },
};

// Geolocation API
export const geolocationApi = {
  getNearby: async (
    latitude: number,
    longitude: number,
    radius: number = 10,
  ): Promise<ApiResponse<any>> => {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lng: longitude.toString(),
      radius: radius.toString(),
    });
    return apiRequest(`${API_CONFIG.ENDPOINTS.GEOLOCATION.NEARBY}?${params}`);
  },
};

// Wishlist API
export const wishlistApi = {
  addToWishlist: async (productId: string): Promise<ApiResponse<any>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.WISHLIST.ADD, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  getUserWishlist: async (): Promise<ApiResponse<any[]>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.WISHLIST.LIST);
  },

  removeFromWishlist: async (productId: string): Promise<ApiResponse<void>> => {
    return apiRequest(API_CONFIG.ENDPOINTS.WISHLIST.REMOVE(productId), {
      method: 'DELETE',
    });
  },

  checkWishlist: async (
    productId: string,
  ): Promise<{ success: boolean; isInWishlist: boolean }> => {
    return apiRequest(API_CONFIG.ENDPOINTS.WISHLIST.CHECK(productId));
  },
};
