import type { CertificateTypeKind, ValidityUnit } from './enums'

export interface CertificateTypeCreate {
  name: string
  reference?: string | null
  type: CertificateTypeKind
  hours: number
  validity_type: ValidityUnit
  validity_value: number
  created_by?: number | null
}

export interface CertificateTypeUpdate {
  name?: string
  reference?: string | null
  type?: CertificateTypeKind
  hours?: number
  validity_type?: ValidityUnit
  validity_value?: number
}

export interface CertificateType {
  id: number
  name: string
  reference: string | null
  type: CertificateTypeKind
  hours: number
  validity_type: ValidityUnit
  validity_value: number
  created_by: number | null
  created_at: string
}
