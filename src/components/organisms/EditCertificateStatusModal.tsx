import { useState } from 'react'
import { toast } from 'sonner'
import { useUpdateCertificate } from '../../hooks/useCertificates'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'
import { getErrorMessage } from '../../lib/error'
import { formatDate } from '../../lib/dates'
import { certificateStatusVariant } from '../../lib/statusVariant'
import type { Certificate, CertificateStatus } from '../../types'

interface EditCertificateStatusModalProps {
  open: boolean
  onClose: () => void
  certificate: Certificate
}

export default function EditCertificateStatusModal({ open, onClose, certificate }: EditCertificateStatusModalProps) {
  const update = useUpdateCertificate(certificate.id)

  const [editStatus, setEditStatus] = useState<CertificateStatus>(certificate.status)

  // Reset del select al abrir con ajuste-durante-render (sin useEffect → evita
  // react-hooks/set-state-in-effect)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setEditStatus(certificate.status)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await update.mutateAsync({ status: editStatus })
      toast.success('Certificado actualizado correctamente')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Actualizar certificado">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={certificateStatusVariant(certificate.status)}>{certificate.status}</Badge>
            <span className="font-mono text-xs text-neutral-500">{certificate.unique_id.slice(0, 8)}</span>
          </div>
          <p className="text-neutral-600">
            Emitido: <span className="font-medium text-neutral-800">{formatDate(certificate.issued_at)}</span>
          </p>
          <p className="text-neutral-600">
            Expira: <span className="font-medium text-neutral-800">{certificate.expires_at ? formatDate(certificate.expires_at) : '—'}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Estado</label>
          <select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as CertificateStatus)}
            className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="active">Activo</option>
            <option value="revoked">Revocado</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={update.isPending} disabled={update.isPending}>Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}
