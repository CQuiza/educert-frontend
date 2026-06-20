import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers'
import { useAllProgressSummaries } from '../hooks/useModuleAssessments'
import { taskSubmissionService } from '../services/taskSubmissionService'
import Card from '../components/molecules/Card'
import SearchBar from '../components/molecules/SearchBar'
import Skeleton from '../components/atoms/Skeleton'
import Badge from '../components/atoms/Badge'
import { ChevronDown, ChevronRight, GraduationCap, Award, ClipboardCheck, X, Download, Upload, AlertTriangle, Loader2 } from 'lucide-react'
import type { ModuleProgressItem, CourseProgressSummary } from '../types'

function isModuleComplete(mod: ModuleProgressItem): boolean {
  const assessmentOk = mod.total_assessment_questions === 0 || mod.passed
  const tasksOk = mod.total_tasks === 0 || mod.submitted_tasks === mod.total_tasks
  return assessmentOk && tasksOk
}

export default function ProgressPage() {
  const { user } = useAuth()
  const isStaff = user && ['superuser', 'admin', 'teacher'].includes(user.role)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(isStaff ? null : (user?.id ?? null))
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())
  const [downloading, setDownloading] = useState<number | null>(null)

  const { data: allUsers } = useUsers(undefined, { enabled: !!isStaff })
  const { data: summary, isLoading } = useAllProgressSummaries(selectedUserId ?? undefined)

  const filteredUsers = useMemo(() => {
    if (!allUsers || !searchQuery.trim()) return allUsers ?? []
    const q = searchQuery.toLowerCase()
    return allUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.identity_number?.includes(q),
    )
  }, [allUsers, searchQuery])

  const enriched = useMemo(() => {
    if (!summary) return null
    const courses: CourseProgressSummary[] = summary.courses.map((c) => {
      const total = c.modules.length
      const completed = c.modules.filter(isModuleComplete).length
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0
      return { ...c, completed_modules: completed, progress_percent: pct }
    })
    const totalMods = courses.reduce((s, c) => s + c.total_modules, 0)
    const completedMods = courses.reduce((s, c) => s + c.completed_modules, 0)
    const overall = totalMods > 0 ? Math.round((completedMods / totalMods) * 100) : 0
    return { courses, overall_percent: overall }
  }, [summary])

  const allComplete = enriched?.overall_percent === 100

  function toggleCourse(id: number) {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDownload(submissionId: number, preferredName?: string) {
    if (downloading === submissionId) return
    setDownloading(submissionId)
    try {
      await taskSubmissionService.downloadFile(submissionId, preferredName)
    } catch {
      // silent
    } finally {
      setDownloading(null)
    }
  }

  if (isStaff && !selectedUserId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Progreso</h1>
          <p className="mt-1 text-sm text-neutral-500">Selecciona un alumno para ver su progreso y entregas</p>
        </div>
        <Card padding={false} className="mb-6">
          <div className="border-b border-neutral-200 px-4 py-3">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar alumno por nombre, email o identificación..." />
          </div>
          {searchQuery && filteredUsers.length > 0 && (
            <div className="divide-y divide-neutral-100 max-h-48 overflow-y-auto">
              {filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedUserId(u.id); setSearchQuery('') }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-600">
                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{u.name} {u.first_last_name}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Progreso</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {isStaff && selectedUserId
            ? `Progreso de ${allUsers?.find((u) => u.id === selectedUserId)?.name ?? 'Alumno'}`
            : 'Tu progreso en los cursos'}
        </p>
      </div>

      {isStaff && selectedUserId && (() => {
        const su = allUsers?.find((u) => u.id === selectedUserId)
        return su ? (
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                  {su.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{su.name} {su.first_last_name}</p>
                  <p className="text-xs text-neutral-500">{su.email} · {su.identity_number}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUserId(null)} className="rounded-lg p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ) : null
      })()}

      {isLoading ? (
        <div className="space-y-4"><Skeleton count={3} className="h-24 w-full" /></div>
      ) : !enriched || enriched.courses.length === 0 ? (
        <Card><p className="py-8 text-center text-sm text-neutral-400">No hay datos de progreso disponibles.</p></Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <Award className={`h-8 w-8 ${allComplete ? 'text-success-500' : 'text-primary-500'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Progreso global</span>
                  <span className={`text-lg font-bold ${allComplete ? 'text-success-600' : 'text-primary-600'}`}>
                    {enriched.overall_percent}%
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${allComplete ? 'bg-success-100' : 'bg-neutral-200'}`}>
                  <div
                    className={`h-full rounded-full transition-all ${allComplete ? 'bg-success-500' : 'bg-primary-500'}`}
                    style={{ width: `${Math.min(enriched.overall_percent, 100)}%` }}
                  />
                </div>
                {allComplete && (
                  <p className="mt-1 text-xs font-medium text-success-600">Completaste todos los requisitos del curso</p>
                )}
              </div>
            </div>
          </Card>

          {enriched.courses.map((course) => {
            const expanded = expandedCourses.has(course.course_id)
            return (
              <Card key={course.course_id} padding={false}>
                <button
                  onClick={() => toggleCourse(course.course_id)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <GraduationCap className="h-5 w-5 text-primary-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{course.course_title}</p>
                      <p className="text-xs text-neutral-500">{course.completed_modules}/{course.total_modules} módulos completados</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${course.progress_percent === 100 ? 'text-success-600' : 'text-neutral-900'}`}>
                        {course.progress_percent}%
                      </p>
                      <div className={`h-2 w-24 rounded-full overflow-hidden ${course.progress_percent === 100 ? 'bg-success-100' : 'bg-neutral-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all ${course.progress_percent === 100 ? 'bg-success-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min(course.progress_percent, 100)}%` }}
                        />
                      </div>
                    </div>
                    {expanded ? <ChevronDown className="h-5 w-5 text-neutral-400" /> : <ChevronRight className="h-5 w-5 text-neutral-400" />}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-neutral-100">
                    {course.modules.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-neutral-400">Sin módulos</p>
                    ) : (
                      course.modules.map((mod) => {
                        const modComplete = isModuleComplete(mod)
                        const hasTasks = mod.total_tasks > 0
                        const allTasksDone = mod.submitted_tasks === mod.total_tasks
                        return (
                          <div key={mod.module_id} className="border-t border-neutral-50 first:border-t-0">
                            <div className="flex items-center justify-between px-6 py-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-neutral-800">{mod.module_title}</p>
                                <div className="mt-0.5 space-y-0.5">
                                  {mod.total_assessment_questions > 0 && (
                                    <p className="text-xs text-neutral-500">
                                      {mod.attempts_count} intento(s) · {mod.last_score != null ? `Último: ${mod.last_score}%` : 'Sin calificación'}
                                    </p>
                                  )}
                                  {hasTasks && (
                                    <p className={`text-xs ${allTasksDone ? 'text-success-600' : 'text-warning-600'}`}>
                                      <Upload className="inline h-3 w-3 mr-0.5" />
                                      Tareas: {mod.submitted_tasks}/{mod.total_tasks}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <Badge
                                  variant={
                                    modComplete ? 'success' :
                                    mod.total_assessment_questions > 0 && !mod.passed ? 'warning' :
                                    hasTasks && !allTasksDone ? 'warning' :
                                    'default'
                                  }
                                >
                                  {modComplete ? 'Completado' :
                                   mod.total_assessment_questions > 0 && !mod.passed && hasTasks && !allTasksDone ? 'Incompleto' :
                                   mod.total_assessment_questions > 0 && !mod.passed ? 'Evaluación pendiente' :
                                   hasTasks && !allTasksDone ? 'Tareas pendientes' :
                                   'Sin evaluar'}
                                </Badge>
                                {mod.total_assessment_questions > 0 && !isStaff && (
                                  <Link
                                    to={`/assessments/take/${mod.module_id}`}
                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                                  >
                                    <ClipboardCheck className="h-3.5 w-3.5" />
                                    Evaluación
                                  </Link>
                                )}
                              </div>
                            </div>

                            {hasTasks && (
                              <div className="px-6 pb-3 pl-14 space-y-2">
                                {mod.tasks.map((task) => (
                                  <div key={task.task_id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-neutral-700 truncate">{task.task_title}</p>
                                      {task.submitted ? (
                                        <p className="text-[11px] text-success-600">
                                          Entregado {task.submitted_at ? new Date(task.submitted_at).toLocaleDateString() : ''}
                                        </p>
                                      ) : (
                                        <p className="text-[11px] text-warning-600 flex items-center gap-1">
                                          <AlertTriangle className="h-3 w-3" />
                                          No entregado
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {task.submitted && task.submission_id ? (
                                        <button
                                          onClick={() => handleDownload(task.submission_id!, task.original_filename ?? undefined)}
                                          disabled={downloading === task.submission_id}
                                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {downloading === task.submission_id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Download className="h-3 w-3" />
                                          )}
                                          {downloading === task.submission_id ? 'Descargando...' : task.original_filename ?? 'Descargar'}
                                        </button>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                                {!allTasksDone && (
                                  <div className="flex items-start gap-2 rounded-lg bg-warning-50 border border-warning-200 px-3 py-2">
                                    <AlertTriangle className="h-4 w-4 text-warning-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-warning-700">
                                      Debes completar todas las tareas para finalizar el curso.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
