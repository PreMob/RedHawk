"use client"

import { KeyRound, ShieldCheck, UserCog, Users } from "lucide-react"
import { DashboardLayout } from "../dashboard/layout-dashboard"
import { DataPanel, MetricCard, OpsHeader, PageState, SeverityBadge } from "@/app/_components/ops-widgets"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

export default function UsersPage() {
  const { threats, loading, error } = useLogAnalysis()
  const sourceCounts = new Map<string, { ip: string; events: number; severity: "critical" | "high" | "medium" | "low" }>()
  const severityRank = { critical: 0, high: 1, medium: 2, low: 3 }

  threats.forEach((threat) => {
    const current = sourceCounts.get(threat.sourceIp) || {
      ip: threat.sourceIp,
      events: 0,
      severity: "low" as const,
    }
    current.events += 1
    if (severityRank[threat.severity] < severityRank[current.severity]) current.severity = threat.severity
    sourceCounts.set(threat.sourceIp, current)
  })

  const identities = Array.from(sourceCounts.values())
    .sort((a, b) => b.events - a.events)
    .map((source, index) => ({
      id: `analyst-${index + 1}`,
      name: index === 0 ? "Primary watchlist source" : `Observed source ${index + 1}`,
      principal: source.ip,
      events: source.events,
      severity: source.severity,
      access: source.severity === "critical" || source.severity === "high" ? "restricted" : "monitored",
    }))

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <OpsHeader
          icon={<Users className="h-6 w-6 text-red-500" />}
          title="Users"
          subtitle="Identity and source-risk view for access review and analyst triage."
        />

        <PageState loading={loading} error={error} empty={!identities.length ? "No user or source entities are available until log data is loaded." : undefined} />

        {!loading && !error && identities.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Observed Principals" value={identities.length} icon={<Users className="h-5 w-5 text-cyan-400" />} tone="cyan" />
              <MetricCard label="Restricted" value={identities.filter((item) => item.access === "restricted").length} icon={<KeyRound className="h-5 w-5 text-red-500" />} tone="red" />
              <MetricCard label="Monitored" value={identities.filter((item) => item.access === "monitored").length} icon={<ShieldCheck className="h-5 w-5 text-green-400" />} tone="green" />
              <MetricCard label="Events" value={identities.reduce((sum, item) => sum + item.events, 0)} icon={<UserCog className="h-5 w-5 text-amber-400" />} tone="amber" />
            </div>

            <DataPanel title="Access Review Queue" icon={<UserCog className="h-5 w-5 text-red-500" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-900/30 text-left text-xs uppercase text-gray-500">
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Principal</th>
                      <th className="px-3 py-3">Events</th>
                      <th className="px-3 py-3">Risk</th>
                      <th className="px-3 py-3">Access State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/20">
                    {identities.map((identity) => (
                      <tr key={identity.id} className="text-gray-300">
                        <td className="px-3 py-4 font-medium text-white">{identity.name}</td>
                        <td className="px-3 py-4 font-mono">{identity.principal}</td>
                        <td className="px-3 py-4">{identity.events}</td>
                        <td className="px-3 py-4"><SeverityBadge severity={identity.severity} /></td>
                        <td className="px-3 py-4 capitalize">{identity.access}</td>
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
