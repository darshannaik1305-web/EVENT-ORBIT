import React, { createContext, useState, useEffect } from 'react'
import storage from '@/utils/storage'
import authService from '@/services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = storage.getToken()
        const storedUser = storage.getUser()
        if (storedToken && storedUser) {
          setToken(storedToken)
          setUser(storedUser)
          setIsAuthenticated(true)
        }
      } catch (e) {
        console.error('Auth initialization error:', e)
        storage.clearSession()
      } finally {
        setLoading(false)
      }
    }
    initializeAuth()

    // Handle global unauthorized 401 events emitted by Axios interceptor
    const handleUnauthorized = () => {
      logoutStateClear()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  const logoutStateClear = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
  }

  const login = async (username, password) => {
    // Authenticate through the backend service
    const data = await authService.login(username, password)
    
    const rolesArray = Array.isArray(data.roles) && data.roles.length > 0
      ? data.roles
      : data.role === 'CLUB_ADMIN'
      ? ['STUDENT', 'CLUB_ADMIN']
      : data.role === 'SUPER_ADMIN' || data.role === 'ADMIN'
      ? ['SUPER_ADMIN']
      : ['STUDENT']

    const userObj = {
      username: data.username,
      role: data.role,
      roles: rolesArray,
      fullName: data.fullName || '',
      email: data.email || '',
      adminClubIds: data.adminClubIds || [],
      adminClubId: data.adminClubId || null,
    }

    storage.saveToken(data.token)
    storage.saveUser(userObj)
    
    setToken(data.token)
    setUser(userObj)
    setIsAuthenticated(true)

    return userObj
  }

  const register = async (payload) => {
    return await authService.register(payload)
  }

  const logout = () => {
    storage.clearSession()
    logoutStateClear()
  }

  const refreshSession = () => {
    const storedToken = storage.getToken()
    const storedUser = storage.getUser()
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(storedUser)
      setIsAuthenticated(true)
    } else {
      logoutStateClear()
    }
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
export default AuthProvider
