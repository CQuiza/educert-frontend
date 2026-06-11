import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lessonFileService } from '../services/lessonFileService'

export function useLessonFiles(lessonId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['lesson-files', lessonId],
    queryFn: () => lessonFileService.listByLesson(lessonId),
    enabled: lessonId > 0 && (options?.enabled ?? true),
  })
}

export function useCreateLessonFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: number; data: { original_filename: string; mime_type?: string; order_index?: number } }) =>
      lessonFileService.create(lessonId, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['lesson-files', res.lesson_id] })
    },
  })
}

export function useUploadLessonFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, fileId, file }: { lessonId: number; fileId: number; file: File }) =>
      lessonFileService.uploadFile(lessonId, fileId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-files'] })
    },
  })
}

export function useDeleteLessonFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId, fileId }: { lessonId: number; fileId: number }) =>
      lessonFileService.remove(lessonId, fileId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lesson-files'] })
    },
  })
}
