import { createCrudService } from './factory'
import type { UserProgress, UserProgressCreate, UserProgressUpdate } from '../types'

export const progressService = createCrudService<UserProgress, UserProgressCreate, UserProgressUpdate>({ basePath: '/user-progress' })
