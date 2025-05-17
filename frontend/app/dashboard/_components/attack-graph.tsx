"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Sankey,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from "recharts"

interface Node {
  id: string
  name: string
  type: "source" | "target" | "intermediate"
  value: number
  risk: "critical" | "high" | "medium" | "low"
}

interface Link {
  source: string
  target: string
  value: number
}

interface AttackGraphProps {
  nodes: Node[]
  links: Link[]
  className?: string
}

export function AttackGraph({ nodes, links, className }: AttackGraphProps) {
  const [zoom, setZoom] = useState(1)
  const [viewType, setViewType] = useState<"sankey" | "network">("sankey")
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Transform data for Sankey diagram
  const sankeyData = {
    nodes: nodes.map((node) => ({
      name: node.name,
      fill: getRiskColor(node.risk),
    })),
    links: links.map((link) => {
      const sourceIndex = nodes.findIndex((n) => n.id === link.source)
      const targetIndex = nodes.findIndex((n) => n.id === link.target)
      return {
        source: sourceIndex,
        target: targetIndex,
        value: link.value,
      }
    }),
  }

  // Transform data for network graph (scatter plot)
  const networkData = nodes.map((node) => {
    // Position nodes in a circular layout
    const angle = Math.random() * Math.PI * 2
    const radius = 100 + Math.random() * 100
    return {
      x: 200 + Math.cos(angle) * radius,
      y: 200 + Math.sin(angle) * radius,
      z: node.value,
      name: node.name,
      type: node.type,
      risk: node.risk,
      id: node.id,
    }
  })

  // Create connection lines data
  const connectionLines = links
    .map((link) => {
      const source = networkData.find((node) => node.id === link.source)
      const target = networkData.find((node) => node.id === link.target)
      if (!source || !target) return null

      return {
        sourceX: source.x,
        sourceY: source.y,
        targetX: target.x,
        targetY: target.y,
        value: link.value,
        sourceName: source.name,
        targetName: target.name,
      }
    })
    .filter(Boolean)

  function getRiskColor(risk: string) {
    switch (risk) {
      case "critical":
        return "#ef4444" // red-500
      case "high":
        return "#f59e0b" // amber-500
      case "medium":
        return "#eab308" // yellow-500
      case "low":
        return "#22c55e" // green-500
      default:
        return "#6b7280" // gray-500
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // Custom Sankey node
  const CustomSankeyNode = ({ x, y, width, height, index, payload }: any) => {
    // Add null check for payload
    const fill = payload?.fill || "#8884d8"

    return (
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        fillOpacity={0.9}
        className="transition-all duration-300 hover:fill-opacity-100 cursor-pointer"
      />
    )
  }

  // Custom scatter shape for network nodes
  const CustomScatterShape = (props: any) => {
    const { cx, cy, payload } = props
    const nodeSize = 10 + payload.z / 10
    const color = getRiskColor(payload.risk)

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={nodeSize}
          fill={color}
          fillOpacity={0.7}
          stroke={color}
          strokeWidth={1}
          className="transition-all duration-300 hover:fill-opacity-1 cursor-pointer"
        />
        <text x={cx} y={cy + nodeSize + 10} textAnchor="middle" fill="#d1d5db" fontSize={10}>
          {payload.name}
        </text>
      </g>
    )
  }

  // Custom tooltip for network view
  const CustomNetworkTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-black border border-red-900/30 p-2 rounded shadow-md">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-xs text-gray-400">Type: {data.type}</p>
          <p className="text-xs text-gray-400">
            Risk: <span style={{ color: getRiskColor(data.risk) }}>{data.risk}</span>
          </p>
          <p className="text-xs text-gray-400">Value: {data.z}</p>
        </div>
      )
    }
    return null
  }

  // Draw connection lines for network view
  useEffect(() => {
    if (viewType !== "network" || !containerRef.current) return

    const container = containerRef.current
    const svg = container.querySelector("svg")
    if (!svg) return

    // Remove existing lines
    const existingLines = svg.querySelectorAll(".connection-line")
    existingLines.forEach((line) => line.remove())

    // Create a group for lines
    const linesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g")
    linesGroup.classList.add("connection-lines")
    svg.prepend(linesGroup)

    // Add lines
    connectionLines.forEach((connection: any) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.classList.add("connection-line")
      line.setAttribute("x1", connection.sourceX)
      line.setAttribute("y1", connection.sourceY)
      line.setAttribute("x2", connection.targetX)
      line.setAttribute("y2", connection.targetY)
      line.setAttribute("stroke", "rgba(220, 38, 38, 0.3)")
      line.setAttribute("stroke-width", Math.min(connection.value / 10, 3).toString())
      linesGroup.appendChild(line)
    })
  }, [viewType, connectionLines])

  return (
    <Card className={cn("border-red-900/30 bg-black", className)}>
      <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
        <CardTitle className="text-lg font-semibold text-white">Attack Path Visualization</CardTitle>
        <div className="flex items-center gap-2">
          <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)}>
            <TabsList className="bg-red-950/20 border border-red-900/30">
              <TabsTrigger value="sankey" className="data-[state=active]:bg-red-950 data-[state=active]:text-white">
                Flow View
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-red-950 data-[state=active]:text-white">
                Network View
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-1">
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
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-8 w-8 border-red-900/30 bg-black text-gray-400 hover:bg-red-950 hover:text-white",
                isLoading && "animate-spin text-red-500",
              )}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={containerRef}
          className="h-[400px] w-full overflow-hidden"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          {viewType === "sankey" ? (
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                node={<CustomSankeyNode />}
                link={{ stroke: "#77777730" }}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-black border border-red-900/30 p-2 rounded shadow-md">
                          <p className="font-medium text-white">{payload[0].name}</p>
                          <p className="text-xs text-gray-400">Value: {payload[0].value}</p>
                          {payload[0].payload.source !== undefined && (
                            <p className="text-xs text-gray-400">
                              {sankeyData.nodes[payload[0].payload.source].name} →{" "}
                              {sankeyData.nodes[payload[0].payload.target].name}
                            </p>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </Sankey>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" dataKey="x" name="X" hide />
                <YAxis type="number" dataKey="y" name="Y" hide />
                <RechartsTooltip content={<CustomNetworkTooltip />} />
                <Scatter name="Nodes" data={networkData} fill="#8884d8" shape={<CustomScatterShape />} />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
