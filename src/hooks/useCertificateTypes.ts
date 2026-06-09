import { createCrudHooks } from './factory'
import { certificateTypeService } from '../services/certificateTypeService'
import type { CertificateType, CertificateTypeCreate, CertificateTypeUpdate } from '../types'

export const {
  useList: useCertificateTypes,
  useById: useCertificateType,
  useCreate: useCreateCertificateType,
  useUpdate: useUpdateCertificateType,
  useRemove: useDeleteCertificateType,
} = createCrudHooks<CertificateType, CertificateTypeCreate, CertificateTypeUpdate>({ queryKey: 'certificate-types', service: certificateTypeService })
