import api from './api'

export const clubService = {
  getAllClubs: async () => {
    const res = await api.get('/api/clubs')
    return res
  },
  getClubById: async (id) => {
    const res = await api.get(`/api/clubs/${id}`)
    return res
  },
  createClub: async (payload) => {
    const res = await api.post('/api/clubs', payload)
    return res
  },
  updateClub: async (id, payload) => {
    const res = await api.put(`/api/clubs/${id}`, payload)
    return res
  },
  deleteClub: async (id) => {
    const res = await api.delete(`/api/clubs/${id}`)
    return res
  },
  getMyClubs: async () => {
    const res = await api.get('/api/clubs/my-clubs')
    return res
  }
}
export default clubService
