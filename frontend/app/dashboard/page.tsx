"use client"

import { DashboardLayout } from "./layout-dashboard"
import { ThreatTable } from "./_components/threat-table"
import { mockThreats } from "@/lib/mock-data"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnomaliesAreaChart } from "./_components/anamolity-area-chart"
import { VulnerabilityBarChart } from "./_components/vurnability-bar-chart"
import { RiskDonutChart } from "./_components/risk-donut-chart"
import { StatsCard } from "./_components/stats-card"

export default function DashboardPage() {
    const [threats, setThreats] = useState(mockThreats)

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-4">
                <h1 className="text-2xl font-bold text-white mb-4">Scan Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard title="Total Targets Scanned" value="125" />
                    <StatsCard title="Total Vulnerabilities Found" value="53" />
                    <StatsCard title="High-Risk Hosts" value="20" />
                    <StatsCard title="Anomalies Detected" value="15" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-red-900/30 bg-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-white">Vulnerability Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VulnerabilityBarChart />
                        </CardContent>
                    </Card>

                    <Card className="border-red-900/30 bg-black">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold text-white">Risk Level</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RiskDonutChart />
                        </CardContent>
                    </Card>
                </div>

                {/* Anomalies Area Chart - Main Feature */}
                <Card className="border-red-900/30 bg-black">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold text-white">Anomalies Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnomaliesAreaChart />
                    </CardContent>
                </Card>

                {/* Threat Table */}
                <ThreatTable threats={threats} />
            </div>
        </DashboardLayout>
    )
}
