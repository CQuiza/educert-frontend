import { useAuth } from '../context/AuthContext'
import { useDashboardStats } from '../hooks/useDashboard'
import { useCourses } from '../hooks/useCourses'
import Card from '../components/molecules/Card'
import Skeleton from '../components/atoms/Skeleton'
import { Users, Award, GraduationCap, FileCheck, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const isStaff = user?.role === 'superuser' || user?.role === 'admin' || user?.role === 'teacher'

  const { data: statsData, isLoading } = useDashboardStats({ enabled: isStaff })
  const { data: courses } = useCourses()

  const stats = [
    {
      label: 'Usuarios activos',
      value: isStaff ? (statsData?.total_users ?? '—') : '—',
      icon: Users,
      color: 'text-primary-600 bg-primary-50',
      loading: isLoading,
    },
    {
      label: 'Total certificados',
      value: statsData?.total_certificates ?? '—',
      icon: Award,
      color: 'text-success-600 bg-success-50',
      loading: isLoading,
    },
    {
      label: 'Cursos publicados',
      value: statsData?.published_courses ?? '—',
      icon: GraduationCap,
      color: 'text-warning-600 bg-warning-50',
      loading: isLoading,
    },
    {
      label: 'Tipos de certificado',
      value: isStaff ? (statsData?.certificate_types ?? '—') : '—',
      icon: FileCheck,
      color: 'text-info-600 bg-info-50',
      loading: isLoading,
    },
  ]

  const certStatusCards = [
    { label: 'Activos', value: statsData?.active_certificates ?? '—', icon: CheckCircle, color: 'text-success-600 bg-success-50' },
    { label: 'Expirados', value: statsData?.expired_certificates ?? '—', icon: Clock, color: 'text-warning-600 bg-warning-50' },
    { label: 'Revocados', value: statsData?.revoked_certificates ?? '—', icon: XCircle, color: 'text-danger-600 bg-danger-50' },
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
