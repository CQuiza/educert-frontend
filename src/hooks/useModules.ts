import { createCrudHooks } from './factory'
import { moduleService } from '../services/moduleService'
import type { Module, ModuleCreate, ModuleUpdate } from '../types'

export const {
  useList: useModules,
  useById: useModule,
  useCreate: useCreateModule,
  useUpdate: useUpdateModule,
  useRemove: useDeleteModule,
} = createCrudHooks<Module, ModuleCreate, ModuleUpdate>({ queryKey: 'modules', service: moduleService })
