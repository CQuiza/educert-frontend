import api from './api'
import type { Token, LoginRequest } from '../types'

let _refreshToken: string | null = null

export function setRefreshToken(t: string | null) {
  _refreshToken = t
}

export function getRefreshToken(): string | null {
  return _refreshToken
}

export const authService = {
  login: async (data: LoginRequest): Promise<Token> => {
    const formData = new URLSearchParams()
    formData.append('username', data.username)
    formData.append('password', data.password)
    const { data: response } = await api.post<Token>('/auth/token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return response
  },

  getMe: async <T = unknown>(): Promise<T> => {
    const { data } = await api.get<T>('/auth/me')
    return data
  },

  refresh: async (): Promise<Token> => {
    const token = getRefreshToken()
    if (!token) throw new Error('No refresh token disponible')
    const { data } = await api.post<Token>('/auth/refresh', { refresh_token: token })
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },
}
