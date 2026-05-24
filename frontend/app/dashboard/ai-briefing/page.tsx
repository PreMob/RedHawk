"use client"

import { DashboardLayout } from "../layout-dashboard"
import { useAiBriefing, type AttackPathStep, type BriefingSignal } from "@/hooks/use-ai-briefing"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Database,
  FileSearch,
  Globe2,
  ListChecks,
  Loader2,
  Radar,
  RefreshCw,
  Route,
  SearchCode,
  ShieldAlert,
  Sparkles,
  Target,
  Zap,
} from "lucide-react"

type Severity = "critical" | "high" | "medium" | "low"

const severityStyles: Record<Severity, string> = {
  critical: "border-red-500/60 bg-red-950/40 text-red-200",
  high: "border-amber-500/60 bg-amber-950/30 text-amber-200",
  medium: "border-cyan-500/60 bg-cyan-950/30 text-cyan-200",
  low: "border-emerald-500/60 bg-emerald-950/30 text-emerald-200",
}

const severityDots: Record<Severity, string> = {
  critical: "bg-red-500",
  high: "bg-amber-500",
  medium: "bg-cyan-500",
  low: "bg-emerald-500",
}

const riskColors: Record<Severity, string> = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#06b6d4",
  low: "#10b981",
}

function formatDate(value: string | null) {
  if (!value) return "Not available"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Not available"
  return date.toLocaleString()
}

function SignalTile({ signal }: { signal: BriefingSignal }) {
  return (
    <div className={`min-h-[132px] rounded-md border p-4 ${severityStyles[signal.severity]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white">{signal.label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${severityDots[signal.severity]}`} />
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{signal.value}</p>
      <p className="mt-2 text-sm leading-5 text-gray-300">{signal.detail}</p>
    </div>
  )
}

function AttackPathRow({ step, index }: { step: AttackPathStep; index: number }) {
  return (
    <div className="grid gap-4 border-b border-red-900/20 py-5 last:border-0 md:grid-cols-[120px_1fr_180px]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-red-900/40 bg-red-950/30 text-sm font-semibold text-red-200">
          {index + 1}
        </div>
        <div>
          <p className="text-xs uppercase text-gray-500">{step.phase}</p>
          <Badge variant="outline" className={severityStyles[step.severity]}>
            {step.severity}
          </Badge>
        </div>
      </div>
      <div>
        <p className="font-semibold text-white">{step.title}</p>
        <p className="mt-1 text-sm leading-6 text-gray-400">{step.description}</p>
      </div>
      <div className="rounded-md border border-red-900/30 bg-black/60 p-3 text-sm text-gray-300">
        {step.evidence}
      </div>
    </div>
  )
}

