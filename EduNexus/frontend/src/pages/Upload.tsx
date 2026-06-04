import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Sparkles } from 'lucide-react'
import { Dropzone } from '@/components/Dropzone'
import { UploadList, type UploadEntry } from '@/components/UploadList'
import client, { endpoints } from '@/lib/api'
import { getFirebaseAuth } from '@/lib/firebase'
import type { IngestionEvent } from '@/types'

export function UploadPage() {
  const queryClient = useQueryClient()
  const [entries, setEntries] = useState<UploadEntry[]>([])
  const sourcesRef = useRef<Map<string, EventSource>>(new Map())

  function updateEntry(id: string, patch: Partial<UploadEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  }

  const subscribeToIngestion = useCallback(
    async (entryId: string, fileId: number) => {
      const token = await getFirebaseAuth().currentUser?.getIdToken()
      const url = `${endpoints.ingestionStream(fileId)}${token ? `?token=${encodeURIComponent(token)}` : ''}`
      const es = new EventSource(`/api${url}`)
      sourcesRef.current.set(entryId, es)

      es.onmessage = (msg) => {
        try {
          const event: IngestionEvent = JSON.parse(msg.data)
          updateEntry(entryId, {
            stage: event.stage,
            progress: event.progress,
            message: event.message,
          })
          if (event.stage === 'ready' || event.stage === 'failed') {
            es.close()
            sourcesRef.current.delete(entryId)
            queryClient.invalidateQueries({ queryKey: ['files'] })
          }
        } catch {
          /* noop */
        }
      }

      es.onerror = () => {
        updateEntry(entryId, { stage: 'error', message: 'Lost connection to server' })
        es.close()
        sourcesRef.current.delete(entryId)
      }
    },
    [queryClient],
  )

  const upload = useCallback(
    async (file: File) => {
      const entryId = crypto.randomUUID()
      setEntries((prev) => [
        { id: entryId, file, progress: 0, stage: 'uploading' },
        ...prev,
      ])

      const form = new FormData()
      form.append('document', file)

      try {
        const { data } = await client.post<{ id: number }>(endpoints.upload, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            const pct = e.total ? (e.loaded / e.total) * 100 : 0
            updateEntry(entryId, { progress: pct * 0.4 })
          },
        })
        updateEntry(entryId, { fileId: data.id, stage: 'queued', progress: 45 })
        await subscribeToIngestion(entryId, data.id)
      } catch (err) {
        updateEntry(entryId, {
          stage: 'error',
          message: err instanceof Error ? err.message : 'Upload failed',
        })
      }
    },
    [subscribeToIngestion],
  )

  const handleFiles = useCallback(
    (files: File[]) => {
      files.forEach(upload)
    },
    [upload],
  )

  useEffect(() => {
    const sources = sourcesRef.current
    return () => {
      sources.forEach((es) => es.close())
      sources.clear()
    }
  }, [])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="bg-gradient-to-r from-brand-200 to-purple-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
          Upload study material
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Files are OCR'd, summarized by an LLM, and indexed for hybrid lexical + semantic search.
        </p>
      </div>

      <div className="mb-6">
        <Dropzone onFiles={handleFiles} />
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-3 text-xs text-brand-100">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
        <p>
          After upload, the ingestion pipeline (Celery + Redis) extracts text, runs OCR for scanned pages,
          generates an LLM summary, computes sentence-transformer embeddings, and updates the keyword index.
          Progress streams here over Server-Sent Events.
        </p>
      </div>

      <UploadList entries={entries} />
    </div>
  )
}
