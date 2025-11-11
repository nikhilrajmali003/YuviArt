import axios from 'axios';

// ✅ Backend API base URL
const API_BASE_URL = 'http://localhost:8080/api';

// 🌈 Global Axios Config — handles CORS and JSON headers
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

//
// ==================== 🎨 ARTWORK API ====================
//
export const artworkAPI = {
  // ✅ Fetch artworks from backend + fallback to mock if backend fails
  getAll: async () => {
    try {
      const response = await axios.get('/artworks');
      return response.data;
    } catch (error) {
      console.warn('⚠️ Backend unavailable — using mock artworks');
      return [
        {
          id: 1,
          title: 'Serenity Sketch',
          imageUrl: '/mock/art1.jpg',
          category: 'Sketch',
          price: 1200,
        },
        {
          id: 2,
          title: 'Abstract Dreams',
          imageUrl: '/mock/art2.jpg',
          category: 'Painting',
          price: 2500,
        },
        {
          id: 3,
          title: 'Nature Bliss',
          imageUrl: '/mock/art3.jpg',
          category: 'Landscape',
          price: 1800,
        },
      ];
    }
  },

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
  // ✅ Fetch backend testimonials + merge with mock data
  getAll: async () => {
    const mockTestimonials = [
      {
        id: 'mock-1',
        name: 'Riya Sharma',
        rating: 5,
        feedback: 'Absolutely stunning sketch! The detail is unbelievable 💖',
        image: '/mock/user1.jpg',
      },
      {
        id: 'mock-2',
        name: 'Arjun Mehta',
        rating: 4,
        feedback: 'Great work and super fast delivery 👏',
        image: '/mock/user2.jpg',
      },
    ];

    try {
      const response = await axios.get('/testimonials');
      const backendData = response.data || [];
      return [...mockTestimonials, ...backendData];
    } catch (error) {
      console.warn('⚠️ Using mock testimonials (backend offline)');
      return mockTestimonials;
    }
  },

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
      console.error(
        '❌ Error sending commission request:',
        error.response?.data || error.message
      );
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
