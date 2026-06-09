export const UserRole = {
  superuser: "superuser",
  admin: "admin",
  teacher: "teacher",
  student: "student",
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const IdentityType = {
  CC: "CC",
  TI: "TI",
  OTHER: "OTHER",
} as const
export type IdentityType = (typeof IdentityType)[keyof typeof IdentityType]

export const CourseStatus = {
  draft: "draft",
  published: "published",
  archived: "archived",
} as const
export type CourseStatus = (typeof CourseStatus)[keyof typeof CourseStatus]

export const CertificateTypeKind = {
  basic: "basic",
  advanced: "advanced",
  diploma: "diploma",
} as const
export type CertificateTypeKind = (typeof CertificateTypeKind)[keyof typeof CertificateTypeKind]

export const ValidityUnit = {
  years: "years",
  months: "months",
  days: "days",
} as const
export type ValidityUnit = (typeof ValidityUnit)[keyof typeof ValidityUnit]

export const CertificateStatus = {
  active: "active",
  revoked: "revoked",
  expired: "expired",
} as const
export type CertificateStatus = (typeof CertificateStatus)[keyof typeof CertificateStatus]

export const CertificateAuditAction = {
  issued: "issued",
  active: "active",
  revoked: "revoked",
  deleted: "deleted",
  expired: "expired",
} as const
export type CertificateAuditAction = (typeof CertificateAuditAction)[keyof typeof CertificateAuditAction]
