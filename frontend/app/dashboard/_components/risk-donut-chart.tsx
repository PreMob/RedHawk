"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, type TooltipProps } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

export function RiskDonutChart() {
    const { summary, loading, error } = useLogAnalysis();
    
    // Create data for the chart from the summary data
    const generateChartData = () => {
        if (!summary || !summary.predictionPercentages) {
            // Fallback data when no real data is available
            return [
                { name: "Critical", value: 20, color: "#ef4444" },
                { name: "High", value: 20, color: "#ff5c5c" },
                { name: "Medium", value: 35, color: "#ff8040" },
                { name: "Low", value: 25, color: "#e9e9e9" },
            ];
        }
        
        // Map the prediction percentages to risk levels
        const percentages = summary.predictionPercentages;
        return [
            { name: "Critical", value: percentages.attack || 0, color: "#ef4444" },
            { name: "High", value: percentages.probe || 0, color: "#ff5c5c" },
            { name: "Medium", value: percentages.anomaly || 0, color: "#ff8040" },
            { name: "Low", value: percentages.normal || 0, color: "#e9e9e9" },
        ];
    };
    
    const data = generateChartData();

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

    if (loading) {
        return <div className="h-[250px] w-full flex items-center justify-center text-gray-400">Loading risk data...</div>;
    }

    if (error) {
        return <div className="h-[250px] w-full flex items-center justify-center text-red-500">Error loading risk data</div>;
    }

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
