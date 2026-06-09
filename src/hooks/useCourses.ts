import { createCrudHooks } from './factory'
import { courseService } from '../services/courseService'
import type { Course, CourseCreate, CourseUpdate } from '../types'

export const {
  useList: useCourses,
  useById: useCourse,
  useCreate: useCreateCourse,
  useUpdate: useUpdateCourse,
  useRemove: useDeleteCourse,
} = createCrudHooks<Course, CourseCreate, CourseUpdate>({ queryKey: 'courses', service: courseService })
