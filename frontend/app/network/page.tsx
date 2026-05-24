"use client"

import { Activity, Network, Route, Signal } from "lucide-react"
import { DashboardLayout } from "../dashboard/layout-dashboard"
import { AttackGraph } from "../dashboard/_components/attack-graph"
import { DataPanel, MetricCard, OpsHeader, PageState, SeverityBadge } from "@/app/_components/ops-widgets"
import { useLogAnalysis } from "@/hooks/use-log-analysis"
import { mockLinks, mockNodes } from "@/lib/mock-data"

export default function NetworkPage() {
  const { threats, loading, error } = useLogAnalysis()
  const flows = threats.slice(0, 12).map((threat) => ({
    source: threat.sourceIp,
    destination: threat.destinationIp,
    type: threat.type,
    severity: threat.severity,
    status: threat.status,
  }))
  const uniqueSources = new Set(flows.map((flow) => flow.source)).size
  const uniqueDestinations = new Set(flows.map((flow) => flow.destination)).size

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <OpsHeader
          icon={<Network className="h-6 w-6 text-red-500" />}
          title="Network"
          subtitle="Traffic paths, source concentration, and active security flow context."
        />

        <PageState loading={loading} error={error} empty={!flows.length ? "No network flows are available until log analysis data is loaded." : undefined} />

        {!loading && !error && flows.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Tracked Flows" value={flows.length} icon={<Route className="h-5 w-5 text-cyan-400" />} tone="cyan" />
              <MetricCard label="Sources" value={uniqueSources} icon={<Signal className="h-5 w-5 text-amber-400" />} tone="amber" />
              <MetricCard label="Targets" value={uniqueDestinations} icon={<Network className="h-5 w-5 text-red-500" />} tone="red" />
              <MetricCard label="Active Alerts" value={flows.filter((flow) => flow.status === "active").length} icon={<Activity className="h-5 w-5 text-green-400" />} tone="green" />
            </div>

            <AttackGraph nodes={mockNodes} links={mockLinks} />

            <DataPanel title="Recent Flow Table" icon={<Route className="h-5 w-5 text-cyan-400" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-900/30 text-left text-xs uppercase text-gray-500">
                      <th className="px-3 py-3">Source</th>
                      <th className="px-3 py-3">Destination</th>
                      <th className="px-3 py-3">Signal</th>
                      <th className="px-3 py-3">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/20">
                    {flows.map((flow, index) => (
                      <tr key={`${flow.source}-${flow.destination}-${index}`} className="text-gray-300">
                        <td className="px-3 py-4 font-mono">{flow.source}</td>
                        <td className="px-3 py-4 font-mono">{flow.destination}</td>
                        <td className="px-3 py-4 text-white">{flow.type}</td>
                        <td className="px-3 py-4"><SeverityBadge severity={flow.severity} /></td>
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
