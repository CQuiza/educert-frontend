import type { CourseStatus } from './enums'

export interface CourseCreate {
  title: string
  description?: string | null
  certificate_type_id?: number | null
  teacher_id?: number | null
  status?: CourseStatus
}

export interface CourseUpdate {
  title?: string
  description?: string | null
  certificate_type_id?: number | null
  teacher_id?: number | null
  status?: CourseStatus
}

export interface Course {
  id: number
  title: string
  description: string | null
  certificate_type_id: number | null
  teacher_id: number | null
  created_at: string
  updated_at: string
  status: CourseStatus
}

export interface CoursePublic {
  id: number
  title: string
  description: string | null
  status: CourseStatus
}
