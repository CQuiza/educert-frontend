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

// Convierte "YYYY-MM-DD" de un <input type="date"> a ISO UTC anclando la
// medianoche en la ZONA LOCAL del navegador. Sin esto, pydantic parsea la
// fecha como medianoche UTC y los navegadores detrás de UTC (Colombia -5)
// la renderizan un día antes.
export function toLocalIsoDate(dateStr: string): string {
  return new Date(`${dateStr}T00:00:00`).toISOString()
}
