import { useState, useMemo, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useUser } from '../hooks/useUsers'
import { useCertificates } from '../hooks/useCertificates'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import { useCourses } from '../hooks/useCourses'
import { useEnrollments, useCreateEnrollment, useDeleteEnrollment } from '../hooks/useEnrollments'
import Card from '../components/molecules/Card'
import DataTable from '../components/molecules/DataTable'
import SearchBar from '../components/molecules/SearchBar'
import Badge from '../components/atoms/Badge'
import Button from '../components/atoms/Button'
import Skeleton from '../components/atoms/Skeleton'
import BatchCertificateModal from '../components/organisms/BatchCertificateModal'
import RenewCertificateModal from '../components/organisms/RenewCertificateModal'
import EditCertificateStatusModal from '../components/organisms/EditCertificateStatusModal'
import { toast } from 'sonner'
import { ArrowLeft, Plus, FileText, QrCode, GraduationCap, X, RefreshCw, Pencil, Filter, Check } from 'lucide-react'
import { formatDate } from '../lib/dates'
import { getErrorMessage } from '../lib/error'
import type { Certificate, CertificateStatus, Course } from '../types'

const STATUS_OPTIONS: { value: CertificateStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'revoked', label: 'Revocado' },
  { value: 'expired', label: 'Expirado' },
]

