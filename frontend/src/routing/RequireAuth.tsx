import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function RequireAuth() {
  const { isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/auth" replace />
  return <Outlet />
}

