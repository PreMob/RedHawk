// Handles URL scanning using url_scan.py and saves results to database
const { exec } = require('child_process');
const path = require('path');
const ScanResult = require('../models/ScanResult');
const crypto = require('crypto');

// Mock data for when MongoDB is unavailable
const mockScanResults = [
  {
    _id: crypto.randomUUID(),
    targetUrl: 'https://example.com',
    scanDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    summary: 'No obvious security issues detected in this basic scan.',
    vulnerabilities: [],
    rawScanData: {
      headers: {
        'server': 'ECS (sec/96DB)',
        'content-type': 'text/html; charset=UTF-8',
        'strict-transport-security': 'max-age=31536000',
        'date': 'Wed, 08 May 2024 17:31:22 GMT'
      },
      technologies: ['ECS (sec/96DB)'],
      outdated: [],
      vulnTests: {
        sqlInjection: [],
        sqlInjectionSuspected: false,
        xss: [],
        xssSuspected: false
      }
    }
  },
  {
    _id: crypto.randomUUID(),
    targetUrl: 'https://test-vulnerable-site.example',
    scanDate: new Date().toISOString(), // Today
    summary: 'Security scan detected potential vulnerabilities including outdated software and XSS injection points.',
    vulnerabilities: [
      'Outdated software: Apache/2.2.15',
      'Potential Cross-Site Scripting (XSS) vulnerability detected'
    ],
    rawScanData: {
      headers: {
        'server': 'Apache/2.2.15',
        'content-type': 'text/html; charset=UTF-8',
        'date': 'Wed, 08 May 2024 18:45:11 GMT'
      },
      technologies: ['Apache/2.2.15', 'PHP/5.6.40'],
      outdated: ['Apache/2.2.15', 'PHP/5.6.40'],
      vulnTests: {
        sqlInjection: [],
        sqlInjectionSuspected: false,
        xss: [
          { payload: '<script>alert(1)</script>', reflected: true },
          { payload: '<img src=x onerror=alert(1)>', reflected: true }
        ],
        xssSuspected: true
      }
    }
  },
  {
    _id: crypto.randomUUID(),
    targetUrl: 'https://test-sql-injection.example',
    scanDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    summary: 'Security scan detected potential SQL injection vulnerabilities.',
    vulnerabilities: [
      'Potential SQL Injection vulnerability detected'
    ],
    rawScanData: {
      headers: {
        'server': 'nginx/1.18.0',
        'content-type': 'text/html; charset=UTF-8',
        'date': 'Wed, 06 May 2024 12:22:33 GMT'
      },
      technologies: ['nginx/1.18.0'],
      outdated: [],
      vulnTests: {
        sqlInjection: [
          { test: 'true', length: 5200 },
          { test: 'false', length: 1540 }
        ],
        sqlInjectionSuspected: true,
        xss: [],
        xssSuspected: false
      }
    }
  }
];

