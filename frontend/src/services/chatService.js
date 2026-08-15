import api from './api'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

export const chatService = {
  sendQuery: async (query) => {
    return api.post(API_ENDPOINTS.CHAT, { query })
  }
}

export default chatService
