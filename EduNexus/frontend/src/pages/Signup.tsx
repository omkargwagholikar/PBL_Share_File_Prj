import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { GraduationCap, User, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'

export function SignupPage() {
  const { signUp, user, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signUp(name, email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
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
            Join EduNexus
          </h1>
          <p className="text-sm text-slate-400">Make studying social. Share notes, find more.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
              Full name
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20">
              <User className="h-4 w-4 text-slate-500" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Your name"
              />
            </div>
          </label>

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
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="At least 6 characters"
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
            Create account
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-300 hover:text-brand-200">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
