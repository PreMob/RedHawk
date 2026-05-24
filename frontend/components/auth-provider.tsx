"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  clearStoredSession,
  readStoredSession,
  storeSession,
  type AuthSession,
  type AuthUser,
} from "@/lib/auth-client"

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => void
  refreshUser: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function parseAuthResponse(response: Response): Promise<AuthSession> {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || "Authentication failed")
  }

  if (!data.token || !data.user) {
    throw new Error("Authentication response was incomplete")
  }

  return data as AuthSession
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setActiveSession = useCallback((nextSession: AuthSession) => {
    storeSession(nextSession)
    setSession(nextSession)
  }, [])

  const logout = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const storedSession = readStoredSession()

    if (!storedSession) {
      logout()
      return null
    }

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${storedSession.token}`,
          Accept: "application/json",
        },
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.user) {
        logout()
        return null
      }

      const refreshedSession = {
        token: storedSession.token,
        user: data.user as AuthUser,
      }
      setActiveSession(refreshedSession)
      return refreshedSession.user
    } catch (error) {
      logout()
      return null
    }
  }, [logout, setActiveSession])

  useEffect(() => {
    const handleAuthExpired = () => {
      setSession(null)
    }

    window.addEventListener("redhawk:auth-expired", handleAuthExpired)

    const boot = async () => {
      const storedSession = readStoredSession()

      if (!storedSession) {
        setIsLoading(false)
        return
      }

      setSession(storedSession)
      await refreshUser()
      setIsLoading(false)
    }

    boot()

    return () => {
      window.removeEventListener("redhawk:auth-expired", handleAuthExpired)
    }
  }, [refreshUser])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const nextSession = await parseAuthResponse(response)
      setActiveSession(nextSession)
      return nextSession.user
    },
    [setActiveSession],
  )

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const nextSession = await parseAuthResponse(response)
      setActiveSession(nextSession)
      return nextSession.user
    },
    [setActiveSession],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user || null,
      token: session?.token || null,
      isAuthenticated: Boolean(session?.token && session?.user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }
  return context
}
