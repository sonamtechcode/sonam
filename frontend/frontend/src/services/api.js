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
    const url = error.config?.url
    
    console.error('❌ API Error:', {
      status,
      message,
      url
    })

    // ONLY logout on 401 - token is invalid/expired
    if (status === 401) {
      console.warn('⚠️ Token expired - redirecting to login')
      localStorage.clear()
      delete api.defaults.headers.common['Authorization']
      // Redirect after short delay
      setTimeout(() => {
        window.location.href = '/login'
      }, 500)
      return Promise.reject(error)
    }

    // For all other errors (500, 404, network, etc), just reject without logging out
    // Let the component handle the error
    if (message) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api
