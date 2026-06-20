import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskSubmissionService } from '../services/taskSubmissionService'

export function useSubmitTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: number; file: File }) =>
      taskSubmissionService.submit(taskId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-submissions'] })
      qc.invalidateQueries({ queryKey: ['progress-summary'] })
    },
  })
}

export function useTaskSubmissions(taskId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['task-submissions', 'list', taskId],
    queryFn: () => taskSubmissionService.listByTask(taskId),
    enabled: taskId > 0 && (options?.enabled ?? true),
  })
}

export function useMyTaskSubmission(taskId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['task-submissions', 'my', taskId],
    queryFn: () => taskSubmissionService.getMySubmission(taskId),
    enabled: taskId > 0 && (options?.enabled ?? true),
  })
}
