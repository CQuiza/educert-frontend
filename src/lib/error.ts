import type { AxiosError } from 'axios'

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'isAxiosError' in err) {
    const axiosErr = err as AxiosError<{ detail?: string }>
    const detail = axiosErr.response?.data?.detail
    if (detail) return detail
  }
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Ocurrió un error inesperado'
}
