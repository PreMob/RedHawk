/**
 * RedHawk Assistant Markdown Demo
 * 
 * This script demonstrates how to format RedHawk Assistant 
 * responses using markdown and display them as HTML.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const markdownFormatter = require('./utils/markdownFormatter');

// Sample log analysis data (similar to what would come from the database)
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
    console.log('🚀 Starting RedHawk Assistant Markdown Demo');
    
    // Get a response from the assistant
    const query = 'What security threats are in the logs?';
    console.log(`\n📝 Asking assistant: "${query}"`);
    
    const response = await runAssistant(query);
    console.log(`\n🤖 Assistant response: "${response}"`);
    
    // Format the response as markdown
    console.log('\n✨ Formatting response as markdown...');
    const markdown = markdownFormatter.formatResponseAsMarkdown(
      response, 
      { 
        logAnalysis: sampleLogAnalysis,
        securityLevel: sampleLogAnalysis.securityLevel,
        timestamp: sampleLogAnalysis.timestamp
      }
    );
    
    // Convert markdown to HTML
    console.log('\n🔄 Converting markdown to HTML...');
    const html = markdownFormatter.convertMarkdownToHtml(markdown);
    
    // Write outputs to files
    const markdownPath = path.join(__dirname, 'assistant_response.md');
    const htmlPath = path.join(__dirname, 'assistant_response.html');
    
    fs.writeFileSync(markdownPath, markdown);
    fs.writeFileSync(htmlPath, `
<!DOCTYPE html>
<html>
<head>
  <title>RedHawk Assistant Response</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    code { font-family: 'Courier New', monospace; }
    blockquote { border-left: 4px solid #ccc; padding-left: 15px; color: #555; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  ${html}
</body>
</html>
    `);
    
    console.log(`\n✅ Demo complete!`);
    console.log(`📄 Markdown output: ${markdownPath}`);
    console.log(`🌐 HTML output: ${htmlPath}`);
    console.log(`\nOpen ${htmlPath} in your browser to view the formatted assistant response.`);
    
  } catch (error) {
    console.error('❌ Error in demo:', error);
  }
}

// Run the demo
runDemo(); 