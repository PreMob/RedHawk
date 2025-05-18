"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, type TooltipProps } from "recharts"
import { Card, CardContent } from "@/components/ui/card"

// Mock data for risk levels
const data = [
    { name: "Critical", value: 20, color: "#ef4444" },
    { name: "High", value: 20, color: "#ff5c5c" },
    { name: "Medium", value: 35, color: "#ff8040" },
    { name: "Low", value: 25, color: "#e9e9e9" },
]

// Custom tooltip component
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <Card className="border-red-900/30 bg-black p-2 shadow-md">
                <CardContent className="p-2">
                    <p className="text-sm font-medium text-white">{payload[0].name}</p>
                    <p className="text-sm" style={{ color: payload[0].payload.color }}>
                        {`${payload[0].value}%`}
                    </p>
                </CardContent>
            </Card>
        )
    }

    return null
}

// Custom legend
const renderLegend = (props: any) => {
    const { payload } = props

    return (
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm mt-4">
            {payload.map((entry: any, index: number) => (
                <li key={`item-${index}`} className="flex items-center">
                    <span className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-400">
            {entry.value}: {entry.payload.value}%
          </span>
                </li>
            ))}
        </ul>
    )
}

export function RiskDonutChart() {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        animationDuration={1500}
                        animationBegin={200}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={renderLegend} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
