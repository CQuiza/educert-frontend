import { useQuery } from '@tanstack/react-query'
import { emailAuditService } from '../services/emailAuditService'

export function useEmailAudits(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['email-audit', params],
    queryFn: () => emailAuditService.list(params),
  })
}
