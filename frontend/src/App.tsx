import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import TasksPage from './pages/TasksPage'
import RequireAuth from './routing/RequireAuth'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/tasks" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  )
}
