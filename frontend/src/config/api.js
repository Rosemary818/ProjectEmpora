const isProduction = import.meta.env.PROD || import.meta.env.MODE === 'production';
const rawEnvUrl = import.meta.env.VITE_API_URL;

// In production mode, default to the production backend URL on Render.
// Also guard against localhost URL accidentally leaking into a production build.
const defaultUrl = isProduction
  ? 'https://backend-empora.onrender.com'
  : 'http://localhost:5000';

const resolvedUrl = (isProduction && (!rawEnvUrl || rawEnvUrl.includes('localhost')))
  ? 'https://backend-empora.onrender.com'
  : (rawEnvUrl || defaultUrl);

export const API_BASE_URL = resolvedUrl.replace(/\/+$/, '');
export const API_URL = API_BASE_URL;

export const getApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export default API_BASE_URL;
