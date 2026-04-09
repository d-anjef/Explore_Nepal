import axios from 'axios';

const API = axios.create({
  // Use environment variable, otherwise fallback to localhost for dev
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', 
});

export default API;