import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true
});

// Attach Bearer token from sessionStorage on every request
API.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

//Movie APIs
export const movieAPI = {
    getAll: (params) => API.get('/movies', { params }),
    getById: (id) => API.get(`/movies/${id}`),
    create: (data) => API.post('/movies', data),
    update: (id, data) => API.put(`/movies/${id}`, data),
    delete: (id) => API.delete(`/movies/${id}`),
    getReviews: (id) => API.get(`/movies/${id}/reviews`),
    addReview: (id, data) => API.post(`/movies/${id}/reviews`, data)
};

//Theater APIs
export const theaterAPI = {
    getAll: () => API.get('/theaters'),
    getById: (id) => API.get(`/theaters/${id}`),
    create: (data) => API.post('/theaters', data),
    getLocations: () => API.get('/theaters/locations')
};

// Showtime APIs
export const showtimeAPI = {
    getAll: (params) => API.get('/showtimes', { params }),
    getById: (id) => API.get(`/showtimes/${id}`),
    create: (data) => API.post('/showtimes', data)
};

// Payment APIs
export const paymentAPI = {
    createOrder: (data) => API.post('/payments/create-order', data),
    verifyPayment: (data) => API.post('/payments/verify-payment', data)
};

// Booking APIs
export const bookingAPI = {
    getMyBookings: () => API.get('/bookings/my'),
    getById: (id) => API.get(`/bookings/${id}`),
    cancelBooking: (id) => API.put(`/bookings/${id}/cancel`),
    checkInBooking: (id) => API.put(`/bookings/${id}/checkin`)
};

export default API;
