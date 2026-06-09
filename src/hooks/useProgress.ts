import { createCrudHooks } from './factory'
import { progressService } from '../services/progressService'
import type { UserProgress, UserProgressCreate, UserProgressUpdate } from '../types'

export const {
  useList: useUserProgresses,
  useById: useUserProgress,
  useCreate: useCreateProgress,
  useUpdate: useUpdateProgress,
  useRemove: useDeleteProgress,
} = createCrudHooks<UserProgress, UserProgressCreate, UserProgressUpdate>({ queryKey: 'progress', service: progressService })
