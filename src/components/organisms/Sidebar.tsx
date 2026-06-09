import { Home, Users, GraduationCap, Award, LayoutDashboard, FileCheck, ClipboardList, BookOpen, LogOut, X, HelpCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { config } from '../../config'
import type { UserRole } from '../../types'

interface NavItem {
  label: string
  path: string
  icon: typeof Home
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/', icon: Home, roles: ['superuser', 'admin', 'teacher', 'student'] },
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['superuser', 'admin', 'teacher'] },
  { label: 'Usuarios', path: '/users', icon: Users, roles: ['superuser', 'admin'] },
  { label: 'Cursos', path: '/courses', icon: GraduationCap, roles: ['superuser', 'admin', 'teacher', 'student'] },
  { label: 'Certificados', path: '/certificates', icon: Award, roles: ['superuser', 'admin', 'teacher', 'student'] },
  { label: 'Tipos de Certificado', path: '/certificate-types', icon: FileCheck, roles: ['superuser', 'admin'] },
  { label: 'Auditoría', path: '/audit', icon: ClipboardList, roles: ['superuser', 'admin'] },
  { label: 'Manual', path: '/manual', icon: BookOpen, roles: ['superuser', 'admin'] },
  { label: 'FAQ', path: '/faq', icon: HelpCircle, roles: ['superuser', 'admin', 'teacher', 'student'] },
]

interface SidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const filtered = navItems.filter((item) => {
    if (!user) return false
    if (!item.roles.includes(user.role)) return false
    if (config.hideCoursesForAdmin && user.role === 'admin' && item.path === '/courses') return false
    return true
  })

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-1">
        <Link to="/">
          <img src="/logo.png" alt="EduCert" className="h-20 w-60 object-contain" />
        </Link>
        <button onClick={onClose} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filtered.map((item) => {
          const active = pathname === item.path || pathname.startsWith(item.path + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-neutral-200 px-4 py-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-sm font-medium text-neutral-600">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">{user?.name || 'Usuario'}</p>
            <p className="truncate text-xs text-neutral-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200 bg-white lg:flex">
        {sidebarContent}
      </aside>

      <aside className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-col border-r border-neutral-200 bg-white transition-transform duration-200 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  )
}
