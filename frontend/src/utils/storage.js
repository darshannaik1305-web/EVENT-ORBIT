import { APP_CONSTANTS } from '@/constants/appConstants'

const { TOKEN, USER } = APP_CONSTANTS.STORAGE_KEYS

export const storage = {
  saveToken: (token) => {
    localStorage.setItem(TOKEN, token)
  },
  getToken: () => {
    return localStorage.getItem(TOKEN)
  },
  saveUser: (user) => {
    localStorage.setItem(USER, JSON.stringify(user))
  },
  getUser: () => {
    try {
      const user = localStorage.getItem(USER)
      return user ? JSON.parse(user) : null
    } catch (e) {
      console.error('Failed to parse cached user', e)
      return null
    }
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN)
    localStorage.removeItem(USER)
  }
}
export default storage
