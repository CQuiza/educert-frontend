export interface LessonFile {
  id: number
  lesson_id: number
  original_filename: string | null
  mime_type: string | null
  file_url: string | null
  order_index: number
  created_at: string
}
