import api from './api'

export const eventService = {
  getAllEvents: async () => {
    const res = await api.get('/api/events')
    return res
  },
  getActiveEvents: async (clubId) => {
    const url = clubId ? `/api/events/active?clubId=${clubId}` : '/api/events/active'
    const res = await api.get(url)
    return res
  },
  getExpiredEvents: async (clubId) => {
    const url = clubId ? `/api/events/expired?clubId=${clubId}` : '/api/events/expired'
    const res = await api.get(url)
    return res
  },
  getEventsByClub: async (clubId) => {
    const res = await api.get(`/api/events/club/${clubId}`)
    return res
  },
  getEventById: async (id) => {
    const res = await api.get(`/api/events/${id}`)
    return res
  },
  createEvent: async (payload) => {
    const res = await api.post('/api/events', payload)
    return res
  },
  updateEvent: async (id, payload) => {
    const res = await api.put(`/api/events/${id}`, payload)
    return res
  },
  extendRegistrationEnd: async (id, payload) => {
    const res = await api.patch(`/api/events/${id}/extend`, payload)
    return res
  },
  deleteEvent: async (id) => {
    const res = await api.delete(`/api/events/${id}`)
    return res
  },
  registerForEvent: async (id) => {
    const res = await api.post(`/api/events/${id}/register`)
    return res
  },
  listRegistrations: async (id) => {
    const res = await api.get(`/api/events/${id}/registrations`)
    return res
  },
  removeRegistration: async (eventId, regId) => {
    const res = await api.delete(`/api/events/${eventId}/registrations/${regId}`)
    return res
  },
  getMyRegistrations: async (username) => {
    const res = await api.get(`/api/events/my-registrations?username=${username}`)
    return res
  }
}
export default eventService
