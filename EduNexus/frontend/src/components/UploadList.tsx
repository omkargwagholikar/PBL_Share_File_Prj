import { CheckCircle2, AlertCircle, Loader2, FileText } from 'lucide-react'
import { formatBytes } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { IngestionEvent } from '@/types'

export type UploadEntry = {
  id: string
  file: File
  progress: number
  stage: IngestionEvent['stage'] | 'uploading' | 'error'
  message?: string
  fileId?: number
}

const STAGE_LABEL: Record<UploadEntry['stage'], string> = {
  uploading: 'Uploading',
  queued: 'Queued',
  extracting: 'Extracting text',
  ocr: 'Running OCR',
  embedding: 'Generating embeddings',
  summarizing: 'Summarizing',
  indexing: 'Indexing',
  ready: 'Ready',
  failed: 'Failed',
  error: 'Error',
}

export function UploadList({ entries }: { entries: UploadEntry[] }) {
  if (entries.length === 0) return null
  return (
    <ul className="space-y-3">
      {entries.map((e) => {
        const done = e.stage === 'ready'
        const failed = e.stage === 'failed' || e.stage === 'error'
        return (
          <li
            key={e.id}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
                <FileText className="h-4 w-4 text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-slate-100">{e.file.name}</div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {formatBytes(e.file.size)} · {STAGE_LABEL[e.stage]}
                  {e.message ? ` — ${e.message}` : ''}
                </div>
              </div>
              <div className="shrink-0">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : failed ? (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-300" />
                )}
              </div>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  failed
                    ? 'bg-rose-500'
                    : done
                      ? 'bg-emerald-500'
                      : 'bg-gradient-to-r from-brand-500 to-purple-500',
                )}
                style={{ width: `${Math.min(100, Math.round(e.progress))}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