exports.scanUrl = (req, res) => {
  const { target_url } = req.body;
  
  if (!target_url || !/^https?:\/\/.+/.test(target_url)) {
    return res.status(400).json({ error: 'Invalid or missing target_url' });
  }

  const pythonScriptPath = path.join(__dirname, '../AI/url_scan.py');
  const startTime = Date.now();

  console.log(`Running URL scan on: ${target_url}`);
  console.log(`Using Python script: ${pythonScriptPath}`);

  // Execute the Python script
  exec(`/usr/local/bin/python3 "${pythonScriptPath}" "${target_url}" --skip-ai`, { maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error(`Error executing URL scan: ${error.message}`);
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: 'Failed to scan URL', details: error.message });
    }

    if (stderr) {
      console.warn(`Stderr output: ${stderr}`);
    }

    try {
      // Parse the scan results
      console.log("Parsing scan output...");
      const scanOutput = JSON.parse(stdout);
      const { url, raw_results, summary } = scanOutput;

      // Transform the data to match our schema
      const vulnerabilities = [];
      
      // Check for outdated technologies (MEDIUM severity)
      if (raw_results.outdated && raw_results.outdated.length > 0) {
        raw_results.outdated.forEach(tech => {
          vulnerabilities.push(`Outdated software: ${tech}`);
        });
      }

      // Check for SQL Injection (HIGH severity)
      if (raw_results.vuln_tests && raw_results.vuln_tests.sql_injection_suspected) {
        vulnerabilities.push("Potential SQL Injection vulnerability detected");
      }

      // Check for XSS (HIGH severity)
      if (raw_results.vuln_tests && raw_results.vuln_tests.xss_suspected) {
        vulnerabilities.push("Potential Cross-Site Scripting (XSS) vulnerability detected");
      }

      // Detailed vulnerability objects for database storage only
      const vulnerabilityDetails = [];
      
      // Check for outdated technologies (MEDIUM severity)
      if (raw_results.outdated && raw_results.outdated.length > 0) {
        raw_results.outdated.forEach(tech => {
          vulnerabilityDetails.push({
            type: 'OUTDATED_SOFTWARE',
            severity: 'MEDIUM',
            description: `Outdated software found: ${tech}`,
            affectedComponent: tech,
            remediation: 'Update to the latest version'
          });
        });
      }

      // Check for SQL Injection (HIGH severity)
      if (raw_results.vuln_tests && raw_results.vuln_tests.sql_injection_suspected) {
        vulnerabilityDetails.push({
          type: 'SQL_INJECTION',
          severity: 'HIGH',
          description: 'Potential SQL Injection vulnerability detected',
          affectedComponent: 'Web Application',
          remediation: 'Use parameterized queries and input validation'
        });
      }

      // Check for XSS (HIGH severity)
      if (raw_results.vuln_tests && raw_results.vuln_tests.xss_suspected) {
        vulnerabilityDetails.push({
          type: 'XSS',
          severity: 'HIGH',
          description: 'Potential Cross-Site Scripting (XSS) vulnerability detected',
          affectedComponent: 'Web Application',
          remediation: 'Implement output encoding and Content-Security-Policy'
        });
      }

      // Transform the raw_results structure to match our schema
      const transformedResults = {
        headers: {},
        technologies: raw_results.technologies || [],
        outdated: raw_results.outdated || [],
        vulnTests: {
          sqlInjection: raw_results.vuln_tests?.sql_injection || [],
          sqlInjectionSuspected: raw_results.vuln_tests?.sql_injection_suspected || false,
          xss: raw_results.vuln_tests?.xss || [],
          xssSuspected: raw_results.vuln_tests?.xss_suspected || false
        },
        errors: raw_results.errors || []
      };

      // Convert headers from object to Map-compatible format
      if (raw_results.headers) {
        Object.entries(raw_results.headers).forEach(([key, value]) => {
          transformedResults.headers[key] = value.toString();
        });
      }

      // Check if using mock data mode
      if (global.USE_MOCK_DATA) {
        console.log("MongoDB is not connected, using mock data mode");
        
        // Create a new mock scan result
        const mockId = crypto.randomUUID();
        const newMockResult = {
          _id: mockId,
          targetUrl: url,
          scanDate: new Date().toISOString(),
          summary: summary,
          vulnerabilities: vulnerabilities,
          rawScanData: transformedResults
        };
        
        // Add to mock results
        mockScanResults.unshift(newMockResult);
        
        // Keep only the latest 10 results
        if (mockScanResults.length > 10) {
          mockScanResults.pop();
        }
        
        return res.status(200).json({
          scan_id: mockId,
          target_url: url,
          summary: summary,
          vulnerabilities: vulnerabilities,
          raw_results: raw_results,
          scan_duration_ms: duration
        });
      }

      // Check MongoDB connection before trying to save
      if (require('mongoose').connection.readyState !== 1) {
        console.log("MongoDB is not connected, returning results without saving");
        return res.status(200).json({
          target_url: url,
          summary: summary,
          vulnerabilities: vulnerabilities,
          raw_results: raw_results,
          scan_duration_ms: duration,
          note: "Results not saved to database due to no MongoDB connection"
        });
      }

      try {
        // Create a new scan result document
        const scanResult = new ScanResult({
          targetUrl: url,
          rawScanData: transformedResults,
          vulnerabilities: vulnerabilityDetails,
          summary: summary || "No summary available",
          scanDetails: {
            duration: duration,
            technologies: raw_results.technologies || []
          }
        });

        // Save the scan result to the database
        await scanResult.save();
        console.log(`Scan result saved to database with ID: ${scanResult._id}`);

        // Return the scan result
        res.status(200).json({
          scan_id: scanResult._id,
          target_url: url,
          summary: summary,
          vulnerabilities: vulnerabilities,
          raw_results: raw_results,
          scan_duration_ms: duration
        });
      } catch (dbErr) {
        console.error(`Database error saving scan result: ${dbErr.message}`);
        res.status(200).json({
          target_url: url,
          summary: summary,
          vulnerabilities: vulnerabilities,
          raw_results: raw_results,
          scan_duration_ms: duration,
          note: `Error saving to database: ${dbErr.message}`
        });
      }
    } catch (err) {
      console.error(`Error processing scan results: ${err.message}`);
      console.error(`Stdout: ${stdout.substring(0, 500)}...`);
      res.status(500).json({
        error: 'Failed to process scan results',
        details: err.message,
        stdout_sample: stdout.substring(0, 500)
      });
    }
  });
};

// Get all scan results
exports.getScanResults = async (req, res) => {
  // Check if using mock data mode
  if (global.USE_MOCK_DATA) {
    console.log("Using mock data for scan results");
    return res.status(200).json({ results: mockScanResults });
  }
  
  // Check MongoDB connection
  if (require('mongoose').connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  
  try {
    const scanResults = await ScanResult.find().sort('-scanDate').select('targetUrl scanDate summary vulnerabilities');
    res.status(200).json({ results: scanResults });
  } catch (err) {
    console.error(`Error fetching scan results: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch scan results' });
  }
};

// Get a specific scan result by ID
exports.getScanResultById = async (req, res) => {
  // Check if using mock data mode
  if (global.USE_MOCK_DATA) {
    console.log("Using mock data for scan result detail");
    const mockResult = mockScanResults.find(result => result._id === req.params.id);
    
    if (!mockResult) {
      return res.status(404).json({ error: 'Scan result not found' });
    }
    
    return res.status(200).json(mockResult);
  }
  
  // Check MongoDB connection
  if (require('mongoose').connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database connection unavailable' });
  }
  
  try {
    const scanResult = await ScanResult.findById(req.params.id);
    
    if (!scanResult) {
      return res.status(404).json({ error: 'Scan result not found' });
    }
    
    res.status(200).json(scanResult);
  } catch (err) {
    console.error(`Error fetching scan result: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch scan result' });
  }
};
