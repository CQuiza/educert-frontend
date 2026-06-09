import { createCrudService } from './factory'
import type { Course, CourseCreate, CourseUpdate } from '../types'

export const courseService = createCrudService<Course, CourseCreate, CourseUpdate>({ basePath: '/courses' })
