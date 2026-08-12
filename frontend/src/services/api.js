import axios from 'axios'
import storage from '@/utils/storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7070/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor - Attach token if available & prevent double /api/api/ path
api.interceptors.request.use(
  (config) => {
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4)
    }
    const token = storage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor - Handle 401/403 states without direct navigation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      storage.clearSession()
      // Emit a global event so that AuthContext can handle redirect cleanly
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(error)
  }
)

export default api
