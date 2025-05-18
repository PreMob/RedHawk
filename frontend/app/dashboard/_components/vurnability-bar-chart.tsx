"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for vulnerability types
const data = [
    { name: "SQL Injection", value: 22 },
    { name: "XSS", value: 19 },
    { name: "CSRF", value: 18 },
    { name: "RCE", value: 16 },
]

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <Card className="border-red-900/30 bg-black p-2 shadow-md">
                <CardContent className="p-2">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-sm text-red-500">{`Count: ${payload[0].value}`}</p>
                </CardContent>
            </Card>
        )
    }

    return null
}

export function VulnerabilityBarChart() {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                        domain={[0, 25]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1500} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
