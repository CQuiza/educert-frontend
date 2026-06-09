export interface LessonCreate {
  module_id: number
  title: string
  text_content?: string | null
  image_content_url?: string | null
  video_content_url?: string | null
  file_content_url?: string | null
  order_index: number
}

export interface LessonUpdate {
  title?: string
  text_content?: string | null
  image_content_url?: string | null
  video_content_url?: string | null
  file_content_url?: string | null
  order_index?: number
}

export interface Lesson {
  id: number
  module_id: number
  title: string
  text_content: string | null
  image_content_url: string | null
  video_content_url: string | null
  file_content_url: string | null
  order_index: number
}
