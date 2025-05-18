/**
 * Markdown Parser Demo for RedHawk
 * 
 * This script demonstrates how to parse and work with markdown
 * content without converting to HTML.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const markdownParser = require('./utils/markdownParser');

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
    console.log('🚀 Starting RedHawk Markdown Parser Demo');
    
    // Get a response from the assistant
    const query = 'What security threats are in the logs?';
    console.log(`\n📝 Asking assistant: "${query}"`);
    
    const response = await runAssistant(query);
    console.log(`\n🤖 Assistant response: "${response}"`);
    
    // Format the response as markdown
    console.log('\n✨ Formatting response as markdown...');
    const formattedMarkdown = markdownParser.formatRedHawkResponse(
      response, 
      { 
        logAnalysis: sampleLogAnalysis,
        securityLevel: sampleLogAnalysis.securityLevel,
        timestamp: sampleLogAnalysis.timestamp
      }
    );
    
    // Save the markdown to a file
    const markdownPath = path.join(__dirname, 'parser_output.md');
    fs.writeFileSync(markdownPath, formattedMarkdown);
    console.log(`📄 Markdown saved to: ${markdownPath}`);
    
    // Parse the markdown structure
    console.log('\n🔍 Parsing markdown structure...');
    const parsedData = markdownParser.parseRedHawkResponse(formattedMarkdown);
    
    // Save parsed data as JSON
    const jsonPath = path.join(__dirname, 'parsed_markdown.json');
    fs.writeFileSync(jsonPath, JSON.stringify(parsedData, null, 2));
    console.log(`💾 Parsed data saved to: ${jsonPath}`);
    
    // Display the parsed structure
    console.log('\n📊 Parsed Markdown Structure:');
    console.log('---------------------------');
    console.log(`Title: ${parsedData.title}`);
    console.log(`Security Level: ${parsedData.securityLevel}`);
    console.log(`Analysis Time: ${parsedData.analysisTime}`);
    console.log(`\nAnalysis Results:`);
    console.log(parsedData.analysisResults);
    
    console.log('\nRecommended Actions:');
    parsedData.recommendedActions.forEach((action, i) => {
      console.log(`${i + 1}. ${action}`);
    });
    
    console.log('\nLog Classifications:');
    console.log('--------------------------');
    console.log('Category | Count | Percentage');
    console.log('--------------------------');
    parsedData.logClassifications.forEach(entry => {
      console.log(`${entry.category} | ${entry.count} | ${entry.percentage}`);
    });
    
    console.log('\n✅ Demo complete!');
    console.log(`\nYou can now use the markdown parser to work directly with the structure of markdown responses.`);
    
  } catch (error) {
    console.error('❌ Error in demo:', error);
  }
}

// Run the demo
runDemo(); 