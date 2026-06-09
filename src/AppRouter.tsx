import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { config } from './config'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import SearchPage from './pages/SearchPage'
import FaqPage from './pages/FaqPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import CertificatesPage from './pages/CertificatesPage'
import CoursesPage from './pages/CoursesPage'
import CertificateTypesPage from './pages/CertificateTypesPage'
import CertificateAuditPage from './pages/CertificateAuditPage'
import ManualPage from './pages/ManualPage'
import CourseDetailPage from './pages/CourseDetailPage'
import LessonViewPage from './pages/LessonViewPage'
import DashboardLayout from './components/organisms/DashboardLayout'
import type { ReactNode } from 'react'
import type { UserRole } from './types'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RoleGuard({ children, roles }: { children: ReactNode; roles: UserRole[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

const coursesRoles: UserRole[] = config.hideCoursesForAdmin
  ? ['superuser', 'teacher', 'student']
  : ['superuser', 'admin', 'teacher', 'student']

export default function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<RoleGuard roles={['superuser', 'admin', 'teacher']}><DashboardPage /></RoleGuard>} />
        <Route path="/users" element={<RoleGuard roles={['superuser', 'admin']}><UsersPage /></RoleGuard>} />
        <Route path="/certificates" element={<RoleGuard roles={['superuser', 'admin', 'teacher', 'student']}><CertificatesPage /></RoleGuard>} />
        <Route path="/courses" element={<RoleGuard roles={coursesRoles}><CoursesPage /></RoleGuard>} />
        <Route path="/courses/:courseId" element={<RoleGuard roles={coursesRoles}><CourseDetailPage /></RoleGuard>} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<RoleGuard roles={coursesRoles}><LessonViewPage /></RoleGuard>} />
        <Route path="/certificate-types" element={<RoleGuard roles={['superuser', 'admin']}><CertificateTypesPage /></RoleGuard>} />
        <Route path="/audit" element={<RoleGuard roles={['superuser', 'admin']}><CertificateAuditPage /></RoleGuard>} />
        <Route path="/manual" element={<RoleGuard roles={['superuser', 'admin']}><ManualPage /></RoleGuard>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
