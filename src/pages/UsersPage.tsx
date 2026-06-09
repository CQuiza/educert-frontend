import { useState, useMemo } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useUsers'
import { useEnrollments, useCreateEnrollment, useDeleteEnrollment } from '../hooks/useEnrollments'
import { useCourses } from '../hooks/useCourses'
import Card from '../components/molecules/Card'
import DataTable from '../components/molecules/DataTable'
import SearchBar from '../components/molecules/SearchBar'
import SearchableSelect from '../components/molecules/SearchableSelect'
import Pagination from '../components/molecules/Pagination'
import Modal from '../components/molecules/Modal'
import Button from '../components/atoms/Button'
import Badge from '../components/atoms/Badge'
import Skeleton from '../components/atoms/Skeleton'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, GraduationCap, X } from 'lucide-react'
import { getErrorMessage } from '../lib/error'
import { formatDate } from '../lib/dates'
import { useAuth } from '../context/AuthContext'
import { config } from '../config'
import UserFormModal from '../components/organisms/UserFormModal'
import type { User, CourseEnrollment } from '../types'

const PAGE_SIZE = 10

export default function UsersPage() {
  const { user } = useAuth()
  const isSuperuser = user?.role === 'superuser'

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formUser, setFormUser] = useState<User | null | undefined>(undefined)

  const { data: users, isLoading } = useUsers()
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const updateUser = useUpdateUser(formUser?.id ?? 0)

  const [enrollUserId, setEnrollUserId] = useState<number | null>(null)
  const enrollUser = users?.find((u) => u.id === enrollUserId)
  const { data: enrollments, isLoading: loadingEnroll } = useEnrollments(
    { user_id: enrollUserId ?? 0 },
    { enabled: enrollUserId !== null },
  )
  const { data: courses } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>('')
  const createEnrollment = useCreateEnrollment()
  const deleteEnrollment = useDeleteEnrollment()
  const courseMap = useMemo(() => {
    if (!courses) return {} as Record<number, string>
    return Object.fromEntries(courses.map((c) => [c.id, c.title]))
  }, [courses])
  const enrolledCourseIds = useMemo(() => new Set(enrollments?.map((e) => e.course_id) ?? []), [enrollments])

  const courseOptions = useMemo(
    () =>
      (courses || [])
        .filter((c) => c.status === 'published' && !enrolledCourseIds.has(c.id))
        .map((c) => ({
          value: c.id,
          label: c.title,
          sublabel: c.status,
        })),
    [courses, enrolledCourseIds],
  )

  const filtered = useMemo(() => {
    if (!users) return []
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.identity_number?.includes(q),
    )
  }, [users, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() {
    setFormUser(null)
  }

  function openEdit(u: User) {
    setFormUser(u)
  }

  async function handleFormSubmit(data: Record<string, unknown>, mode: 'create' | 'edit') {
    try {
      if (mode === 'edit') {
        await updateUser.mutateAsync(data as unknown as Parameters<typeof updateUser.mutateAsync>[0])
        toast.success('Usuario actualizado correctamente')
      } else {
        await createUser.mutateAsync(data as unknown as Parameters<typeof createUser.mutateAsync>[0])
        toast.success('Usuario creado correctamente')
      }
      setFormUser(undefined)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleDelete(u: User) {
    if (!confirm(`¿Eliminar a ${u.name || u.email}?`)) return
    try {
      await deleteUser.mutateAsync(u.id)
      toast.success(`Usuario ${u.email} eliminado exitosamente.`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'name', header: 'Nombre', render: (u: User) => (
      <div>
        <p className="font-medium text-neutral-900">{u.name} {u.first_last_name}</p>
        <p className="text-xs text-neutral-500">{u.email}</p>
      </div>
    )},
    { key: 'identity_number', header: 'Identificación' },
    { key: 'role', header: 'Rol', render: (u: User) => {
      const variant = u.role === 'superuser' || u.role === 'admin' ? 'info' : u.role === 'teacher' ? 'warning' : 'default'
      return <Badge variant={variant as 'info' | 'warning' | 'default'}>{u.role}</Badge>
    }},
    { key: 'is_active', header: 'Estado', render: (u: User) => (
      <Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Activo' : 'Inactivo'}</Badge>
    )},
    { key: 'actions' as string, header: 'Acciones', render: (u: User) => (
      <div className="flex gap-2">
        <button onClick={(e) => { e.stopPropagation(); openEdit(u) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors">
          <Pencil className="h-4 w-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(u) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); setEnrollUserId(u.id); setSelectedCourseId('') }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors" title="Asignar cursos">
          <GraduationCap className="h-4 w-4" />
        </button>
      </div>
    )},
  ]

  const roleOptions = useMemo(() => {
    const roles = [
      { value: 'student', label: 'Estudiante' },
    ]
    if (isSuperuser && config.showTeacherRole) {
      roles.push({ value: 'teacher', label: 'Docente' })
    }
    roles.push({ value: 'admin', label: 'Admin' })
    if (isSuperuser) {
      roles.push({ value: 'superuser', label: 'Superusuario' })
    }
    return roles
  }, [isSuperuser])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Usuarios</h1>
          <p className="mt-1 text-sm text-neutral-500">Gestiona los usuarios de la plataforma</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <Card padding={false}>
        <div className="border-b border-neutral-200 px-4 py-3">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar por nombre, email o identificación..." />
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6"><Skeleton count={5} className="h-10 w-full" /></div>
        ) : (
          <>
            <DataTable columns={columns} data={pageData} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <UserFormModal
        isOpen={formUser !== undefined}
        onClose={() => setFormUser(undefined)}
        user={formUser ?? null}
        roleOptions={roleOptions}
        isSaving={createUser.isPending || updateUser.isPending}
        onSubmit={handleFormSubmit}
      />

      <Modal open={!!enrollUserId} onClose={() => setEnrollUserId(null)} title={enrollUser ? `Cursos de ${enrollUser.name || enrollUser.email}` : 'Cursos'}>
        {loadingEnroll ? (
          <div className="space-y-3 p-2"><Skeleton count={3} className="h-10 w-full" /></div>
        ) : (
          <div className="space-y-4">
            {enrollments && enrollments.length > 0 ? (
              <div className="space-y-2">
                {enrollments.map((enr: CourseEnrollment) => (
                  <div key={enr.id} className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{courseMap[enr.course_id] || `Curso #${enr.course_id}`}</p>
                      <p className="text-xs text-neutral-500">Inscrito el {formatDate(enr.enrolled_at, { fallback: '' })}</p>
                    </div>
                    <button onClick={() => deleteEnrollment.mutateAsync(enr.id).catch((err) => toast.error(getErrorMessage(err)))} className="rounded-lg p-1.5 text-neutral-400 hover:bg-danger-50 hover:text-danger-600 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">Este usuario no tiene cursos asignados.</p>
            )}
            <div className="border-t border-neutral-200 pt-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Asignar nuevo curso</label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    options={courseOptions}
                    value={selectedCourseId}
                    onChange={setSelectedCourseId}
                    placeholder="Buscar curso por nombre..."
                  />
                </div>
                <Button
                  onClick={() => {
                    if (!enrollUserId || !selectedCourseId) return
                    createEnrollment.mutateAsync({ user_id: enrollUserId, course_id: Number(selectedCourseId) })
                      .then(() => { setSelectedCourseId(''); toast.success('Curso asignado correctamente') })
                      .catch((err) => toast.error(getErrorMessage(err)))
                  }}
                  disabled={!selectedCourseId}
                  loading={createEnrollment.isPending}
                >
                  Asignar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
