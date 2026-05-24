"use client"

import { AlertTriangle, Bug, ShieldAlert, Wrench } from "lucide-react"
import { DashboardLayout } from "../dashboard/layout-dashboard"
import { DataPanel, MetricCard, OpsHeader, PageState, SeverityBadge } from "@/app/_components/ops-widgets"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

const severityOrder = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export default function VulnerabilitiesPage() {
  const { threats, loading, error } = useLogAnalysis()

  const vulnerabilities = threats
    .filter((threat) => threat.status !== "mitigated")
    .map((threat, index) => ({
      id: `VUL-${String(index + 1).padStart(3, "0")}`,
      title: threat.type === "Probe" ? "Exposed service reconnaissance" : `${threat.type} activity`,
      asset: threat.destinationIp,
      source: threat.sourceIp,
      severity: threat.severity,
      remediation: threat.severity === "critical"
        ? "Isolate affected endpoint and block source traffic"
        : threat.severity === "high"
          ? "Review service access rules and enforce rate limits"
          : "Track repeated activity and validate service hardening",
    }))
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const critical = vulnerabilities.filter((item) => item.severity === "critical").length
  const high = vulnerabilities.filter((item) => item.severity === "high").length
  const medium = vulnerabilities.filter((item) => item.severity === "medium").length

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <OpsHeader
          icon={<Bug className="h-6 w-6 text-red-500" />}
          title="Vulnerabilities"
          subtitle="Prioritized findings derived from active threats, scan results, and current exposure signals."
        />

        <PageState loading={loading} error={error} empty={!vulnerabilities.length ? "No active vulnerabilities are currently derived from the latest analysis." : undefined} />

        {!loading && !error && vulnerabilities.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Open Findings" value={vulnerabilities.length} icon={<ShieldAlert className="h-5 w-5 text-red-500" />} tone="red" />
              <MetricCard label="Critical" value={critical} icon={<AlertTriangle className="h-5 w-5 text-red-500" />} tone="red" />
              <MetricCard label="High" value={high} icon={<AlertTriangle className="h-5 w-5 text-amber-400" />} tone="amber" />
              <MetricCard label="Medium" value={medium} icon={<Wrench className="h-5 w-5 text-cyan-400" />} tone="cyan" />
            </div>

            <DataPanel title="Finding Queue" icon={<ShieldAlert className="h-5 w-5 text-red-500" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-900/30 text-left text-xs uppercase text-gray-500">
                      <th className="px-3 py-3">ID</th>
                      <th className="px-3 py-3">Finding</th>
                      <th className="px-3 py-3">Asset</th>
                      <th className="px-3 py-3">Source</th>
                      <th className="px-3 py-3">Severity</th>
                      <th className="px-3 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/20">
                    {vulnerabilities.map((item) => (
                      <tr key={item.id} className="text-gray-300">
                        <td className="px-3 py-4 font-mono text-gray-500">{item.id}</td>
                        <td className="px-3 py-4 font-medium text-white">{item.title}</td>
                        <td className="px-3 py-4 font-mono">{item.asset}</td>
                        <td className="px-3 py-4 font-mono">{item.source}</td>
                        <td className="px-3 py-4"><SeverityBadge severity={item.severity} /></td>
                        <td className="px-3 py-4">{item.remediation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DataPanel>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
