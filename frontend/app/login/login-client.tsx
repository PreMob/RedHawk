"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Eye, EyeOff, LockKeyhole, LogIn, ShieldCheck, UserPlus } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthMode = "login" | "register"

export function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, register, isAuthenticated, isLoading } = useAuth()
  const [mode, setMode] = useState<AuthMode>("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextPath = useMemo(() => {
    const next = searchParams.get("next")
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(nextPath)
    }
  }, [isAuthenticated, isLoading, nextPath, router])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (mode === "register") {
        await register(name, email, password)
      } else {
        await login(email, password)
      }

      router.replace(nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-red-900/30 bg-[radial-gradient(circle_at_40%_20%,rgba(127,29,29,0.35),transparent_36%),linear-gradient(140deg,#050505,#16070a_52%,#020202)] p-10 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="RedHawk" width={48} height={48} className="rounded-xl" />
            <div>
              <p className="text-xl font-bold">RedHawk</p>
              <p className="text-sm text-gray-400">Security Dashboard</p>
            </div>
          </Link>

          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-red-900/40 bg-black/50 px-3 py-2 text-sm text-red-200">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              Protected analyst access
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Sign in before touching live security data.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-gray-300">
              Register a workspace analyst account, then access log analysis, URL scans, AI briefing, and response workflows behind a verified token.
            </p>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-3">
            {["Token gate", "Password hashing", "Mongo users"].map((item) => (
              <div key={item} className="rounded-md border border-red-900/30 bg-black/45 p-3 text-sm text-gray-300">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <Image src="/logo.png" alt="RedHawk" width={46} height={46} className="rounded-xl" />
              <div>
                <p className="text-lg font-bold">RedHawk</p>
                <p className="text-xs text-gray-400">Security Dashboard</p>
              </div>
            </div>

            <Card className="border-red-900/30 bg-zinc-950 text-white">
              <CardHeader className="space-y-5">
                <div className="flex rounded-md border border-red-900/30 bg-black p-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className={`h-10 flex-1 text-sm hover:bg-red-950 hover:text-white ${mode === "login" ? "bg-red-950 text-white" : "text-gray-400"}`}
                    onClick={() => setMode("login")}
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className={`h-10 flex-1 text-sm hover:bg-red-950 hover:text-white ${mode === "register" ? "bg-red-950 text-white" : "text-gray-400"}`}
                    onClick={() => setMode("register")}
                  >
                    <UserPlus className="h-4 w-4" />
                    Register
                  </Button>
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <LockKeyhole className="h-6 w-6 text-red-500" />
                    {mode === "login" ? "Welcome back" : "Create access"}
                  </CardTitle>
                  <p className="mt-2 text-sm text-gray-400">
                    {mode === "login"
                      ? "Use your RedHawk analyst account to continue."
                      : "Create a secure analyst account for this RedHawk workspace."}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submit}>
                  {mode === "register" && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        className="border-red-900/30 bg-black text-white focus-visible:ring-red-500"
                        autoComplete="name"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="border-red-900/30 bg-black text-white focus-visible:ring-red-500"
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="border-red-900/30 bg-black pr-11 text-white focus-visible:ring-red-500"
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                        minLength={8}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1 h-8 w-8 text-gray-400 hover:bg-red-950 hover:text-white"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-md border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-11 w-full bg-red-600 text-white hover:bg-red-700"
                    disabled={isSubmitting || isLoading}
                  >
                    {mode === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                    {isSubmitting ? "Securing..." : mode === "login" ? "Sign in" : "Create account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
