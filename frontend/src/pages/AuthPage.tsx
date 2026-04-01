import { useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { useAuth } from '../auth/useAuth'

function useQueryMode(): 'login' | 'register' {
  const { search } = useLocation()
  return useMemo(() => {
    const mode = new URLSearchParams(search).get('mode')
    return mode === 'register' ? 'register' : 'login'
  }, [search])
}

export default function AuthPage() {
  const mode = useQueryMode()
  const nav = useNavigate()
  const { login, register } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'register') await register(email, password)
      else await login(email, password)
      nav('/tasks', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/40">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            {mode === 'register'
              ? 'Sign up to start tracking tasks.'
              : 'Log in to manage your tasks.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-200">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-0 focus:border-slate-500"
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-200">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none ring-0 focus:border-slate-500"
            />
            <p className="mt-1 text-xs text-slate-400">Minimum 8 characters.</p>
          </label>

          {error ? (
            <div className="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 px-3 py-2 font-medium text-white shadow hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading
              ? 'Please wait...'
              : mode === 'register'
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        <div className="mt-5 text-sm text-slate-300">
          {mode === 'register' ? (
            <>
              Already have an account?{' '}
              <Link className="text-indigo-300 hover:text-indigo-200" to="/auth?mode=login">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{' '}
              <Link className="text-indigo-300 hover:text-indigo-200" to="/auth?mode=register">
                Create an account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

