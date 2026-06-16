import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers'
import { useAllProgressSummaries } from '../hooks/useModuleAssessments'
import Card from '../components/molecules/Card'
import SearchBar from '../components/molecules/SearchBar'
import Skeleton from '../components/atoms/Skeleton'
import Badge from '../components/atoms/Badge'
import { ChevronDown, ChevronRight, GraduationCap, Award, ClipboardCheck, X } from 'lucide-react'

export default function ProgressPage() {
  const { user } = useAuth()
  const isStaff = user && ['superuser', 'admin', 'teacher'].includes(user.role)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(isStaff ? null : (user?.id ?? null))
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set())

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

  function toggleCourse(id: number) {
    setExpandedCourses((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const overall = summary?.overall_percent ?? 0

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Progreso</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {selectedUserId
            ? `Progreso del alumno ${allUsers?.find((u) => u.id === selectedUserId)?.name ?? ''}`
            : 'Tu progreso en los cursos'}
        </p>
      </div>

      {isStaff && (
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
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-neutral-50 transition-colors ${
                    selectedUserId === u.id ? 'bg-primary-50' : ''
                  }`}
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
          {selectedUserId && (() => {
            const su = allUsers?.find((u) => u.id === selectedUserId)
            return su ? (
              <div className="flex items-center justify-between px-4 py-3 bg-primary-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-200 text-sm font-medium text-primary-700">
                    {su.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{su.name} {su.first_last_name}</p>
                    <p className="text-xs text-neutral-500">{su.email} · {su.identity_number}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUserId(null)} className="rounded-lg p-1 text-neutral-400 hover:text-danger-600 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null
          })()}
        </Card>
      )}

      {isStaff && !selectedUserId ? (
        <Card><p className="py-8 text-center text-sm text-neutral-400">Busca un alumno para ver su progreso.</p></Card>
      ) : isLoading ? (
        <div className="space-y-4"><Skeleton count={3} className="h-24 w-full" /></div>
      ) : !summary || summary.courses.length === 0 ? (
        <Card><p className="py-8 text-center text-sm text-neutral-400">No hay datos de progreso disponibles.</p></Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-primary-500" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-neutral-700">Progreso global</span>
                  <span className="text-lg font-bold text-primary-600">{overall}%</span>
                </div>
                <div className="h-3 rounded-full bg-neutral-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all"
                    style={{ width: `${Math.min(overall, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {summary.courses.map((course) => {
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
                      <p className="text-sm font-semibold text-neutral-900">{course.progress_percent}%</p>
                      <div className="h-2 w-24 rounded-full bg-neutral-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary-500 transition-all"
                          style={{ width: `${Math.min(course.progress_percent, 100)}%` }}
                        />
                      </div>
                    </div>
                    {expanded ? <ChevronDown className="h-5 w-5 text-neutral-400" /> : <ChevronRight className="h-5 w-5 text-neutral-400" />}
                  </div>
                </button>
                {expanded && (
                  <div className="border-t border-neutral-100 divide-y divide-neutral-50">
                    {course.modules.length === 0 ? (
                      <p className="px-6 py-4 text-sm text-neutral-400">Sin módulos</p>
                    ) : (
                      course.modules.map((mod) => (
                        <div key={mod.module_id} className="flex items-center justify-between px-6 py-3">
                          <div>
                            <p className="text-sm font-medium text-neutral-800">{mod.module_title}</p>
                            <p className="text-xs text-neutral-500">
                              {mod.total_assessment_questions > 0
                                ? `${mod.attempts_count} intento(s) · ${mod.last_score != null ? `Último: ${mod.last_score}%` : 'Sin calificación'}`
                                : 'Sin evaluación'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={
                                mod.passed ? 'success' :
                                mod.total_assessment_questions === 0 ? 'default' :
                                'warning'
                              }
                            >
                              {mod.passed ? 'Aprobado' : mod.total_assessment_questions === 0 ? 'Sin evaluar' : 'Pendiente'}
                            </Badge>
                            {mod.total_assessment_questions > 0 && !isStaff && (
                              <Link
                                to={`/assessments/take/${mod.module_id}`}
                                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                              >
                                <ClipboardCheck className="h-3.5 w-3.5" />
                                Tomar evaluación
                              </Link>
                            )}
                          </div>
                        </div>
                      ))
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
