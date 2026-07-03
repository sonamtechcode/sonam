import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        setIsAuthenticated(true)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        console.log('✅ Auth initialized from localStorage:', parsed.email)
      } else {
        setIsAuthenticated(false)
        console.log('⚠️ No auth token found')
      }
    } catch (err) {
      console.error('❌ Auth initialization error:', err)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, []) // Only run once on mount

  const login = useCallback(async (email, password) => {
    try {
      console.log('🔐 Attempting login...')
      const response = await api.post('/auth/login', { email, password })
      
      const { token, user, success } = response.data
      
      if (!success || !token || !user) {
        throw new Error('Invalid response from server')
      }
      
      console.log('✅ Login successful')
      
      // Save to localStorage
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      // Update state
      setUser(user)
      setIsAuthenticated(true)
      
      return user
    } catch (error) {
      console.error('❌ Login error:', error.message)
      setIsAuthenticated(false)
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    console.log('🚪 Logging out...')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return { user, isAuthenticated, loading, login, logout }
}

