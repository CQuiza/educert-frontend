import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import Button from '../components/atoms/Button'
import Input from '../components/atoms/Input'
import { getErrorMessage } from '../lib/error'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block mx-auto mb-4">
              <img src="/logo.png" alt="EduCert" className="h-20 w-60 object-contain" />
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900">EduCert</h1>
            <p className="mt-1 text-sm text-neutral-500">Inicia sesión en tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="rounded-lg bg-danger-50 px-4 py-3 text-sm text-danger-700">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Iniciar sesión
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden flex-1 bg-gradient-to-br from-primary-600 to-primary-800 lg:flex items-center justify-center">
        <div className="max-w-md text-center text-white px-8">
          <img src="/logo.png" alt="EduCert" className="mx-auto mb-6 h-28 w-60 object-contain brightness-0 invert opacity-90" />
          <h2 className="text-3xl font-bold">Plataforma de Certificación</h2>
          <p className="mt-3 text-lg text-primary-200">
            Gestiona cursos, usuarios y certificados de forma centralizada.
          </p>
        </div>
      </div>
    </div>
  )
}
