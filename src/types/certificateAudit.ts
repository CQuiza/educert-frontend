import type { CertificateAuditAction } from './enums'

export interface CertificateAuditCreate {
  certificate_id?: number | null
  certificate_unique_id?: string | null
  action?: CertificateAuditAction | null
  performed_by?: number | null
}

export interface CertificateAuditUpdate {
  certificate_id?: number | null
  certificate_unique_id?: string | null
  action?: CertificateAuditAction | null
  performed_by?: number | null
}

export interface CertificateAudit {
  id: number
  certificate_id: number | null
  certificate_unique_id: string | null
  action: string | null
  performed_by: number | null
  timestamp: string
}
