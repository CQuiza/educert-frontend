export function formatDate(
  value: string | null | undefined,
  options?: { fallback?: string; withTime?: boolean }
): string {
  if (!value) return options?.fallback ?? '—'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value.slice(0, 10)
  if (options?.withTime) return d.toLocaleString('es-CO')
  return d.toLocaleDateString('es-CO')
}
