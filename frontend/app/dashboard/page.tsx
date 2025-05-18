"use client"

import { DashboardLayout } from "./layout-dashboard"
import { ThreatTable } from "./_components/threat-table"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnomaliesAreaChart } from "./_components/anamolity-area-chart"
import { VulnerabilityBarChart } from "./_components/vurnability-bar-chart"
import { RiskDonutChart } from "./_components/risk-donut-chart"
import { StatsCard } from "./_components/stats-card"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

export default function DashboardPage() {
    // Use the real data from the API instead of mock data
    const { threats, summary, loading, error, refetch } = useLogAnalysis()
    
    // Helper function to count threats by severity
    const countThreatsBySeverity = (severity: string) => {
        if (!threats?.length) return 0;
        return threats.filter(threat => threat.severity === severity).length;
    }
    
    // Helper function to count mitigated threats
    const countMitigatedThreats = () => {
        if (!threats?.length) return 0;
        return threats.filter(threat => 
            threat.status === 'mitigated'
        ).length;
    }
    
    // Helper function to count threats by type for the pie chart
    const getThreatTypeData = () => {
        if (!threats?.length) return [];
        const typeCounts: Record<string, number> = {};
        
        threats.forEach(threat => {
            if (threat.type) {
                if (!typeCounts[threat.type]) {
                    typeCounts[threat.type] = 0;
                }
                typeCounts[threat.type]++;
            }
        });
        
        return Object.entries(typeCounts).map(([type, count]) => ({
            type,
            count
        }));
    }
    
    // Helper function to count anomalies
    const countAnomalies = () => {
        if (!threats?.length) return 0;
        return threats.filter(threat => 
            threat.type === 'Anomaly' || 
            threat.type === 'Probe' || 
            threat.severity === 'critical'
        ).length;
    }
    
    // Calculate total targets based on unique IP addresses
    const calculateTotalTargets = () => {
        if (!threats?.length) return 0;
        const uniqueIps = new Set<string>();
        threats.forEach(threat => {
            if (threat.sourceIp) uniqueIps.add(threat.sourceIp);
            if (threat.destinationIp) uniqueIps.add(threat.destinationIp);
        });
        return uniqueIps.size || 0;
    }

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-4">
                <h1 className="text-2xl font-bold text-white mb-4">Scan Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard 
                        title="Total Targets Scanned" 
                        value={loading ? "Loading..." : calculateTotalTargets().toString()}
                    />
                    <StatsCard 
                        title="Total Vulnerabilities Found" 
                        value={loading ? "Loading..." : threats?.length.toString() || "0"} 
                    />
                    <StatsCard 
                        title="High-Risk Hosts" 
                        value={loading ? "Loading..." : (countThreatsBySeverity('critical') + countThreatsBySeverity('high')).toString()} 
                    />
                    <StatsCard 
                        title="Anomalies Detected" 
                        value={loading ? "Loading..." : countAnomalies().toString()} 
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-red-900/30 bg-black">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">Risk Level Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RiskDonutChart />
                        </CardContent>
                    </Card>

                    <Card className="border-red-900/30 bg-black">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-white">Vulnerability Types</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VulnerabilityBarChart />
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-red-900/30 bg-black">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-white">Anomalies Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AnomaliesAreaChart />
                    </CardContent>
                </Card>

                <Card className="border-red-900/30 bg-black">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-white">Active Threats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ThreatTable threats={threats || []} loading={loading} error={error} />
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
