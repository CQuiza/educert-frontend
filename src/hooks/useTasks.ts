import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import type { TaskCreate, TaskUpdate } from '../types'

export function useTasksByLesson(lessonId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['tasks', 'lesson', lessonId],
    queryFn: () => taskService.listByLesson(lessonId),
    enabled: lessonId > 0 && (options?.enabled ?? true),
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskCreate) => taskService.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tasks', 'lesson', res.lesson_id] })
    },
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) => taskService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => taskService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUploadTaskFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: number; file: File }) => taskService.uploadFile(taskId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
