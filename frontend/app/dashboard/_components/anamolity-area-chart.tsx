"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, ZoomIn, ZoomOut } from "lucide-react"
import { format, subDays } from "date-fns"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, type TooltipProps, XAxis, YAxis } from "recharts"
import { useLogAnalysis } from "@/hooks/use-log-analysis"

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
        return (
            <Card className="border-red-900/30 bg-black p-2 shadow-md">
                <CardContent className="p-2">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-sm text-red-500">{`Anomalies: ${payload[0].value}`}</p>
                </CardContent>
            </Card>
        )
    }

    return null
}

export function AnomaliesAreaChart() {
    const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d")
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [zoomLevel, setZoomLevel] = useState(1)
    const { summary, threats, loading, error } = useLogAnalysis();

    // Generate data based on real threats data or fallback to generated data
    const generateChartData = () => {
        if (!threats?.length) {
            // Fallback to generated mock data
            return generateMockData(timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90);
        }
        
        // Group threats by day
        const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
        const anomalyData = [];
        const now = new Date();
        
        // Initialize data structure for all days
        for (let i = days; i >= 0; i--) {
            const date = subDays(now, i);
            anomalyData.push({
                date: format(date, "MMM dd"),
                value: 0,
                timestamp: date.getTime()
            });
        }
        
        // Count anomalies by day
        threats.forEach(threat => {
            if (threat.timestamp) {
                const threatDate = new Date(threat.timestamp);
                const formattedDate = format(threatDate, "MMM dd");
                
                // Find matching day in our data
                const dataPoint = anomalyData.find(d => d.date === formattedDate);
                if (dataPoint) {
                    // Count severity critical and high as anomalies
                    if (threat.severity === 'critical' || threat.severity === 'high') {
                        dataPoint.value += 1;
                    }
                }
            }
        });
        
        return anomalyData;
    };
    
    // Fallback function to generate mock data
    const generateMockData = (days: number) => {
        const data = [];
        const now = new Date();

        for (let i = days; i >= 0; i--) {
            const date = subDays(now, i);

            // Create a base value with some randomness
            let value = Math.floor(Math.random() * 5) + 5;

            // Add some spikes for visual interest
            if (i % 7 === 0) value += Math.floor(Math.random() * 8);
            if (i % 11 === 0) value += Math.floor(Math.random() * 10);

            data.push({
                date: format(date, "MMM dd"),
                value,
                timestamp: date.getTime(),
            });
        }

        return data;
    };

    // Get the chart data
    const data = generateChartData();
    
    const handleZoomIn = () => {
        setZoomLevel(Math.min(zoomLevel + 0.2, 2))
    }

    const handleZoomOut = () => {
        setZoomLevel(Math.max(zoomLevel - 0.2, 0.5))
    }
    
    if (loading) {
        return <div className="h-[300px] w-full flex items-center justify-center text-gray-400">Loading anomaly data...</div>;
    }

    if (error) {
        return <div className="h-[300px] w-full flex items-center justify-center text-red-500">Error loading anomaly data</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Tabs
                    defaultValue="30d"
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d")}
                    className="w-auto"
                >
                    <TabsList className="bg-red-950/20 border border-red-900/30">
                        <TabsTrigger value="7d" className="data-[state=active]:bg-red-950 data-[state=active]:text-white">
                            7 Days
                        </TabsTrigger>
                        <TabsTrigger value="30d" className="data-[state=active]:bg-red-950 data-[state=active]:text-white">
                            30 Days
                        </TabsTrigger>
                        <TabsTrigger value="90d" className="data-[state=active]:bg-red-950 data-[state=active]:text-white">
                            90 Days
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex items-center gap-1">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="h-8 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-black border-red-900/30" align="end">
                            <Calendar
                                mode="single"
                                initialFocus
                                selected={date}
                                onSelect={setDate}
                                className="border-red-900/30 bg-black"
                                classNames={{
                                    day_selected: "bg-red-950 text-white",
                                    day_today: "bg-neutral-800 text-white",
                                }}
                            />
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
                        onClick={handleZoomIn}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
                        onClick={handleZoomOut}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white"
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div
                className="h-[300px] w-full overflow-hidden"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                        />
                        <YAxis
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                            domain={[0, "dataMax + 5"]}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex justify-between text-xs text-gray-500">
                <span>Lower values indicate normal behavior</span>
                <span>Spikes represent potential security anomalies</span>
            </div>
        </div>
    )
}
