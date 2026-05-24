const { buildThreatBriefing } = require('../services/threatBriefingService');

describe('Threat Briefing Service', () => {
  it('builds a structured briefing from log and scan context', () => {
    const briefing = buildThreatBriefing({
      logAnalysis: {
        filename: 'sample.csv',
        totalRecords: 100,
        predictionCounts: {
          normal: 70,
          probe: 10,
          attack: 15,
          anomaly: 5
        },
        predictionPercentages: {
          normal: 70,
          probe: 10,
          attack: 15,
          anomaly: 5
        },
        recommendedActions: ['Block repeated malicious sources'],
        logEntries: [
          {
            sourceIp: '203.0.113.10',
            type: 'attack',
            sensitivity: 'HIGH',
            status: 'ALERT'
          }
        ]
      },
      scanResult: {
        targetUrl: 'https://example.com',
        vulnerabilities: [
          {
            type: 'SQL_INJECTION',
            severity: 'HIGH',
            description: 'Potential SQL injection',
            affectedComponent: 'Web Application',
            remediation: 'Use parameterized queries'
          }
        ]
      }
    });

    expect(briefing.riskScore).toBeGreaterThan(0);
    expect(briefing.attackPath).toHaveLength(5);
    expect(briefing.priorityActions.length).toBeGreaterThan(0);
    expect(briefing.detectionIdeas).toHaveLength(3);
    expect(briefing.metrics.topSources[0].ip).toBe('203.0.113.10');
  });
});
