export interface AuthUser {
  id: string
  name: string
  email: string
  role: "analyst" | "admin"
  createdAt?: string
  lastLoginAt?: string | null
}

export interface AuthSession {
  user: AuthUser
  token: string
}

const AUTH_STORAGE_KEY = "redhawk.auth.session"
export const AUTH_COOKIE_NAME = "redhawk_auth_token"
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

function writeAuthCookie(token: string) {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`
}

function clearAuthCookie() {
  if (typeof document === "undefined") return
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
}

export function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  try {
    const value = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!value) return null

    const session = JSON.parse(value) as AuthSession
    if (!session?.token || !session?.user?.email) return null

    return session
  } catch (error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function storeSession(session: AuthSession) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  writeAuthCookie(session.token)
}

export function clearStoredSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  clearAuthCookie()
}

export function getAuthToken() {
  return readStoredSession()?.token || null
}

export function authHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers)
  const token = getAuthToken()

  if (token) {
    nextHeaders.set("Authorization", `Bearer ${token}`)
  }

  return nextHeaders
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const response = await fetch(input, {
    ...init,
    headers: authHeaders(init.headers),
  })

  if (response.status === 401 && typeof window !== "undefined") {
    clearStoredSession()
    window.dispatchEvent(new CustomEvent("redhawk:auth-expired"))
  }

  return response
}
