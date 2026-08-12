import api from './api'

export const winnerService = {
  getAllWinners: async () => {
    const res = await api.get('/api/winners')
    return res
  },
  getWinnersByEvent: async (eventId) => {
    const res = await api.get(`/api/winners/event/${eventId}`)
    return res
  },
  getWinnersByClub: async (clubId) => {
    const res = await api.get(`/api/winners/club/${clubId}`)
    return res
  },
  getWinnersByUser: async (username) => {
    const res = await api.get(`/api/winners/user/${username}`)
    return res
  },
  addWinner: async (eventId, payload) => {
    const res = await api.post(`/api/winners/event/${eventId}`, payload)
    return res
  },
  deleteWinner: async (id) => {
    const res = await api.delete(`/api/winners/${id}`)
    return res
  }
}
export default winnerService
