import type { AxiosError } from 'axios'

interface PydanticError {
  loc?: (string | number)[]
  msg?: string
  type?: string
}

const FIELD_LABELS: Record<string, string> = {
  password: 'La contraseña',
  email: 'El correo',
  name: 'El nombre',
  first_last_name: 'El primer apellido',
  second_last_name: 'El segundo apellido',
  identity_number: 'El número de identidad',
  phone_number: 'El teléfono',
  role: 'El rol',
  user_id: 'El usuario',
  certificate_type_id: 'El tipo de certificado',
  hours: 'Las horas',
  validity_extension: 'La extensión de vigencia',
  title: 'El título',
}

function formatValidationError(errors: PydanticError[]): string | null {
  if (!Array.isArray(errors) || errors.length === 0) return null
  const parts = errors.map((e) => {
    const fieldPath = e.loc?.filter((l) => l !== 'body').map(String).join('.')
    const field = fieldPath ? FIELD_LABELS[fieldPath] ?? fieldPath : undefined
    const raw = e.msg ?? 'Valor inválido'
    // Traduce los mensajes comunes de pydantic a algo legible para el usuario
    let msg = raw
    if (raw.includes('at least 8 characters')) msg = 'debe tener al menos 8 caracteres'
    else if (raw.includes('not a valid email address') || raw.includes('valid email')) msg = 'no es un correo válido'
    else if (raw.includes('Field required')) msg = 'es obligatorio'
    else if (raw.includes('Input should be')) msg = 'tiene un valor no permitido'
    else if (raw.includes('greater than or equal to')) msg = `debe ser mayor o igual a ${raw.split('equal to')[1]?.trim()}`
    return field ? `${field} ${msg}` : msg
  })
  const text = parts.join(' · ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'isAxiosError' in err) {
    const axiosErr = err as AxiosError<{ detail?: string | PydanticError[] }>
    const detail = axiosErr.response?.data?.detail
    if (typeof detail === 'string') return detail
    const formatted = formatValidationError(detail ?? [])
    if (formatted) return formatted
  }
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Ocurrió un error inesperado'
}
