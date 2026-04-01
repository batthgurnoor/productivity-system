import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError, type Task, type TaskStatus } from '../lib/api'
import { useAuth } from '../auth/useAuth'

function statusLabel(s: TaskStatus) {
  if (s === 'TODO') return 'Todo'
  if (s === 'IN_PROGRESS') return 'In progress'
  return 'Done'
}

type EditDraft = {
  title: string
  description: string
  status: TaskStatus
  priority: number
  dueDate: string // yyyy-mm-dd or ''
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
        description,
        status: 'TODO',
        priority,
        dueDate: dueDate ? dueDate : undefined,
      })
      setItems((prev) => [created, ...prev])
      setTitle('')
      setDescription('')
      setPriority(2)
      setDueDate('')
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
    setError(null)
    try {
      const updated = await api.updateTask(t.id, {
        title: trimmed,
        description: draft.description,
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate ? draft.dueDate : undefined,
      })
      setItems((prev) => prev.map((x) => (x.id === t.id ? updated : x)))
      cancelEdit()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update task')
    }
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
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
        >
          <div className="grid gap-3 md:grid-cols-3 md:items-end">
            <label className="md:col-span-2">
              <div className="text-sm text-slate-200">Title</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                placeholder="e.g. Build login page"
              />
            </label>

            <label>
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

            <label className="md:col-span-2">
              <div className="text-sm text-slate-200">Description</div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                placeholder="Optional…"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label>
                <div className="text-sm text-slate-200">Due date</div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-slate-500"
                />
              </label>
              <button className="mt-6 rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white hover:bg-indigo-400">
                Add
              </button>
            </div>
          </div>
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
                        {editingId === t.id && draft ? (
                          <div className="space-y-3">
                            <label className="block">
                              <div className="text-xs text-slate-300">Title</div>
                              <input
                                value={draft.title}
                                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none focus:border-slate-500"
                              />
                            </label>

                            <label className="block">
                              <div className="text-xs text-slate-300">Description</div>
                              <textarea
                                value={draft.description}
                                onChange={(e) =>
                                  setDraft({ ...draft, description: e.target.value })
                                }
                                rows={3}
                                className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none focus:border-slate-500"
                              />
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                              <label className="block">
                                <div className="text-xs text-slate-300">Status</div>
                                <select
                                  value={draft.status}
                                  onChange={(e) =>
                                    setDraft({ ...draft, status: e.target.value as TaskStatus })
                                  }
                                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none focus:border-slate-500"
                                >
                                  <option value="TODO">Todo</option>
                                  <option value="IN_PROGRESS">In progress</option>
                                  <option value="DONE">Done</option>
                                </select>
                              </label>
                              <label className="block">
                                <div className="text-xs text-slate-300">Priority</div>
                                <select
                                  value={draft.priority}
                                  onChange={(e) =>
                                    setDraft({
                                      ...draft,
                                      priority: Number(e.target.value),
                                    })
                                  }
                                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none focus:border-slate-500"
                                >
                                  <option value={1}>High</option>
                                  <option value={2}>Medium</option>
                                  <option value={3}>Low</option>
                                </select>
                              </label>
                            </div>

                            <label className="block">
                              <div className="text-xs text-slate-300">Due date</div>
                              <input
                                type="date"
                                value={draft.dueDate}
                                onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm outline-none focus:border-slate-500"
                              />
                            </label>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => void saveEdit(t)}
                                className="rounded-lg bg-indigo-500 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-400"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs hover:bg-slate-800"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate font-medium">{t.title}</div>
                              <div className="mt-1 text-xs text-slate-400">
                                Priority {t.priority}
                                {t.dueDate ? ` • Due ${t.dueDate}` : ''}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(t)}
                                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs hover:bg-slate-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => void remove(t)}
                                className="rounded-lg border border-slate-800 bg-slate-900 px-2 py-1 text-xs hover:bg-slate-800"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}

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

