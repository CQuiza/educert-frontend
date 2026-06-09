import api from './api'
import type { WorkerAudit } from '../types'

export const workerAuditService = {
  list: async (params?: Record<string, unknown>): Promise<WorkerAudit[]> => {
    const { data } = await api.get<WorkerAudit[]>('/worker-audit', { params })
    return data
  },
}
