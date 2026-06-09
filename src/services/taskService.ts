import api from './api'
import { config } from '../config'
import type { Task, TaskCreate, TaskUpdate } from '../types'

export const taskService = {
  listByLesson: async (lessonId: number, params?: Record<string, unknown>): Promise<Task[]> => {
    const { data } = await api.get<Task[]>(`/tasks/by-lesson/${lessonId}`, { params })
    return data
  },

  create: async (payload: TaskCreate): Promise<Task> => {
    const { data } = await api.post<Task>('/tasks', payload)
    return data
  },

  update: async (id: number, payload: TaskUpdate): Promise<Task> => {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload)
    return data
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  uploadFile: async (taskId: number, file: File): Promise<Task> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<Task>(`/tasks/${taskId}/upload`, form)
    return data
  },

  getFileUrl: (taskId: number): string => {
    return `${config.apiUrl}/tasks/${taskId}/file`
  },
}
