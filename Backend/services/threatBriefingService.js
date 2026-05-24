const mongoose = require('mongoose');
const LogAnalysis = require('../models/LogAnalysis');
const ScanResult = require('../models/ScanResult');

const demoContext = {
  logAnalysis: {
    filename: 'demo-security-events.csv',
    timestamp: new Date().toISOString(),
    totalRecords: 1250,
    predictionCounts: {
      normal: 980,
      probe: 85,
      attack: 150,
      anomaly: 35
    },
    predictionPercentages: {
      normal: 78.4,
      probe: 6.8,
      attack: 12,
      anomaly: 2.8
    },
    textSummary: 'Traffic is mostly normal, with concentrated attack and reconnaissance activity against public web services.',
    recommendedActions: [
      'Block sources associated with repeated attack attempts',
      'Review web application input validation',
      'Enable rate limiting on public endpoints'
    ],
    logEntries: [
      {
        timestamp: new Date().toISOString(),
        sourceIp: '45.123.45.67',
        type: 'probe',
        sensitivity: 'MEDIUM',
        status: 'ALERT',
        recommendedAction: 'Monitor scanning activity'
      },
      {
        timestamp: new Date().toISOString(),
        sourceIp: '72.14.56.78',
        type: 'attack',
        sensitivity: 'HIGH',
        status: 'ALERT',
        recommendedAction: 'Block source and inspect affected service'
      },
      {
        timestamp: new Date().toISOString(),
        sourceIp: '72.14.56.78',
        type: 'attack',
        sensitivity: 'HIGH',
        status: 'ALERT',
        recommendedAction: 'Validate application logs for exploitation'
      }
    ]
  },
  scanResult: {
    targetUrl: 'https://example.com',
    scanDate: new Date().toISOString(),
    summary: 'Security scan detected missing hardening headers and possible web application exposure.',
    vulnerabilities: [
      {
        type: 'SQL_INJECTION',
        severity: 'HIGH',
        description: 'Potential SQL Injection vulnerability detected',
        affectedComponent: 'Web Application',
        remediation: 'Use parameterized queries and strict input validation'
      },
      {
        type: 'MISSING_SECURITY_HEADER',
        severity: 'MEDIUM',
        description: 'Missing critical security header: Content-Security-Policy',
        affectedComponent: 'Web Server Configuration',
        remediation: 'Configure Content-Security-Policy'
      }
    ],
    scanDetails: {
      duration: 1340,
      technologies: ['nginx', 'Node.js']
    }
  },
  isDemo: true
};

function mapToObject(value) {
  if (!value) return {};
  if (value instanceof Map) return Object.fromEntries(value);
  if (typeof value.toObject === 'function') return value.toObject();
  return value;
}

function normalizeNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeCounts(logAnalysis = {}) {
  const counts = mapToObject(logAnalysis.predictionCounts);
  return {
    normal: normalizeNumber(counts.normal),
    probe: normalizeNumber(counts.probe),
    attack: normalizeNumber(counts.attack || counts.dos || counts.threat),
    anomaly: normalizeNumber(counts.anomaly)
  };
}

function normalizePercentages(logAnalysis = {}, counts) {
  const percentages = mapToObject(logAnalysis.predictionPercentages);
  const total = normalizeNumber(logAnalysis.totalRecords) || Object.values(counts).reduce((sum, count) => sum + count, 0) || 1;

  return {
    normal: normalizeNumber(percentages.normal) || Math.round((counts.normal / total) * 1000) / 10,
    probe: normalizeNumber(percentages.probe) || Math.round((counts.probe / total) * 1000) / 10,
    attack: normalizeNumber(percentages.attack || percentages.dos || percentages.threat) || Math.round((counts.attack / total) * 1000) / 10,
    anomaly: normalizeNumber(percentages.anomaly) || Math.round((counts.anomaly / total) * 1000) / 10
  };
}

