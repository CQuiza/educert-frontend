import { createCrudService } from './factory'
import type { CertificateAudit, CertificateAuditCreate, CertificateAuditUpdate } from '../types'

export const certificateAuditService = createCrudService<CertificateAudit, CertificateAuditCreate, CertificateAuditUpdate>({ basePath: '/certificate-audit' })
