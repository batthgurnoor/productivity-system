import { useCallback, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { clearAccessToken, getAccessToken, setAccessToken } from '../lib/storage'
import type { AuthContextValue } from './AuthContextValue'
import { AuthContext } from './AuthContext'

type AuthState = { token: string | null }

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: getAccessToken() })

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    setAccessToken(res.accessToken)
    setState({ token: res.accessToken })
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.register(email, password)
    setAccessToken(res.accessToken)
    setState({ token: res.accessToken })
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
    setState({ token: null })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      token: state.token,
      isAuthed: Boolean(state.token),
      login,
      register,
      logout,
    }),
    [login, logout, register, state.token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

