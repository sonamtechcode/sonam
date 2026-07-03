import { useState, useEffect } from 'react'
import api from '../services/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
      setIsAuthenticated(true)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    console.log('🔐 Login response:', response.data) // Debug log
    
    const { token, user, success } = response.data
    
    if (!success || !token || !user) {
      console.error('❌ Login failed - missing data:', { token: !!token, user: !!user, success })
      throw new Error('Invalid response from server - missing token or user')
    }
    
    console.log('✅ Token received:', token.substring(0, 20) + '...')
    console.log('✅ User received:', user.email)
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    
    setUser(user)
    setIsAuthenticated(true)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setIsAuthenticated(false)
  }

  return { user, isAuthenticated, loading, login, logout }
}
