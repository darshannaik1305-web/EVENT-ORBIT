import api from './api'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

export const clubService = {
  getAllClubs: async () => {
    return { data: [] }
  },
  getClubById: async (id) => {
    return { data: {} }
  },
  createClub: async (payload) => {
    return { data: {} }
  },
  updateClub: async (id, payload) => {
    return { data: {} }
  },
  deleteClub: async (id) => {
    return { data: {} }
  }
}
export default clubService
