import api from './api'
import { config } from '../config'
import type { TaskSubmission, TaskSubmissionWithUser } from '../types'

export const taskSubmissionService = {
  submit: async (taskId: number, file: File): Promise<TaskSubmission> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<TaskSubmission>(`/tasks/${taskId}/submit`, form)
    return data
  },

  listByTask: async (taskId: number): Promise<TaskSubmissionWithUser[]> => {
    const { data } = await api.get<TaskSubmissionWithUser[]>(`/tasks/${taskId}/submissions`)
    return data
  },

  getMySubmission: async (taskId: number): Promise<TaskSubmission | null> => {
    const { data } = await api.get<TaskSubmission | null>(`/tasks/${taskId}/my-submission`)
    return data
  },

  getFileUrl: (submissionId: number): string => {
    return `${config.apiUrl}/submissions/${submissionId}/file`
  },

  downloadFile: async (submissionId: number, preferredName?: string): Promise<void> => {
    const url = `${config.apiUrl}/submissions/${submissionId}/file`
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error()
    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition')
    const match = disposition?.match(/filename="(.+)"/)
    const fallback = match?.[1] ?? `submission-${submissionId}.pdf`
    const filename = preferredName ?? fallback
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  },
}
