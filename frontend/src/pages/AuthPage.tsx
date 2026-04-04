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
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="glass w-full max-w-lg rounded-3xl p-6 sm:p-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {mode === 'register' ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {mode === 'register'
              ? 'Sign up to start tracking tasks.'
              : 'Log in to manage your tasks.'}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="mx-auto w-full max-w-[20rem] space-y-5"
        >
          <label className="block">
            <span className="text-base font-medium text-slate-100">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              required
              className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none ring-0 focus:border-indigo-400/70 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-base font-medium text-slate-100">Password</span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 text-slate-100 outline-none ring-0 focus:border-indigo-400/70 focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-slate-400">Minimum 8 characters.</p>
          </label>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-500/50 bg-red-950/70 px-3 py-2 text-sm font-medium text-red-400"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-500 px-3 py-2.5 text-base font-medium text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading
              ? 'Please wait...'
              : mode === 'register'
                ? 'Create account'
                : 'Log in'}
          </button>
        </form>

        <div className="mx-auto mt-6 max-w-[20rem] text-center text-sm text-slate-300">
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

