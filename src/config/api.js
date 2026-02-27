export const API_BASE_URL = (process.env.REACT_APP_API_URL ||'https://soothescape-backend.onrender.com').replace(/\/+$/, '');

export function apiUrl(path = '') {
  if (!path) return API_BASE_URL;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