function normalizeVulnerabilities(scanResult = {}) {
  return ((scanResult && scanResult.vulnerabilities) || []).map((vulnerability) => {
    if (typeof vulnerability === 'string') {
      const upper = vulnerability.toUpperCase();
      const severity = upper.includes('SQL') || upper.includes('XSS') ? 'HIGH' : upper.includes('OUTDATED') ? 'MEDIUM' : 'LOW';
      return {
        type: severity === 'HIGH' ? 'WEB_APP_RISK' : 'SECURITY_FINDING',
        severity,
        description: vulnerability,
        affectedComponent: 'Unknown',
        remediation: 'Validate and remediate this finding'
      };
    }

    return {
      type: vulnerability.type || 'SECURITY_FINDING',
      severity: vulnerability.severity || 'LOW',
      description: vulnerability.description || 'Security finding detected',
      affectedComponent: vulnerability.affectedComponent || 'Unknown',
      remediation: vulnerability.remediation || 'Review and remediate this finding'
    };
  });
}

function getTopSources(logEntries = []) {
  const sourceCounts = new Map();

  logEntries.forEach((entry) => {
    const sourceIp = entry.sourceIp || entry.source_ip;
    if (!sourceIp || sourceIp === 'unknown') return;
    const current = sourceCounts.get(sourceIp) || { ip: sourceIp, count: 0, severities: new Set() };
    current.count += 1;
    if (entry.sensitivity) current.severities.add(entry.sensitivity);
    sourceCounts.set(sourceIp, current);
  });

  return Array.from(sourceCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((source) => ({
      ip: source.ip,
      count: source.count,
      severity: source.severities.has('HIGH') ? 'HIGH' : source.severities.has('MEDIUM') ? 'MEDIUM' : 'LOW'
    }));
}

function getRiskLevel(score) {
  if (score >= 85) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function calculateRiskScore({ counts, percentages, vulnerabilities }) {
  const highVulnerabilities = vulnerabilities.filter((item) => item.severity === 'HIGH').length;
  const mediumVulnerabilities = vulnerabilities.filter((item) => item.severity === 'MEDIUM').length;
  const exposureWeight = highVulnerabilities * 13 + mediumVulnerabilities * 7;
  const activityWeight = percentages.attack * 0.55 + percentages.probe * 0.3 + percentages.anomaly * 0.45;
  const attackVolumeWeight = Math.min(counts.attack * 0.12, 18);
  const score = Math.round(18 + exposureWeight + activityWeight + attackVolumeWeight);

  return Math.max(5, Math.min(score, 99));
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function getHostname(targetUrl) {
  if (!targetUrl) return null;

  try {
    return new URL(targetUrl).hostname;
  } catch (error) {
    return targetUrl;
  }
}

function buildSignals({ counts, percentages, vulnerabilities, topSources, scanResult }) {
  const highVulnerabilities = vulnerabilities.filter((item) => item.severity === 'HIGH').length;
  const mediumVulnerabilities = vulnerabilities.filter((item) => item.severity === 'MEDIUM').length;

  return [
    {
      label: 'Attack Ratio',
      value: `${percentages.attack.toFixed(1)}%`,
      detail: `${pluralize(counts.attack, 'attack event')} observed in the latest analysis`,
      severity: percentages.attack >= 15 ? 'critical' : percentages.attack >= 8 ? 'high' : 'medium'
    },
    {
      label: 'Recon Pressure',
      value: `${percentages.probe.toFixed(1)}%`,
      detail: `${pluralize(counts.probe, 'probe')} suggests active target mapping`,
      severity: counts.probe > 50 ? 'high' : 'medium'
    },
    {
      label: 'Exploit Surface',
      value: `${highVulnerabilities + mediumVulnerabilities}`,
      detail: `${pluralize(highVulnerabilities, 'high-risk finding')} and ${pluralize(mediumVulnerabilities, 'medium-risk finding')}`,
      severity: highVulnerabilities > 0 ? 'critical' : mediumVulnerabilities > 0 ? 'high' : 'low'
    },
    {
      label: 'Noisy Sources',
      value: `${topSources.length}`,
      detail: topSources[0] ? `${topSources[0].ip} is the loudest source` : 'No repeated source concentration detected',
      severity: topSources.some((source) => source.severity === 'HIGH') ? 'high' : 'medium'
    },
    {
      label: 'Target',
      value: getHostname(scanResult?.targetUrl) || 'Logs only',
      detail: scanResult?.summary || 'Briefing generated from log analysis data',
      severity: vulnerabilities.length > 0 ? 'medium' : 'low'
    }
  ];
}

function buildAttackPath({ counts, percentages, vulnerabilities, topSources, scanResult }) {
  const highFindings = vulnerabilities.filter((item) => item.severity === 'HIGH');
  const outdated = vulnerabilities.find((item) => item.type === 'OUTDATED_SOFTWARE' || item.description.toLowerCase().includes('outdated'));
  const missingHeader = vulnerabilities.find((item) => item.type === 'MISSING_SECURITY_HEADER' || item.description.toLowerCase().includes('header'));
  const loudestSource = topSources[0]?.ip || 'unattributed source';

  return [
    {
      phase: 'Recon',
      title: 'Target mapping is visible',
      description: counts.probe > 0
        ? `${loudestSource} and related traffic are probing exposed services before exploitation.`
        : 'No strong probe cluster is present, but exposed service metadata still gives attackers a starting point.',
      evidence: `${pluralize(counts.probe, 'probe')} across ${percentages.probe.toFixed(1)}% of analyzed records`,
      severity: counts.probe > 50 ? 'high' : 'medium'
    },
    {
      phase: 'Weaponization',
      title: highFindings[0]?.description || 'Likely web exploit path',
      description: highFindings.length > 0
        ? `The scan data points to ${highFindings[0].affectedComponent}, which can become an initial access route if reachable.`
        : 'No confirmed high-risk web exploit was stored, so the current hypothesis leans on log behavior.',
      evidence: highFindings.length > 0 ? highFindings.map((finding) => finding.type).join(', ') : 'No high severity scan finding',
      severity: highFindings.length > 0 ? 'critical' : 'medium'
    },
    {
      phase: 'Execution',
      title: 'Attack traffic is already landing',
      description: counts.attack > 0
        ? `${pluralize(counts.attack, 'attack event')} indicate exploitation attempts moved beyond reconnaissance.`
        : 'No attack-classified log events are present in the latest analysis.',
      evidence: `${percentages.attack.toFixed(1)}% attack-classified activity`,
      severity: counts.attack > 100 ? 'critical' : counts.attack > 0 ? 'high' : 'low'
    },
    {
      phase: 'Defense Evasion',
      title: missingHeader ? 'Browser-side guardrails are incomplete' : outdated ? 'Version exposure raises attacker confidence' : 'Hardening gap review',
      description: missingHeader
        ? `${missingHeader.description} reduces resilience against client-side abuse and clickjacking chains.`
        : outdated
          ? `${outdated.description} makes exploit selection easier for attackers.`
          : 'No stored hardening weakness dominated the scan context.',
      evidence: missingHeader?.affectedComponent || outdated?.affectedComponent || scanResult?.targetUrl || 'No scan target stored',
      severity: missingHeader || outdated ? 'medium' : 'low'
    },
    {
      phase: 'Impact',
      title: 'Business risk is concentrated around public services',
      description: counts.anomaly > 0
        ? 'Anomalies mixed with attack traffic can hide data access, service instability, or post-exploit discovery.'
        : 'Impact evidence is limited, but the exposed service path still deserves containment.',
      evidence: `${pluralize(counts.anomaly, 'anomaly')} in the latest model output`,
      severity: counts.anomaly > 20 ? 'high' : 'medium'
    }
  ];
}

function buildPriorityActions({ counts, vulnerabilities, topSources, logAnalysis }) {
  const actions = [];
  const topSource = topSources[0];
  const sqlFinding = vulnerabilities.find((item) => item.type.includes('SQL') || item.description.toLowerCase().includes('sql'));
  const xssFinding = vulnerabilities.find((item) => item.type.includes('XSS') || item.description.toLowerCase().includes('xss'));
  const headerFinding = vulnerabilities.find((item) => item.type === 'MISSING_SECURITY_HEADER' || item.description.toLowerCase().includes('header'));
  const outdatedFinding = vulnerabilities.find((item) => item.type === 'OUTDATED_SOFTWARE' || item.description.toLowerCase().includes('outdated'));

  if (topSource) {
    actions.push({
      title: `Contain repeated source ${topSource.ip}`,
      rationale: `${topSource.ip} appears ${pluralize(topSource.count, 'time')} in the latest threat sample.`,
      owner: 'SOC',
      effort: '15 min',
      impact: 'Reduces active noise while deeper analysis runs'
    });
  }

  if (sqlFinding) {
    actions.push({
      title: 'Review database-facing inputs',
      rationale: sqlFinding.description,
      owner: 'AppSec',
      effort: '1-2 hrs',
      impact: 'Cuts off the highest-confidence initial access path'
    });
  }

  if (xssFinding) {
    actions.push({
      title: 'Harden output encoding and CSP',
      rationale: xssFinding.description,
      owner: 'Frontend',
      effort: '2 hrs',
      impact: 'Reduces account takeover and session theft paths'
    });
  }

  if (headerFinding) {
    actions.push({
      title: 'Ship missing security headers',
      rationale: headerFinding.description,
      owner: 'Platform',
      effort: '30 min',
      impact: 'Improves browser and transport-layer guardrails'
    });
  }

  if (outdatedFinding) {
    actions.push({
      title: 'Patch exposed service versions',
      rationale: outdatedFinding.description,
      owner: 'Infrastructure',
      effort: '1 day',
      impact: 'Removes known exploit playbooks from attacker options'
    });
  }

  (logAnalysis.recommendedActions || []).slice(0, 3).forEach((action) => {
    if (!actions.some((item) => item.title.toLowerCase() === action.toLowerCase())) {
      actions.push({
        title: action,
        rationale: 'Recommended by the latest log analysis pipeline',
        owner: 'Security',
        effort: counts.attack > 0 ? 'Today' : 'This week',
        impact: 'Improves the active incident response posture'
      });
    }
  });

  return actions.slice(0, 6);
}

function buildDetectionIdeas({ topSources, scanResult }) {
  const sourceClause = topSources.length > 0
    ? topSources.map((source) => source.ip).join(', ')
    : 'suspicious_source_list';
  const host = getHostname(scanResult?.targetUrl) || 'public_web_assets';

  return [
    {
      name: 'Repeated Attack Source',
      description: 'Flags sources that repeatedly trigger alert-class events in a short window.',
      query: `source_ip IN (${sourceClause}) AND status = "ALERT" | stats count by source_ip | where count > 5`
    },
    {
      name: 'Web Exploit Probe Chain',
      description: 'Finds reconnaissance followed by attack traffic against the same target.',
      query: `target = "${host}" AND type IN ("probe", "attack") | transaction source_ip maxspan=15m`
    },
    {
      name: 'Anomaly After Exploit Attempt',
      description: 'Highlights anomalous records that occur soon after attack-classified events.',
      query: `type = "attack" THEN type = "anomaly" WITHIN 30m | table timestamp, source_ip, target`
    }
  ];
}

function buildThreatBriefing(context = demoContext) {
  const logAnalysis = context.logAnalysis || demoContext.logAnalysis;
  const scanResult = context.scanResult || null;
  const counts = normalizeCounts(logAnalysis);
  const percentages = normalizePercentages(logAnalysis, counts);
  const vulnerabilities = normalizeVulnerabilities(scanResult);
  const topSources = getTopSources(logAnalysis.logEntries || []);
  const riskScore = calculateRiskScore({ counts, percentages, vulnerabilities });
  const riskLevel = getRiskLevel(riskScore);
  const highVulnerabilities = vulnerabilities.filter((item) => item.severity === 'HIGH').length;

  const signals = buildSignals({ counts, percentages, vulnerabilities, topSources, scanResult });
  const attackPath = buildAttackPath({ counts, percentages, vulnerabilities, topSources, scanResult });
  const priorityActions = buildPriorityActions({ counts, vulnerabilities, topSources, logAnalysis });

  return {
    generatedAt: new Date().toISOString(),
    mode: context.isDemo ? 'demo-intelligence' : 'live-intelligence',
    title: riskLevel === 'critical' ? 'Active Web Exploitation Likely' : riskLevel === 'high' ? 'Elevated Attack Pressure' : 'Watchlisted Exposure',
    riskScore,
    riskLevel,
    confidence: Math.min(96, 58 + signals.filter((signal) => signal.severity !== 'low').length * 7 + highVulnerabilities * 6),
    executiveSummary: `${pluralize(counts.attack, 'attack event')} and ${pluralize(counts.probe, 'probe')} point to ${riskLevel} risk. ${scanResult?.targetUrl ? `The current external target is ${scanResult.targetUrl}.` : 'The briefing is based on log behavior only.'}`,
    incidentNarrative: `RedHawk correlates model output, source concentration, and web scan findings into a probable path: reconnaissance first, web-service exploitation next, then anomaly-driven impact checks. The strongest immediate signal is ${signals[0].label.toLowerCase()} at ${signals[0].value}.`,
    sourceContext: {
      logFile: logAnalysis.filename || 'No log file stored',
      logTimestamp: logAnalysis.timestamp || null,
      scanTarget: scanResult?.targetUrl || null,
      scanTimestamp: scanResult?.scanDate || null
    },
    metrics: {
      counts,
      percentages,
      highVulnerabilities,
      mediumVulnerabilities: vulnerabilities.filter((item) => item.severity === 'MEDIUM').length,
      topSources
    },
    signals,
    attackPath,
    priorityActions,
    detectionIdeas: buildDetectionIdeas({ topSources, scanResult }),
    aiLens: [
      {
        question: 'What is the most likely attacker goal?',
        answer: highVulnerabilities > 0
          ? 'Initial access through the public web layer, followed by data discovery or service disruption.'
          : 'Service mapping and opportunistic probing while looking for a reliable entry point.'
      },
      {
        question: 'What should be verified first?',
        answer: topSources[0]
          ? `Confirm whether ${topSources[0].ip} reached sensitive endpoints or authenticated workflows.`
          : 'Verify whether attack-classified records share a target service, account, or URL path.'
      },
      {
        question: 'What would reduce risk fastest?',
        answer: priorityActions[0]?.title || 'Upload fresh logs or run a URL scan to strengthen the briefing context.'
      }
    ]
  };
}

async function getThreatBriefing() {
  if (!global.USE_MOCK_DATA && mongoose.connection.readyState === 1) {
    const [logAnalysis, scanResult] = await Promise.all([
      LogAnalysis.findOne().sort({ timestamp: -1 }).lean(),
      ScanResult.findOne().sort({ scanDate: -1 }).lean()
    ]);

    if (logAnalysis || scanResult) {
      return buildThreatBriefing({
        logAnalysis: logAnalysis || demoContext.logAnalysis,
        scanResult,
        isDemo: !logAnalysis
      });
    }
  }

  return buildThreatBriefing(demoContext);
}

module.exports = {
  buildThreatBriefing,
  getThreatBriefing
};
