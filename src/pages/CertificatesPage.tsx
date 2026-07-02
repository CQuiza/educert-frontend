import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { useCertifiedUsers, useUsers } from '../hooks/useUsers'
import { useCertificates, useUpdateCertificate, useIssueCertificate } from '../hooks/useCertificates'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import Card from '../components/molecules/Card'
import SearchBar from '../components/molecules/SearchBar'
import SearchableSelect from '../components/molecules/SearchableSelect'
import Pagination from '../components/molecules/Pagination'
import Modal from '../components/molecules/Modal'
import Button from '../components/atoms/Button'
import Badge from '../components/atoms/Badge'
import Input from '../components/atoms/Input'
import Skeleton from '../components/atoms/Skeleton'
import { Plus, Pencil, FileText, QrCode, ChevronDown, ChevronRight } from 'lucide-react'
import { getErrorMessage } from '../lib/error'
import { formatDate } from '../lib/dates'
import { certificateStatusVariant } from '../lib/statusVariant'
import { config } from '../config'
import type { Certificate } from '../types'

const PAGE_SIZE = 15

interface CertRow {
  cert: Certificate
  userName?: string
  userEmail?: string
  userDoc?: string
}

interface UserGroup {
  userId: number
  userName: string
  userEmail: string
  userDoc: string
  certificates: Certificate[]
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'superuser' || user?.role === 'admin'

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [certPage, setCertPage] = useState(1)
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set())

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | number>('')
  const [selectedTypeId, setSelectedTypeId] = useState<string | number>('')
  const [issuedAt, setIssuedAt] = useState('')
  const [validityExtension, setValidityExtension] = useState<number | null>(null)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<Certificate | null>(null)
  const [editStatus, setEditStatus] = useState('')

  const { data: certifiedUsers, isLoading: loadingCertified } = useCertifiedUsers(
    { skip: (certPage - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined },
    { enabled: isAdmin },
  )
  const { data: students } = useUsers({ role: 'student' }, { enabled: isAdmin })
  const { data: plainCerts, isLoading: loadingPlain } = useCertificates(
    { skip: (page - 1) * PAGE_SIZE, limit: PAGE_SIZE, search: debouncedSearch || undefined },
    { enabled: !isAdmin },
  )
  const { data: certTypes } = useCertificateTypes()
  const issueCert = useIssueCertificate()
  const updateCert = useUpdateCertificate(editingCert?.id ?? 0)

  const isLoading = isAdmin ? loadingCertified : loadingPlain

  const typeMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, string>
    return Object.fromEntries(certTypes.map((t) => [t.id, t.name]))
  }, [certTypes])

  const referenceMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, string | null>
    return Object.fromEntries(certTypes.map((t) => [t.id, t.reference]))
  }, [certTypes])

  const userGroups: UserGroup[] = useMemo(() => {
    if (!isAdmin || !certifiedUsers?.items) return []
    return certifiedUsers.items
      .filter((cu) => cu.certificates && cu.certificates.length > 0)
      .map((cu) => ({
        userId: cu.id,
        userName: cu.name || `Usuario #${cu.id}`,
        userEmail: cu.email,
        userDoc: cu.identity_number,
        certificates: [...cu.certificates].sort(
          (a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime(),
        ),
      }))
      .sort((a, b) => a.userName.localeCompare(b.userName))
  }, [isAdmin, certifiedUsers])

  const filteredGroups = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return userGroups
    return userGroups.filter(
      (g) =>
        g.userName.toLowerCase().includes(q) ||
        g.userEmail.toLowerCase().includes(q) ||
        g.userDoc.includes(q) ||
        g.certificates.some(
          (c) => c.unique_id.toLowerCase().includes(q) || typeMap[c.certificate_type_id ?? -1]?.toLowerCase().includes(q),
        ),
    )
  }, [userGroups, search, typeMap])

  function toggleUser(userId: number) {
    setExpandedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  function openEdit(c: Certificate) {
    setEditingCert(c)
    setEditStatus(c.status)
    setEditModalOpen(true)
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingCert) return
    try {
      await updateCert.mutateAsync({ status: editStatus as Certificate['status'] })
      toast.success('Certificado actualizado correctamente')
      setEditModalOpen(false)
      setEditingCert(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUserId || !selectedTypeId) return
    try {
      await issueCert.mutateAsync({
        user_id: Number(selectedUserId),
        certificate_type_id: Number(selectedTypeId),
        issued_at: issuedAt || undefined,
        validity_extension: validityExtension ?? undefined,
      })
      toast.success('Certificado emitido correctamente')
      setIssueModalOpen(false)
      setSelectedUserId('')
      setSelectedTypeId('')
      setIssuedAt('')
      setValidityExtension(null)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  // Non-admin: flat view
  const flatRows: CertRow[] = useMemo(() => {
    if (!isAdmin && plainCerts?.items) {
      return plainCerts.items.map((c) => ({ cert: c }))
    }
    return []
  }, [isAdmin, plainCerts])

  const studentOptions = useMemo(
    () =>
      (students?.items || []).map((s) => ({
        value: s.id,
        label: `${s.name || ''} ${s.first_last_name || ''}`.trim() || s.email,
        sublabel: `${s.identity_type} ${s.identity_number} — ${s.email}`,
      })),
    [students],
  )

  const certTypeOptions = useMemo(
    () =>
      (certTypes || []).map((t) => ({
        value: t.id,
        label: t.name,
        sublabel: `${t.type} — ${t.hours} horas${t.reference ? ` · ${t.reference}` : ''}`,
      })),
    [certTypes],
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Certificados</h1>
          <p className="mt-1 text-sm text-neutral-500">Emite y gestiona certificados</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIssueModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Adicionar Nuevo Certificado
          </Button>
        )}
      </div>

      <Card padding={false}>
        <div className="border-b border-neutral-200 px-4 py-3">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); setCertPage(1); setExpandedUsers(new Set()) }}
            placeholder="Buscar por estudiante, documento o UUID..."
          />
        </div>
        {isLoading ? (
          <div className="space-y-4 p-6"><Skeleton count={5} className="h-10 w-full" /></div>
        ) : isAdmin ? (
          <>
            <div className="divide-y divide-neutral-100">
              {filteredGroups.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-neutral-400">No se encontraron certificados.</p>
              ) : (
                filteredGroups.map((group) => {
                  const expanded = expandedUsers.has(group.userId)
                  return (
                    <div key={group.userId}>
                      <button
                        onClick={() => toggleUser(group.userId)}
                        className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {expanded ? (
                            <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900 truncate">{group.userName}</p>
                            <p className="text-xs text-neutral-500 truncate">{group.userEmail} · {group.userDoc}</p>
                          </div>
                        </div>
                        <Badge variant="default">{group.certificates.length} certificado{group.certificates.length !== 1 ? 's' : ''}</Badge>
                      </button>
                      {expanded && (
                        <div className="border-t border-neutral-100">
                          <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                                <th className="px-6 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">Tipo</th>
                                {user?.role === 'superuser' && <th className="px-6 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">Referencia</th>}
                                <th className="px-6 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">Estado</th>
                                <th className="px-6 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">Emitido</th>
                                <th className="px-6 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">Expira</th>
                                <th className="px-6 py-2.5 text-left text-xs font-medium text-neutral-500 uppercase">UUID</th>
                                <th className="px-6 py-2.5 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {group.certificates.map((cert) => (
                                <tr key={cert.id} className="hover:bg-neutral-50/50 transition-colors">
                                  <td className="px-6 py-3 text-neutral-700">
                                    {cert.certificate_type_id != null
                                      ? typeMap[cert.certificate_type_id] || `ID: ${cert.certificate_type_id}`
                                      : '—'}
                                  </td>
                                  {user?.role === 'superuser' && (
                                    <td className="px-6 py-3 text-neutral-600">
                                      {cert.certificate_type_id != null
                                        ? referenceMap[cert.certificate_type_id] || '—'
                                        : '—'}
                                    </td>
                                  )}
                                  <td className="px-6 py-3">
                                    <Badge variant={certificateStatusVariant(cert.status)}>{cert.status}</Badge>
                                  </td>
                                  <td className="px-6 py-3 text-neutral-600">
                                    {formatDate(cert.issued_at)}
                                  </td>
                                  <td className="px-6 py-3 text-neutral-600">
                                    {!cert.expires_at ? '—' : formatDate(cert.expires_at)}
                                  </td>
                                  <td className="px-6 py-3">
                                    <span
                                      className="font-mono text-xs text-neutral-500 cursor-pointer hover:text-primary-600 transition-colors"
                                      title={cert.unique_id}
                                      onClick={() => navigator.clipboard.writeText(cert.unique_id)}
                                    >
                                      {cert.unique_id.slice(0, 8)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="flex justify-end gap-1">
                                      <button
                                        onClick={() => window.open(`${config.apiUrl}/certificates/view/${cert.unique_id}`, '_blank')}
                                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
                                        title="Ver PDF"
                                      >
                                        <FileText className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => window.open(`${config.apiUrl}/certificates/view/${cert.unique_id}/qr`, '_blank')}
                                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
                                        title="Ver QR"
                                      >
                                        <QrCode className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => openEdit(cert)}
                                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
                                        title="Editar"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
            <Pagination page={certPage} totalPages={certifiedUsers ? Math.ceil(certifiedUsers.total / PAGE_SIZE) : 0} onPageChange={setCertPage} />
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Referencia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Emitido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Expira</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">UUID</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {flatRows.map((r) => (
                  <tr key={r.cert.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="px-6 py-3 text-neutral-700">
                      {r.cert.certificate_type_id != null
                        ? typeMap[r.cert.certificate_type_id] || `ID: ${r.cert.certificate_type_id}`
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-neutral-600">
                      {r.cert.certificate_type_id != null
                        ? referenceMap[r.cert.certificate_type_id] || '—'
                        : '—'}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={certificateStatusVariant(r.cert.status)}>{r.cert.status}</Badge>
                    </td>
                    <td className="px-6 py-3 text-neutral-700">
                      {formatDate(r.cert.issued_at)}
                    </td>
                    <td className="px-6 py-3 text-neutral-700">
                      {!r.cert.expires_at ? '—' : formatDate(r.cert.expires_at)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className="font-mono text-xs text-neutral-500 cursor-pointer hover:text-primary-600 transition-colors"
                        title={r.cert.unique_id}
                        onClick={() => navigator.clipboard.writeText(r.cert.unique_id)}
                      >
                        {r.cert.unique_id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => window.open(`${config.apiUrl}/certificates/view/${r.cert.unique_id}`, '_blank')}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
                          title="Ver PDF"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => window.open(`${config.apiUrl}/certificates/view/${r.cert.unique_id}/qr`, '_blank')}
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
                          title="Ver QR"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {flatRows.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-neutral-400">No se encontraron certificados.</p>
            )}
            <Pagination page={page} totalPages={plainCerts ? Math.ceil(plainCerts.total / PAGE_SIZE) : 0} onPageChange={setPage} />
          </>
        )}
      </Card>

      {isAdmin && (
        <Modal open={issueModalOpen} onClose={() => { setIssueModalOpen(false); setValidityExtension(null) }} title="Adicionar Nuevo Certificado">
          <form onSubmit={handleIssueSubmit} className="space-y-4">
            <SearchableSelect
              label="Usuario"
              options={studentOptions}
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Buscar estudiante por nombre o identidad..."
              required
            />
            <SearchableSelect
              label="Tipo de certificado"
              options={certTypeOptions}
              value={selectedTypeId}
              onChange={setSelectedTypeId}
              placeholder="Buscar tipo o referencia..."
              required
            />
            <Input label="Fecha de emisión (opcional)" type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
            <Input
              label="Extensión de vigencia (años, opcional)"
              type="number"
              min={1}
              value={validityExtension ?? ''}
              onChange={(e) => setValidityExtension(e.target.value ? Number(e.target.value) : null)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setIssueModalOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={issueCert.isPending}>Emitir certificado</Button>
            </div>
          </form>
        </Modal>
      )}

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Actualizar certificado">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Estado</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" required>
              <option value="active">Activo</option>
              <option value="revoked">Revocado</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={updateCert.isPending}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
