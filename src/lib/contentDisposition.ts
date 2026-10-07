export function filenameFromContentDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback

  const extended = header.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (extended?.[1]) {
    try {
      return decodeURIComponent(extended[1].trim())
    } catch {
      // cae al filename básico
    }
  }

  const basic = header.match(/filename\s*=\s*"([^"]*)"/i)
  if (basic?.[1]) return basic[1]

  return fallback
}
