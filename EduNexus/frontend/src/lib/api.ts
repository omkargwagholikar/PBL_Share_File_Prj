import axios, { type AxiosInstance } from 'axios'
import { getFirebaseAuth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

const client: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use(async (config) => {
  const user = getFirebaseAuth().currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.set?.('Authorization', `Bearer ${token}`)
  }
  return config
})

client.interceptors.response.use(
  (r) => r,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.warn('[api] 401 unauthorized')
    }
    return Promise.reject(error)
  },
)

export default client

export const endpoints = {
  signup: '/auth/signup/',
  me: '/auth/me/',
  files: '/files/',
  fileById: (id: number | string) => `/files/${id}/`,
  upload: '/files/upload/',
  search: '/search/',
  suggest: '/search/suggest/',
  ingestionStream: (fileId: number | string) => `/files/${fileId}/events/`,
  upvote: (fileId: number | string) => `/files/${fileId}/upvote/`,
} as const
