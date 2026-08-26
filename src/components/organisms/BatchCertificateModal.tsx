import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useCertificateTypes } from '../../hooks/useCertificateTypes'
import { useBatchIssueCertificates } from '../../hooks/useCertificates'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import { Search, CheckSquare, Square } from 'lucide-react'

interface BatchCertificateModalProps {
  userId: number
  open: boolean
  onClose: () => void
}

export default function BatchCertificateModal({ userId, open, onClose }: BatchCertificateModalProps) {
  const { data: certTypes } = useCertificateTypes()
  const batchIssue = useBatchIssueCertificates()

  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [issuedAt, setIssuedAt] = useState('')
  const [validityExtension, setValidityExtension] = useState<number | null>(null)
  const [hours, setHours] = useState<number | null>(null)
  const [result, setResult] = useState<{ issued: number; errors: { ct: string; error: string }[] } | null>(null)

  // Reset al abrir con ajuste-durante-render (sin useEffect → evita
  // react-hooks/set-state-in-effect)
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearch('')
      setSelectedIds(new Set())
      setIssuedAt('')
      setValidityExtension(null)
      setHours(null)
      setResult(null)
    }
  }

  const singleType = selectedIds.size === 1

  const filtered = useMemo(() => {
    if (!certTypes) return []
    const q = search.toLowerCase()
    return certTypes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        String(t.hours).includes(q) ||
        (t.reference && t.reference.toLowerCase().includes(q)),
    )
  }, [certTypes, search])

  function toggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)))
    }
  }

  async function handleIssue() {
    if (selectedIds.size === 0) return
    setResult(null)
    try {
      const res = await batchIssue.mutateAsync({
        user_id: userId,
        certificate_type_ids: Array.from(selectedIds),
        issued_at: issuedAt || null,
        // Los overrides solo aplican a la emisión de un único tipo
        validity_extension: selectedIds.size === 1 ? (validityExtension ?? undefined) : undefined,
        hours: selectedIds.size === 1 ? (hours ?? undefined) : undefined,
      })
      setResult({
        issued: res.issued.length,
        errors: res.errors.map((e) => ({
          ct: String(e.certificate_type_id),
          error: e.error,
        })),
      })
      if (res.errors.length === 0) {
        toast.success(`${res.issued.length} certificado(s) emitido(s) correctamente`)
        setSelectedIds(new Set())
        setIssuedAt('')
      } else if (res.issued.length > 0) {
        toast.success(`${res.issued.length} emitido(s), ${res.errors.length} error(es)`)
      } else {
        toast.error('No se pudo emitir ningún certificado')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al emitir certificados')
    }
  }

  function handleClose() {
    setSearch('')
    setSelectedIds(new Set())
    setIssuedAt('')
    setValidityExtension(null)
    setHours(null)
    setResult(null)
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Generar certificados">
      <div className="space-y-4">
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
          disabled={!singleType}
          value={validityExtension ?? ''}
          onChange={(e) => setValidityExtension(e.target.value ? Number(e.target.value) : null)}
        />
        {!singleType && (
          <p className="-mt-2 text-xs text-neutral-400">Solo disponible al seleccionar un único tipo de certificado.</p>
        )}

        <Input
          label="Número de horas (opcional)"
          type="number"
          min={1}
          disabled={!singleType}
          value={hours ?? ''}
          onChange={(e) => setHours(e.target.value ? Number(e.target.value) : null)}
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipos de certificado</label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, tipo, horas o referencia..."
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {filtered.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <button onClick={toggleAll} className="text-xs text-primary-600 hover:underline">
                {selectedIds.size === filtered.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </button>
              {selectedIds.size > 0 && (
                <span className="text-xs text-neutral-500">{selectedIds.size} seleccionado(s)</span>
              )}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto space-y-1 rounded-lg border border-neutral-200 p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-neutral-400">Sin resultados</p>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => toggle(t.id)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    selectedIds.has(t.id) ? 'bg-primary-50 text-primary-800' : 'hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {selectedIds.has(t.id) ? (
                    <CheckSquare className="h-4 w-4 shrink-0 text-primary-600" />
                  ) : (
                    <Square className="h-4 w-4 shrink-0 text-neutral-300" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{t.name}</p>
                    <p className="text-xs text-neutral-400">
                      {t.type} &middot; {t.hours}h{t.reference ? ` · ${t.reference}` : ''}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {result && result.errors.length > 0 && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
            <p className="font-medium mb-1">{result.errors.length} error(es):</p>
            <ul className="space-y-1">
              {result.errors.map((e, i) => (
                <li key={i}>
                  <strong>Tipo #{e.ct}:</strong> {e.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleIssue} loading={batchIssue.isPending} disabled={selectedIds.size === 0}>
            Emitir certificados ({selectedIds.size})
          </Button>
        </div>
      </div>
    </Modal>
  )
}
