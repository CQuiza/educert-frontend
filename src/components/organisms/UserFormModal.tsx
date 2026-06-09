import { useState, useEffect } from 'react'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import type { User } from '../../types'
import { IdentityType } from '../../types'

interface FormData {
  email: string
  password: string
  name: string
  first_last_name: string
  second_last_name: string
  role: string
  identity_type: string
  identity_number: string
  phone_number: string
  is_active: boolean
}

const emptyForm: FormData = {
  email: '', password: '', name: '', first_last_name: '', second_last_name: '',
  role: 'student', identity_type: 'CC', identity_number: '', phone_number: '', is_active: true,
}

interface UserFormModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  roleOptions: { value: string; label: string }[]
  isSaving?: boolean
  onSubmit: (data: Record<string, unknown>, mode: 'create' | 'edit') => Promise<void>
}

export default function UserFormModal({ isOpen, onClose, user, roleOptions, isSaving, onSubmit }: UserFormModalProps) {
  const [form, setForm] = useState<FormData>(emptyForm)

  useEffect(() => {
    if (!isOpen) return
    if (user) {
      setForm({
        email: user.email,
        password: '',
        name: user.name || '',
        first_last_name: user.first_last_name || '',
        second_last_name: user.second_last_name || '',
        role: user.role,
        identity_type: user.identity_type,
        identity_number: user.identity_number,
        phone_number: user.phone_number,
        is_active: user.is_active,
      })
    } else {
      setForm(emptyForm)
    }
  }, [isOpen, user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const mode = user ? 'edit' : 'create'
    const payload: Record<string, unknown> = {
      email: form.email,
      name: form.name || null,
      first_last_name: form.first_last_name || null,
      second_last_name: form.second_last_name || null,
      role: form.role,
      identity_type: form.identity_type,
      identity_number: form.identity_number,
      phone_number: form.phone_number,
      is_active: form.is_active,
    }
    if (mode === 'edit') {
      if (form.password) payload.password = form.password
    } else {
      payload.password = form.password
    }
    await onSubmit(payload, mode)
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={user ? 'Editar usuario' : 'Nuevo usuario'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input
          label={user ? 'Contraseña (dejar vacío para mantener)' : 'Contraseña'}
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!user}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Primer apellido" value={form.first_last_name} onChange={(e) => setForm({ ...form, first_last_name: e.target.value })} />
        </div>
        <Input label="Segundo apellido" value={form.second_last_name} onChange={(e) => setForm({ ...form, second_last_name: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required>
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipo ID</label>
            <select value={form.identity_type} onChange={(e) => setForm({ ...form, identity_type: e.target.value })} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required>
              {Object.values(IdentityType).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Número ID" value={form.identity_number} onChange={(e) => setForm({ ...form, identity_number: e.target.value })} required />
          <Input label="Teléfono" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-neutral-700">Usuario activo</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSaving}>{user ? 'Guardar cambios' : 'Crear usuario'}</Button>
        </div>
      </form>
    </Modal>
  )
}
