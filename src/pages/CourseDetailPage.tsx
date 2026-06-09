import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCourse } from '../hooks/useCourses'
import Skeleton from '../components/atoms/Skeleton'
import Badge from '../components/atoms/Badge'
import ModuleManager from '../components/organisms/course/ModuleManager'
import { ArrowLeft } from 'lucide-react'

export default function CourseDetailPage() {
  const { user } = useAuth()
  const { courseId } = useParams<{ courseId: string }>()
  const id = Number(courseId)
  const canManage = user && ['superuser', 'admin', 'teacher'].includes(user.role)

  const { data: course, isLoading: loadingCourse } = useCourse(id)

  if (loadingCourse) return <div className="p-6 lg:p-8 space-y-4"><Skeleton count={3} className="h-8 w-full" /></div>
  if (!course) return <div className="p-6 lg:p-8"><p className="text-neutral-500">Curso no encontrado</p></div>

  return (
    <div className="p-6 lg:p-8">
      <Link to="/courses" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver a cursos
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{course.title}</h1>
          {course.description && <p className="mt-2 text-neutral-600">{course.description}</p>}
          <div className="mt-2"><Badge variant={course.status === 'published' ? 'success' : 'warning'}>{course.status}</Badge></div>
        </div>
      </div>

      <ModuleManager courseId={id} canManage={!!canManage} />
    </div>
  )
}
