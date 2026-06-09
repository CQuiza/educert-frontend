import { createCrudService } from './factory'
import type { Lesson, LessonCreate, LessonUpdate } from '../types'

export const lessonService = createCrudService<Lesson, LessonCreate, LessonUpdate>({ basePath: '/lessons' })
