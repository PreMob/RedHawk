import type { Threat } from "@/app/dashboard/_components/threat-table"

// Mock threats data
export const mockThreats: Threat[] = [
  {
    id: "threat-001",
    timestamp: "2025-05-17 08:23:15",
    sourceIp: "192.168.1.5",
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
    sourceIp: "10.0.0.23",
    destinationIp: "10.0.0.10",
    type: "XSS",
    severity: "high",
    status: "investigating",
    description:
        "Cross-site scripting vulnerability detected in web application. Potential for session hijacking and unauthorized access.",
  },
  {
    id: "threat-003",
    timestamp: "2025-05-16 23:12:05",
    sourceIp: "172.16.22.7",
    destinationIp: "10.0.0.15",
    type: "SQL Injection",
    severity: "low",
    status: "mitigated",
    description:
        "SQL injection attempt detected but blocked by WAF. Database queries properly sanitized and no data exposure occurred.",
  },
  {
    id: "threat-004",
    timestamp: "2025-05-16 18:34:51",
    sourceIp: "192.168.1.110",
    destinationIp: "10.0.0.20",
    type: "RCE",
    severity: "low",
    status: "active",
    description:
        "Potential remote code execution vulnerability in outdated service. Limited impact due to network segmentation.",
  },
  {
    id: "threat-005",
    timestamp: "2025-05-16 15:22:30",
    sourceIp: "192.168.1.104",
    destinationIp: "10.0.0.25",
    type: "XSS",
    severity: "high",
    status: "investigating",
    description:
        "Stored XSS vulnerability detected in user profile section. Could allow attackers to inject malicious scripts.",
  },
  {
    id: "threat-006",
    timestamp: "2025-05-16 12:11:18",
    sourceIp: "192.168.1.105",
    destinationIp: "10.0.0.30",
    type: "CSRF",
    severity: "medium",
    status: "mitigated",
    description: "Cross-site request forgery vulnerability in admin panel. Anti-CSRF tokens implemented as mitigation.",
  },
  {
    id: "threat-007",
    timestamp: "2025-05-16 09:05:42",
    sourceIp: "192.168.1.106",
    destinationIp: "10.0.0.35",
    type: "CSRF",
    severity: "high",
    status: "active",
    description:
        "CSRF vulnerability allowing unauthorized actions when admin users visit malicious sites while authenticated.",
  },
  {
    id: "threat-008",
    timestamp: "2025-05-16 06:58:14",
    sourceIp: "192.168.1.107",
    destinationIp: "10.0.0.40",
    type: "RCE",
    severity: "medium",
    status: "investigating",
    description: "Potential RCE vulnerability in file upload functionality. Input validation improvements recommended.",
  },
  {
    id: "threat-009",
    timestamp: "2025-05-15 22:47:33",
    sourceIp: "192.168.1.108",
    destinationIp: "10.0.0.45",
    type: "SQL Injection",
    severity: "critical",
    status: "mitigated",
    description: "Blind SQL injection vulnerability in search function. Parameterized queries implemented as fix.",
  },
  {
    id: "threat-010",
    timestamp: "2025-05-15 19:36:27",
    sourceIp: "192.168.1.109",
    destinationIp: "10.0.0.50",
    type: "XSS",
    severity: "low",
    status: "active",
    description: "Reflected XSS vulnerability in error messages. Input sanitization needed.",
  },
]

// Add mock nodes for network graph
export const mockNodes = [
  { id: "server-1", label: "Web Server", group: "server" },
  { id: "server-2", label: "Database Server", group: "server" },
  { id: "server-3", label: "Application Server", group: "server" },
  { id: "client-1", label: "Admin Client", group: "client" },
  { id: "client-2", label: "User Client", group: "client" },
  { id: "attacker-1", label: "External Attacker", group: "attacker" },
];

// Add mock links for network graph
export const mockLinks = [
  { source: "client-1", target: "server-1", label: "HTTPS" },
  { source: "client-2", target: "server-1", label: "HTTPS" },
  { source: "server-1", target: "server-2", label: "SQL" },
  { source: "server-1", target: "server-3", label: "API" },
  { source: "attacker-1", target: "server-1", label: "Attack" },
];
