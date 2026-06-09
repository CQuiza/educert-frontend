import { config } from '../config'

export async function downloadTaskFile(taskId: number): Promise<void> {
  try {
    const res = await fetch(`${config.apiUrl}/tasks/${taskId}/file`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error()
    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition')
    const match = disposition?.match(/filename="(.+)"/)
    const filename = match ? match[1] : `task-${taskId}`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch {
    // silent
  }
}
