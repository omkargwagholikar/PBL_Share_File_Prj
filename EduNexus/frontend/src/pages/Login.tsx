import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'

export function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname: string } } }
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    const dest = location.state?.from?.pathname ?? '/'
    return <Navigate to={dest} replace />
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 p-3 shadow-2xl shadow-brand-900/40">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="bg-gradient-to-r from-brand-200 to-purple-200 bg-clip-text text-3xl font-semibold tracking-tight text-transparent">
            EduNexus
          </h1>
          <p className="text-sm text-slate-400">Sign in to share and discover study material.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Email
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20">
              <Mail className="h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="you@university.edu"
              />
            </div>
          </label>

          <label className="mb-2 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Password
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20">
              <Lock className="h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>
          </label>

          {error && (
            <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition hover:from-brand-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            New here?{' '}
            <Link to="/signup" className="font-medium text-brand-300 hover:text-brand-200">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
