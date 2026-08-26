import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { certificateService } from '../services/certificateService'
import type { BatchIssueRequest, CertificateIssueRequest, CertificateRenewRequest, CertificateUpdate } from '../types'

const QUERY_KEY = ['certificates']

function invalidateCaches(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: ['users'] })
}

export function useCertificates(params?: Record<string, unknown>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => certificateService.list(params),
    ...options,
  })
}

export function useCertificate(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => certificateService.getById(id),
    enabled: id > 0,
  })
}

export function useIssueCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CertificateIssueRequest) => certificateService.issue(data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useUpdateCertificate(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CertificateUpdate) => certificateService.update(id, data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => certificateService.remove(id),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useBatchIssueCertificates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BatchIssueRequest) => certificateService.issueBatch(data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useRenewCertificate(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CertificateRenewRequest) => certificateService.renew(id, data),
    onSuccess: () => invalidateCaches(queryClient),
  })
}

export function useCertificateByUuid(uuid: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'uuid', uuid],
    queryFn: () => certificateService.viewByUuid(uuid),
    enabled: !!uuid,
  })
}
