import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { config } from '../config'
import { authService, getRefreshToken, setRefreshToken } from './authService'

const api = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
})

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string | null) => void
  reject: (err: unknown) => void
}> = []

function processQueue(token: string | null, err: unknown = null) {
  pendingQueue.forEach((p) => {
    if (err) p.reject(err)
    else p.resolve(token)
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (!getRefreshToken()) {
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then(() => {
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const token = await authService.refresh()
      setRefreshToken(token.refresh_token ?? null)
      processQueue(token.access_token)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(null, refreshError)
      setRefreshToken(null)
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
