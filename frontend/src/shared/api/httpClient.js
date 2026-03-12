import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {

  if (config.skipAuth)
    return config;

  const token = localStorage.getItem('@trascendence:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.config?.skipAuth)
      return Promise.reject(error);

    if (error.response?.status === 401) {
      localStorage.removeItem('@trascendence:token');
      localStorage.removeItem('@trascendence:user');
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);



export default api;