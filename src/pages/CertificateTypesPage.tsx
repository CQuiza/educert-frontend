import { useState, useMemo } from 'react'
import { useCertificateTypes, useCreateCertificateType, useUpdateCertificateType } from '../hooks/useCertificateTypes'
import { toast } from 'sonner'
import Card from '../components/molecules/Card'
import DataTable from '../components/molecules/DataTable'
import SearchBar from '../components/molecules/SearchBar'
import Pagination from '../components/molecules/Pagination'
import Modal from '../components/molecules/Modal'
import Button from '../components/atoms/Button'
import Badge from '../components/atoms/Badge'
import Input from '../components/atoms/Input'
import Skeleton from '../components/atoms/Skeleton'
import { Plus, Pencil } from 'lucide-react'
import { getErrorMessage } from '../lib/error'
import type { CertificateType } from '../types'
import { CertificateTypeKind, ValidityUnit } from '../types'

const PAGE_SIZE = 10

interface FormData {
  name: string
  reference: string
  type: string
  hours: number
  validity_type: string
  validity_value: number
}

const emptyForm: FormData = { name: '', reference: '', type: 'basic', hours: 0, validity_type: 'years', validity_value: 1 }

export default function CertificateTypesPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CertificateType | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)

  const { data: types, isLoading } = useCertificateTypes()
  const createMutation = useCreateCertificateType()
  const updateMutation = useUpdateCertificateType(editing?.id ?? 0)

  const filtered = useMemo(() => {
    if (!types) return []
    const q = search.toLowerCase()
    return types.filter((t) => t.name.toLowerCase().includes(q) || t.type?.toLowerCase().includes(q))
  }, [types, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(t: CertificateType) {
    setEditing(t)
    setForm({
      name: t.name,
      reference: t.reference || '',
      type: t.type,
      hours: t.hours,
      validity_type: t.validity_type,
      validity_value: t.validity_value,
    })
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          name: form.name,
          reference: form.reference || null,
          type: form.type as CertificateType['type'],
          hours: form.hours,
          validity_type: form.validity_type as CertificateType['validity_type'],
          validity_value: form.validity_value,
        })
        toast.success('Tipo actualizado correctamente')
      } else {
        await createMutation.mutateAsync({
          name: form.name,
          reference: form.reference || null,
          type: form.type as CertificateType['type'],
          hours: form.hours,
          validity_type: form.validity_type as CertificateType['validity_type'],
          validity_value: form.validity_value,
        })
        toast.success('Tipo creado correctamente')
      }
      setModalOpen(false)
      setEditing(null)
      setForm(emptyForm)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const columns = [
    { key: 'name', header: 'Nombre', className: 'w-[60%]' },
    { key: 'type', header: 'Tipo', className: 'text-center', render: (t: CertificateType) => <Badge variant="info">{t.type}</Badge> },
    { key: 'hours', header: 'Horas', className: 'text-center' },
    { key: 'validity_type', header: 'Vigencia', className: 'text-center', render: (t: CertificateType) => `${t.validity_value} ${t.validity_type}` },
    { key: 'reference', header: 'Referencia', className: 'text-center' },
    { key: 'actions' as string, header: 'Acciones', className: 'text-center', render: (t: CertificateType) => (
      <div className="flex justify-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); openEdit(t) }} className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors">
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    )},
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Tipos de Certificado</h1>
          <p className="mt-1 text-sm text-neutral-500">Gestiona los tipos de certificado disponibles</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Nuevo tipo
        </Button>
      </div>

      <Card padding={false}>
        <div className="border-b border-neutral-200 px-4 py-3">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar tipo..." />
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6"><Skeleton count={5} className="h-10 w-full" /></div>
        ) : (
          <>
            <DataTable fixed columns={columns} data={pageData} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar tipo de certificado' : 'Nuevo tipo de certificado'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Referencia (opcional)" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Tipo</label>
            <select value={form.type} onChange={(e) => {
              const t = e.target.value
              const defaults: Record<string, Partial<FormData>> = { basic: { hours: 45, validity_value: 1 }, advanced: { hours: 70, validity_value: 2 }, diploma: { hours: 150, validity_value: 3 } }
              setForm((prev) => editing ? { ...prev, type: t } : { ...prev, type: t, ...defaults[t] })
            }} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required>
              {Object.values(CertificateTypeKind).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <Input label="Horas" type="number" min={0} value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Unidad de vigencia</label>
              <select value={form.validity_type} onChange={(e) => setForm({ ...form, validity_type: e.target.value })} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required>
                {Object.values(ValidityUnit).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <Input label="Valor" type="number" min={1} value={form.validity_value} onChange={(e) => setForm({ ...form, validity_value: Number(e.target.value) })} required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? 'Guardar cambios' : 'Crear tipo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
