"use client"

import { Database, Server, ShieldCheck, Wifi } from "lucide-react"
import { DashboardLayout } from "../dashboard/layout-dashboard"
import { DataPanel, MetricCard, OpsHeader, PageState, SeverityBadge } from "@/app/_components/ops-widgets"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

export default function AssetsPage() {
  const { threats, loading, error } = useLogAnalysis()
  const assetMap = new Map<string, { asset: string; inbound: number; outbound: number; highest: "critical" | "high" | "medium" | "low" }>()
  const severityRank = { critical: 0, high: 1, medium: 2, low: 3 }

  threats.forEach((threat) => {
    const destination = assetMap.get(threat.destinationIp) || {
      asset: threat.destinationIp,
      inbound: 0,
      outbound: 0,
      highest: "low" as const,
    }
    destination.inbound += 1
    if (severityRank[threat.severity] < severityRank[destination.highest]) destination.highest = threat.severity
    assetMap.set(threat.destinationIp, destination)

    const source = assetMap.get(threat.sourceIp) || {
      asset: threat.sourceIp,
      inbound: 0,
      outbound: 0,
      highest: "low" as const,
    }
    source.outbound += 1
    if (severityRank[threat.severity] < severityRank[source.highest]) source.highest = threat.severity
    assetMap.set(threat.sourceIp, source)
  })

  const assets = Array.from(assetMap.values()).sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound))
  const highRiskAssets = assets.filter((asset) => asset.highest === "critical" || asset.highest === "high").length

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <OpsHeader
          icon={<Server className="h-6 w-6 text-red-500" />}
          title="Assets"
          subtitle="Inventory view of hosts and services observed in recent security activity."
        />

        <PageState loading={loading} error={error} empty={!assets.length ? "No assets are available until log analysis data is loaded." : undefined} />

        {!loading && !error && assets.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Observed Assets" value={assets.length} icon={<Server className="h-5 w-5 text-cyan-400" />} tone="cyan" />
              <MetricCard label="High-Risk Assets" value={highRiskAssets} icon={<ShieldCheck className="h-5 w-5 text-red-500" />} tone="red" />
              <MetricCard label="Inbound Events" value={assets.reduce((sum, asset) => sum + asset.inbound, 0)} icon={<Wifi className="h-5 w-5 text-amber-400" />} tone="amber" />
              <MetricCard label="Data Sources" value="Logs" icon={<Database className="h-5 w-5 text-green-400" />} tone="green" />
            </div>

            <DataPanel title="Asset Inventory" icon={<Server className="h-5 w-5 text-red-500" />}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {assets.map((asset) => (
                  <div key={asset.asset} className="rounded-md border border-red-900/30 bg-red-950/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-lg text-white">{asset.asset}</p>
                      <SeverityBadge severity={asset.highest} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">Inbound</p>
                        <p className="text-xl font-semibold text-white">{asset.inbound}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Outbound</p>
                        <p className="text-xl font-semibold text-white">{asset.outbound}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </DataPanel>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
