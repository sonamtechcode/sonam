import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'https://sonam-zhe4.onrender.com/api'

console.log('🔗 API URL:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable credentials for cross-origin requests
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request error:', error.message)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message || 'An error occurred'
    
    console.error('❌ Response error:', {
      status,
      message,
      url: error.config?.url
    })

    // Only logout on 401 Unauthorized (invalid/expired token)
    // Do NOT logout on other errors
    if (status === 401) {
      console.warn('⚠️ Unauthorized - Token invalid or expired')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      setTimeout(() => {
        window.location.replace('/login')
      }, 1000)
      return Promise.reject(error)
    }

    // For all other errors, just show toast
    if (status !== 404 && status !== 200) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
