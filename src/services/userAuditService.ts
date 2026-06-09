import api from './api'
import type { UserAudit } from '../types'

export const userAuditService = {
  list: async (params?: Record<string, unknown>): Promise<UserAudit[]> => {
    const { data } = await api.get<UserAudit[]>('/user-audit', { params })
    return data
  },
}
