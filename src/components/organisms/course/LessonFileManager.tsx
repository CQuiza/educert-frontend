import { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../../context/AuthContext'
import { useLessonFiles, useCreateLessonFile, useUploadLessonFile, useDeleteLessonFile } from '../../../hooks/useLessonFiles'
import { lessonFileService } from '../../../services/lessonFileService'
import Modal from '../../molecules/Modal'
import FileDropzone from '../../molecules/FileDropzone'
import { Trash2, FileIcon } from 'lucide-react'

interface LessonFileManagerProps {
  lessonId: number | null
  onClose: () => void
}

export default function LessonFileManager({ lessonId, onClose }: LessonFileManagerProps) {
  const { user } = useAuth()
  const canManage = user && ['superuser', 'admin', 'teacher'].includes(user.role)
  const { data: files } = useLessonFiles(lessonId ?? 0, { enabled: lessonId !== null })
  const createFile = useCreateLessonFile()
  const uploadFile = useUploadLessonFile()
  const deleteFile = useDeleteLessonFile()

  const [uploading, setUploading] = useState(false)
  const mountedRef = useRef(true)
  useEffect(() => { return () => { mountedRef.current = false } }, [])

  async function handleFiles(selected: File[]) {
    if (!lessonId || selected.length === 0) return

    setUploading(true)
    for (const file of selected) {
      try {
        const created = await createFile.mutateAsync({
          lessonId,
          data: {
            original_filename: file.name,
            mime_type: file.type || undefined,
            order_index: (files?.length ?? 0) + 1,
          },
        })
        await uploadFile.mutateAsync({ lessonId, fileId: created.id, file })
        toast.success(`Archivo "${file.name}" subido correctamente`)
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : `Error al subir "${file.name}"`)
      }
    }
    if (mountedRef.current) setUploading(false)
  }

  return (
    <Modal open={lessonId !== null} onClose={onClose} title="Archivos de la lección">
      <div className="space-y-4">
        <div className="space-y-3">
          {(!files || files.length === 0) ? (
            <p className="text-sm text-neutral-500">No hay archivos aún.</p>
          ) : (
            files.map((f) => (
              <div key={f.id} className="flex items-start justify-between rounded-lg border border-neutral-200 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 text-neutral-400 shrink-0" />
                    <p className="text-sm font-medium text-neutral-900 truncate">{f.original_filename}</p>
                  </div>
                  {f.mime_type && (
                    <p className="text-xs text-neutral-400 mt-0.5 ml-6">{f.mime_type}</p>
                  )}
                  <div className="mt-1 ml-6 flex gap-2 text-xs">
                    <button
                      onClick={() => window.open(lessonFileService.getFileUrl(lessonId!, f.id, true), '_blank')}
                      className="text-primary-600 hover:underline"
                    >
                      Descargar
                    </button>
                  </div>
                </div>
                {canManage && (
                  <button
                    onClick={() => {
                      deleteFile.mutateAsync({ lessonId: lessonId!, fileId: f.id })
                        .then(() => toast.success('Archivo eliminado'))
                        .catch((e) => toast.error(e.message))
                    }}
                    className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors shrink-0"
                    title="Eliminar archivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {canManage && (
          <div className="border-t border-neutral-200 pt-4">
            <FileDropzone
              multiple
              disabled={uploading}
              onFiles={handleFiles}
              hint="JPG, PNG, PDF, DOCX, PPTX, XLSX · máx. 50 MB por archivo"
            />
          </div>
        )}
      </div>
    </Modal>
  )
}
