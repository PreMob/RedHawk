import type { ReactNode } from "react"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Tone = "red" | "amber" | "cyan" | "green" | "gray"

const toneClasses: Record<Tone, string> = {
  red: "border-red-900/30 bg-red-950/10 text-red-200",
  amber: "border-amber-900/30 bg-amber-950/10 text-amber-200",
  cyan: "border-cyan-900/30 bg-cyan-950/10 text-cyan-200",
  green: "border-green-900/30 bg-green-950/10 text-green-200",
  gray: "border-red-900/30 bg-black text-gray-200",
}

export function OpsHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="flex items-center gap-3">
          {icon}
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        {subtitle && <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "gray",
}: {
  label: string
  value: string | number
  detail?: string
  icon?: ReactNode
  tone?: Tone
}) {
  return (
    <Card className={cn("border bg-black", toneClasses[tone])}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-400">{label}</p>
          {icon}
        </div>
        <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        {detail && <p className="mt-1 text-sm text-gray-500">{detail}</p>}
      </CardContent>
    </Card>
  )
}

export function SeverityBadge({ severity }: { severity: string }) {
  const normalized = severity.toLowerCase()

  if (normalized === "critical") {
    return <Badge variant="outline" className="border-red-500 bg-red-950/30 text-red-300">critical</Badge>
  }

  if (normalized === "high") {
    return <Badge variant="outline" className="border-amber-500 bg-amber-950/30 text-amber-300">high</Badge>
  }

  if (normalized === "medium") {
    return <Badge variant="outline" className="border-cyan-500 bg-cyan-950/30 text-cyan-300">medium</Badge>
  }

  return <Badge variant="outline" className="border-green-500 bg-green-950/30 text-green-300">low</Badge>
}

export function DataPanel({
  title,
  icon,
  children,
  className,
}: {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn("border-red-900/30 bg-black", className)}>
      <CardHeader className="px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5">{children}</CardContent>
    </Card>
  )
}

export function PageState({
  loading,
  error,
  empty,
}: {
  loading?: boolean
  error?: string | null
  empty?: string
}) {
  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-md border border-red-900/30 bg-black text-gray-300">
        <Loader2 className="mr-2 h-5 w-5 animate-spin text-red-500" />
        Loading security data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-md border border-red-900/30 bg-red-950/10 p-6 text-red-200">
        <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
        {error}
      </div>
    )
  }

  if (empty) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-md border border-red-900/30 bg-black p-6 text-gray-400">
        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
        {empty}
      </div>
    )
  }

  return null
}
