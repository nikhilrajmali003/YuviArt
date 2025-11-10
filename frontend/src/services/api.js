import axios from 'axios';

// ✅ Backend API base URL
// Make sure your backend is running on port 8080
const API_BASE_URL = 'http://localhost:8080/api';

// 🌈 Global Axios Config — handles CORS and JSON headers
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

//
// ==================== 🎨 ARTWORK API ====================
//
export const artworkAPI = {
  getAll: () => axios.get('/artworks'),
  getById: (id) => axios.get(`/artworks/${id}`),
  getByCategory: (category) => axios.get(`/artworks/category/${category}`),
};

//
// ==================== 🛒 ORDER API ====================
//
export const orderAPI = {
  create: (orderData) => axios.post('/orders', orderData),
  getById: (id) => axios.get(`/orders/${id}`),
  getByEmail: (email) => axios.get(`/orders/customer/${email}`),

  // Payment integrations
  createRazorpayOrder: (amount) =>
    axios.post('/orders/payment/razorpay', { amount }),
  createStripePayment: (amount) =>
    axios.post('/orders/payment/stripe', { amount }),
};

//
// ==================== 🌟 TESTIMONIAL API ====================
//
export const testimonialAPI = {
  getAll: () => axios.get('/testimonials'),
  create: (data) => axios.post('/testimonials', data),
};

//
// ==================== 💌 CONTACT / COMMISSION REQUEST API ====================
//
export const contactAPI = {
  submit: async (data) => {
    try {
      const response = await axios.post('/contact', data);
      console.log('✅ Commission Request Sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error sending commission request:', error.response?.data || error.message);
      throw error;
    }
  },
};

// ✅ Export all APIs as one object
export default {
  artworkAPI,
  orderAPI,
  testimonialAPI,
  contactAPI,
};
