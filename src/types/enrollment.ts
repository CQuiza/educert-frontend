export interface CourseEnrollmentCreate {
  user_id: number
  course_id: number
}

export interface CourseEnrollment {
  id: number
  user_id: number
  course_id: number
  enrolled_at: string
}
