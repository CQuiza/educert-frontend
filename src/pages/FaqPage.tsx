import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { faqs } from '../constants/faqs'

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-1">
          <Link to="/">
            <img src="/logo.png" alt="EduCert" className="h-20 w-60 object-contain" />
          </Link>
          <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">Iniciar sesión</Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/" className="mb-6 inline-flex text-sm text-neutral-500 hover:text-neutral-700 transition-colors">&larr; Volver al inicio</Link>
        <h1 className="text-3xl font-bold text-neutral-900">Preguntas Frecuentes</h1>
        <p className="mt-2 text-neutral-600">Respuestas a las dudas más comunes sobre EduCert.</p>

        <div className="mt-8 space-y-3">
          {faqs.map((faq, i) => {
            const open = openIndex === i
            return (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-neutral-50"
                >
                  <span className="font-medium text-neutral-900">{faq.q}</span>
                  {open ? <ChevronDown className="h-5 w-5 text-neutral-400 shrink-0" /> : <ChevronRight className="h-5 w-5 text-neutral-400 shrink-0" />}
                </button>
                {open && (
                  <div className="border-t border-neutral-100 px-5 py-4 text-sm text-neutral-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="mx-auto max-w-3xl px-6 text-center text-sm text-neutral-500">
          <Link to="/" className="inline-flex mb-4">
            <img src="/logovector.svg" alt="EduCert" className="mx-auto h-16 w-auto" />
          </Link>
          <p>&copy; {new Date().getFullYear()} EduCert. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
