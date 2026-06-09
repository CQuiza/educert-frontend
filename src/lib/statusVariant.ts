export type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default'

export function courseStatusVariant(s: string): BadgeVariant {
  if (s === 'published') return 'success'
  if (s === 'draft') return 'warning'
  return 'default'
}

export function certificateStatusVariant(s: string): BadgeVariant {
  if (s === 'active') return 'success'
  if (s === 'revoked') return 'danger'
  return 'warning'
}

export function auditStatusVariant(s: string): BadgeVariant {
  if (s === 'sent' || s === 'completed' || s === 'success') return 'success'
  if (s === 'failed' || s === 'error') return 'danger'
  return 'warning'
}
