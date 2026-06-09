export interface UserAudit {
  id: number
  user_id: number | null
  deleted_at: string
  deleted_by: number | null
  snapshot: Record<string, unknown>
}
