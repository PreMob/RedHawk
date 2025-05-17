import type { Threat } from "@/app/dashboard/_components/threat-table"
import type { SummaryData } from "@/app/dashboard/_components/summary-panel"
import type { Node } from "@/app/dashboard/_components/attack-graph"

// Mock threats data
export const mockThreats: Threat[] = [
  {
    id: "threat-001",
    timestamp: "2025-05-17 08:23:15",
    sourceIp: "192.168.1.100",
    destinationIp: "10.0.0.5",
    type: "SQL Injection",
    severity: "critical",
    status: "active",
    description:
      "SQL injection attempt detected in login form. Multiple malicious payloads identified targeting the authentication database.",
  },
  {
    id: "threat-002",
    timestamp: "2025-05-17 07:45:22",
    sourceIp: "192.168.1.101",
    destinationIp: "10.0.0.10",
    type: "Brute Force",
    severity: "high",
    status: "investigating",
    description:
      "Multiple failed login attempts detected from same source IP. Possible credential stuffing attack targeting admin accounts.",
  },
  {
    id: "threat-003",
    timestamp: "2025-05-16 23:12:05",
    sourceIp: "192.168.1.102",
    destinationIp: "10.0.0.15",
    type: "XSS Attack",
    severity: "medium",
    status: "mitigated",
    description:
      "Cross-site scripting attempt detected in comment form. Payload attempted to inject malicious JavaScript to steal session cookies.",
  },
  {
    id: "threat-004",
    timestamp: "2025-05-16 18:34:51",
    sourceIp: "192.168.1.103",
    destinationIp: "10.0.0.20",
    type: "File Inclusion",
    severity: "high",
    status: "active",
    description:
      "Remote file inclusion attempt detected. Attacker tried to include malicious PHP file from external server.",
  },
  {
    id: "threat-005",
    timestamp: "2025-05-16 15:22:30",
    sourceIp: "192.168.1.104",
    destinationIp: "10.0.0.25",
    type: "Command Injection",
    severity: "critical",
    status: "investigating",
    description:
      "Command injection attempt detected in search function. Attacker tried to execute system commands through vulnerable input field.",
  },
  {
    id: "threat-006",
    timestamp: "2025-05-16 12:11:18",
    sourceIp: "192.168.1.105",
    destinationIp: "10.0.0.30",
    type: "CSRF Attack",
    severity: "medium",
    status: "mitigated",
    description:
      "Cross-site request forgery attempt detected. Attacker tried to perform unauthorized actions on behalf of authenticated user.",
  },
  {
    id: "threat-007",
    timestamp: "2025-05-16 09:05:42",
    sourceIp: "192.168.1.106",
    destinationIp: "10.0.0.35",
    type: "DDoS Attack",
    severity: "high",
    status: "active",
    description:
      "Distributed denial of service attack detected. Multiple IPs sending high volume of requests to overwhelm server resources.",
  },
  {
    id: "threat-008",
    timestamp: "2025-05-16 06:58:14",
    sourceIp: "192.168.1.107",
    destinationIp: "10.0.0.40",
    type: "Path Traversal",
    severity: "medium",
    status: "investigating",
    description:
      "Directory traversal attempt detected. Attacker tried to access sensitive files outside the web root directory.",
  },
  {
    id: "threat-009",
    timestamp: "2025-05-15 22:47:33",
    sourceIp: "192.168.1.108",
    destinationIp: "10.0.0.45",
    type: "Malware Upload",
    severity: "critical",
    status: "mitigated",
    description: "Malicious file upload detected. Attacker attempted to upload PHP shell disguised as image file.",
  },
  {
    id: "threat-010",
    timestamp: "2025-05-15 19:36:27",
    sourceIp: "192.168.1.109",
    destinationIp: "10.0.0.50",
    type: "API Abuse",
    severity: "low",
    status: "active",
    description: "Unusual API usage pattern detected. Possible data scraping or enumeration attempt.",
  },
]

// Mock nodes data for attack graph
export const mockNodes: Node[] = [
  { id: "internet", name: "Internet", type: "source", value: 100, risk: "medium" },
  { id: "firewall", name: "Firewall", type: "intermediate", value: 80, risk: "low" },
  { id: "webserver", name: "Web Server", type: "intermediate", value: 60, risk: "high" },
  { id: "appserver", name: "App Server", type: "intermediate", value: 50, risk: "medium" },
  { id: "database", name: "Database", type: "target", value: 40, risk: "critical" },
  { id: "admin", name: "Admin Panel", type: "target", value: 30, risk: "critical" },
  { id: "api", name: "API Gateway", type: "intermediate", value: 45, risk: "high" },
  { id: "storage", name: "Storage Server", type: "target", value: 35, risk: "medium" },
  { id: "user", name: "User Auth", type: "intermediate", value: 55, risk: "high" },
]

// Mock links data for attack graph
export const mockLinks = [
  { source: "internet", target: "firewall", value: 100 },
  { source: "firewall", target: "webserver", value: 80 },
  { source: "firewall", target: "api", value: 60 },
  { source: "webserver", target: "appserver", value: 70 },
  { source: "webserver", target: "admin", value: 30 },
  { source: "appserver", target: "database", value: 50 },
  { source: "api", target: "user", value: 45 },
  { source: "api", target: "storage", value: 35 },
  { source: "user", target: "database", value: 40 },
]

// Mock summary data
export const mockSummaryData: SummaryData = {
  totalThreats: 127,
  criticalThreats: 23,
  mitigatedThreats: 85,
  topAttackers: [
    { ip: "192.168.1.100", count: 47, country: "Unknown" },
    { ip: "192.168.1.103", count: 32, country: "Unknown" },
    { ip: "192.168.1.107", count: 28, country: "Unknown" },
  ],
  vulnerableServices: [
    { name: "Web Server", count: 12, risk: "critical" },
    { name: "Database", count: 8, risk: "high" },
    { name: "API Gateway", count: 6, risk: "medium" },
    { name: "Admin Panel", count: 4, risk: "low" },
  ],
  threatTrend: "increasing",
  trendPercentage: 12,
  lastUpdated: "10 min ago",
}
