import api from './api'
import type { ModuleAssessment, AttemptResult, AllProgressSummary, CourseProgressSummary } from '../types'

export interface ModuleAssessmentCreate {
  passing_score: number
  questions: {
    question_text: string
    question_type: 'multiple_choice' | 'true_false'
    points: number
    order_index: number
    options: { option_text: string; is_correct: boolean }[]
  }[]
}

export interface AssessmentSubmit {
  answers: { question_id: number; selected_option_id: number }[]
}

export const moduleAssessmentService = {
  getByModule: async (moduleId: number): Promise<ModuleAssessment> => {
    const { data } = await api.get<ModuleAssessment>(`/modules/${moduleId}/assessment`)
    return data
  },

  upsert: async (moduleId: number, payload: ModuleAssessmentCreate): Promise<ModuleAssessment> => {
    const { data } = await api.post<ModuleAssessment>(`/modules/${moduleId}/assessment`, payload)
    return data
  },

  delete: async (assessmentId: number): Promise<void> => {
    await api.delete(`/assessments/${assessmentId}`)
  },

  submit: async (assessmentId: number, payload: AssessmentSubmit): Promise<AttemptResult> => {
    const { data } = await api.post<AttemptResult>(`/assessments/${assessmentId}/submit`, payload)
    return data
  },

  getAttempts: async (assessmentId: number) => {
    const { data } = await api.get(`/assessments/${assessmentId}/attempts`)
    return data
  },

  getSummary: async (courseId: number): Promise<CourseProgressSummary> => {
    const { data } = await api.get<CourseProgressSummary>(`/progress/summary/${courseId}`)
    return data
  },

  getAllSummaries: async (userId?: number): Promise<AllProgressSummary> => {
    const params = userId ? { user_id: userId } : undefined
    const { data } = await api.get<AllProgressSummary>('/progress/summary', { params })
    return data
  },
}
