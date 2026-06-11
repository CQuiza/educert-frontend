import api from './api'
import { config } from '../config'
import type { LessonFile } from '../types'

export const lessonFileService = {
  listByLesson: async (lessonId: number): Promise<LessonFile[]> => {
    const { data } = await api.get<LessonFile[]>(`/lessons/${lessonId}/files`)
    return data
  },

  create: async (lessonId: number, payload: { original_filename: string; mime_type?: string; order_index?: number }): Promise<LessonFile> => {
    const { data } = await api.post<LessonFile>(`/lessons/${lessonId}/files`, payload)
    return data
  },

  remove: async (lessonId: number, fileId: number): Promise<void> => {
    await api.delete(`/lessons/${lessonId}/files/${fileId}`)
  },

  uploadFile: async (lessonId: number, fileId: number, file: File): Promise<LessonFile> => {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post<LessonFile>(`/lessons/${lessonId}/files/${fileId}/upload`, fd)
    return data
  },

  getFileUrl: (lessonId: number, fileId: number, download?: boolean): string => {
    const base = `${config.apiUrl}/lessons/${lessonId}/files/${fileId}/file`
    return download ? `${base}?download=true` : base
  },
}
