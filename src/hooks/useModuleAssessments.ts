import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moduleAssessmentService } from '../services/moduleAssessmentService'
import type { ModuleAssessmentCreate, AssessmentSubmit } from '../services/moduleAssessmentService'

export function useModuleAssessment(moduleId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['module-assessment', moduleId],
    queryFn: () => moduleAssessmentService.getByModule(moduleId),
    enabled: moduleId > 0 && (options?.enabled ?? true),
  })
}

export function useUpsertAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ moduleId, data }: { moduleId: number; data: ModuleAssessmentCreate }) =>
      moduleAssessmentService.upsert(moduleId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['module-assessment'] }),
  })
}

export function useDeleteAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assessmentId: number) => moduleAssessmentService.delete(assessmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['module-assessment'] }),
  })
}

export function useSubmitAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ assessmentId, data }: { assessmentId: number; data: AssessmentSubmit }) =>
      moduleAssessmentService.submit(assessmentId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['module-assessment'] })
      qc.invalidateQueries({ queryKey: ['progress-summary'] })
    },
  })
}

export function useAssessmentAttempts(assessmentId: number) {
  return useQuery({
    queryKey: ['assessment-attempts', assessmentId],
    queryFn: () => moduleAssessmentService.getAttempts(assessmentId),
    enabled: assessmentId > 0,
  })
}

export function useCourseProgressSummary(courseId: number) {
  return useQuery({
    queryKey: ['progress-summary', courseId],
    queryFn: () => moduleAssessmentService.getSummary(courseId),
    enabled: courseId > 0,
  })
}

export function useAllProgressSummaries(userId?: number) {
  return useQuery({
    queryKey: ['progress-summary', 'all', userId],
    queryFn: () => moduleAssessmentService.getAllSummaries(userId),
    enabled: !!userId,
  })
}
