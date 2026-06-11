import { config } from '../config'

export async function downloadFromUrl(url: string, defaultFilename: string): Promise<void> {
  try {
    const res = await fetch(url, { credentials: 'include' })
    if (!res.ok) throw new Error()
    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition')
    const match = disposition?.match(/filename="(.+)"/)
    const filename = match ? match[1] : defaultFilename
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    // silent
  }
}

export async function downloadTaskFile(taskId: number): Promise<void> {
  return downloadFromUrl(`${config.apiUrl}/tasks/${taskId}/file`, `task-${taskId}`)
}

export async function downloadLessonFile(lessonId: number, fileId: number, filename: string, download = true): Promise<void> {
  const url = `${config.apiUrl}/lessons/${lessonId}/files/${fileId}/file${download ? '?download=true' : ''}`
  return downloadFromUrl(url, filename)
}
