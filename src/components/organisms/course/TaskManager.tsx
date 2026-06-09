import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../../context/AuthContext'
import { useTasksByLesson, useCreateTask, useUpdateTask, useDeleteTask, useUploadTaskFile } from '../../../hooks/useTasks'
import Modal from '../../molecules/Modal'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import { downloadTaskFile } from '../../../lib/download'
import { Pencil, Trash2 } from 'lucide-react'
import type { Task, TaskCreate, TaskUpdate } from '../../../types'

interface TaskManagerProps {
  lessonId: number | null
  onClose: () => void
}

export default function TaskManager({ lessonId, onClose }: TaskManagerProps) {
  const { user } = useAuth()
  const canManage = user && ['superuser', 'admin', 'teacher'].includes(user.role)
  const { data: tasks } = useTasksByLesson(lessonId ?? 0, { enabled: lessonId !== null })
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const uploadTaskFile = useUploadTaskFile()

  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskGoogleDrive, setNewTaskGoogleDrive] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)

  function handleEdit(task: Task) {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskDesc(task.description ?? '')
    setNewTaskGoogleDrive(task.google_drive_link ?? '')
    setUploadFile(null)
  }

  function resetForm() {
    setEditingTask(null)
    setNewTaskTitle('')
    setNewTaskDesc('')
    setNewTaskGoogleDrive('')
    setUploadFile(null)
  }

  async function handleSave() {
    if (!newTaskTitle.trim() || !lessonId) return

    if (editingTask) {
      const data: TaskUpdate = {
        title: newTaskTitle.trim(),
        description: newTaskDesc || null,
        google_drive_link: newTaskGoogleDrive || null,
        file_type: newTaskGoogleDrive ? 'google_drive' : uploadFile ? 'upload' : editingTask.file_type,
      }
      try {
        await updateTask.mutateAsync({ id: editingTask.id, data })
        if (uploadFile) {
          await uploadTaskFile.mutateAsync({ taskId: editingTask.id, file: uploadFile })
          toast.success('Tarea actualizada con archivo')
        } else {
          toast.success('Tarea actualizada')
        }
        resetForm()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al actualizar tarea')
      }
    } else {
      const payload: TaskCreate = {
        lesson_id: lessonId,
        title: newTaskTitle.trim(),
        description: newTaskDesc || null,
        google_drive_link: newTaskGoogleDrive || null,
        file_type: newTaskGoogleDrive ? 'google_drive' : uploadFile ? 'upload' : 'none',
        order_index: (tasks?.length ?? 0) + 1,
      }
      try {
        const created = await createTask.mutateAsync(payload)
        if (uploadFile) {
          await uploadTaskFile.mutateAsync({ taskId: created.id, file: uploadFile })
          toast.success('Tarea creada con archivo')
        } else {
          toast.success('Tarea creada')
        }
        resetForm()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Error al crear tarea')
      }
    }
  }

  return (
    <Modal open={lessonId !== null} onClose={onClose} title="Tareas de la lección">
      <div className="space-y-4">
        <div className="space-y-3">
          {(!tasks || tasks.length === 0) ? (
            <p className="text-sm text-neutral-500">No hay tareas aún.</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="flex items-start justify-between rounded-lg border border-neutral-200 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-neutral-900">{t.title}</p>
                  {t.description && <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>}
                  <div className="mt-1 flex gap-2 text-xs text-neutral-400">
                    {t.file_type === 'google_drive' && t.google_drive_link && (
                      <a href={t.google_drive_link} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Google Drive</a>
                    )}
                    {t.file_type === 'upload' && t.file_url && (
                      <button onClick={() => downloadTaskFile(t.id)} className="text-primary-600 hover:underline text-xs">Descargar archivo</button>
                    )}
                  </div>
                </div>
                {canManage && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(t)} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors" title="Editar tarea">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteTask.mutateAsync(t.id).then(() => toast.success('Tarea eliminada')).catch((e) => toast.error(e.message))}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {canManage && (
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm font-semibold text-neutral-700 mb-3">{editingTask ? 'Editar tarea' : 'Añadir tarea'}</p>
            <div className="space-y-3">
              <Input label="Título" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Nombre de la tarea" />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Descripción</label>
                <textarea value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} rows={2} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Instrucciones de la tarea" />
              </div>
              <Input label="Enlace de Google Drive (opcional)" value={newTaskGoogleDrive} onChange={(e) => setNewTaskGoogleDrive(e.target.value)} placeholder="https://drive.google.com/file/d/..." />
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Subir archivo (opcional, máx 50 MB)</label>
                <input type="file" onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-neutral-500 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100" />
              </div>
              <div className="flex justify-end gap-2">
                {editingTask && (
                  <Button variant="secondary" type="button" onClick={resetForm}>Cancelar</Button>
                )}
                <Button onClick={handleSave} loading={createTask.isPending || updateTask.isPending}>
                  {editingTask ? 'Guardar cambios' : 'Añadir tarea'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
