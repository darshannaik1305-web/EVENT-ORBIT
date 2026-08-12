import api from './api'

export const teamService = {
  registerTeam: async (payload) => {
    // payload: { eventId, teamName, memberUsns }
    const res = await api.post('/api/teams', payload)
    return res
  },
  getTeamsByEvent: async (eventId) => {
    const res = await api.get(`/api/teams/event/${eventId}`)
    return res
  },
  deleteTeam: async (teamId) => {
    const res = await api.delete(`/api/teams/${teamId}`)
    return res
  },
  checkUserRegistration: async (eventId) => {
    const res = await api.get(`/api/teams/check-registration/${eventId}`)
    return res
  },
  getMyTeams: async (username) => {
    const res = await api.get(`/api/teams/my-teams?username=${username}`)
    return res
  },
}

export default teamService
