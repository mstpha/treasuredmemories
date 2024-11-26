import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const tokens = JSON.parse(localStorage.getItem('tokens'));
        const response = await axios.post('http://localhost:5000/api/auth/token/refresh', {
          refreshToken: tokens.refreshToken
        });
        
        const newTokens = response.data.data.tokens;
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        window.location.href = '/';
        return Promise.reject(err);
      }
    }
    if (error.response && error.response.status === 404) {
      return Promise.reject(); // Silently reject
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use(
  (config) => {
    try {
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
    } catch (error) {
      console.error('Error parsing tokens:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;