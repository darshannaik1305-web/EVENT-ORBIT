import api from './api'

export const adminService = {
  listUsers: async () => {
    const res = await api.get('/api/admin/users')
    return res
  },
  listClubAdmins: async () => {
    const res = await api.get('/api/admin/club-admins')
    return res
  },
  listPendingClubAdmins: async () => {
    const res = await api.get('/api/admin/club-admins/pending')
    return res
  },
  createClubAdmin: async (payload) => {
    const res = await api.post('/api/admin/club-admins', payload)
    return res
  },
  deleteUser: async (id) => {
    const res = await api.delete(`/api/admin/users/${id}`)
    return res
  },
  setUserEnabled: async (id, enabled) => {
    const res = await api.patch(`/api/admin/users/${id}/enabled`, { enabled })
    return res
  },
  setClubAdminEnabled: async (id, enabled) => {
    const res = await api.patch(`/api/admin/club-admins/${id}/enabled`, { enabled })
    return res
  },
  deleteClubAdmin: async (id) => {
    const res = await api.delete(`/api/admin/club-admins/${id}`)
    return res
  },
  cleanupWinners: async () => {
    const res = await api.post('/api/admin/cleanup-winners')
    return res
  },
  cleanupEvents: async () => {
    const res = await api.post('/api/admin/cleanup-events')
    return res
  }
}
export default adminService
