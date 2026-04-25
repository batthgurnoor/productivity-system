import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../components/AppHeader'
import { api, ApiError, type Task, type TaskStatus } from '../lib/api'
import { useAuth } from '../auth/useAuth'

function statusLabel(s: TaskStatus) {
  if (s === 'TODO') return 'Todo'
  if (s === 'IN_PROGRESS') return 'In progress'
  return 'Done'
}

function priorityLabel(p: number): string {
  if (p === 1) return 'High'
  if (p === 2) return 'Medium'
  if (p === 3) return 'Low'
  return String(p)
}

function priorityStripClass(p: number): string {
  if (p === 1) return 'task-card-priority-strip task-card-priority-strip--1'
  if (p === 2) return 'task-card-priority-strip task-card-priority-strip--2'
  return 'task-card-priority-strip task-card-priority-strip--3'
}

function priorityChipClass(p: number): string {
  if (p === 1)
    return 'border-rose-500/35 bg-rose-950/55 text-rose-200 ring-rose-500/20'
  if (p === 2)
    return 'border-amber-500/35 bg-amber-950/45 text-amber-100 ring-amber-500/15'
  return 'border-slate-600/40 bg-slate-900/70 text-slate-300 ring-slate-500/10'
}

function formatDueDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** Backend requires due date; use today when moving legacy tasks that have none. */
function dueDateForApi(t: Task): string {
  return t.dueDate ?? new Date().toISOString().slice(0, 10)
}

type EditDraft = {
  title: string
  description: string
  status: TaskStatus
  priority: number
  dueDate: string // yyyy-mm-dd or ''
}

/** Missing/invalid/expired JWT: backend returns 401; 403 can still appear in some setups—send user to sign-in. */
function isAuthRequiredFailure(status: number) {
  return status === 401 || status === 403
}

