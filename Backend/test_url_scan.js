const mongoose = require('mongoose');
const { exec } = require('child_process');
const path = require('path');
const ScanResult = require('./models/ScanResult');

// MongoDB connection string - using the same as in server.js
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redhawk';
const targetUrl = process.argv[2] || 'https://example.com';

// Connect to MongoDB
console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).then(async () => {
  console.log(`MongoDB Connected: ${MONGO_URI.split('@').pop() || 'localhost'}`);
  
  // Execute the URL scan
  console.log(`Scanning URL: ${targetUrl}`);
  const pythonScriptPath = path.join(__dirname, 'AI/url_scan.py');
  
  exec(`python "${pythonScriptPath}" "${targetUrl}" --skip-ai`, { maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing URL scan: ${error.message}`);
      console.error(`Stderr: ${stderr}`);
      await mongoose.connection.close();
      process.exit(1);
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
          vulnerabilities.push({
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
        vulnerabilities.push({
          type: 'SQL_INJECTION',
          severity: 'HIGH',
          description: 'Potential SQL Injection vulnerability detected',
          affectedComponent: 'Web Application',
          remediation: 'Use parameterized queries and input validation'
        });
      }

      // Check for XSS (HIGH severity)
      if (raw_results.vuln_tests && raw_results.vuln_tests.xss_suspected) {
        vulnerabilities.push({
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

      // Create a new scan result document
      const scanResult = new ScanResult({
        targetUrl: url,
        rawResults: transformedResults,
        vulnerabilities: vulnerabilities,
        summary: summary || "No summary available",
        scanDetails: {
          duration: 0, // Not measuring duration in this test
          technologies: raw_results.technologies || []
        }
      });

      // Save the scan result to the database
      await scanResult.save();
      console.log(`Scan result saved to database with ID: ${scanResult._id}`);
      
      // Check the updated scan count
      const count = await ScanResult.countDocuments({});
      console.log(`Total scan results in database: ${count}`);
      
      // Close the connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    } catch (err) {
      console.error(`Error processing scan results: ${err.message}`);
      console.error(`Stdout: ${stdout.substring(0, 500)}...`);
      await mongoose.connection.close();
    }
  });
}).catch(err => {
  console.error(`MongoDB Connection Error: ${err.message}`);
}); 