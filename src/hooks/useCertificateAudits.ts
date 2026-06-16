import { createCrudHooks } from './factory'
import { certificateAuditService } from '../services/certificateAuditService'
import type { CertificateAudit, CertificateAuditCreate, CertificateAuditUpdate } from '../types'

export const {
  useList: useCertificateAudits,
} = createCrudHooks<CertificateAudit, CertificateAuditCreate, CertificateAuditUpdate>({ queryKey: 'certificate-audit', service: certificateAuditService })
