import { env } from './env'
import { getAccessToken } from './storage'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${env.apiBaseUrl}${path}`, { ...init, headers })
  const text = await res.text()
  const body = text ? (JSON.parse(text) as unknown) : null

  if (!res.ok) {
    const message = extractMessage(body) ?? `Request failed (${res.status})`
    throw new ApiError(message, res.status, body)
  }
  return body as T
}

function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null
  if (!('message' in body)) return null
  const msg = (body as { message?: unknown }).message
  return typeof msg === 'string' ? msg : msg != null ? String(msg) : null
}

export type AuthResponse = { accessToken: string }
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'
export type Task = {
  id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: number
  dueDate: string | null
  createdAt: string
  updatedAt: string | null
  completedAt: string | null
}

export type AnalyticsSummary = {
  from: string
  to: string
  createdInRange: number
  completedInRange: number
  overdueNotDone: number
  byStatus: {
    TODO: number
    IN_PROGRESS: number
    DONE: number
  }
  completionsByDay: { date: string; count: number }[]
}

export const api = {
  register: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  listTasks: () => request<Task[]>('/api/tasks'),
  createTask: (input: {
    title: string
    description?: string
    status: TaskStatus
    priority: number
    dueDate: string
  }) =>
    request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: input.title,
        description: input.description ?? '',
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
      }),
    }),
  updateTask: (
    id: number,
    input: {
      title: string
      description?: string
      status: TaskStatus
      priority: number
      dueDate: string
    },
  ) =>
    request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        title: input.title,
        description: input.description ?? '',
        status: input.status,
        priority: input.priority,
        dueDate: input.dueDate,
      }),
    }),
  deleteTask: (id: number) =>
    request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
  analyticsSummary: (params?: { from?: string; to?: string }) => {
    const q = new URLSearchParams()
    if (params?.from) q.set('from', params.from)
    if (params?.to) q.set('to', params.to)
    const qs = q.toString()
    const suffix = qs ? `?${qs}` : ''
    return request<AnalyticsSummary>(`/api/analytics/summary${suffix}`)
  },
}

