"use client"

import { useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Home,
    Shield,
    AlertTriangle,
    Server,
    Network,
    Settings,
    LogOut,
    FileText,
    BarChart2,
    Users,
    Bell,
    Search,
    Eye,
    AlertCircle,
} from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { ThreatTable, type Threat } from "@/app/dashboard/_components/threat-table"
import { AttackGraph } from "@/app/dashboard/_components/attack-graph"
import { SummaryPanel } from "@/app/dashboard/_components/summary-panel"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { mockThreats, mockNodes, mockLinks, mockSummaryData } from "@/lib/mock-data"

export function DashboardLayout() {
    const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
    const [threats, setThreats] = useState<Threat[]>(mockThreats)

    const handleFileUpload = (data: any[]) => {
        console.log("File uploaded:", data)
        // In a real app, we would process the data and update the state
        // For now, we'll just add a notification or something

        // Simulate adding new threats after a delay
        setTimeout(() => {
            const newThreats = [
                {
                    id: `threat-${Date.now()}`,
                    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
                    sourceIp: data[0]?.ip || "192.168.1.254",
                    destinationIp: "10.0.0.15",
                    type: "Suspicious Login Attempt",
                    severity: "high" as const,
                    status: "active" as const,
                    description: "Multiple failed login attempts detected from unknown source",
                },
                {
                    id: `threat-${Date.now() + 1}`,
                    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
                    sourceIp: data[0]?.ip || "192.168.1.253",
                    destinationIp: "10.0.0.16",
                    type: "Port Scanning",
                    severity: "medium" as const,
                    status: "active" as const,
                    description: "Sequential port scanning detected from external IP",
                },
            ]

            setThreats((prev) => [...newThreats, ...prev])
        }, 2000)
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-black">
                <Sidebar className="border-r border-red-900/30">
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-950">
                                <span className="text-lg font-bold text-red-500">R</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white">RedHawk</span>
                                <span className="text-xs text-gray-400">Security Dashboard</span>
                            </div>
                        </div>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-gray-400">Main</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton isActive className="data-[active=true]:bg-red-950 data-[active=true]:text-white">
                                            <Home className="text-red-500" />
                                            <span>Dashboard</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <Shield className="text-red-500" />
                                            <span>Threats</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <AlertTriangle className="text-red-500" />
                                            <span>Vulnerabilities</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <Server className="text-red-500" />
                                            <span>Assets</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <Network className="text-red-500" />
                                            <span>Network</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <FileText className="text-red-500" />
                                            <span>Logs</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <BarChart2 className="text-red-500" />
                                            <span>Reports</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <Users className="text-red-500" />
                                            <span>Users</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-gray-400">Recent Scans</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <span>Network Scan - 05/17/2025</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <span>Web App Scan - 05/15/2025</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton className="hover:bg-red-950/50 hover:text-white">
                                            <span>Vulnerability Scan - 05/10/2025</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                    <SidebarFooter>
                        <div className="flex items-center justify-between p-2">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8 border border-red-900/50">
                                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                    <AvatarFallback className="bg-red-950 text-red-500">JD</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-white">John Doe</span>
                                    <span className="text-xs text-gray-400">Security Analyst</span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-red-950 hover:text-white">
                                    <Settings className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:bg-red-950 hover:text-white">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Header */}
                    <header className="border-b border-red-900/30 bg-black px-4 py-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <SidebarTrigger className="mr-2 text-gray-400 hover:bg-red-950 hover:text-white" />
                                <h1 className="text-xl font-bold text-white">Security Dashboard</h1>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                    <Input
                                        placeholder="Search..."
                                        className="h-9 w-[200px] bg-black pl-8 text-sm border-red-900/30 focus-visible:ring-red-500"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="relative text-gray-400 hover:bg-red-950 hover:text-white"
                                >
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                    3
                  </span>
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* Main content */}
                    <main className="flex-1 overflow-auto bg-gradient-to-b from-black to-red-950/10 p-4">
                        <div className="mx-auto max-w-7xl space-y-4">
                            {/* Summary Panel */}
                            <SummaryPanel data={mockSummaryData} />

                            {/* File Upload and Attack Graph */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FileUpload onFileUpload={handleFileUpload} className="md:col-span-1" />
                                <AttackGraph nodes={mockNodes} links={mockLinks} className="md:col-span-2" />
                            </div>

                            {/* Threat Table */}
                            <ThreatTable threats={threats} onViewDetails={setSelectedThreat} />
                        </div>
                    </main>
                </div>
            </div>

            {/* Threat Details Dialog */}
            <Dialog open={!!selectedThreat} onOpenChange={(open) => !open && setSelectedThreat(null)}>
                <DialogContent className="bg-black border border-red-900/30 text-white max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-white">Threat Details</DialogTitle>
                    </DialogHeader>

                    {selectedThreat && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">ID</p>
                                    <p className="font-medium">{selectedThreat.id}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Timestamp</p>
                                    <p className="font-medium">{selectedThreat.timestamp}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Source IP</p>
                                    <p className="font-medium">{selectedThreat.sourceIp}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Destination IP</p>
                                    <p className="font-medium">{selectedThreat.destinationIp}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Type</p>
                                    <p className="font-medium">{selectedThreat.type}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Severity</p>
                                    <div className="flex items-center">
                                        {selectedThreat.severity === "critical" && <AlertCircle className="mr-2 h-4 w-4 text-red-500" />}
                                        {selectedThreat.severity === "high" && <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />}
                                        {selectedThreat.severity === "medium" && <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />}
                                        {selectedThreat.severity === "low" && <Shield className="mr-2 h-4 w-4 text-green-500" />}
                                        <Badge
                                            variant="outline"
                                            className={`
                        ${selectedThreat.severity === "critical" ? "border-red-500 bg-red-950/30 text-red-500" : ""}
                        ${selectedThreat.severity === "high" ? "border-amber-500 bg-amber-950/30 text-amber-500" : ""}
                        ${selectedThreat.severity === "medium" ? "border-yellow-500 bg-yellow-950/30 text-yellow-500" : ""}
                        ${selectedThreat.severity === "low" ? "border-green-500 bg-green-950/30 text-green-500" : ""}
                      `}
                                        >
                                            {selectedThreat.severity}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-400">Status</p>
                                    <Badge
                                        className={`
                      ${selectedThreat.status === "active" ? "bg-red-500" : ""}
                      ${selectedThreat.status === "mitigated" ? "bg-green-500" : ""}
                      ${selectedThreat.status === "investigating" ? "bg-blue-500" : ""}
                    `}
                                    >
                                        {selectedThreat.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm text-gray-400">Description</p>
                                <p className="rounded-md bg-red-950/10 p-3 text-sm">{selectedThreat.description}</p>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-white">Recommended Actions</p>
                                <div className="rounded-md bg-red-950/10 p-3 space-y-2">
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 h-4 w-4 rounded-full bg-red-950 flex items-center justify-center text-red-500 text-xs">
                                            1
                                        </div>
                                        <p className="text-sm text-gray-300">Isolate affected system from the network</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 h-4 w-4 rounded-full bg-red-950 flex items-center justify-center text-red-500 text-xs">
                                            2
                                        </div>
                                        <p className="text-sm text-gray-300">Update firewall rules to block the source IP</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5 h-4 w-4 rounded-full bg-red-950 flex items-center justify-center text-red-500 text-xs">
                                            3
                                        </div>
                                        <p className="text-sm text-gray-300">Run a full system scan on the affected host</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" className="border-red-900/50 text-gray-400 hover:bg-red-950 hover:text-white">
                                    Mark as Mitigated
                                </Button>
                                <Button className="bg-red-600 hover:bg-red-700 text-white">
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Full Analysis
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </SidebarProvider>
    )
}
