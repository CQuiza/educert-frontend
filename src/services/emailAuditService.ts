import api from './api'
import type { EmailAudit } from '../types'

export const emailAuditService = {
  list: async (params?: Record<string, unknown>): Promise<EmailAudit[]> => {
    const { data } = await api.get<EmailAudit[]>('/email-audit', { params })
    return data
  },
}
