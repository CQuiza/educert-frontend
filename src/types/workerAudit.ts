export interface WorkerAudit {
  id: number
  task_name: string
  status: string
  started_at: string | null
  finished_at: string | null
  details: string | null
  created_at: string
}
