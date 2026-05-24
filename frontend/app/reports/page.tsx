"use client"

import { BarChart2, FileText, ListChecks, ShieldAlert } from "lucide-react"
import { DashboardLayout } from "../dashboard/layout-dashboard"
import { DataPanel, MetricCard, OpsHeader, PageState } from "@/app/_components/ops-widgets"
import { useAiBriefing } from "@/hooks/use-ai-briefing"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

export default function ReportsPage() {
  const { summary, threats, loading: logsLoading, error: logsError } = useLogAnalysis()
  const { briefing, loading: briefingLoading, error: briefingError } = useAiBriefing()
  const loading = logsLoading || briefingLoading
  const error = logsError || briefingError

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <OpsHeader
          icon={<BarChart2 className="h-6 w-6 text-red-500" />}
          title="Reports"
          subtitle="Executive security summary, response priorities, and detection coverage."
        />

        <PageState loading={loading} error={error} empty={!summary && !briefing ? "No report data is available yet." : undefined} />

        {!loading && !error && (summary || briefing) && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Risk Score" value={briefing?.riskScore ?? "N/A"} icon={<ShieldAlert className="h-5 w-5 text-red-500" />} tone="red" />
              <MetricCard label="Confidence" value={briefing ? `${briefing.confidence}%` : "N/A"} icon={<BarChart2 className="h-5 w-5 text-cyan-400" />} tone="cyan" />
              <MetricCard label="Records" value={summary?.totalRecords || 0} icon={<FileText className="h-5 w-5 text-green-400" />} tone="green" />
              <MetricCard label="Threat Rows" value={threats.length} icon={<ListChecks className="h-5 w-5 text-amber-400" />} tone="amber" />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <DataPanel title="Executive Summary" icon={<FileText className="h-5 w-5 text-cyan-400" />}>
                <div className="space-y-4 text-sm leading-6 text-gray-300">
                  <p>{briefing?.executiveSummary || summary?.textSummary}</p>
                  {briefing?.incidentNarrative && (
                    <p className="rounded-md border border-cyan-900/30 bg-cyan-950/10 p-4">{briefing.incidentNarrative}</p>
                  )}
                </div>
              </DataPanel>

              <DataPanel title="Priority Actions" icon={<ListChecks className="h-5 w-5 text-green-400" />}>
                <div className="space-y-3">
                  {(briefing?.priorityActions || summary?.recommendedActions?.map((action) => ({
                    title: action,
                    rationale: "Recommended by the latest analysis",
                    owner: "Security",
                    effort: "Today",
                    impact: "Improves current security posture",
                  })) || []).slice(0, 5).map((action) => (
                    <div key={action.title} className="rounded-md border border-red-900/30 bg-red-950/10 p-3">
                      <p className="font-medium text-white">{action.title}</p>
                      <p className="mt-1 text-sm text-gray-400">{action.impact}</p>
                    </div>
                  ))}
                </div>
              </DataPanel>
            </div>

            {briefing?.detectionIdeas && (
              <DataPanel title="Detection Coverage" icon={<ShieldAlert className="h-5 w-5 text-red-500" />}>
                <div className="grid gap-4 lg:grid-cols-3">
                  {briefing.detectionIdeas.map((idea) => (
                    <div key={idea.name} className="rounded-md border border-red-900/30 bg-black/70 p-4">
                      <p className="font-semibold text-white">{idea.name}</p>
                      <p className="mt-2 text-sm text-gray-400">{idea.description}</p>
                      <pre className="mt-3 overflow-x-auto rounded-md bg-red-950/10 p-3 text-xs text-cyan-100">{idea.query}</pre>
                    </div>
                  ))}
                </div>
              </DataPanel>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
