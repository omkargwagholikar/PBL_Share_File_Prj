import type { SearchFilters, SearchResponse } from '@/types'
import { cn } from '@/lib/cn'

type FacetGroup = SearchResponse['facets'][keyof SearchResponse['facets']]

export function FilterPanel({
  filters,
  facets,
  onChange,
}: {
  filters: SearchFilters
  facets?: SearchResponse['facets']
  onChange: (next: SearchFilters) => void
}) {
  return (
    <aside className="w-60 shrink-0 space-y-6">
      <ModeToggle filters={filters} onChange={onChange} />

      <FacetGroupView
        title="Subject"
        values={facets?.subjects}
        active={filters.subject}
        onPick={(v) => onChange({ ...filters, subject: filters.subject === v ? undefined : v })}
      />

      <FacetGroupView
        title="Semester"
        values={facets?.semesters}
        active={filters.semester}
        onPick={(v) => onChange({ ...filters, semester: filters.semester === v ? undefined : v })}
      />

      <FacetGroupView
        title="File type"
        values={facets?.file_types}
        active={filters.file_type}
        onPick={(v) => onChange({ ...filters, file_type: filters.file_type === v ? undefined : v })}
      />
    </aside>
  )
}

function ModeToggle({
  filters,
  onChange,
}: {
  filters: SearchFilters
  onChange: (next: SearchFilters) => void
}) {
  const modes: Array<{ value: NonNullable<SearchFilters['mode']>; label: string; hint: string }> = [
    { value: 'hybrid', label: 'Hybrid', hint: 'BM25 + embeddings' },
    { value: 'lexical', label: 'Lexical', hint: 'BM25 only' },
    { value: 'semantic', label: 'Semantic', hint: 'Embeddings only' },
  ]
  const active = filters.mode ?? 'hybrid'
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        Ranking mode
      </div>
      <div className="space-y-1.5">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => onChange({ ...filters, mode: m.value })}
            className={cn(
              'flex w-full items-center justify-between rounded-lg border px-3 py-1.5 text-left text-xs transition',
              active === m.value
                ? 'border-brand-400/40 bg-brand-500/15 text-brand-100'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10',
            )}
          >
            <span className="font-medium">{m.label}</span>
            <span className="text-[10px] text-slate-400">{m.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function FacetGroupView({
  title,
  values,
  active,
  onPick,
}: {
  title: string
  values: FacetGroup | undefined
  active: string | undefined
  onPick: (value: string) => void
}) {
  if (!values || values.length === 0) return null
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</div>
      <ul className="space-y-1">
        {values.map((v) => (
          <li key={v.value}>
            <button
              onClick={() => onPick(v.value)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs transition',
                active === v.value
                  ? 'bg-brand-500/15 text-brand-100 ring-1 ring-brand-400/40'
                  : 'text-slate-300 hover:bg-white/5',
              )}
            >
              <span className="truncate">{v.value}</span>
              <span className="text-[10px] text-slate-500">{v.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
