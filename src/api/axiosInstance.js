// e:\PROYECTO_ROSILLO\django_react\react_rosillo\src\api\axiosInstance.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/'; // Asegúrate de que este sea el puerto de tu backend Django

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a cada petición
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // O de donde lo guardes (ej. Redux)
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
