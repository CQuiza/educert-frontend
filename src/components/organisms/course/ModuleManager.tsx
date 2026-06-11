import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useModules } from '../../../hooks/useModules'
import { useLessons } from '../../../hooks/useLessons'
import { moduleService } from '../../../services/moduleService'
import { lessonService } from '../../../services/lessonService'
import Card from '../../molecules/Card'
import Modal from '../../molecules/Modal'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import Skeleton from '../../atoms/Skeleton'
import { getErrorMessage } from '../../../lib/error'
import {
  ChevronDown, ChevronRight, Eye, FileText, Video, Image, File,
  BookOpen, Plus, Pencil, Trash2, ClipboardList, FileIcon,
} from 'lucide-react'
import TaskManager from './TaskManager'
import LessonFileManager from './LessonFileManager'
import type { Module, Lesson, ModuleUpdate, LessonUpdate } from '../../../types'

interface ModuleManagerProps {
  courseId: number
  canManage: boolean
}

interface ModuleForm { title: string; order_index: number }
interface LessonForm { title: string; text_content: string; image_content_url: string; video_content_url: string; file_content_url: string; order_index: number }

const emptyModuleForm: ModuleForm = { title: '', order_index: 0 }
const emptyLessonForm: LessonForm = { title: '', text_content: '', image_content_url: '', video_content_url: '', file_content_url: '', order_index: 0 }

function contentTypeIcon(l: { video_content_url?: string | null; image_content_url?: string | null; file_content_url?: string | null }) {
  if (l.video_content_url) return <Video className="h-4 w-4 text-danger-500" />
  if (l.image_content_url) return <Image className="h-4 w-4 text-warning-500" />
  if (l.file_content_url) return <File className="h-4 w-4 text-info-500" />
  return <FileText className="h-4 w-4 text-neutral-400" />
}

