import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '@/components/SearchBar'
import { FilterPanel } from '@/components/FilterPanel'
import { FileCard } from '@/components/FileCard'
import { PdfPreview } from '@/components/PdfPreview'
import { useSearch } from '@/hooks/useSearch'
import { useDebounced } from '@/hooks/useDebounced'
import type { FileMeta, SearchFilters, SearchHit } from '@/types'

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>({ mode: 'hybrid' })
  const [selected, setSelected] = useState<{ file: FileMeta; page: number | null } | null>(null)
  const debouncedQuery = useDebounced(query, 200)

  useEffect(() => {
    if (debouncedQuery) setParams({ q: debouncedQuery }, { replace: true })
    else setParams({}, { replace: true })
  }, [debouncedQuery, setParams])

  const { data, isFetching } = useSearch(debouncedQuery, filters)

  const hits: SearchHit[] = useMemo(() => data?.hits ?? [], [data])

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col">
      <div className="mb-4">
        <h1 className="bg-gradient-to-r from-brand-200 to-purple-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
          Search the library
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Hybrid lexical + semantic search over PDFs, PPTX, and DOCX, ranked with BM25 plus pgvector embeddings.
        </p>
      </div>

      <SearchBar value={query} onChange={setQuery} loading={isFetching} />

      <div className="mt-6 flex min-h-0 flex-1 gap-6">
        <FilterPanel filters={filters} facets={data?.facets} onChange={setFilters} />

        <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="flex min-h-0 flex-col">
            {debouncedQuery && (
              <div className="mb-3 text-xs text-slate-400">
                {data ? `${data.total.toLocaleString()} results for “${data.query}”` : 'Searching…'}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-1 xl:grid-cols-2">
              {hits.length === 0 && debouncedQuery && !isFetching ? (
                <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-slate-400">
                  No matches. Try a broader phrase, or switch ranking mode to <strong>Semantic</strong>.
                </div>
              ) : (
                hits.map((hit) => (
                  <div key={hit.file.id} className="space-y-2">
                    <FileCard
                      file={hit.file}
                      matchedKeywords={hit.matched_keywords.map((k) => k.toLowerCase())}
                      onOpen={(file) => setSelected({ file, page: hit.page_anchor })}
                    />
                    {hit.snippet && (
                      <p className="rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-xs italic text-slate-400">
                        “{hit.snippet}”
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="hidden min-h-0 lg:block">
            <PdfPreview file={selected?.file ?? null} initialPage={selected?.page ?? null} />
          </div>
        </div>
      </div>
    </div>
  )
}
