import { ArrowUpCircle, FileText, Presentation, FileType2, Image, BookOpen } from 'lucide-react'
import type { FileMeta } from '@/types'
import { formatBytes, formatRelativeDate, extOf } from '@/lib/format'

function iconForExt(ext: string) {
  switch (ext) {
    case 'pdf':
      return BookOpen
    case 'ppt':
    case 'pptx':
      return Presentation
    case 'doc':
    case 'docx':
      return FileType2
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'webp':
      return Image
    default:
      return FileText
  }
}

export function FileCard({
  file,
  matchedKeywords,
  onOpen,
}: {
  file: FileMeta
  matchedKeywords?: string[]
  onOpen?: (file: FileMeta) => void
}) {
  const Icon = iconForExt(extOf(file.filename))
  const status = file.status

  return (
    <button
      onClick={() => onOpen?.(file)}
      className="group flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-brand-400/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-brand-900/20"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-gradient-to-br from-brand-500/30 to-purple-500/20 p-2.5 ring-1 ring-white/10">
          <Icon className="h-5 w-5 text-brand-200" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-slate-100">{file.filename}</div>
          <div className="mt-0.5 truncate text-xs text-slate-400">
            {file.uploader} · {formatRelativeDate(file.uploaded_at)} · {formatBytes(file.size_bytes)}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs text-slate-400">
          <ArrowUpCircle className="h-3.5 w-3.5" />
          {file.upvotes}
        </div>
      </div>

      {file.summary && (
        <p className="line-clamp-2 text-xs text-slate-400">{file.summary}</p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {file.subject && (
          <span className="rounded-md bg-purple-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-200 ring-1 ring-purple-500/20">
            {file.subject}
          </span>
        )}
        {file.keywords.slice(0, 4).map((k) => {
          const matched = matchedKeywords?.includes(k.toLowerCase())
          return (
            <span
              key={k}
              className={
                matched
                  ? 'rounded-md bg-brand-500/30 px-2 py-0.5 text-[10px] font-medium text-brand-100 ring-1 ring-brand-400/40'
                  : 'rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-300 ring-1 ring-white/10'
              }
            >
              {k}
            </span>
          )
        })}
      </div>

      {status !== 'ready' && (
        <div className="text-[10px] uppercase tracking-wider text-amber-300">
          {status === 'processing' ? 'Indexing…' : status}
        </div>
      )}
    </button>
  )
}
