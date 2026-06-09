import { useQuery } from '@tanstack/react-query'
import { userAuditService } from '../services/userAuditService'

export function useUserAudits(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['user-audit', params],
    queryFn: () => userAuditService.list(params),
  })
}
