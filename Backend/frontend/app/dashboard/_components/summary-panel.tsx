"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, Server, Network, Clock, Users, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryData {
  totalThreats: number
  criticalThreats: number
  mitigatedThreats: number
  topAttackers: Array<{ ip: string; count: number; country: string }>
  vulnerableServices: Array<{ name: string; count: number; risk: "critical" | "high" | "medium" | "low" }>
  threatTrend: "increasing" | "decreasing" | "stable"
  trendPercentage: number
  lastUpdated: string
}

interface SummaryPanelProps {
  data: SummaryData
  className?: string
}

export function SummaryPanel({ data, className }: SummaryPanelProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-amber-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTrendIcon = () => {
    switch (data.threatTrend) {
      case "increasing":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "decreasing":
        return <ArrowDownRight className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (data.threatTrend) {
      case "increasing":
        return "text-red-500"
      case "decreasing":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {/* Threat Overview Card */}
      <Card className="border-red-900/30 bg-black">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-red-500" />
            Threat Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Threats</p>
                <p className="text-2xl font-bold text-white">{data.totalThreats}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("text-sm font-medium flex items-center", getTrendColor())}>
                  {getTrendIcon()}
                  <span className="ml-1">{data.trendPercentage}%</span>
                </div>
                <Badge variant="outline" className="border-gray-700 text-gray-400">
                  <Clock className="mr-1 h-3 w-3" />
                  {data.lastUpdated}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-950/20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-400">Critical</p>
                  <Badge className="bg-red-500">{data.criticalThreats}</Badge>
                </div>
                <Progress
                  value={(data.criticalThreats / data.totalThreats) * 100}
                  className="h-1.5 bg-red-950/50"
                />
              </div>
              <div className="bg-green-950/20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-400">Mitigated</p>
                  <Badge className="bg-green-500">{data.mitigatedThreats}</Badge>
                </div>
                <Progress
                  value={(data.mitigatedThreats / data.totalThreats) * 100}
                  className="h-1.5 bg-green-950/50"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Threat Mitigation Rate</p>
                <p className="text-sm font-medium text-white">
                  {Math.round((data.mitigatedThreats / data.totalThreats) * 100)}%
                </p>
              </div>
              <Progress
                value={(data.mitigatedThreats / data.totalThreats) * 100}
                className="h-2 bg-red-950/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Attackers Card */}
      <Card className="border-red-900/30 bg-black">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Users className="mr-2 h-5 w-5 text-red-500" />
            Top Attackers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topAttackers.map((attacker, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-red-950/10 hover:bg-red-950/20 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-950 flex items-center justify-center text-red-500 mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{attacker.ip}</p>
                    <p className="text-xs text-gray-400">{attacker.country}</p>
                  </div>
                </div>
                <Badge className="bg-red-950 text-red-500 border border-red-500/50">{attacker.count} attacks</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vulnerable Services Card */}
      <Card className="border-red-900/30 bg-black">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Server className="mr-2 h-5 w-5 text-red-500" />
            Vulnerable Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.vulnerableServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={cn("w-2 h-2 rounded-full mr-2", getRiskColor(service.risk))}></div>
                  <p className="text-sm text-white">{service.name}</p>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="border-red-900/50 text-gray-400 mr-2">
                    {service.count} vulnerabilities
                  </Badge>
                  <div className="w-16">
                    <Progress
                      value={service.count}
                      max={Math.max(...data.vulnerableServices.map((s) => s.count))}
                      className={cn("h-1.5 bg-red-950/30", getRiskColor(service.risk))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Network Status Card */}
      <Card className="border-red-900/30 bg-black">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Network className="mr-2 h-5 w-5 text-red-500" />
            Network Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-950/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Monitored Hosts</p>
                <p className="text-xl font-bold text-white">127</p>
              </div>
              <div className="bg-red-950/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Active Connections</p>
                <p className="text-xl font-bold text-white">1,842</p>
              </div>
              <div className="bg-red-950/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Blocked IPs</p>
                <p className="text-xl font-bold text-white">43</p>
              </div>
              <div className="bg-red-950/10 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400">Scan Coverage</p>
                <p className="text-xl font-bold text-white">98%</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Network Load</p>
                <p className="text-xs text-gray-400">72%</p>
              </div>
              <Progress value={72} className="h-1.5 bg-red-950/30 bg-amber-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">Firewall Status</p>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <Progress value={100} className="h-1.5 bg-red-950/30 bg-green-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-400">IDS Status</p>
                <Badge className="bg-green-500">Active</Badge>
              </div>
              <Progress value={100} className="h-1.5 bg-red-950/30 bg-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
