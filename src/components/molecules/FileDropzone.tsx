import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { UploadCloud } from 'lucide-react'
import { isAllowedLessonFile } from '../../lib/lessonFiles'

interface FileDropzoneProps {
  onFiles: (files: File[]) => void
  multiple?: boolean
  disabled?: boolean
  hint?: string
}

export default function FileDropzone({ onFiles, multiple = false, disabled = false, hint }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  function validateAndForward(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const valid: File[] = []
    for (const file of Array.from(fileList)) {
      const check = isAllowedLessonFile(file)
      if (check.ok) {
        valid.push(file)
      } else if (check.error) {
        toast.error(check.error)
      }
    }
    if (valid.length > 0) {
      onFiles(multiple ? valid : valid.slice(0, 1))
    }
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setDragActive(true)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setDragActive(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (disabled) return
    validateAndForward(e.dataTransfer.files)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => { if (!disabled) inputRef.current?.click() }}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
        disabled
          ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60'
          : dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 bg-white hover:border-primary-400 hover:bg-neutral-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          validateAndForward(e.target.files)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
      <UploadCloud className={`h-8 w-8 mb-2 ${dragActive ? 'text-primary-600' : 'text-neutral-400'}`} />
      <p className="text-sm font-medium text-neutral-700">
        Arrastra archivo{multiple ? 's' : ''} aquí o haz clic para seleccionar
      </p>
      <p className="mt-1 text-xs text-neutral-400">
        {hint ?? `JPG, PNG, PDF, DOCX, PPTX, XLSX · máx. 50 MB${multiple ? ' por archivo' : ''}`}
      </p>
    </div>
  )
}
