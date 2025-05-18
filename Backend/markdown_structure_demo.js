/**
 * Markdown Structure Demo for RedHawk
 * 
 * This script demonstrates how to parse and work with markdown
 * content using simple string operations.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const markdownStructure = require('./utils/markdownStructure');

// Sample log analysis data
const sampleLogAnalysis = {
  timestamp: new Date().toISOString(),
  totalRecords: 1000,
  predictionCounts: {
    'normal': 750,
    'attack': 120,
    'probe': 80,
    'anomaly': 50
  },
  predictionPercentages: {
    'normal': '75.0%',
    'attack': '12.0%',
    'probe': '8.0%',
    'anomaly': '5.0%'
  },
  recommendedActions: [
    'Investigate the 120 potential attack entries',
    'Block suspicious IP addresses: 192.168.1.100, 192.168.1.105',
    'Update firewall rules to restrict incoming connections',
    'Monitor system logs for further anomalies'
  ],
  securityLevel: 'HIGH'
};

// Function to run the RedHawk assistant with a query
function runAssistant(query) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, 'AI', 'redhawk_assistant.py');
    
    const args = [
      pythonScriptPath,
      '--query', query
    ];
    
    // Add path to a summary file if available
    const summaryPath = path.join(__dirname, '..', 'uploads', 'summary.json');
    if (fs.existsSync(summaryPath)) {
      args.push('--summary', summaryPath);
    }
    
    const pythonProcess = spawn('python', args);
    
    let responseData = '';
    let errorData = '';
    
    pythonProcess.stdout.on('data', (data) => {
      responseData += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Assistant error: ${errorData || 'Unknown error'}`));
      }
      
      // Extract assistant response (strip "RedHawk Assistant: " prefix if present)
      let assistantResponse = responseData.trim();
      const prefixMatch = assistantResponse.match(/RedHawk Assistant:\s*(.*)/);
      if (prefixMatch) {
        assistantResponse = prefixMatch[1].trim();
      }
      
      resolve(assistantResponse);
    });
  });
}

// Demo function
async function runDemo() {
  try {
    console.log('🚀 Starting RedHawk Markdown Structure Demo');
    
    // Get a response from the assistant
    const query = 'What security threats are in the logs?';
    console.log(`\n📝 Asking assistant: "${query}"`);
    
    const response = await runAssistant(query);
    console.log(`\n🤖 Assistant response: "${response}"`);
    
    // Format the response as markdown
    console.log('\n✨ Formatting response as markdown...');
    const formattedMarkdown = markdownStructure.formatRedHawkResponse(
      response, 
      { 
        logAnalysis: sampleLogAnalysis,
        securityLevel: sampleLogAnalysis.securityLevel,
        timestamp: sampleLogAnalysis.timestamp
      }
    );
    
    // Save the markdown to a file
    const markdownPath = path.join(__dirname, 'structure_output.md');
    fs.writeFileSync(markdownPath, formattedMarkdown);
    console.log(`📄 Markdown saved to: ${markdownPath}`);
    
    // Parse the markdown structure
    console.log('\n🔍 Parsing markdown structure...');
    const parsedData = markdownStructure.parseRedHawkResponse(formattedMarkdown);
    
    // Save parsed data as JSON
    const jsonPath = path.join(__dirname, 'parsed_structure.json');
    fs.writeFileSync(jsonPath, JSON.stringify(parsedData, null, 2));
    console.log(`💾 Parsed data saved to: ${jsonPath}`);
    
    // Extract sections
    console.log('\n📋 Extracting sections from markdown...');
    const sections = markdownStructure.extractSections(formattedMarkdown);
    
    // Display the sections
    console.log('Section names found:');
    Object.keys(sections).forEach(sectionName => {
      console.log(`- ${sectionName}`);
    });
    
    // Extract bullet points from the recommended actions section
    if (sections['Recommended Actions']) {
      console.log('\n📌 Extracting bullet points from Recommended Actions:');
      const actions = markdownStructure.extractBulletPoints(sections['Recommended Actions']);
      actions.forEach((action, i) => {
        console.log(`${i + 1}. ${action}`);
      });
    }
    
    console.log('\n✅ Demo complete!');
    console.log(`\nYou can now use the markdown structure utility to parse markdown responses.`);
    
  } catch (error) {
    console.error('❌ Error in demo:', error);
  }
}

// Run the demo
runDemo(); 