export default function TasksPage() {
  const { logout } = useAuth()
  const nav = useNavigate()

  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(2)
  const [dueDate, setDueDate] = useState('') // yyyy-mm-dd or ''

  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState<EditDraft | null>(null)

  async function load() {
    setError(null)
    setLoading(true)
    try {
      setItems(await api.listTasks())
    } catch (err) {
      if (err instanceof ApiError && isAuthRequiredFailure(err.status)) {
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
    if (!trimmed) {
      setError('Title is required')
      return
    }
    if (!dueDate) {
      setError('Due date is required')
      return
    }

    setError(null)
    try {
      const created = await api.createTask({
        title: trimmed,
        description,
        status: 'TODO',
        priority,
        dueDate,
      })
      setItems((prev) => [created, ...prev])
      setTitle('')
      setDescription('')
      setPriority(2)
      setDueDate('')
    } catch (err) {
      if (err instanceof ApiError && isAuthRequiredFailure(err.status)) {
        logout()
        nav('/auth', { replace: true })
        return
      }
      setError(err instanceof ApiError ? err.message : 'Failed to create task')
    }
  }

  async function move(t: Task, next: TaskStatus) {
    setError(null)
    try {
      const updated = await api.updateTask(t.id, {
        title: t.title,
        description: t.description ?? '',
        status: next,
        priority: t.priority,
        dueDate: dueDateForApi(t),
      })
      setItems((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
    } catch (err) {
      if (err instanceof ApiError && isAuthRequiredFailure(err.status)) {
        logout()
        nav('/auth', { replace: true })
        return
      }
      setError(err instanceof ApiError ? err.message : 'Failed to move task')
    }
  }

  async function remove(t: Task) {
    setError(null)
    try {
      await api.deleteTask(t.id)
      setItems((prev) => prev.filter((x) => x.id !== t.id))
    } catch (err) {
      if (err instanceof ApiError && isAuthRequiredFailure(err.status)) {
        logout()
        nav('/auth', { replace: true })
        return
      }
      setError(err instanceof ApiError ? err.message : 'Failed to delete task')
    }
  }

  function startEdit(t: Task) {
    setEditingId(t.id)
    setDraft({
      title: t.title,
      description: t.description ?? '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate ?? '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft(null)
  }

  async function saveEdit(t: Task) {
    if (!draft) return
    const trimmed = draft.title.trim()
    if (!trimmed) {
      setError('Title is required')
      return
    }
    if (!draft.dueDate) {
      setError('Due date is required')
      return
    }
    setError(null)
    try {
      const updated = await api.updateTask(t.id, {
        title: trimmed,
        description: draft.description,
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate,
      })
      setItems((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
      cancelEdit()
    } catch (err) {
      if (err instanceof ApiError && isAuthRequiredFailure(err.status)) {
        logout()
        nav('/auth', { replace: true })
        return
      }
      setError(err instanceof ApiError ? err.message : 'Failed to update task')
    }
  }

  return (
    <div className="min-h-full">
      <AppHeader title="Tasks" subtitle="Phase 1 · Board" />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mx-auto w-full max-w-lg">
          <div className="glass rounded-3xl p-6 sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold tracking-tight">New task</h2>
              <p className="mt-2 text-sm text-slate-300">Add an item to your board.</p>
            </div>

            <form
              onSubmit={onCreate}
              className="mx-auto w-full max-w-[20rem] space-y-5"
            >
              <label className="block">
                <span className="text-base font-medium text-slate-100">Title :</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-indigo-400/70"
                  placeholder="e.g. Build login page"
                />
              </label>

              <label className="block">
                <span className="text-base font-medium text-slate-100">Priority :</span>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  required
                  className="mt-2 w-full rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-indigo-400/70"
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </label>

              <label className="flex flex-col items-stretch">
                <span className="text-base font-medium text-slate-100">Description :</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="mt-2 min-h-[10.5rem] w-full resize-y rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-indigo-400/70"
                  placeholder="Optional…"
                />
              </label>

              <label className="flex flex-col items-start">
                <span className="text-base font-medium text-slate-100">Due Date :</span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="mt-2 box-border w-auto min-w-[10.5rem] rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5 outline-none focus:border-indigo-400/70 [color-scheme:dark]"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-500 px-3 py-2.5 text-base font-medium text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-400"
              >
                Add
              </button>
            </form>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mx-auto mt-4 w-full max-w-lg rounded-xl border border-red-500/50 bg-red-950/70 px-4 py-3 text-center text-sm font-medium text-red-400"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid grid-cols-1 items-start gap-6 px-1 md:grid-cols-3 md:gap-8 md:px-0">
          {(['TODO', 'IN_PROGRESS', 'DONE'] as TaskStatus[]).map((s) => (
            <section
              key={s}
              className="glass min-w-0 self-start rounded-3xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-800/60 px-4 py-3.5">
                <div className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {statusLabel(s)}
                </div>
                <div className="tabular-nums rounded-full border border-slate-700/60 bg-slate-950/50 px-2.5 py-0.5 text-xs font-medium text-slate-200">
                  {byStatus[s].length}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {loading ? (
                  <div className="rounded-2xl border border-dashed border-slate-800/80 bg-slate-950/20 px-4 py-8 text-center text-sm text-slate-500">
                    Loading…
                  </div>
                ) : byStatus[s].length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800/70 bg-slate-950/25 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-slate-400">No tasks yet</p>
                    <p className="mt-1 text-xs text-slate-600">Add one in the form above</p>
                  </div>
                ) : (
                  <ul className="m-0 list-none space-y-5 p-0">
                    {byStatus[s].map((t) => {
                      const accentP =
                        editingId === t.id && draft ? draft.priority : t.priority
                      return (
                      <li
                        key={t.id}
                        className="group flex min-h-0 w-full overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-950/90 via-slate-950/50 to-slate-950/30 shadow-lg shadow-black/30 ring-1 ring-inset ring-white/[0.04] transition duration-200 hover:border-slate-700/70 hover:shadow-xl hover:shadow-black/40"
                      >
                        <div
                          className={priorityStripClass(accentP)}
                          aria-hidden
                        />
                        <div className="min-w-0 flex-1 p-3 sm:p-4">
                        {editingId === t.id && draft ? (
                          <div className="space-y-3">
                            <label className="block">
                              <span className="text-base font-medium text-slate-100">Title :</span>
                              <input
                                value={draft.title}
                                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                required
                                className="mt-2 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-2 py-2 text-sm outline-none focus:border-indigo-400/70"
                              />
                            </label>

                            <label className="flex flex-col items-stretch">
                              <span className="text-base font-medium text-slate-100">Description :</span>
                              <textarea
                                value={draft.description}
                                onChange={(e) =>
                                  setDraft({ ...draft, description: e.target.value })
                                }
                                rows={6}
                                className="mt-2 min-h-[9rem] w-full resize-y rounded-lg border border-slate-700/80 bg-slate-950/70 px-2 py-2 text-sm outline-none focus:border-indigo-400/70"
                              />
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              <label className="block">
                                <span className="text-base font-medium text-slate-100">Status :</span>
                                <select
                                  value={draft.status}
                                  onChange={(e) =>
                                    setDraft({ ...draft, status: e.target.value as TaskStatus })
                                  }
                                  required
                                  className="mt-2 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-2 py-2 text-sm outline-none focus:border-indigo-400/70"
                                >
                                  <option value="TODO">Todo</option>
                                  <option value="IN_PROGRESS">In progress</option>
                                  <option value="DONE">Done</option>
                                </select>
                              </label>
                              <label className="block">
                                <span className="text-base font-medium text-slate-100">Priority :</span>
                                <select
                                  value={draft.priority}
                                  onChange={(e) =>
                                    setDraft({
                                      ...draft,
                                      priority: Number(e.target.value),
                                    })
                                  }
                                  required
                                  className="mt-2 w-full rounded-lg border border-slate-700/80 bg-slate-950/70 px-2 py-2 text-sm outline-none focus:border-indigo-400/70"
                                >
                                  <option value={1}>High</option>
                                  <option value={2}>Medium</option>
                                  <option value={3}>Low</option>
                                </select>
                              </label>
                            </div>

                            <label className="flex flex-col items-start">
                              <span className="text-base font-medium text-slate-100">Due Date :</span>
                              <input
                                type="date"
                                value={draft.dueDate}
                                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                                required
                                className="mt-2 box-border w-auto min-w-[10.5rem] rounded-lg border border-slate-700/80 bg-slate-950/70 px-2 py-2 text-sm outline-none focus:border-indigo-400/70 [color-scheme:dark]"
                              />
                            </label>

                            <div className="flex flex-wrap gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => void saveEdit(t)}
                                className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-900/30 transition hover:bg-indigo-400 active:scale-[0.98]"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-lg border border-slate-700/60 bg-slate-900/40 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 active:scale-[0.98]"
                              >
                                Cancel
                              </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800/50 pt-4">
                              {s !== 'TODO' ? (
                                <button
                                  type="button"
                                  onClick={() => void move(t, 'TODO')}
                                  className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 active:scale-[0.98]"
                                >
                                  To do
                                </button>
                              ) : null}
                              {s !== 'IN_PROGRESS' ? (
                                <button
                                  type="button"
                                  onClick={() => void move(t, 'IN_PROGRESS')}
                                  className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 active:scale-[0.98]"
                                >
                                  In progress
                                </button>
                              ) : null}
                              {s !== 'DONE' ? (
                                <button
                                  type="button"
                                  onClick={() => void move(t, 'DONE')}
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/25 transition hover:bg-emerald-500 active:scale-[0.98]"
                                >
                                  Mark done
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void move(t, 'IN_PROGRESS')}
                                  className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 active:scale-[0.98]"
                                >
                                  Reopen
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug tracking-tight text-slate-50 break-words">
                                  {t.title}
                                </h3>
                                <span
                                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider ring-1 ${priorityChipClass(t.priority)}`}
                                >
                                  {priorityLabel(t.priority)}
                                </span>
                              </div>

                              {t.description?.trim() ? (
                                <p className="rounded-xl border border-slate-800/60 bg-black/25 px-3 py-2.5 text-sm leading-relaxed text-slate-300 break-words">
                                  {t.description}
                                </p>
                              ) : (
                                <p className="rounded-xl border border-dashed border-slate-800/50 bg-slate-950/30 px-3 py-2.5 text-sm italic text-slate-600">
                                  No description
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                <span className="text-slate-500">Due</span>
                                <span className="font-medium text-slate-200 tabular-nums">
                                  {formatDueDate(t.dueDate)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 flex flex-col gap-3 border-t border-slate-800/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(t)}
                                  className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-500/40 hover:bg-indigo-950/30 hover:text-indigo-100 active:scale-[0.98]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void remove(t)}
                                  className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-red-500/40 hover:bg-red-950/35 hover:text-red-200 active:scale-[0.98]"
                                >
                                  Delete
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2 sm:justify-end">
                                {s !== 'TODO' ? (
                                  <button
                                    type="button"
                                    onClick={() => void move(t, 'TODO')}
                                    className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 active:scale-[0.98]"
                                  >
                                    To do
                                  </button>
                                ) : null}
                                {s !== 'IN_PROGRESS' ? (
                                  <button
                                    type="button"
                                    onClick={() => void move(t, 'IN_PROGRESS')}
                                    className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 active:scale-[0.98]"
                                  >
                                    In progress
                                  </button>
                                ) : null}
                                {s !== 'DONE' ? (
                                  <button
                                    type="button"
                                    onClick={() => void move(t, 'DONE')}
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-900/25 transition hover:bg-emerald-500 active:scale-[0.98]"
                                  >
                                    Mark done
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void move(t, 'IN_PROGRESS')}
                                    className="rounded-lg border border-slate-700/50 bg-slate-900/30 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/50 active:scale-[0.98]"
                                  >
                                    Reopen
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        </div>
                      </li>
                      )
                    })}
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

