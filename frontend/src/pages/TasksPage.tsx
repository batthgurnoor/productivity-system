import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError, type Task, type TaskStatus } from '../lib/api'
import { useAuth } from '../auth/useAuth'

function statusLabel(s: TaskStatus) {
  if (s === 'TODO') return 'Todo'
  if (s === 'IN_PROGRESS') return 'In progress'
  return 'Done'
}

export default function TasksPage() {
  const { logout } = useAuth()
  const nav = useNavigate()

  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState(2)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      setItems(await api.listTasks())
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        nav('/auth', { replace: true })
        return
      }
      setError(err instanceof ApiError ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { TODO: [], IN_PROGRESS: [], DONE: [] }
    for (const t of items) map[t.status].push(t)
    return map
  }, [items])

  async function onCreate(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    setError(null)
    try {
      const created = await api.createTask({
        title: trimmed,
        status: 'TODO',
        priority,
      })
      setItems((prev) => [created, ...prev])
      setTitle('')
      setPriority(2)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create task')
    }
  }

  async function move(t: Task, next: TaskStatus) {
    const updated = await api.updateTask(t.id, {
      title: t.title,
      description: t.description ?? '',
      status: next,
      priority: t.priority,
      dueDate: t.dueDate ?? undefined,
    })
    setItems((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
  }

  async function remove(t: Task) {
    await api.deleteTask(t.id)
    setItems((prev) => prev.filter((x) => x.id !== t.id))
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm text-slate-400">Phase 1 MVP</div>
            <div className="text-lg font-semibold">Tasks</div>
          </div>
          <button
            onClick={() => {
              logout()
              nav('/auth', { replace: true })
            }}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <form
          onSubmit={onCreate}
          className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:flex-row md:items-end"
        >
          <label className="flex-1">
            <div className="text-sm text-slate-200">New task</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
              placeholder="e.g. Build login page"
            />
          </label>
          <label className="w-full md:w-44">
            <div className="text-sm text-slate-200">Priority</div>
            <select
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
            >
              <option value={1}>High</option>
              <option value={2}>Medium</option>
              <option value={3}>Low</option>
            </select>
          </label>
          <button className="rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400">
            Add
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((s) => (
            <section key={s} className="rounded-2xl border border-slate-800 bg-slate-900/30">
              <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
                <div className="font-semibold">{statusLabel(s)}</div>
                <div className="text-xs text-slate-400">{byStatus[s].length}</div>
              </div>

              <div className="p-3">
                {loading ? (
                  <div className="text-sm text-slate-400">Loading...</div>
                ) : byStatus[s].length === 0 ? (
                  <div className="text-sm text-slate-500">No tasks.</div>
                ) : (
                  <ul className="space-y-2">
                    {byStatus[s].map((t) => (
                      <li
                        key={t.id}
                        className="rounded-xl border border-slate-800 bg-slate-950/40 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate font-medium">{t.title}</div>
                            <div className="mt-1 text-xs text-slate-400">
                              Priority {t.priority}
                            </div>
                          </div>
                          <button
                            onClick={() => void remove(t)}
                            className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs hover:bg-slate-800"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {s !== 'TODO' ? (
                            <button
                              onClick={() => void move(t, 'TODO')}
                              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs hover:bg-slate-800"
                            >
                              To todo
                            </button>
                          ) : null}
                          {s !== 'IN_PROGRESS' ? (
                            <button
                              onClick={() => void move(t, 'IN_PROGRESS')}
                              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs hover:bg-slate-800"
                            >
                              In progress
                            </button>
                          ) : null}
                          {s !== 'DONE' ? (
                            <button
                              onClick={() => void move(t, 'DONE')}
                              className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                            >
                              Mark done
                            </button>
                          ) : (
                            <button
                              onClick={() => void move(t, 'IN_PROGRESS')}
                              className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs hover:bg-slate-800"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

