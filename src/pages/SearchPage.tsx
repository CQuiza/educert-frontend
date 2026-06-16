import { useState, useMemo } from 'react'
import { FileText, QrCode, Search, User, IdCard, Calendar, Clock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/molecules/Card'
import Badge from '../components/atoms/Badge'
import Input from '../components/atoms/Input'
import Button from '../components/atoms/Button'
import Skeleton from '../components/atoms/Skeleton'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import { certificateStatusVariant } from '../lib/statusVariant'
import { formatDate } from '../lib/dates'
import { config } from '../config'
import api from '../services/api'
import type { Certificate } from '../types'

interface SearchResult {
  user_name: string | null
  user_email: string | null
  identity_number: string | null
  certificates: Certificate[]
}

export default function SearchPage() {
  const [identityNumber, setIdentityNumber] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { data: certTypes } = useCertificateTypes()
  const typeMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, string>
    return Object.fromEntries(certTypes.map((t) => [t.id, t.name]))
  }, [certTypes])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!identityNumber.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.get<SearchResult[]>(`/certificates/search-by-identity/${encodeURIComponent(identityNumber.trim())}`)
      if (data.length > 0) setResult(data[0])
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } }
        if (axiosErr.response?.status === 404) {
          setError('No se encontraron certificados para esta identidad.')
        } else {
          setError(axiosErr.response?.data?.detail || 'Error al consultar los certificados.')
        }
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error de conexión. Intente nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

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

      <section className="mx-auto max-w-2xl px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Verificar Certificados</h1>
          <p className="mt-2 text-neutral-500">Ingresa tu número de identificación para consultar tus certificados</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Número de identificación"
              placeholder="Ej: 1234567890"
              value={identityNumber}
              onChange={(e) => setIdentityNumber(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              <Search className="h-4 w-4" />
              Consultar
            </Button>
          </form>
        </Card>

        {loading && (
          <div className="mt-6 space-y-4">
            <Skeleton count={3} className="h-16 w-full" />
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-danger-200 bg-danger-50 px-5 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-danger-500" />
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <Card>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-neutral-400" />
                <div>
                  <p className="font-medium text-neutral-900">{result.user_name || 'Usuario'}</p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <IdCard className="h-3.5 w-3.5" />
                        {result.identity_number}
                      </span>
                    </div>
                </div>
              </div>
            </Card>

            <h2 className="text-lg font-semibold text-neutral-900">
              Certificados encontrados ({result.certificates.length})
            </h2>

            {result.certificates.map((cert) => (
              <Card key={cert.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={certificateStatusVariant(cert.status)}>{cert.status}</Badge>
                      {cert.certificate_type_id != null && typeMap[cert.certificate_type_id] && (
                        <span className="text-base font-bold text-neutral-900 break-words">{typeMap[cert.certificate_type_id]}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Emitido: {formatDate(cert.issued_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Expira: {cert.expires_at ? formatDate(cert.expires_at) : '—'}</span>
                      </div>
                    </div>
                    <p className="font-mono text-xs text-neutral-400">ID: {cert.unique_id.slice(0, 8)}...</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`${config.apiUrl}/certificates/view/${cert.unique_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      PDF
                    </a>
                    <a
                      href={`${config.apiUrl}/certificates/view/${cert.unique_id}/qr`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      QR
                    </a>
                  </div>
                </div>
              </Card>
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
            <Link to="/catalog" className="text-primary-600 hover:text-primary-700 transition-colors">Catálogo</Link>
            <Link to="/faq" className="text-primary-600 hover:text-primary-700 transition-colors">Preguntas frecuentes</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} EduCert. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
