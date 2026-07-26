import api from './api'
import { API_ENDPOINTS } from '@/constants/apiEndpoints'

export const eventService = {
  getAllEvents: async () => {
    return { data: [] }
  },
  getActiveEvents: async (clubId) => {
    return { data: [] }
  },
  getExpiredEvents: async (clubId) => {
    return { data: [] }
  },
  getEventsByClub: async (clubId) => {
    return { data: [] }
  },
  getEventById: async (id) => {
    return { data: {} }
  },
  createEvent: async (payload) => {
    return { data: {} }
  },
  updateEvent: async (id, payload) => {
    return { data: {} }
  },
  extendRegistrationEnd: async (id, payload) => {
    return { data: {} }
  },
  deleteEvent: async (id) => {
    return { data: {} }
  },
  registerForEvent: async (id) => {
    return { data: {} }
  },
  listRegistrations: async (id) => {
    return { data: [] }
  },
  removeRegistration: async (eventId, regId) => {
    return { data: {} }
  },
  getMyRegistrations: async (username) => {
    return { data: [] }
  }
}
export default eventService
