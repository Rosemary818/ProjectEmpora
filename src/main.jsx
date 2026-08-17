import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

// Global fetch interceptor to handle 401 Unauthorized across the app
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  if (response.status === 401) {
    // Avoid redirect loop for auth endpoints
    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
    const isAuthEndpoint = url.includes('/login') || url.includes('/auth') || url.includes('/register');
    
    if (!isAuthEndpoint && window.location.pathname !== '/login') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  }
  return response;
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="923115329782-3kbb29a74rpr8rgn8pfp46j232jpqu86.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
