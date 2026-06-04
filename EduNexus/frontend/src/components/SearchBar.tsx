import { useEffect, useRef, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useSuggestions } from '@/hooks/useSearch'
import { useDebounced } from '@/hooks/useDebounced'

export function SearchBar({
  value,
  onChange,
  onSubmit,
  loading,
}: {
  value: string
  onChange: (next: string) => void
  onSubmit?: (next: string) => void
  loading?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounced = useDebounced(value, 180)
  const { data: suggestions } = useSuggestions(debounced)

  useEffect(() => {
    function onClickAway(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener('mousedown', onClickAway)
    return () => document.removeEventListener('mousedown', onClickAway)
  }, [])

  const show = focused && suggestions && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-lg focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20">
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-300" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onSubmit) onSubmit(value)
            if (e.key === 'Escape') setFocused(false)
          }}
          placeholder="Search by topic, course, or paste a sentence…"
          className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="rounded-full p-1 text-slate-500 hover:bg-white/10 hover:text-slate-200"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {show && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0f1e] shadow-2xl">
          <ul className="max-h-72 overflow-y-auto py-1">
            {suggestions!.map((s) => (
              <li key={s}>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault()
                    onChange(s)
                    setFocused(false)
                    onSubmit?.(s)
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                >
                  <Search className="h-3.5 w-3.5 text-slate-500" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
