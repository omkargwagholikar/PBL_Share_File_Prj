import { useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'
import type { FileMeta } from '@/types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export function PdfPreview({
  file,
  initialPage,
}: {
  file: FileMeta | null
  initialPage?: number | null
}) {
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(0)

  useEffect(() => {
    setPageNumber(initialPage && initialPage > 0 ? initialPage : 1)
    setNumPages(0)
  }, [file?.id, initialPage])

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-sm text-slate-500">
        Pick a result to preview it here.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-slate-100">{file.filename}</div>
          <div className="truncate text-xs text-slate-400">{file.uploader}</div>
        </div>
        <a
          href={file.download_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/10"
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </div>

      <div className="flex-1 overflow-auto bg-[#06080f] p-4">
        <Document
          file={file.download_url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preview…
            </div>
          }
          error={
            <div className="text-sm text-rose-300">
              Preview unavailable for this file type. Click <em>Open</em> to download.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            width={640}
            renderAnnotationLayer={false}
            renderTextLayer
          />
        </Document>
      </div>

      {numPages > 0 && (
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-xs text-slate-300">
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/5 disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/5 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
