import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send cookies (refreshtoken) on every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the access token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bloodlinkToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: On 401, try to refresh the access token and retry once
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the token refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refreshtoken cookie is sent automatically (withCredentials: true)
        const res = await axios.post(
          `${API_BASE_URL}/auth/refreshtoken`,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.accessToken || res.data.token;
        if (newToken) {
          localStorage.setItem('bloodlinkToken', newToken);
          api.defaults.headers['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — clear stale auth and let the caller handle it
        localStorage.removeItem('bloodlinkToken');
        localStorage.removeItem('bloodlinkUser');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
// Note: backend expects capital 'E' in Email
export const verifyOtp = ({ otp, email }) => api.post('/auth/verifyotp', { otp, Email: email });

// Dashboard Stats
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getRecentDonations = () => api.get('/dashboard/recent-donations');

// Donor Management
export const getDonors = () => api.get('/donors');
export const addDonor = (donorData) => api.post('/donors', donorData);
export const updateDonor = (id, donorData) => api.put(`/donors/${id}`, donorData);
export const deleteDonor = (id) => api.delete(`/donors/${id}`);
export const approveDonor = (id) => api.patch(`/donors/${id}/approve`);
export const blockDonor = (id) => api.patch(`/donors/${id}/block`);

// Blood Request Management
export const getBloodRequests = (params) => api.get('/requests', { params });
export const addBloodRequest = (requestData) => api.post('/requests', requestData);
export const updateBloodRequestStatus = (id, status) => api.patch(`/requests/${id}/status`, { status });
export const updateBloodRequest = (id, requestData) => api.patch(`/requests/${id}`, requestData);
export const deleteBloodRequest = (id) => api.delete(`/requests/${id}`);

// Location Management
export const getLocations = () => api.get('/locations');
export const addLocation = (locationData) => api.post('/locations', locationData);
export const deleteLocation = (id) => api.delete(`/locations/${id}`);

// Notifications
export const getNotifications = () => api.get('/notifications');
export const sendNotification = (notificationData) => api.post('/notifications', notificationData);

// Admins
export const getAdmins = () => api.get('/admins');
export const addAdmin = (adminData) => api.post('/admins', adminData);
export const deleteAdmin = (id) => api.delete(`/admins/${id}`);
export const updateAdmin = (id, adminData) => api.put(`/admins/${id}`, adminData);

// Profile
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (profileData) => api.post('/auth/profile/update', profileData);
export const getCurrentUser = () => api.get('/auth/me');

// Blood Bank Inventory
export const getInventory = () => api.get('/inventory');
export const updateInventory = (group, units) => api.put(`/inventory/${group}`, { units });

export default api;
