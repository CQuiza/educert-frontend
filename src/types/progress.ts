export interface UserProgressCreate {
  user_id: number
  lesson_id: number
  completed?: boolean
  completed_at?: string | null
}

export interface UserProgressUpdate {
  completed?: boolean
  completed_at?: string | null
}

export interface UserProgress {
  id: number
  user_id: number
  lesson_id: number
  completed: boolean
  completed_at: string | null
}
