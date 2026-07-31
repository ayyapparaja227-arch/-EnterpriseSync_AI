import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000, // 4 second timeout — don't hang forever waiting for offline backend
})

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('es_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

api.interceptors.response.use(
  r => r.data,
  err => {
    const token = localStorage.getItem('es_token') || ''
    const isMockToken = token.startsWith('mock_token_')          // mock login — skip redirect
    const isLoginEndpoint = err.config?.url?.includes('/api/auth/login')

    // Only force-logout on real 401s from real sessions (not mock demo tokens)
    if (err.response?.status === 401 && !isLoginEndpoint && !isMockToken) {
      localStorage.clear()
      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)

export default api
