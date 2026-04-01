export type AuthContextValue = {
  token: string | null
  isAuthed: boolean
  login(email: string, password: string): Promise<void>
  register(email: string, password: string): Promise<void>
  logout(): void
}

