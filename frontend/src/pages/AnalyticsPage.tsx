import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api, ApiError, type AnalyticsSummary } from '../lib/api'
import { useAuth } from '../auth/useAuth'

function isAuthRequiredFailure(status: number) {
  return status === 401 || status === 403
}

function localYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function defaultRange(): { from: string; to: string } {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 29)
  return { from: localYmd(from), to: localYmd(to) }
}

function formatShortDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function AnalyticsPage() {
  const { logout } = useAuth()
  const nav = useNavigate()
  const initial = useMemo(() => defaultRange(), [])
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    setLoading(true)
    try {
      setData(await api.analyticsSummary({ from, to }))
    } catch (err) {
      if (err instanceof ApiError && isAuthRequiredFailure(err.status)) {
        logout()
        nav('/auth', { replace: true })
        return
      }
      setError(err instanceof ApiError ? err.message : 'Failed to load analytics')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [from, to, logout, nav])

  useEffect(() => {
    void load()
  }, [load])

  const maxCompletion = useMemo(() => {
    if (!data?.completionsByDay.length) return 0
    return Math.max(...data.completionsByDay.map((d) => d.count), 1)
  }, [data])

  return (
    <div className="min-h-full">
      <AppHeader title="Analytics" subtitle="Phase 2 · Summary" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Date range</h2>
              <p className="mt-1 text-sm text-slate-400">
                Stats use your browser’s local calendar for defaults; the server uses its own timezone for bucketing.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-400">From</span>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-lg border border-slate-700/80 bg-slate-950/70 px-2 py-2 text-slate-100 outline-none focus:border-indigo-400/70 [color-scheme:dark]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-400">To</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-lg border border-slate-700/80 bg-slate-950/70 px-2 py-2 text-slate-100 outline-none focus:border-indigo-400/70 [color-scheme:dark]"
                />
              </label>
              <button
                type="button"
                onClick={() => void load()}
                className="mt-5 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-400 sm:mt-0"
              >
                Refresh
              </button>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-500/50 bg-red-950/70 px-4 py-3 text-sm font-medium text-red-400"
            >
              {error}
            </div>
          ) : null}

          {loading ? (
            <p className="mt-8 text-sm text-slate-400">Loading…</p>
          ) : data ? (
            <>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Created (range)" value={data.createdInRange} />
                <StatCard label="Completed (range)" value={data.completedInRange} />
                <StatCard label="Overdue (open)" value={data.overdueNotDone} highlight={data.overdueNotDone > 0} />
                <StatCard
                  label="On board"
                  value={data.byStatus.TODO + data.byStatus.IN_PROGRESS + data.byStatus.DONE}
                />
              </div>

              <div className="mt-8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Board snapshot</h3>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-4">
                    <div className="text-2xl font-semibold tabular-nums text-slate-100">{data.byStatus.TODO}</div>
                    <div className="mt-1 text-xs text-slate-400">Todo</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-4">
                    <div className="text-2xl font-semibold tabular-nums text-slate-100">
                      {data.byStatus.IN_PROGRESS}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">In progress</div>
                  </div>
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 px-3 py-4">
                    <div className="text-2xl font-semibold tabular-nums text-slate-100">{data.byStatus.DONE}</div>
                    <div className="mt-1 text-xs text-slate-400">Done</div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Completions by day (range)
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Days with zero height had no task marked done that day (per server clock).
                </p>
                <div className="mt-4 flex h-40 items-end gap-px overflow-x-auto rounded-xl border border-slate-800/60 bg-slate-950/30 px-2 pb-1 pt-3">
                  {data.completionsByDay.map((d) => {
                    const barMaxPx = 120
                    const hPx =
                      d.count === 0 ? 2 : Math.max(4, Math.round((d.count / maxCompletion) * barMaxPx))
                    return (
                      <div
                        key={d.date}
                        className="group flex min-w-[10px] flex-1 flex-col items-center justify-end"
                        title={`${d.date}: ${d.count}`}
                      >
                        <span className="mb-1 text-[10px] tabular-nums text-slate-500 opacity-0 transition group-hover:opacity-100">
                          {d.count > 0 ? d.count : ''}
                        </span>
                        <div
                          className="w-full max-w-[20px] rounded-t bg-indigo-500/80 transition group-hover:bg-indigo-400"
                          style={{ height: `${hPx}px` }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                  <span>{formatShortDate(data.completionsByDay[0]?.date ?? data.from)}</span>
                  <span>
                    {formatShortDate(data.completionsByDay[data.completionsByDay.length - 1]?.date ?? data.to)}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border px-3 py-4 ${
        highlight ? 'border-amber-500/40 bg-amber-950/25' : 'border-slate-800/70 bg-slate-950/40'
      }`}
    >
      <div className="text-2xl font-semibold tabular-nums text-slate-100">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{label}</div>
    </div>
  )
}
