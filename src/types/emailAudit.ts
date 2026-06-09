export interface EmailAudit {
  id: number
  user_name: string | null
  email_to: string
  email_type: string
  status: string
  error: string | null
  created_at: string
  sent_at: string | null
}
