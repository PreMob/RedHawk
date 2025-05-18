"use client"

import { DashboardLayout } from "../dashboard/layout-dashboard"
import { ThreatTable } from "../dashboard/_components/threat-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLogAnalysis } from "@/hooks/use-log-analysis"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { SummaryPanel } from "../dashboard/_components/summary-panel"

export default function ThreatsPage() {
    const { threats, summary, loading, error, refetch } = useLogAnalysis();

    return (
        <DashboardLayout>
            <div className="mx-auto max-w-7xl space-y-4 p-4">
                <h1 className="text-2xl font-bold text-white mb-4">Threat Analysis</h1>

                {error && (
                    <Card className="border-red-900/30 bg-black text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <p>Error loading threat analysis: {error}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <div className="space-y-4">
                        <Card className="border-red-900/30 bg-black">
                            <CardHeader>
                                <Skeleton className="h-6 w-1/3 bg-gray-800" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full bg-gray-800" />
                                    <Skeleton className="h-4 w-5/6 bg-gray-800" />
                                    <Skeleton className="h-4 w-3/4 bg-gray-800" />
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Skeleton className="h-[600px] w-full bg-gray-800" />
                    </div>
                ) : (
                    <>
                        {/* Summary Panel */}
                        {summary && (
                            <Card className="border-red-900/30 bg-black">
                                <CardHeader className="px-6 py-4">
                                    <CardTitle className="text-lg font-semibold text-white">Security Analysis Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="px-6 pt-0 pb-4">
                                    <div className="space-y-4">
                                        <p className="text-gray-300">{summary.textSummary}</p>
                                        
                                        {summary.recommendedActions && summary.recommendedActions.length > 0 && (
                                            <div>
                                                <h3 className="font-medium text-white mb-2">Recommended Actions:</h3>
                                                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                                                    {summary.recommendedActions.map((action, index) => (
                                                        <li key={index}>{action}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                            <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-3">
                                                <p className="text-xs text-gray-400">Total Records</p>
                                                <p className="text-2xl font-bold text-white">{summary.totalRecords}</p>
                                            </div>
                                            <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-3">
                                                <p className="text-xs text-gray-400">Normal Events</p>
                                                <p className="text-2xl font-bold text-green-500">{summary.predictionCounts.normal || 0}</p>
                                            </div>
                                            <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-3">
                                                <p className="text-xs text-gray-400">Probes Detected</p>
                                                <p className="text-2xl font-bold text-yellow-500">{summary.predictionCounts.probe || 0}</p>
                                            </div>
                                            <div className="rounded-lg bg-red-950/20 border border-red-900/30 p-3">
                                                <p className="text-xs text-gray-400">Attacks Detected</p>
                                                <p className="text-2xl font-bold text-red-500">{summary.predictionCounts.attack || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Threat Table */}
                        <ThreatTable 
                            threats={threats} 
                            loading={loading} 
                            error={error}
                            onViewDetails={(threat) => console.log('Viewing threat details:', threat.id)} 
                        />
                    </>
                )}
            </div>
        </DashboardLayout>
    )
} 