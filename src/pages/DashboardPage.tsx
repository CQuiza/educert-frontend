import { useAuth } from '../context/AuthContext'
import { useUsers } from '../hooks/useUsers'
import { useCertificates } from '../hooks/useCertificates'
import { useCourses } from '../hooks/useCourses'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import Card from '../components/molecules/Card'
import Skeleton from '../components/atoms/Skeleton'
import { Users, Award, GraduationCap, FileCheck, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'superuser' || user?.role === 'admin'

  const { data: users } = useUsers(undefined, { enabled: isAdmin })
  const { data: certificates } = useCertificates()
  const { data: courses } = useCourses()
  const { data: certTypes } = useCertificateTypes(undefined, { enabled: isAdmin })

  const activeCerts = certificates?.filter((c) => c.status === 'active').length ?? 0
  const expiredCerts = certificates?.filter((c) => c.status === 'expired').length ?? 0
  const revokedCerts = certificates?.filter((c) => c.status === 'revoked').length ?? 0

  const stats = [
    {
      label: 'Usuarios activos',
      value: isAdmin ? (users?.length ?? '—') : '—',
      icon: Users,
      color: 'text-primary-600 bg-primary-50',
      loading: false,
    },
    {
      label: 'Total certificados',
      value: certificates?.length ?? '—',
      icon: Award,
      color: 'text-success-600 bg-success-50',
      loading: false,
    },
    {
      label: 'Cursos publicados',
      value: courses?.length ?? '—',
      icon: GraduationCap,
      color: 'text-warning-600 bg-warning-50',
      loading: false,
    },
    {
      label: 'Tipos de certificado',
      value: isAdmin ? (certTypes?.length ?? '—') : '—',
      icon: FileCheck,
      color: 'text-info-600 bg-info-50',
      loading: false,
    },
  ]

  const certStatusCards = [
    { label: 'Activos', value: activeCerts, icon: CheckCircle, color: 'text-success-600 bg-success-50' },
    { label: 'Expirados', value: expiredCerts, icon: Clock, color: 'text-warning-600 bg-warning-50' },
    { label: 'Revocados', value: revokedCerts, icon: XCircle, color: 'text-danger-600 bg-danger-50' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">
          Bienvenido, {user?.name || 'Usuario'}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Panel principal de la plataforma EduCert
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  {stat.loading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  )}
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <h2 className="mt-8 mb-4 text-lg font-semibold text-neutral-900">Estado de Certificados</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {certStatusCards.map((c) => {
          const Icon = c.icon
          return (
            <Card key={c.label}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900">{c.value}</p>
                  <p className="text-sm text-neutral-500">{c.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