export default function UserCertificatesPanel() {
  const { userId } = useParams<{ userId: string }>()
  const userIdNum = Number(userId)

  const { data: user, isLoading: loadingUser } = useUser(userIdNum)
  const { data: certificates, isLoading: loadingCerts } = useCertificates({ user_id: userIdNum })
  const { data: certTypes } = useCertificateTypes()
  const { data: courses } = useCourses()
  const { data: enrollments } = useEnrollments({ user_id: userIdNum })
  const createEnrollment = useCreateEnrollment()
  const deleteEnrollment = useDeleteEnrollment()

  const [searchQuery, setSearchQuery] = useState('')
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [renewCert, setRenewCert] = useState<Certificate | null>(null)
  const [editCert, setEditCert] = useState<Certificate | null>(null)

  const [statusFilterOpen, setStatusFilterOpen] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<Set<CertificateStatus>>(new Set())
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setStatusFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function toggleStatus(status: CertificateStatus) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  function clearStatuses() {
    setSelectedStatuses(new Set())
  }

  const typeInfoMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, { name: string; reference: string | null }>
    return Object.fromEntries(certTypes.map((t) => [t.id, { name: t.name, reference: t.reference }]))
  }, [certTypes])

  const courseByTypeId = useMemo(() => {
    if (!courses) return {} as Record<number, Course>
    const map: Record<number, Course> = {}
    for (const c of courses) {
      if (c.certificate_type_id != null) {
        map[c.certificate_type_id] = c
      }
    }
    return map
  }, [courses])

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments?.map((e) => e.course_id) ?? []),
    [enrollments],
  )

  const filteredCertificates = useMemo(() => {
    if (!certificates) return []
    if (!searchQuery.trim() && selectedStatuses.size === 0) return certificates.items
    const q = searchQuery.toLowerCase()
    return certificates.items.filter((cert) => {
      if (selectedStatuses.size > 0 && !selectedStatuses.has(cert.status)) return false
      if (!searchQuery.trim()) return true
      if (cert.certificate_type_id == null) return false
      const info = typeInfoMap[cert.certificate_type_id]
      if (!info) return false
      return info.name.toLowerCase().includes(q) || (info.reference && info.reference.toLowerCase().includes(q))
    })
  }, [certificates, searchQuery, selectedStatuses, typeInfoMap])

  function getCertTypeName(cert: Certificate): string {
    if (cert.certificate_type_id == null) return '—'
    return typeInfoMap[cert.certificate_type_id]?.name || `Tipo #${cert.certificate_type_id}`
  }

  function getCertTypeRef(cert: Certificate): string | null {
    if (cert.certificate_type_id == null) return null
    return typeInfoMap[cert.certificate_type_id]?.reference ?? null
  }

  function getRelatedCourse(cert: Certificate): Course | undefined {
    if (cert.certificate_type_id == null) return undefined
    return courseByTypeId[cert.certificate_type_id]
  }

  async function handleAssign(courseId: number) {
    try {
      await createEnrollment.mutateAsync({ user_id: userIdNum, course_id: courseId })
      toast.success('Curso asignado correctamente')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleRemove(enrId: number) {
    try {
      await deleteEnrollment.mutateAsync(enrId)
      toast.success('Curso removido correctamente')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'type', header: 'Tipo', render: (cert: Certificate) => (
      <span className="font-medium text-neutral-900">{getCertTypeName(cert)}</span>
    )},
    { key: 'reference', header: 'Referencia', className: 'text-center', render: (cert: Certificate) => (
      <span className="text-center text-sm text-neutral-500">{getCertTypeRef(cert) || '—'}</span>
    )},
    { key: 'status', header: 'Estado', render: (cert: Certificate) => {
      const variant = cert.status === 'active' ? 'success' : cert.status === 'expired' ? 'warning' : 'danger'
      return <Badge variant={variant as 'success' | 'warning' | 'danger'}>{cert.status}</Badge>
    }},
    { key: 'issued_at', header: 'Emitido', render: (cert: Certificate) => formatDate(cert.issued_at, { fallback: '' }) },
    { key: 'expires_at', header: 'Expira', render: (cert: Certificate) => cert.expires_at ? formatDate(cert.expires_at, { fallback: '' }) : '—' },
    { key: 'course', header: 'Curso asociado', render: (cert: Certificate) => {
      const course = getRelatedCourse(cert)
      return course ? (
        <Link to={`/courses/${course.id}`} className="text-primary-600 hover:underline text-sm">{course.title}</Link>
      ) : (
        <span className="text-sm text-neutral-400">Sin curso</span>
      )
    }},
    { key: 'course_action', header: 'Acción curso', render: (cert: Certificate) => {
      const course = getRelatedCourse(cert)
      if (!course) return <span className="text-xs text-neutral-400">—</span>
      const enrolled = enrolledCourseIds.has(course.id)
      const enr = enrollments?.find((e) => e.course_id === course.id)
      if (enrolled && enr) {
        return (
          <button
            onClick={() => handleRemove(enr.id)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-danger-600 hover:bg-danger-50 transition-colors"
          >
            <X className="h-3 w-3" />
            Remover
          </button>
        )
      }
      return (
        <button
          onClick={() => handleAssign(course.id)}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
        >
          <GraduationCap className="h-3 w-3" />
          Asignar
        </button>
      )
    }},
    { key: 'actions' as string, header: 'Acciones', render: (cert: Certificate) => (
      <div className="flex gap-1">
        {cert.pdf_url && (
          <a
            href={cert.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
            title="Ver PDF"
          >
            <FileText className="h-4 w-4" />
          </a>
        )}
        {cert.qr_code_url && (
          <a
            href={cert.qr_code_url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
            title="Ver QR"
          >
            <QrCode className="h-4 w-4" />
          </a>
        )}
        <button
          onClick={() => setEditCert(cert)}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
          title="Editar estado"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          onClick={() => setRenewCert(cert)}
          disabled={cert.status === 'revoked'}
          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors disabled:pointer-events-none disabled:opacity-30"
          title={cert.status === 'revoked' ? 'No renovable (revocado)' : 'Renovar certificado'}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
        {!cert.pdf_url && !cert.qr_code_url && (
          <span className="text-xs text-neutral-400">—</span>
        )}
      </div>
    )},
  ]

  if (loadingUser) {
    return <div className="p-6 lg:p-8"><Skeleton count={3} className="h-8 w-full" /></div>
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a usuarios
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Certificados de {user ? `${user.name} ${user.first_last_name ?? ''}` : 'Usuario'}
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {user?.email} &middot; {user?.identity_type} {user?.identity_number}
            </p>
          </div>
          <Button onClick={() => setBatchModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Generar nuevo certificado
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="flex items-center gap-2 border-b border-neutral-200 px-4 py-3">
          <div className="min-w-0 flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por tipo o referencia..." />
          </div>
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setStatusFilterOpen(!statusFilterOpen)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                statusFilterOpen
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Filter className="h-4 w-4" />
              Estado
              {selectedStatuses.size > 0 && (
                <Badge variant="info">{selectedStatuses.size}</Badge>
              )}
            </button>
            {statusFilterOpen && (
              <div className="absolute right-0 z-50 mt-1 w-52 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleStatus(opt.value)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    {opt.label}
                    {selectedStatuses.has(opt.value) && (
                      <Check className="h-4 w-4 text-primary-600" />
                    )}
                  </button>
                ))}
                <div className="border-t border-neutral-100 mt-1 pt-1">
                  <button
                    onClick={clearStatuses}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    Todos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {loadingCerts ? (
          <div className="space-y-4 p-6"><Skeleton count={5} className="h-10 w-full" /></div>
        ) : filteredCertificates.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-neutral-400">
            {searchQuery ? 'Sin resultados para la búsqueda.' : 'Este usuario no tiene certificados.'}
          </p>
        ) : (
          <DataTable columns={columns} data={filteredCertificates} />
        )}
      </Card>

      <BatchCertificateModal
        userId={userIdNum}
        open={batchModalOpen}
        onClose={() => setBatchModalOpen(false)}
      />

      {renewCert && (
        <RenewCertificateModal
          open
          onClose={() => setRenewCert(null)}
          certificate={renewCert}
        />
      )}

      {editCert && (
        <EditCertificateStatusModal
          open
          onClose={() => setEditCert(null)}
          certificate={editCert}
        />
      )}
    </div>
  )
}