export default function ModuleManager({ courseId, canManage }: ModuleManagerProps) {
  const qc = useQueryClient()
  const { data: modules, isLoading: loadingModules } = useModules({ course_id: courseId })

  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const { data: lessons, isLoading: loadingLessons } = useLessons({ module_id: expandedModule ?? 0 }, { enabled: expandedModule !== null })

  const createModule = useMutation({
    mutationFn: (data: { course_id: number; title: string; order_index: number }) => moduleService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  })
  const updateModule = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ModuleUpdate }) => moduleService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  })
  const deleteModule = useMutation({
    mutationFn: (id: number) => moduleService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }),
  })
  const createLesson = useMutation({
    mutationFn: (data: Record<string, unknown>) => lessonService.create(data as unknown as Lesson),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] }),
  })
  const updateLesson = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LessonUpdate }) => lessonService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] }),
  })
  const deleteLesson = useMutation({
    mutationFn: (id: number) => lessonService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] }),
  })

  const [modModal, setModModal] = useState(false)
  const [editingMod, setEditingMod] = useState<Module | null>(null)
  const [modForm, setModForm] = useState<ModuleForm>(emptyModuleForm)

  const [lessonModal, setLessonModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonForm, setLessonForm] = useState<LessonForm>(emptyLessonForm)
  const [lessonModuleId, setLessonModuleId] = useState(0)

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'module' | 'lesson'; id: number } | null>(null)

  const [taskModalLessonId, setTaskModalLessonId] = useState<number | null>(null)
  const [fileModalLessonId, setFileModalLessonId] = useState<number | null>(null)

  const modulesSorted = Array.isArray(modules) ? [...modules].sort((a, b) => a.order_index - b.order_index) : []

  function openModModal(mod?: Module) {
    setEditingMod(mod ?? null)
    setModForm(mod ? { title: mod.title, order_index: mod.order_index } : emptyModuleForm)
    setModModal(true)
  }

  async function handleModSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingMod) {
        await updateModule.mutateAsync({ id: editingMod.id, data: { title: modForm.title, order_index: modForm.order_index } })
        toast.success('Módulo actualizado correctamente')
      } else {
        await createModule.mutateAsync({ course_id: courseId, title: modForm.title, order_index: modForm.order_index })
        toast.success('Módulo creado correctamente')
      }
      setModModal(false)
      setEditingMod(null)
      setModForm(emptyModuleForm)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  function openLessonModal(modId: number, lesson?: Lesson) {
    setLessonModuleId(modId)
    setEditingLesson(lesson ?? null)
    setLessonForm(lesson ? {
      title: lesson.title,
      text_content: lesson.text_content ?? '',
      image_content_url: lesson.image_content_url ?? '',
      video_content_url: lesson.video_content_url ?? '',
      file_content_url: lesson.file_content_url ?? '',
      order_index: lesson.order_index,
    } : emptyLessonForm)
    setLessonModal(true)
  }

  async function handleLessonSubmit(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: lessonForm.title,
      text_content: lessonForm.text_content || null,
      image_content_url: lessonForm.image_content_url || null,
      video_content_url: lessonForm.video_content_url || null,
      file_content_url: lessonForm.file_content_url || null,
      order_index: lessonForm.order_index,
    }
    try {
      if (editingLesson) {
        await updateLesson.mutateAsync({ id: editingLesson.id, data: payload })
        toast.success('Lección actualizada correctamente')
      } else {
        await createLesson.mutateAsync({ module_id: lessonModuleId, ...payload })
        toast.success('Lección creada correctamente')
      }
      setLessonModal(false)
      setEditingLesson(null)
      setLessonForm(emptyLessonForm)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return
    try {
      if (confirmDelete.type === 'module') {
        await deleteModule.mutateAsync(confirmDelete.id)
        toast.success('Módulo eliminado correctamente')
      } else {
        await deleteLesson.mutateAsync(confirmDelete.id)
        toast.success('Lección eliminada correctamente')
      }
      setConfirmDelete(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Módulos</h2>
        {canManage && (
          <Button onClick={() => openModModal()}><Plus className="h-4 w-4" />Añadir módulo</Button>
        )}
      </div>

      {loadingModules ? (
        <div className="space-y-3"><Skeleton count={4} className="h-16 w-full" /></div>
      ) : modulesSorted.length === 0 ? (
        <Card><p className="py-8 text-center text-sm text-neutral-500">Este curso no tiene módulos aún.</p></Card>
      ) : (
        <div className="space-y-3">
          {modulesSorted.map((mod) => {
            const expanded = expandedModule === mod.id
            return (
              <Card key={mod.id} padding={false}>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedModule(expanded ? null : mod.id)}
                    className="flex flex-1 items-center justify-between px-5 py-4 text-left transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-primary-500" />
                      <div>
                        <p className="font-medium text-neutral-900">{mod.title}</p>
                        <p className="text-xs text-neutral-500">Módulo {mod.order_index}</p>
                      </div>
                    </div>
                    {expanded ? <ChevronDown className="h-5 w-5 text-neutral-400" /> : <ChevronRight className="h-5 w-5 text-neutral-400" />}
                  </button>
                  {canManage && (
                    <div className="flex gap-1 pr-3">
                      <button onClick={(e) => { e.stopPropagation(); openLessonModal(mod.id) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors" title="Añadir lección">
                        <Plus className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openModModal(mod) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors" title="Editar módulo">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'module', id: mod.id }) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors" title="Eliminar módulo">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {expanded && (
                  <div className="border-t border-neutral-100">
                    {loadingLessons ? (
                      <div className="space-y-2 p-4"><Skeleton count={3} className="h-12 w-full" /></div>
                    ) : lessons && lessons.length > 0 ? (
                      lessons.map((lesson) => (
                        <div key={lesson.id} className="group flex items-center justify-between border-b border-neutral-50 last:border-0 transition-colors hover:bg-neutral-50">
                          <Link
                            to={`/courses/${courseId}/lessons/${lesson.id}`}
                            className="flex flex-1 items-center gap-3 px-5 py-3"
                          >
                            {contentTypeIcon(lesson)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-neutral-800">{lesson.title}</p>
                              {lesson.text_content && (
                                <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{lesson.text_content}</p>
                              )}
                            </div>
                            <Eye className="h-4 w-4 text-neutral-400 shrink-0" />
                          </Link>
                          {canManage && (
                            <div className="flex gap-1 pr-3">
                              <button onClick={(e) => { e.stopPropagation(); setTaskModalLessonId(lesson.id) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors" title="Tareas">
                                <ClipboardList className="h-4 w-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setFileModalLessonId(lesson.id) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors" title="Archivos">
                                <FileIcon className="h-4 w-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); openLessonModal(mod.id, lesson) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors" title="Editar lección">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'lesson', id: lesson.id }) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors" title="Eliminar lección">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="px-5 py-4 text-sm text-neutral-500">Sin lecciones</p>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={modModal} onClose={() => setModModal(false)} title={editingMod ? 'Editar módulo' : 'Nuevo módulo'}>
        <form onSubmit={handleModSubmit} className="space-y-4">
          <Input label="Título" value={modForm.title} onChange={(e) => setModForm({ ...modForm, title: e.target.value })} required />
          <Input label="Orden" type="number" min={0} value={modForm.order_index} onChange={(e) => setModForm({ ...modForm, order_index: Number(e.target.value) })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModModal(false)}>Cancelar</Button>
            <Button type="submit" loading={createModule.isPending || updateModule.isPending}>{editingMod ? 'Guardar' : 'Crear módulo'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={lessonModal} onClose={() => setLessonModal(false)} title={editingLesson ? 'Editar lección' : 'Nueva lección'}>
        <form onSubmit={handleLessonSubmit} className="space-y-4">
          <Input label="Título" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Contenido de texto</label>
            <textarea value={lessonForm.text_content} onChange={(e) => setLessonForm({ ...lessonForm, text_content: e.target.value })} rows={3} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <Input label="URL de imagen (opcional)" value={lessonForm.image_content_url} onChange={(e) => setLessonForm({ ...lessonForm, image_content_url: e.target.value })} />
          <Input label="URL de video (opcional)" value={lessonForm.video_content_url} onChange={(e) => setLessonForm({ ...lessonForm, video_content_url: e.target.value })} />
          <Input label="URL de archivo (opcional)" value={lessonForm.file_content_url} onChange={(e) => setLessonForm({ ...lessonForm, file_content_url: e.target.value })} />
          <Input label="Orden" type="number" min={0} value={lessonForm.order_index} onChange={(e) => setLessonForm({ ...lessonForm, order_index: Number(e.target.value) })} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setLessonModal(false)}>Cancelar</Button>
            <Button type="submit" loading={createLesson.isPending || updateLesson.isPending}>{editingLesson ? 'Guardar' : 'Crear lección'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar eliminación">
        <p className="text-sm text-neutral-600">¿Estás seguro de eliminar este {confirmDelete?.type === 'module' ? 'módulo' : 'lección'}? Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} loading={deleteModule.isPending || deleteLesson.isPending}>Eliminar</Button>
        </div>
      </Modal>

      <TaskManager lessonId={taskModalLessonId} onClose={() => setTaskModalLessonId(null)} />
      <LessonFileManager lessonId={fileModalLessonId} onClose={() => setFileModalLessonId(null)} />
    </>
  )
}
