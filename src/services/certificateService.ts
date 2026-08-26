import api from './api'
import type { BatchIssueRequest, BatchIssueResponse, Certificate, CertificateIssueRequest, CertificateRenewRequest, CertificateUpdate } from '../types'

export const certificateService = {
  list: async (params?: Record<string, unknown>): Promise<{ items: Certificate[]; total: number }> => {
    const { data } = await api.get<{ items: Certificate[]; total: number }>('/certificates', { params })
    return data
  },

  getById: async (id: number): Promise<Certificate> => {
    const { data } = await api.get<Certificate>(`/certificates/${id}`)
    return data
  },

  issue: async (payload: CertificateIssueRequest): Promise<Certificate> => {
    const { data } = await api.post<Certificate>('/certificates', payload)
    return data
  },

  update: async (id: number, payload: CertificateUpdate): Promise<Certificate> => {
    const { data } = await api.patch<Certificate>(`/certificates/${id}`, payload)
    return data
  },

  renew: async (id: number, payload: CertificateRenewRequest): Promise<Certificate> => {
    const { data } = await api.post<Certificate>(`/certificates/${id}/renew`, payload)
    return data
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/certificates/${id}`)
  },

  issueBatch: async (payload: BatchIssueRequest): Promise<BatchIssueResponse> => {
    const { data } = await api.post<BatchIssueResponse>('/certificates/batch', payload)
    return data
  },

  viewByUuid: async (uuid: string): Promise<Certificate> => {
    const { data } = await api.get<Certificate>(`/certificates/view/${uuid}`)
    return data
  },

  viewQrByUuid: async (uuid: string): Promise<Blob> => {
    const { data } = await api.get<Blob>(`/certificates/view/${uuid}/qr`, {
      responseType: 'blob',
    })
    return data
  },
}
