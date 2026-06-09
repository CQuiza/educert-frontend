import type { UserRole, IdentityType } from './enums'

export interface UserBase {
  email: string
  name: string | null
  first_last_name: string | null
  second_last_name: string | null
  role: UserRole
  identity_type: IdentityType
  identity_number: string
  phone_number: string
  is_active: boolean
}

export interface UserCreate extends UserBase {
  password: string
}

export interface UserUpdate {
  email?: string
  password?: string
  name?: string | null
  first_last_name?: string | null
  second_last_name?: string | null
  role?: UserRole
  identity_type?: IdentityType
  identity_number?: string
  phone_number?: string
  is_active?: boolean
}

export interface User {
  id: number
  email: string
  name: string | null
  first_last_name: string | null
  second_last_name: string | null
  role: UserRole
  identity_type: IdentityType
  identity_number: string
  phone_number: string
  created_at: string
  updated_at: string
  is_active: boolean
}

import type { Certificate } from './certificate'

export interface UserWithCertificates extends User {
  certificates: Certificate[]
}
