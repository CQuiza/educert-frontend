import { useCourses } from '../hooks/useCourses'
import { GraduationCap, Clock, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import Skeleton from '../components/atoms/Skeleton'

export default function CatalogPage() {
  const { data: courses, isLoading } = useCourses({ limit: 50 })

  const published = (courses || []).filter((c) => c.status === 'published')

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1">
          <Link to="/">
            <img src="/logo.png" alt="EduCert" className="h-20 w-60 object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Inicio</Link>
            <Link to="/login" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">Iniciar sesión</Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Catálogo de Cursos</h1>
          <p className="mt-2 text-neutral-500">Explora los cursos disponibles y encuentra el que mejor se ajuste a tus necesidades</p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : published.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-4 text-lg font-medium text-neutral-600">No hay cursos disponibles por el momento</p>
            <p className="mt-1 text-sm text-neutral-400">Vuelve a consultar más tarde.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((course) => (
              <div key={course.id} className="group rounded-xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 mb-4">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 text-sm text-neutral-500 line-clamp-3">{course.description}</p>
                )}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Curso disponible</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-neutral-500">
          <Link to="/" className="inline-flex mb-4">
            <img src="/logovector.svg" alt="EduCert" className="mx-auto h-16 w-auto" />
          </Link>
          <div className="flex justify-center gap-4 mb-3">
            <Link to="/faq" className="text-primary-600 hover:text-primary-700 transition-colors">Preguntas frecuentes</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} EduCert. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
