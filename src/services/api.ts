import axios from 'axios'

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim()
  let url = 'http://127.0.0.1:5000'

  if (envUrl) {
    url = envUrl
  } else if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname.includes('staging')) {
      url = 'https://staging-api.jarabagapp.com'
    } else if (hostname === 'jarabagapp.com' || hostname.endsWith('.jarabagapp.com')) {
      url = 'https://api.jarabagapp.com'
    } else if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      url = `http://${hostname}:5000`
    }
  }

  const cleanedUrl = url.replace(/\/+$/, '')
  return cleanedUrl.endsWith('/v1') ? cleanedUrl : `${cleanedUrl}/v1`
}

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically append Bearer JWT token to all requests if present in localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jarabag_access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Clear expired/revoked admin sessions automatically on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const reqUrl = String(error?.config?.url || '')
    const isAuthAttempt = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/dev-login')

    if (error?.response?.status === 401 && !isAuthAttempt && typeof window !== 'undefined') {
      localStorage.removeItem('jarabag_access_token')
      localStorage.removeItem('jarabag_user')
      localStorage.removeItem('jarabag_auth_step')

      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  },
)
