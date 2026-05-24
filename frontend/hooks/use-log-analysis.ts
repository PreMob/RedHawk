import { useState, useEffect } from 'react';
import type { Threat } from "@/app/dashboard/_components/threat-table";
import { authFetch } from "@/lib/auth-client";

interface LogSummary {
  totalRecords: number;
  logAnalysisId?: string;
  predictionCounts: {
    normal: number;
    probe: number;
    attack: number;
    anomaly: number;
  };
  predictionPercentages: {
    normal: number;
    probe: number;
    attack: number;
    anomaly: number;
  };
  textSummary: string;
  recommendedActions: string[];
}

interface LogEntry {
  timestamp: string;
  sourceIp?: string;
  source_ip?: string;
  type?: string;
  prediction?: string;
  sensitivity?: "LOW" | "MEDIUM" | "HIGH";
  status?: "INFO" | "ALERT" | "WARNING";
  recommendedAction?: string;
  recommended_action?: string;
  id?: string;
}

interface BackendAnalysisListResponse {
  analyses: Array<{
    _id: string;
    filename: string;
    timestamp: string;
    totalRecords: number;
    textSummary: string;
  }>;
}

interface BackendAnalysisDetailResponse {
  analysis: {
    filename: string;
    timestamp: string;
    totalRecords: number;
    predictionCounts: {
      normal: number;
      probe: number;
      attack: number;
      anomaly: number;
      dos?: number;
      r2l?: number;
      u2r?: number;
      threat?: number;
    };
    predictionPercentages: {
      normal: number;
      probe: number;
      attack: number;
      anomaly: number;
      dos?: number;
      r2l?: number;
      u2r?: number;
      threat?: number;
    };
    textSummary: string;
    recommendedActions: string[];
    logEntries: LogEntry[];
    visualizationData?: Record<string, unknown>;
  };
}

const normalizeCounts = (counts: BackendAnalysisDetailResponse["analysis"]["predictionCounts"]) => ({
  normal: counts.normal || 0,
  probe: counts.probe || 0,
  attack: counts.attack || counts.dos || counts.threat || 0,
  anomaly: counts.anomaly || counts.r2l || counts.u2r || 0,
});

const normalizePercentages = (
  percentages: BackendAnalysisDetailResponse["analysis"]["predictionPercentages"],
  counts: LogSummary["predictionCounts"],
  totalRecords: number
) => {
  const total = totalRecords || Object.values(counts).reduce((sum, count) => sum + count, 0) || 1;

  return {
    normal: percentages.normal || Math.round((counts.normal / total) * 1000) / 10,
    probe: percentages.probe || Math.round((counts.probe / total) * 1000) / 10,
    attack: percentages.attack || percentages.dos || percentages.threat || Math.round((counts.attack / total) * 1000) / 10,
    anomaly: percentages.anomaly || percentages.r2l || percentages.u2r || Math.round((counts.anomaly / total) * 1000) / 10,
  };
};

// Map backend log entries to frontend threat model
const mapLogEntryToThreat = (logEntry: LogEntry): Threat => {
  // Generate a unique ID if not provided
  const id = logEntry.id || `threat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const entryType = logEntry.type || logEntry.prediction || "threat";
  const sensitivity = logEntry.sensitivity || (entryType === "attack" ? "HIGH" : entryType === "probe" ? "MEDIUM" : "LOW");
  const entryStatus = logEntry.status || (sensitivity === "LOW" ? "INFO" : "ALERT");
  
  // Map sensitivity to severity
  let severity: "critical" | "high" | "medium" | "low";
  switch (sensitivity) {
    case "HIGH":
      severity = entryType === "attack" ? "critical" : "high";
      break;
    case "MEDIUM":
      severity = "medium";
      break;
    case "LOW":
    default:
      severity = "low";
      break;
  }
  
  // Map status
  let status: "active" | "mitigated" | "investigating";
  switch (entryStatus) {
    case "ALERT":
      status = "active";
      break;
    case "WARNING":
      status = "investigating";
      break;
    case "INFO":
    default:
      status = "mitigated";
      break;
  }
  
  // Format the timestamp to match the UI format
  const parsedDate = new Date(logEntry.timestamp);
  const timestamp = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString().replace("T", " ").substring(0, 19)
    : parsedDate.toISOString().replace("T", " ").substring(0, 19);
  
  // Ensure sourceIp exists or use a default
  const sourceIp = logEntry.sourceIp || logEntry.source_ip || "192.168.1.1";
  
  return {
    id,
    timestamp,
    sourceIp,
    destinationIp: "10.0.0.1", // Default destination as it's not provided in the log
    type: entryType.charAt(0).toUpperCase() + entryType.slice(1),
    severity,
    status,
    description: logEntry.recommendedAction || logEntry.recommended_action || `${entryType} activity detected from ${sourceIp}`,
  };
};

export function useLogAnalysis() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [summary, setSummary] = useState<LogSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching log analyses list...');
      // First, fetch list of analyses
      const listResponse = await authFetch('/api/analyses', {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('List response status:', listResponse.status);
      
      if (!listResponse.ok) {
        throw new Error(`Error fetching log analyses: ${listResponse.statusText}`);
      }
      
      const listData: BackendAnalysisListResponse = await listResponse.json();
      console.log('Analyses data received:', listData);
      
      if (!listData.analyses || listData.analyses.length === 0) {
        setError('No log analyses available');
        setLoading(false);
        return;
      }
      
      // Get the most recent analysis ID
      const mostRecentAnalysisId = listData.analyses[0]._id;
      console.log('Fetching details for analysis ID:', mostRecentAnalysisId);
      
      // Fetch detailed analysis data
      const detailResponse = await authFetch(`/api/analyses/${mostRecentAnalysisId}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Detail response status:', detailResponse.status);
      
      if (!detailResponse.ok) {
        throw new Error(`Error fetching log analysis details: ${detailResponse.statusText}`);
      }
      
      const detailData: BackendAnalysisDetailResponse = await detailResponse.json();
      console.log('Detail data received:', detailData);
      
      // Extract and update the summary
      const analysisData = detailData.analysis;
      const normalizedCounts = normalizeCounts(analysisData.predictionCounts);
      const normalizedPercentages = normalizePercentages(
        analysisData.predictionPercentages,
        normalizedCounts,
        analysisData.totalRecords
      );
      
      const summaryData: LogSummary = {
        totalRecords: analysisData.totalRecords,
        logAnalysisId: mostRecentAnalysisId,
        predictionCounts: normalizedCounts,
        predictionPercentages: normalizedPercentages,
        textSummary: analysisData.textSummary,
        recommendedActions: analysisData.recommendedActions || []
      };
      
      setSummary(summaryData);
      
      // Convert log entries to threats
      const newThreats = analysisData.logEntries?.map(entry => {
        console.log('Processing log entry:', entry);
        return mapLogEntryToThreat(entry);
      }) || [];
      
      console.log('Setting threats:', newThreats.length);
      setThreats(newThreats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Error fetching log analysis:', errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchLogAnalysis();
  }, []);

  return {
    threats: threats || [],
    summary,
    loading,
    error,
    refetch: fetchLogAnalysis
  };
}
