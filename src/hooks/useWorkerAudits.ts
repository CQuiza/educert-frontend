import { useQuery } from '@tanstack/react-query'
import { workerAuditService } from '../services/workerAuditService'

export function useWorkerAudits(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['worker-audit', params],
    queryFn: () => workerAuditService.list(params),
  })
}
