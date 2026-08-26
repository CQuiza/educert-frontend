// Constantes compartidas de archivos de lección — espejo de la validación del
// backend (app/api/v1/endpoints/lesson_files.py + settings.py). En lib/ para
// no violar react-refresh/only-export-components.

export const LESSON_FILE_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.pdf',
  '.docx',
  '.pptx',
  '.xlsx',
] as const

export const LESSON_FILE_MAX_SIZE_MB = 50

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isAllowedLessonFile(file: File): { ok: boolean; error?: string } {
  const name = file.name.toLowerCase()
  const hasExt = LESSON_FILE_ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
  if (!hasExt) {
    return {
      ok: false,
      error: `"${file.name}": extensión no permitida. Solo: ${LESSON_FILE_ALLOWED_EXTENSIONS.join(', ')}`,
    }
  }
  if (file.size > LESSON_FILE_MAX_SIZE_MB * 1024 * 1024) {
    return {
      ok: false,
      error: `"${file.name}": supera el límite de ${LESSON_FILE_MAX_SIZE_MB} MB`,
    }
  }
  return { ok: true }
}
