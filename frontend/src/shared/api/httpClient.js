import axios from 'axios';

function resolveBaseURL() {
  const raw = import.meta.env.VITE_BACKEND_URL;
  const hasExplicit = raw !== undefined && raw !== '';

  if (hasExplicit) {
    if (
      import.meta.env.PROD &&
      (String(raw).includes('localhost:8080') || String(raw).includes('127.0.0.1:8080'))
    ) {
      console.warn(
        '[api] VITE_BACKEND_URL aponta para :8080 num build de produção; a usar /api (Nginx). Corrige o .env e rebuild.'
      );
      return '/api';
    }
    return raw;
  }

  return import.meta.env.PROD ? '/api' : 'http://localhost:8080';
}

const baseURL = resolveBaseURL();

const api = axios.create({
  baseURL,
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
