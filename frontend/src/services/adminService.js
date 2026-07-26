import api from './api'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

export const adminService = {
  listUsers: async () => {
    return { data: [] }
  },
  listClubAdmins: async () => {
    return { data: [] }
  },
  listPendingClubAdmins: async () => {
    return { data: [] }
  },
  createUser: async (payload) => {
    return { data: {} }
  },
  deleteUser: async (id) => {
    return { data: {} }
  },
  setUserEnabled: async (id, enabled) => {
    return { data: {} }
  },
  setClubAdminEnabled: async (id, enabled) => {
    return { data: {} }
  },
  deleteClubAdmin: async (id) => {
    return { data: {} }
  },
  cleanupWinners: async () => {
    return { data: {} }
  },
  cleanupEvents: async () => {
    return { data: {} }
  }
}
export default adminService
