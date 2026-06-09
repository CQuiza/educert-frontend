import { createCrudService } from './factory'
import type { CourseEnrollment, CourseEnrollmentCreate } from '../types'

export const enrollmentService = createCrudService<CourseEnrollment, CourseEnrollmentCreate, CourseEnrollmentCreate>({ basePath: '/course-enrollments' })
