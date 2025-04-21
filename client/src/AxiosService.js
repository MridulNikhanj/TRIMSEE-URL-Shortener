import axios from 'axios';

// This will use the environment variable in production
// and default to localhost for local development
const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:3200/';

console.log('API BASE URL:', baseURL); // Helpful for debugging

export const axiosGet = (url) => axios.get(`${baseURL}${url}`);
export const axiosPost = (url, data) => axios.post(`${baseURL}${url}`, data, {
  headers: { 'Content-Type': 'application/json' }
});
export const axiosDelete = (url, data) => axios.delete(`${baseURL}${url}`, {
  headers: { 'Content-Type': 'application/json' }
});