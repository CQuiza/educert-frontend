import { useState, useRef, useEffect, useMemo } from 'react'

interface Option {
  value: string | number
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  options: Option[]
  value: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  onRemoteSearch?: (query: string) => Promise<Option[]>
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  label,
  disabled,
  onRemoteSearch,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [remoteOptions, setRemoteOptions] = useState<Option[] | null>(null)
  const [searching, setSearching] = useState(false)
  const [chosen, setChosen] = useState<Option | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchSeq = useRef(0)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selected = options.find((o) => o.value === value) ??
    (chosen && chosen.value === value ? chosen : undefined)

  function resetSearch() {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current)
      searchTimer.current = null
    }
    searchSeq.current += 1
    setSearch('')
    setRemoteOptions(null)
    setSearching(false)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearch(q)
    if (!onRemoteSearch) return
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchSeq.current += 1
    const seq = searchSeq.current
    if (!q.trim()) {
      setRemoteOptions(null)
      setSearching(false)
      return
    }
    setSearching(true)
    searchTimer.current = setTimeout(() => {
      onRemoteSearch(q.trim())
        .then((results) => {
          if (searchSeq.current === seq) {
            setRemoteOptions(results)
            setSearching(false)
          }
        })
        .catch(() => {
          if (searchSeq.current === seq) {
            setRemoteOptions([])
            setSearching(false)
          }
        })
    }, 300)
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return options
    const merged = new Map<string, Option>()
    for (const o of options) {
      if (o.label.toLowerCase().includes(q) || (o.sublabel && o.sublabel.toLowerCase().includes(q))) {
        merged.set(String(o.value), o)
      }
    }
    for (const o of remoteOptions ?? []) merged.set(String(o.value), o)
    return Array.from(merged.values())
  }, [options, search, remoteOptions])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        resetSearch()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [])

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          {label}
        </label>
      )}
      <div ref={containerRef} className="relative">
        <div
          onClick={() => { if (!disabled) { setOpen(!open); resetSearch(); setTimeout(() => inputRef.current?.focus(), 50) }}}
          className={`flex items-center justify-between w-full rounded-lg border px-3 py-2.5 text-sm cursor-pointer ${
            disabled ? 'bg-neutral-50 text-neutral-400' : 'bg-white text-neutral-900'
          } ${open ? 'border-primary-500 ring-2 ring-primary-200' : 'border-neutral-300'}`}
        >
          <span className={`truncate ${selected ? '' : 'text-neutral-400'}`}>
            {selected ? selected.label : placeholder}
          </span>
          <svg className={`h-4 w-4 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-neutral-200 bg-white shadow-lg">
            <div className="border-b border-neutral-100 p-2">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Buscar..."
                className="w-full rounded-md border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {searching ? (
                <p className="px-3 py-2 text-sm text-neutral-400">Buscando...</p>
              ) : filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-neutral-400">Sin resultados</p>
              ) : (
                filtered.map((opt) => {
                  const active = opt.value === value
                  return (
                    <div
                      key={String(opt.value)}
                      onClick={() => { setChosen(opt); onChange(opt.value); setOpen(false); resetSearch() }}
                      className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors ${
                        active ? 'bg-primary-50 text-primary-700' : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{opt.label}</p>
                        {opt.sublabel && (
                          <p className="text-xs text-neutral-400">{opt.sublabel}</p>
                        )}
                      </div>
                      {active && (
                        <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
