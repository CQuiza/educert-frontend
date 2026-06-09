import type { CertificateStatus } from './enums'

export interface CertificateCreate {
  certificate_type_id?: number | null
  user_id?: number | null
  status?: CertificateStatus
  qr_code_url?: string | null
  pdf_url?: string | null
}

export interface CertificateIssueRequest {
  user_id: number
  certificate_type_id: number
  issued_at?: string | null
}

export interface CertificateUpdate {
  status?: CertificateStatus
  qr_code_url?: string | null
  pdf_url?: string | null
}

export interface Certificate {
  id: number
  unique_id: string
  certificate_type_id: number | null
  user_id: number | null
  issued_at: string
  expires_at: string | null
  status: CertificateStatus
  qr_code_url: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}
