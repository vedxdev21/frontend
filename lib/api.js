import axios from 'axios';
import Cookies from 'js-cookie';

// Config for rate limit handling
const RATE_LIMIT_RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

export const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

const buildQueryIds = (ids) => (Array.isArray(ids) ? ids.join(',') : ids);

const normalizeResponseBody = (body) => {
  if (!body || typeof body !== 'object' || body.success === undefined || body.data === undefined) {
    return body;
  }

  const normalized = {
    success: body.success,
    message: body.message,
    data: body.data,
    meta: body.meta || null,
  };

  if (Array.isArray(body.data)) {
    return {
      ...normalized,
      _list: body.data,
      ...(body.meta || {}),
    };
  }

  if (body.data && typeof body.data === 'object') {
    return {
      ...normalized,
      ...body.data,
      ...(body.meta || {}),
    };
  }

  return {
    ...normalized,
    value: body.data,
    ...(body.meta || {}),
  };
};

// Request cache for GET requests
const requestCache = new Map();
const CACHE_DURATION = 30000; // 30 seconds for GET requests

/**
 * Get cached response if still valid
 */
function getCachedResponse(cacheKey) {
  if (!requestCache.has(cacheKey)) return null;
  
  const { data, timestamp } = requestCache.get(cacheKey);
  if (Date.now() - timestamp > CACHE_DURATION) {
    requestCache.delete(cacheKey);
    return null;
  }
  
  return data;
}

/**
 * Cache response
 */
function setCachedResponse(cacheKey, data) {
  requestCache.set(cacheKey, { data, timestamp: Date.now() });
}

/**
 * Generate cache key from request config
 */