export default function AiBriefingPage() {
  const { briefing, loading, error, refetch } = useAiBriefing()

  const riskLevel = briefing?.riskLevel ?? "medium"
  const riskColor = riskColors[riskLevel]

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-cyan-400" />
              <h1 className="text-2xl font-bold text-white">AI Threat Briefing</h1>
            </div>
            {briefing && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={severityStyles[briefing.riskLevel]}>
                  {briefing.riskLevel} risk
                </Badge>
                <Badge variant="outline" className="border-cyan-900/60 bg-cyan-950/20 text-cyan-200">
                  {briefing.mode === "live-intelligence" ? "live context" : "demo context"}
                </Badge>
                <span className="text-sm text-gray-500">Generated {formatDate(briefing.generatedAt)}</span>
              </div>
            )}
          </div>
          <Button onClick={refetch} disabled={loading} className="bg-red-600 text-white hover:bg-red-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {loading && (
          <Card className="border-red-900/30 bg-black">
            <CardContent className="flex min-h-[260px] items-center justify-center">
              <div className="flex items-center gap-3 text-gray-300">
                <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                Generating threat briefing...
              </div>
            </CardContent>
          </Card>
        )}

        {error && !loading && (
          <Card className="border-red-900/30 bg-black">
            <CardContent className="flex items-start gap-3 p-6 text-red-200">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {briefing && !loading && (
          <>
            <div className="grid gap-4 lg:grid-cols-[320px_1fr_320px]">
              <Card className="border-red-900/30 bg-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    Risk Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div
                    className="flex h-44 w-44 items-center justify-center rounded-full p-3"
                    style={{
                      background: `conic-gradient(${riskColor} ${briefing.riskScore * 3.6}deg, rgba(127, 29, 29, 0.28) 0deg)`,
                    }}
                  >
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-black">
                      <span className="text-5xl font-bold text-white">{briefing.riskScore}</span>
                      <span className="text-sm uppercase text-gray-500">{briefing.riskLevel}</span>
                    </div>
                  </div>
                  <div className="mt-5 grid w-full grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md border border-red-900/30 bg-red-950/10 p-3">
                      <p className="text-gray-500">Confidence</p>
                      <p className="text-xl font-semibold text-white">{briefing.confidence}%</p>
                    </div>
                    <div className="rounded-md border border-red-900/30 bg-red-950/10 p-3">
                      <p className="text-gray-500">High Findings</p>
                      <p className="text-xl font-semibold text-white">{briefing.metrics.highVulnerabilities}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-900/30 bg-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    {briefing.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <p className="text-base leading-7 text-gray-200">{briefing.executiveSummary}</p>
                  <div className="rounded-md border border-cyan-900/30 bg-cyan-950/10 p-4">
                    <p className="text-sm leading-6 text-gray-300">{briefing.incidentNarrative}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-md bg-red-950/10 p-3">
                      <p className="text-xs text-gray-500">Attack</p>
                      <p className="text-lg font-semibold text-white">{briefing.metrics.percentages.attack.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-md bg-red-950/10 p-3">
                      <p className="text-xs text-gray-500">Probe</p>
                      <p className="text-lg font-semibold text-white">{briefing.metrics.percentages.probe.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-md bg-red-950/10 p-3">
                      <p className="text-xs text-gray-500">Anomaly</p>
                      <p className="text-lg font-semibold text-white">{briefing.metrics.percentages.anomaly.toFixed(1)}%</p>
                    </div>
                    <div className="rounded-md bg-red-950/10 p-3">
                      <p className="text-xs text-gray-500">Sources</p>
                      <p className="text-lg font-semibold text-white">{briefing.metrics.topSources.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-900/30 bg-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Database className="h-5 w-5 text-amber-400" />
                    Context
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <FileSearch className="mt-0.5 h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-gray-500">Log File</p>
                      <p className="break-all text-white">{briefing.sourceContext.logFile}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe2 className="mt-0.5 h-4 w-4 text-cyan-400" />
                    <div>
                      <p className="text-gray-500">Scan Target</p>
                      <p className="break-all text-white">{briefing.sourceContext.scanTarget || "Not available"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-amber-400" />
                    <div>
                      <p className="text-gray-500">Latest Log</p>
                      <p className="text-white">{formatDate(briefing.sourceContext.logTimestamp)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="mt-0.5 h-4 w-4 text-emerald-400" />
                    <div>
                      <p className="text-gray-500">Latest Scan</p>
                      <p className="text-white">{formatDate(briefing.sourceContext.scanTimestamp)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {briefing.signals.map((signal) => (
                <SignalTile key={signal.label} signal={signal} />
              ))}
            </div>

            <Card className="border-red-900/30 bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Route className="h-5 w-5 text-cyan-400" />
                  Probable Attack Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                {briefing.attackPath.map((step, index) => (
                  <AttackPathRow key={`${step.phase}-${index}`} step={step} index={index} />
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="border-red-900/30 bg-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <ListChecks className="h-5 w-5 text-emerald-400" />
                    Response Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {briefing.priorityActions.map((action, index) => (
                    <div key={`${action.title}-${index}`} className="rounded-md border border-red-900/30 bg-red-950/10 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-semibold text-white">{action.title}</p>
                          <p className="mt-1 text-sm leading-6 text-gray-400">{action.rationale}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Badge variant="outline" className="border-cyan-900/60 text-cyan-200">
                            {action.owner}
                          </Badge>
                          <Badge variant="outline" className="border-amber-900/60 text-amber-200">
                            {action.effort}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-3 flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        {action.impact}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-red-900/30 bg-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Target className="h-5 w-5 text-red-500" />
                    AI Lens
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {briefing.aiLens.map((item) => (
                    <div key={item.question} className="rounded-md border border-cyan-900/30 bg-cyan-950/10 p-4">
                      <p className="text-sm font-medium text-cyan-200">{item.question}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">{item.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-red-900/30 bg-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <SearchCode className="h-5 w-5 text-amber-400" />
                  Detection Ideas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                {briefing.detectionIdeas.map((idea) => (
                  <div key={idea.name} className="rounded-md border border-red-900/30 bg-black/70 p-4">
                    <p className="flex items-center gap-2 font-semibold text-white">
                      <Radar className="h-4 w-4 text-red-500" />
                      {idea.name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{idea.description}</p>
                    <pre className="mt-4 overflow-x-auto rounded-md border border-red-900/30 bg-red-950/10 p-3 text-xs leading-5 text-cyan-100">
                      {idea.query}
                    </pre>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              {briefing.metrics.topSources.map((source) => (
                <div key={source.ip} className="rounded-md border border-red-900/30 bg-black p-4">
                  <p className="flex items-center gap-2 text-sm text-gray-400">
                    <Zap className="h-4 w-4 text-red-500" />
                    Source Cluster
                  </p>
                  <p className="mt-2 font-mono text-lg text-white">{source.ip}</p>
                  <p className="mt-1 text-sm text-gray-500">{source.count} events · {source.severity}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
