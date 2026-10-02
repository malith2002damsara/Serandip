// Get backend URL from environment variable and ensure no trailing slash
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
export const backendUrl = rawBackendUrl.endsWith('/') ? rawBackendUrl.slice(0, -1) : rawBackendUrl;

export const currency = 'LKR';

console.log('Constants - Raw backend URL:', rawBackendUrl);
console.log('Constants - Cleaned backend URL:', backendUrl);
