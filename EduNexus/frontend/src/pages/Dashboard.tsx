import { useNavigate } from 'react-router-dom'
import { Sparkles, UploadCloud, TrendingUp, Loader2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { useFiles } from '@/hooks/useFiles'
import { FileCard } from '@/components/FileCard'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: files, isLoading, isError } = useFiles()

  const recent = files?.slice(0, 6) ?? []
  const trending = files
    ?.slice()
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, 4) ?? []

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">
            Welcome back, {user?.display_name?.split(' ')[0] ?? 'student'}
          </p>
          <h1 className="mt-1 bg-gradient-to-r from-brand-200 to-purple-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            Your study library
          </h1>
        </div>
        <button
          onClick={() => navigate('/upload')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 hover:from-brand-400 hover:to-purple-400"
        >
          <UploadCloud className="h-4 w-4" />
          Upload material
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card icon={<Sparkles className="h-4 w-4 text-brand-300" />} label="Total files" value={files?.length ?? '—'} />
        <Card
          icon={<TrendingUp className="h-4 w-4 text-purple-300" />}
          label="Total upvotes"
          value={files?.reduce((sum, f) => sum + f.upvotes, 0) ?? '—'}
        />
        <Card
          icon={<UploadCloud className="h-4 w-4 text-emerald-300" />}
          label="Your uploads"
          value={files?.filter((f) => f.uploader === user?.email).length ?? '—'}
        />
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Recently added</h2>
          <button
            onClick={() => navigate('/search')}
            className="text-xs text-brand-300 hover:text-brand-200"
          >
            Browse all →
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading library…
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            Could not reach the backend. Make sure the Django server is running on :8000.
          </div>
        ) : recent.length === 0 ? (
          <EmptyState onUpload={() => navigate('/upload')} />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((f) => (
              <FileCard key={f.id} file={f} onOpen={(file) => navigate(`/search?q=${encodeURIComponent(file.filename)}`)} />
            ))}
          </div>
        )}
      </section>

      {trending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Trending this week</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {trending.map((f) => (
              <FileCard key={f.id} file={f} onOpen={(file) => navigate(`/search?q=${encodeURIComponent(file.filename)}`)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function Card({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  )
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
      <UploadCloud className="mx-auto h-10 w-10 text-slate-500" />
      <p className="mt-3 text-sm text-slate-300">No files yet. Upload your first PDF or PPTX.</p>
      <button
        onClick={onUpload}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-500/20 px-4 py-2 text-sm font-medium text-brand-200 ring-1 ring-brand-500/30 hover:bg-brand-500/30"
      >
        <UploadCloud className="h-4 w-4" />
        Upload material
      </button>
    </div>
  )
}
