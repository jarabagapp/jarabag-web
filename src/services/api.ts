import axios from 'axios'

// Dynamically detect local network IP of the host machine
const getBaseURL = () => {
  let url = 'http://127.0.0.1:5000'
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
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
  (error) => {
    return Promise.reject(error)
  }
)
