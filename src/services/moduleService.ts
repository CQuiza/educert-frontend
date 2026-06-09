import { createCrudService } from './factory'
import type { Module, ModuleCreate, ModuleUpdate } from '../types'

export const moduleService = createCrudService<Module, ModuleCreate, ModuleUpdate>({ basePath: '/modules' })
