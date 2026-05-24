import { useCallback, useEffect, useState } from "react"

export interface BriefingSignal {
  label: string
  value: string
  detail: string
  severity: "critical" | "high" | "medium" | "low"
}

export interface AttackPathStep {
  phase: string
  title: string
  description: string
  evidence: string
  severity: "critical" | "high" | "medium" | "low"
}

export interface PriorityAction {
  title: string
  rationale: string
  owner: string
  effort: string
  impact: string
}

export interface DetectionIdea {
  name: string
  description: string
  query: string
}

export interface AiLensItem {
  question: string
  answer: string
}

export interface AiThreatBriefing {
  generatedAt: string
  mode: "demo-intelligence" | "live-intelligence"
  title: string
  riskScore: number
  riskLevel: "critical" | "high" | "medium" | "low"
  confidence: number
  executiveSummary: string
  incidentNarrative: string
  sourceContext: {
    logFile: string
    logTimestamp: string | null
    scanTarget: string | null
    scanTimestamp: string | null
  }
  metrics: {
    counts: {
      normal: number
      probe: number
      attack: number
      anomaly: number
    }
    percentages: {
      normal: number
      probe: number
      attack: number
      anomaly: number
    }
    highVulnerabilities: number
    mediumVulnerabilities: number
    topSources: Array<{
      ip: string
      count: number
      severity: "HIGH" | "MEDIUM" | "LOW"
    }>
  }
  signals: BriefingSignal[]
  attackPath: AttackPathStep[]
  priorityActions: PriorityAction[]
  detectionIdeas: DetectionIdea[]
  aiLens: AiLensItem[]
}

export function useAiBriefing() {
  const [briefing, setBriefing] = useState<AiThreatBriefing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBriefing = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/briefing", {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Briefing request failed: ${response.status}`)
      }

      const data = await response.json()
      setBriefing(data.briefing)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI briefing"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBriefing()
  }, [fetchBriefing])

  return {
    briefing,
    loading,
    error,
    refetch: fetchBriefing,
  }
}
