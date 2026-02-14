import axios from 'axios';

const api = axios.create({
  baseURL: 'http://api.com.br',
});

api.interceptors.request.use((config) => {

  const token = localStorage.getItem('@trascendence:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;