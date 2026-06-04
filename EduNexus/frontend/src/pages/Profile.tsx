import { useEffect, useState, type FormEvent } from 'react'
import {
  KeyRound,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { useDownloadModel, useProfile, useUpdateProfile } from '@/hooks/useProfile'

const POPULAR_MODELS = [
  {
    id: 'sentence-transformers/all-MiniLM-L6-v2',
    label: 'all-MiniLM-L6-v2',
    note: 'Lightweight 384-dim embeddings (default)',
  },
  {
    id: 'sentence-transformers/all-mpnet-base-v2',
    label: 'all-mpnet-base-v2',
    note: 'Higher quality, 768-dim, slower',
  },
  {
    id: 'BAAI/bge-small-en-v1.5',
    label: 'bge-small-en-v1.5',
    note: 'Strong English semantic search',
  },
]

export function ProfilePage() {
  const { user } = useAuth()
  const { data: profile, isLoading, isError } = useProfile()
  const updateMutation = useUpdateProfile()
  const downloadMutation = useDownloadModel()

  const [hfToken, setHfToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [defaultModel, setDefaultModel] = useState('')
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setDefaultModel(profile.default_embedding_model)
    }
  }, [profile])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setSavedNotice(null)
    try {
      await updateMutation.mutateAsync({
        hf_token: hfToken.trim() ? hfToken.trim() : undefined,
        default_embedding_model: defaultModel || undefined,
      })
      setHfToken('')
      setSavedNotice('Profile saved.')
    } catch (err) {
      setSavedNotice(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function onClearToken() {
    setSavedNotice(null)
    try {
      await updateMutation.mutateAsync({ hf_token: '' })
      setHfToken('')
      setSavedNotice('Token removed.')
    } catch (err) {
      setSavedNotice(err instanceof Error ? err.message : 'Clear failed')
    }
  }

  async function onDownload(modelId?: string) {
    try {
      await downloadMutation.mutateAsync({ model_id: modelId })
    } catch {
      /* surfaced via mutation state */
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile…
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
        Could not load your profile. Make sure the Django server is running on :8000.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="bg-gradient-to-r from-brand-200 to-purple-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
          Profile & integrations
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Signed in as <span className="text-slate-200">{user?.email ?? profile.uid}</span>. The HF
          token below is used server-side to download embedding / OCR / summarization models from
          the Hugging Face Hub.
        </p>
      </div>

      <form
        onSubmit={onSave}
        className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <KeyRound className="h-4 w-4 text-brand-300" />
            Hugging Face access token
          </div>
          <p className="mb-3 text-xs text-slate-400">
            Generate a token at{' '}
            <a
              href="https://huggingface.co/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-brand-300 hover:text-brand-200"
            >
              huggingface.co/settings/tokens
              <ExternalLink className="h-3 w-3" />
            </a>
            . Read access is enough for most embedding and OCR models.
          </p>

          {profile.hf_token_set && (
            <div className="mb-3 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              <span>
                Token on file: <code className="rounded bg-emerald-500/20 px-1.5 py-0.5">{profile.hf_token_preview}</code>
              </span>
              <button
                type="button"
                onClick={onClearToken}
                className="rounded-md border border-emerald-300/30 px-2 py-0.5 text-[10px] uppercase tracking-wider hover:bg-emerald-400/10"
              >
                Remove
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20">
            <KeyRound className="h-4 w-4 text-slate-500" />
            <input
              type={showToken ? 'text' : 'password'}
              value={hfToken}
              onChange={(e) => setHfToken(e.target.value)}
              placeholder={profile.hf_token_set ? 'Replace token (leave blank to keep)' : 'hf_...'}
              className="w-full bg-transparent font-mono text-sm text-slate-100 outline-none placeholder:text-slate-500"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowToken((v) => !v)}
              className="rounded-md p-1 text-slate-400 hover:bg-white/5 hover:text-slate-200"
              aria-label={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Cpu className="h-4 w-4 text-brand-300" />
            Default embedding model
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {POPULAR_MODELS.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setDefaultModel(m.id)}
                className={
                  defaultModel === m.id
                    ? 'rounded-xl border border-brand-400/40 bg-brand-500/15 p-3 text-left ring-1 ring-brand-400/30'
                    : 'rounded-xl border border-white/10 bg-white/5 p-3 text-left hover:border-white/20 hover:bg-white/10'
                }
              >
                <div className="text-xs font-semibold text-slate-100">{m.label}</div>
                <div className="mt-1 text-[10px] text-slate-400">{m.note}</div>
              </button>
            ))}
          </div>
          <input
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/20"
            placeholder="organization/model-name"
            spellCheck={false}
          />
        </div>

        {savedNotice && (
          <p
            className={
              updateMutation.isError
                ? 'rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200'
                : 'rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200'
            }
          >
            {savedNotice}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 hover:from-brand-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save profile
          </button>

          <button
            type="button"
            onClick={() => onDownload()}
            disabled={!profile.hf_token_set || downloadMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            title={!profile.hf_token_set ? 'Save a token first' : `Download ${defaultModel}`}
          >
            {downloadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download default model
          </button>
        </div>
      </form>

      <DownloadStatus profile={profile} mutationResult={downloadMutation.data} mutationError={downloadMutation.error} />
    </div>
  )
}

function DownloadStatus({
  profile,
  mutationResult,
  mutationError,
}: {
  profile: { last_download_status: string; last_download_message: string; last_download_at: string | null }
  mutationResult?: { ok: boolean; model_id: string; local_path?: string; error?: string }
  mutationError?: Error | null
}) {
  const liveError = mutationError?.message
  const live = mutationResult
  const stored = profile.last_download_status

  if (!live && !stored && !liveError) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-sm text-slate-400">
        No models downloaded yet. After saving a token, click <strong>Download default model</strong> to fetch
        it locally.
      </div>
    )
  }

  const ok = live ? live.ok : stored === 'ok'
  const Icon = ok ? CheckCircle2 : AlertCircle
  const tone = ok
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
    : 'border-rose-500/30 bg-rose-500/10 text-rose-100'

  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4" />
        Last model download {ok ? 'succeeded' : 'failed'}
      </div>
      <div className="mt-3 space-y-1 text-xs">
        {live?.model_id && <div>Model: <code className="rounded bg-black/30 px-1.5 py-0.5">{live.model_id}</code></div>}
        {live?.local_path && <div>Path: <code className="rounded bg-black/30 px-1.5 py-0.5">{live.local_path}</code></div>}
        {liveError && <div>Error: {liveError}</div>}
        {!live && profile.last_download_message && <div>{profile.last_download_message}</div>}
        {!live && profile.last_download_at && (
          <div className="text-slate-300/70">At {new Date(profile.last_download_at).toLocaleString()}</div>
        )}
      </div>
    </div>
  )
}
