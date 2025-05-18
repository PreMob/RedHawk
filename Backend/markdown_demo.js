const MarkdownIt = require('markdown-it');
const fs = require('fs');
const path = require('path');

// Initialize markdown parser with default options
const md = new MarkdownIt();

// Example markdown content
const markdownContent = `
# RedHawk Security Analysis

## Overview
RedHawk provides cybersecurity log analysis with AI-assisted insights.

## Key Features
- **Log Analysis**: Analyze security logs for threats
- **AI Assistant**: Get intelligent recommendations
- **URL Scanning**: Check for malicious URLs

## Sample Security Alert
\`\`\`json
{
  "severity": "HIGH",
  "type": "INTRUSION_ATTEMPT",
  "source": "192.168.1.100",
  "timestamp": "2025-05-18T07:45:23Z"
}
\`\`\`

> **Note**: Always investigate high severity alerts immediately!

Visit [RedHawk Documentation](https://example.com/redhawk) for more information.
`;

// Parse markdown to HTML
const htmlResult = md.render(markdownContent);

// Create output file
const outputPath = path.join(__dirname, 'markdown_output.html');
fs.writeFileSync(outputPath, `
<!DOCTYPE html>
<html>
<head>
  <title>RedHawk Markdown Demo</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
    code { font-family: 'Courier New', monospace; }
    blockquote { border-left: 4px solid #ccc; padding-left: 15px; color: #555; }
  </style>
</head>
<body>
  <h1>Markdown Parser Demo</h1>
  <hr>
  <h2>Rendered HTML:</h2>
  ${htmlResult}
  <hr>
  <h2>Original Markdown:</h2>
  <pre>${markdownContent}</pre>
</body>
</html>
`);

console.log(`
✅ Markdown successfully parsed!
📄 Output file created at: ${outputPath}
🌐 Open this file in your browser to see the rendered HTML

To use markdown-it in your project:
1. Import the library: const md = require('markdown-it')();
2. Parse markdown: const html = md.render(markdownText);
3. Use the resulting HTML in your application
`); 