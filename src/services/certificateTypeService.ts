import { createCrudService } from './factory'
import type { CertificateType, CertificateTypeCreate, CertificateTypeUpdate } from '../types'

export const certificateTypeService = createCrudService<CertificateType, CertificateTypeCreate, CertificateTypeUpdate>({ basePath: '/certificate-types' })