function getCacheKey(config) {
  if (config.method?.toUpperCase() !== 'GET') return null;
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
}

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    res.data = normalizeResponseBody(res.data);
    
    // Cache GET responses after transformation
    const cacheKey = getCacheKey(res.config);
    if (cacheKey && res.status === 200) {
      setCachedResponse(cacheKey, res.data);
    }
    
    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 429 (Too Many Requests) with exponential backoff
    if (error.response?.status === 429 && !originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }
    
    if (error.response?.status === 429 && originalRequest._retryCount < RATE_LIMIT_RETRY_CONFIG.maxRetries) {
      originalRequest._retryCount++;
      const delayMs = Math.min(
        RATE_LIMIT_RETRY_CONFIG.initialDelay * 
        Math.pow(RATE_LIMIT_RETRY_CONFIG.backoffMultiplier, originalRequest._retryCount - 1),
        RATE_LIMIT_RETRY_CONFIG.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delayMs;
      await new Promise(resolve => setTimeout(resolve, delayMs + jitter));
      
      return api(originalRequest);
    }
    
    // Handle 401 (Unauthorized) - token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post('/api/v1/auth/refresh-token', { refreshToken });
          const refreshData = normalizeResponseBody(refreshResponse.data);
          const accessToken = refreshData?.accessToken || refreshData?.data?.accessToken;
          if (!accessToken) throw new Error('Missing refreshed access token');

          Cookies.set('accessToken', accessToken, { expires: 7 });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

const endpoints = {
  auth: '/auth',
  users: '/users',
  location: '/location',
  properties: '/properties',
  roommate: '/roommate',
  mess: '/mess',
  cook: '/cook',
  chat: '/chat',
  notifications: '/notifications',
  reviews: '/reviews',
  comingSoon: '/coming-soon',
  admin: '/admin',
};

export const authAPI = {
  register: (payload) => api.post(`${endpoints.auth}/register`, payload),
  sendOtp: (payload) => api.post(`${endpoints.auth}/send-otp`, payload),
  verifyOtp: (payload) => api.post(`${endpoints.auth}/verify-otp`, payload),
  loginPhone: (payload) => api.post(`${endpoints.auth}/login/phone`, payload),
  loginEmail: (payload) => api.post(`${endpoints.auth}/login/email`, payload),
  googleAuth: (payload) => api.post(`${endpoints.auth}/google`, payload),
  refreshToken: (payload) => api.post(`${endpoints.auth}/refresh-token`, payload),
  forgotPassword: (payload) => api.post(`${endpoints.auth}/forgot-password`, payload),
  resetPassword: (payload) => api.post(`${endpoints.auth}/reset-password`, payload),
  logout: () => api.post(`${endpoints.auth}/logout`),
};

export const userAPI = {
  getMe: () => api.get(`${endpoints.users}/me`),
  profileSetup: (payload) => api.put(`${endpoints.users}/profile-setup`, payload),
  updateMe: (payload) => api.put(`${endpoints.users}/me`, payload),
  updateLocation: (payload) => api.put(`${endpoints.users}/me/location`, payload),
  updateLanguage: (payload) => api.put(`${endpoints.users}/me/language`, payload),
  getStats: () => api.get(`${endpoints.users}/me/stats`),
  getUser: (userId) => api.get(`${endpoints.users}/${userId}`),
};

export const locationAPI = {
  getCities: () => api.get(`${endpoints.location}/cities`),
  getAreas: (city) => api.get(`${endpoints.location}/cities/${encodeURIComponent(city)}/areas`),
  detect: (payload) => api.post(`${endpoints.location}/detect`, payload),
  getAreaGuide: (city) => api.get(`${endpoints.location}/area-guide/${encodeURIComponent(city)}`),
};

export const propertyAPI = {
  browse: (params) => api.get(endpoints.properties, { params }),
  create: (payload) => api.post(endpoints.properties, payload),
  getById: (propertyId) => api.get(`${endpoints.properties}/${propertyId}`),
  update: (propertyId, payload) => api.put(`${endpoints.properties}/${propertyId}`, payload),
  updateStatus: (propertyId, payload) => api.patch(`${endpoints.properties}/${propertyId}/status`, payload),
  delete: (propertyId) => api.delete(`${endpoints.properties}/${propertyId}`),
  getMyListings: (params) => api.get(`${endpoints.properties}/my-listings`, { params }),
  save: (propertyId) => api.post(`${endpoints.properties}/${propertyId}/save`),
  getSaved: () => api.get(`${endpoints.properties}/saved`),
  inquiry: (propertyId, payload) => api.post(`${endpoints.properties}/${propertyId}/inquiry`, payload),
  getInquiries: (propertyId) => api.get(`${endpoints.properties}/${propertyId}/inquiries`),
  showNumber: (propertyId) => api.post(`${endpoints.properties}/${propertyId}/show-number`),
  compare: (ids) => api.get(`${endpoints.properties}/compare`, { params: { ids: buildQueryIds(ids) } }),
  createAlert: (payload) => api.post(`${endpoints.properties}/alerts`, payload),
  getAlerts: () => api.get(`${endpoints.properties}/alerts`),
  getOwnerDashboard: () => api.get(`${endpoints.properties}/owner/dashboard`),
};

export const roommateAPI = {
  browse: (params) => api.get(endpoints.roommate, { params }),
  createProfile: (payload) => api.post(`${endpoints.roommate}/profile`, payload),
  updateProfile: (payload) => api.put(`${endpoints.roommate}/profile`, payload),
  deleteProfile: () => api.delete(`${endpoints.roommate}/profile`),
  getById: (profileId) => api.get(`${endpoints.roommate}/${profileId}`),
  sendInterest: (profileId, payload) => api.post(`${endpoints.roommate}/${profileId}/interest`, payload),
  getInterests: () => api.get(`${endpoints.roommate}/interests`),
  respondInterest: (interestId, payload) => api.put(`${endpoints.roommate}/interests/${interestId}/respond`, payload),
  getConnections: () => api.get(`${endpoints.roommate}/connections`),
  browseGroups: (params) => api.get(`${endpoints.roommate}/groups`, { params }),
  createGroup: (payload) => api.post(`${endpoints.roommate}/groups`, payload),
};

export const messAPI = {
  browse: (params) => api.get(endpoints.mess, { params }),
  register: (payload) => api.post(`${endpoints.mess}/register`, payload),
  getById: (messId) => api.get(`${endpoints.mess}/${messId}`),
  update: (messId, payload) => api.put(`${endpoints.mess}/${messId}`, payload),
  updateMenu: (payload) => api.post(`${endpoints.mess}/menu`, payload),
  getMenu: (messId) => api.get(`${endpoints.mess}/${messId}/menu`),
  save: (messId) => api.post(`${endpoints.mess}/${messId}/save`),
  getSaved: () => api.get(`${endpoints.mess}/saved`),
  getDashboard: () => api.get(`${endpoints.mess}/dashboard`),
};

export const cookAPI = {
  browse: (params) => api.get(endpoints.cook, { params }),
  register: (payload) => api.post(`${endpoints.cook}/register`, payload),
  getById: (cookId) => api.get(`${endpoints.cook}/${cookId}`),
  update: (cookId, payload) => api.put(`${endpoints.cook}/${cookId}`, payload),
  save: (cookId) => api.post(`${endpoints.cook}/${cookId}/save`),
  getSaved: () => api.get(`${endpoints.cook}/saved`),
  getDashboard: () => api.get(`${endpoints.cook}/dashboard`),
};

export const chatAPI = {
  getConversations: () => api.get(`${endpoints.chat}/conversations`),
  startConversation: (payload) => api.post(`${endpoints.chat}/conversations`, payload),
  getMessages: (conversationId) => api.get(`${endpoints.chat}/conversations/${conversationId}`),
  sendMessage: (conversationId, payload) => api.post(`${endpoints.chat}/conversations/${conversationId}/messages`, payload),
};

export const notificationAPI = {
  getAll: (filter) => api.get(endpoints.notifications, { params: { filter } }),
  getUnreadCount: () => api.get(`${endpoints.notifications}/unread-count`),
  markRead: (notificationId) => api.patch(`${endpoints.notifications}/${notificationId}/read`),
  markAllRead: () => api.patch(`${endpoints.notifications}/read-all`),
};

export const reviewAPI = {
  getReviews: (targetType, targetId) => api.get(`${endpoints.reviews}/${targetType}/${targetId}`),
  create: (payload) => api.post(endpoints.reviews, payload),
  update: (reviewId, payload) => api.put(`${endpoints.reviews}/${reviewId}`, payload),
  delete: (reviewId) => api.delete(`${endpoints.reviews}/${reviewId}`),
};

export const comingSoonAPI = {
  getServices: () => api.get(`${endpoints.comingSoon}/services`),
  getService: (serviceId) => api.get(`${endpoints.comingSoon}/services/${serviceId}`),
  notify: (serviceId, payload) => api.post(`${endpoints.comingSoon}/services/${serviceId}/notify`, payload),
};

export const adminAPI = {
  login: (payload) => api.post(`${endpoints.admin}/login`, payload),
  dashboard: () => api.get(`${endpoints.admin}/dashboard`),
  getUsers: (params) => api.get(`${endpoints.admin}/users`, { params }),
  getUserDetail: (userId) => api.get(`${endpoints.admin}/users/${userId}`),
  verifyUser: (userId) => api.patch(`${endpoints.admin}/users/${userId}/verify`),
  blockUser: (userId, payload) => api.patch(`${endpoints.admin}/users/${userId}/block`, payload),
  getProperties: (params) => api.get(`${endpoints.admin}/properties`, { params }),
  approveProperty: (propertyId) => api.patch(`${endpoints.admin}/properties/${propertyId}/approve`),
  rejectProperty: (propertyId) => api.patch(`${endpoints.admin}/properties/${propertyId}/reject`),
  featureProperty: (propertyId, payload) => api.patch(`${endpoints.admin}/properties/${propertyId}/feature`, payload),
  getMess: (params) => api.get(`${endpoints.admin}/mess`, { params }),
  verifyMess: (messId) => api.patch(`${endpoints.admin}/mess/${messId}/verify`),
  getCooks: (params) => api.get(`${endpoints.admin}/cooks`, { params }),
  verifyCook: (cookId) => api.patch(`${endpoints.admin}/cooks/${cookId}/verify`),
  getReports: (params) => api.get(`${endpoints.admin}/reports`, { params }),
  sendNotification: (payload) => api.post(`${endpoints.admin}/notifications/send`, payload),
  analytics: () => api.get(`${endpoints.admin}/analytics`),
  comingSoonStats: () => api.get(`${endpoints.admin}/coming-soon/stats`),
  getSettings: () => api.get(`${endpoints.admin}/settings`),
  updateSettings: (payload) => api.put(`${endpoints.admin}/settings`, payload),
};

export default api;
