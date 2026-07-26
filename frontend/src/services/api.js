import axios from 'axios'
import { APP_CONSTANTS } from '@/constants/appConstants'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7070/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically append authorization token to outgoing API requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
