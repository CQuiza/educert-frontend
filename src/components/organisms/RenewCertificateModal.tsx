import { useState } from 'react'
import { toast } from 'sonner'
import { useRenewCertificate } from '../../hooks/useCertificates'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import Badge from '../atoms/Badge'
import { getErrorMessage } from '../../lib/error'
import { formatDate } from '../../lib/dates'
import { certificateStatusVariant } from '../../lib/statusVariant'
import type { Certificate } from '../../types'

interface RenewCertificateModalProps {
  open: boolean
  onClose: () => void
  certificate: Certificate
}

export default function RenewCertificateModal({ open, onClose, certificate }: RenewCertificateModalProps) {
  const renew = useRenewCertificate(certificate.id)

  const [issuedAt, setIssuedAt] = useState('')
  const [validityExtension, setValidityExtension] = useState<number | null>(null)
  const [hours, setHours] = useState<number | null>(null)

  // Reset al abrir con ajuste-durante-render (sin useEffect → evita
  // react-hooks/set-state-in-effect)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setIssuedAt('')
      setValidityExtension(null)
      setHours(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await renew.mutateAsync({
        issued_at: issuedAt || undefined,
        validity_extension: validityExtension ?? undefined,
        hours: hours ?? undefined,
      })
      toast.success('Certificado renovado correctamente')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Renovar certificado">
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
          <p className="mt-2 text-xs text-neutral-400">
            La renovación mantiene el mismo UUID y regenera el PDF con las nuevas fechas.
          </p>
        </div>

        <Input
          label="Fecha de emisión (opcional)"
          type="date"
          value={issuedAt}
          onChange={(e) => setIssuedAt(e.target.value)}
        />
        <Input
          label="Extensión de vigencia (años, opcional)"
          type="number"
          min={1}
          value={validityExtension ?? ''}
          onChange={(e) => setValidityExtension(e.target.value ? Number(e.target.value) : null)}
        />
        <Input
          label="Número de horas (opcional)"
          type="number"
          min={1}
          value={hours ?? ''}
          onChange={(e) => setHours(e.target.value ? Number(e.target.value) : null)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={renew.isPending} disabled={renew.isPending}>Renovar</Button>
        </div>
      </form>
    </Modal>
  )
}
