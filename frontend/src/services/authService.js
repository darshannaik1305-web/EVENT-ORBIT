import api from './api'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

export const authService = {
  login: async (username, password) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password })
    return response.data
  },
  register: async (payload) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, payload)
    return response.data
  },
  registerAdmin: async (payload) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER_ADMIN, payload)
    return response.data
  }
}
export default authService
