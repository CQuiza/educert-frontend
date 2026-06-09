import { createCrudHooks } from './factory'
import { lessonService } from '../services/lessonService'
import type { Lesson, LessonCreate, LessonUpdate } from '../types'

export const {
  useList: useLessons,
  useById: useLesson,
  useCreate: useCreateLesson,
  useUpdate: useUpdateLesson,
  useRemove: useDeleteLesson,
} = createCrudHooks<Lesson, LessonCreate, LessonUpdate>({ queryKey: 'lessons', service: lessonService })
