import api from './api'
import type { User, UserCreate, UserUpdate, UserWithCertificates } from '../types'

export const userService = {
  list: async (params?: Record<string, unknown>): Promise<{ items: User[]; total: number }> => {
    const { data } = await api.get<{ items: User[]; total: number }>('/users', { params })
    return data
  },

  getById: async (id: number): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`)
    return data
  },

  getCertified: async (params?: Record<string, unknown>): Promise<{ items: UserWithCertificates[]; total: number }> => {
    const { data } = await api.get<{ items: UserWithCertificates[]; total: number }>('/users/certified', { params })
    return data
  },

  create: async (payload: UserCreate): Promise<User> => {
    const { data } = await api.post<User>('/users', payload)
    return data
  },

  update: async (id: number, payload: UserUpdate): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, payload)
    return data
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
