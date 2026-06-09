import { createCrudHooks } from './factory'
import { enrollmentService } from '../services/enrollmentService'
import type { CourseEnrollment, CourseEnrollmentCreate } from '../types'

export const {
  useList: useEnrollments,
  useById: useEnrollment,
  useCreate: useCreateEnrollment,
  useRemove: useDeleteEnrollment,
} = createCrudHooks<CourseEnrollment, CourseEnrollmentCreate, CourseEnrollmentCreate>({ queryKey: 'enrollments', service: enrollmentService })
