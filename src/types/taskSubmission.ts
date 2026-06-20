export interface TaskSubmission {
  id: number
  task_id: number
  user_id: number
  file_url: string
  original_filename: string
  mime_type: string
  submitted_at: string
}

export interface TaskSubmissionWithUser extends TaskSubmission {
  user_name: string
  user_email: string
}
