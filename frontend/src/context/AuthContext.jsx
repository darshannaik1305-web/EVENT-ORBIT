import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for cached user session on mount
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('cem_user')
        const storedToken = localStorage.getItem('cem_token')
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        }
      } catch (e) {
        console.error('Auth initialization error:', e)
      } finally {
        setLoading(false)
      }
    }
    initializeAuth()
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('cem_user', JSON.stringify(userData))
    localStorage.setItem('cem_token', token)
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('cem_user')
    localStorage.removeItem('cem_token')
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
