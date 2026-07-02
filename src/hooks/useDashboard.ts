import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import type { DashboardStats } from '../types'

const QUERY_KEY = ['dashboard-stats']

export function useDashboardStats(options?: { enabled?: boolean }) {
  return useQuery<DashboardStats>({
    queryKey: QUERY_KEY,
    queryFn: () => dashboardService.getStats(),
    ...options,
  })
}
