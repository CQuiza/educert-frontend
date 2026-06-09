export interface TaskCreate {
  lesson_id: number
  title: string
  description?: string | null
  original_filename?: string | null
  file_type?: string
  file_url?: string | null
  google_drive_link?: string | null
  order_index?: number
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  original_filename?: string | null
  file_type?: string
  file_url?: string | null
  google_drive_link?: string | null
  order_index?: number
}

export interface Task {
  id: number
  lesson_id: number
  title: string
  description: string | null
  original_filename: string | null
  file_type: string
  file_url: string | null
  google_drive_link: string | null
  order_index: number
  created_at: string
  updated_at: string
}
