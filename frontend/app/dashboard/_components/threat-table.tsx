"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  AlertCircle,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface Threat {
  id: string
  timestamp: string
  sourceIp: string
  destinationIp: string
  type: string
  severity: "critical" | "high" | "medium" | "low"
  status: "active" | "mitigated" | "investigating"
  description: string
}

interface ThreatTableProps {
  threats: Threat[]
  className?: string
  onViewDetails?: (threat: Threat) => void
}

export function ThreatTable({ threats, className, onViewDetails }: ThreatTableProps) {
  const [sortField, setSortField] = useState<keyof Threat>("timestamp")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

  const handleSort = (field: keyof Threat) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredThreats = threats.filter((threat) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      Object.values(threat).some((value) => value.toString().toLowerCase().includes(searchQuery.toLowerCase()))

    // Severity filter
    const matchesSeverity = selectedSeverity === null || threat.severity === selectedSeverity

    // Status filter
    const matchesStatus = selectedStatus === null || threat.status === selectedStatus

    return matchesSearch && matchesSeverity && matchesStatus
  })

  const sortedThreats = [...filteredThreats].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1
    }
    return 0
  })

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Shield className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="outline" className="border-red-500 bg-red-950/30 text-red-500">
            {severity}
          </Badge>
        )
      case "high":
        return (
          <Badge variant="outline" className="border-amber-500 bg-amber-950/30 text-amber-500">
            {severity}
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="border-yellow-500 bg-yellow-950/30 text-yellow-500">
            {severity}
          </Badge>
        )
      case "low":
        return (
          <Badge variant="outline" className="border-green-500 bg-green-950/30 text-green-500">
            {severity}
          </Badge>
        )
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
      case "mitigated":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "investigating":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <Card className={cn("border-red-900/30 bg-black", className)}>
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
        <CardTitle className="text-lg font-semibold text-white">Detected Threats</CardTitle>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search threats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-[200px] bg-black pl-8 text-sm border-red-900/30 focus-visible:ring-red-500"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
              >
                Severity
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black border-red-900/30">
              <DropdownMenuItem
                onClick={() => setSelectedSeverity(null)}
                className="text-gray-400 focus:bg-red-950 focus:text-white"
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedSeverity("critical")}
                className="text-red-500 focus:bg-red-950 focus:text-white"
              >
                Critical
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedSeverity("high")}
                className="text-amber-500 focus:bg-red-950 focus:text-white"
              >
                High
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedSeverity("medium")}
                className="text-yellow-500 focus:bg-red-950 focus:text-white"
              >
                Medium
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedSeverity("low")}
                className="text-green-500 focus:bg-red-950 focus:text-white"
              >
                Low
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
              >
                Status
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black border-red-900/30">
              <DropdownMenuItem
                onClick={() => setSelectedStatus(null)}
                className="text-gray-400 focus:bg-red-950 focus:text-white"
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedStatus("active")}
                className="text-red-500 focus:bg-red-950 focus:text-white"
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedStatus("investigating")}
                className="text-blue-500 focus:bg-red-950 focus:text-white"
              >
                Investigating
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedStatus("mitigated")}
                className="text-green-500 focus:bg-red-950 focus:text-white"
              >
                Mitigated
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-black">
              <tr className="border-b border-red-900/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort("timestamp")}>
                    Timestamp
                    {sortField === "timestamp" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort("sourceIp")}>
                    Source IP
                    {sortField === "sourceIp" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort("type")}>
                    Type
                    {sortField === "type" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort("severity")}>
                    Severity
                    {sortField === "severity" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => handleSort("status")}>
                    Status
                    {sortField === "status" ? (
                      sortDirection === "asc" ? (
                        <ChevronUp className="ml-1 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-1 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20 bg-black">
              {sortedThreats.length > 0 ? (
                sortedThreats.map((threat) => (
                  <tr key={threat.id} className="hover:bg-red-950/10">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{threat.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{threat.sourceIp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{threat.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getSeverityIcon(threat.severity)}
                        <span className="ml-2">{getSeverityBadge(threat.severity)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(threat.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:bg-red-950 hover:text-white"
                          onClick={() => onViewDetails?.(threat)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View details</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:bg-red-950 hover:text-white"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black border-red-900/30">
                            <DropdownMenuItem className="text-gray-400 focus:bg-red-950 focus:text-white">
                              Mark as Mitigated
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gray-400 focus:bg-red-950 focus:text-white">
                              Investigate
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 focus:bg-red-950 focus:text-white">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No threats found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
