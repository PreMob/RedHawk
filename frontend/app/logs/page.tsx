"use client"

import { Clock, FileText, Search, ShieldAlert } from "lucide-react"
import { DashboardLayout } from "../dashboard/layout-dashboard"
import { DataPanel, MetricCard, OpsHeader, PageState, SeverityBadge } from "@/app/_components/ops-widgets"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

export default function LogsPage() {
  const { threats, summary, loading, error } = useLogAnalysis()
  const activeLogs = threats.filter((threat) => threat.status === "active")

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <OpsHeader
          icon={<FileText className="h-6 w-6 text-red-500" />}
          title="Logs"
          subtitle="Security event stream normalized from the latest uploaded analysis."
        />

        <PageState loading={loading} error={error} empty={!threats.length ? "No log events are available until analysis data is loaded." : undefined} />

        {!loading && !error && threats.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Records Analyzed" value={summary?.totalRecords || threats.length} icon={<FileText className="h-5 w-5 text-cyan-400" />} tone="cyan" />
              <MetricCard label="Visible Events" value={threats.length} icon={<Search className="h-5 w-5 text-green-400" />} tone="green" />
              <MetricCard label="Active Alerts" value={activeLogs.length} icon={<ShieldAlert className="h-5 w-5 text-red-500" />} tone="red" />
              <MetricCard label="Latest Event" value={threats[0]?.timestamp?.slice(11, 19) || "N/A"} icon={<Clock className="h-5 w-5 text-amber-400" />} tone="amber" />
            </div>

            <DataPanel title="Event Stream" icon={<FileText className="h-5 w-5 text-red-500" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-900/30 text-left text-xs uppercase text-gray-500">
                      <th className="px-3 py-3">Timestamp</th>
                      <th className="px-3 py-3">Source</th>
                      <th className="px-3 py-3">Destination</th>
                      <th className="px-3 py-3">Type</th>
                      <th className="px-3 py-3">Severity</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/20">
                    {threats.map((threat) => (
                      <tr key={threat.id} className="text-gray-300">
                        <td className="px-3 py-4 font-mono text-gray-500">{threat.timestamp}</td>
                        <td className="px-3 py-4 font-mono">{threat.sourceIp}</td>
                        <td className="px-3 py-4 font-mono">{threat.destinationIp}</td>
                        <td className="px-3 py-4 text-white">{threat.type}</td>
                        <td className="px-3 py-4"><SeverityBadge severity={threat.severity} /></td>
                        <td className="px-3 py-4 capitalize">{threat.status}</td>
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
