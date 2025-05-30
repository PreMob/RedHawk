/**
 * Markdown Formatter for RedHawk Assistant
 * 
 * Provides utilities to format the assistant's responses as markdown
 * and convert them to HTML for display in the frontend.
 */

const MarkdownIt = require('markdown-it');
const md = new MarkdownIt({
  html: true,        // Enable HTML tags in source
  breaks: true,      // Convert '\n' in paragraphs into <br>
  linkify: true,     // Autoconvert URL-like text to links
  typographer: true  // Enable some language-neutral replacement + quotes beautification
});

/**
 * Format raw assistant response into structured markdown
 * @param {string} response - The assistant's text response
 * @param {object} metadata - Optional metadata about the response
 * @returns {string} Formatted markdown string
 */
function formatResponseAsMarkdown(response, metadata = {}) {
  const { logAnalysis, securityLevel = 'Unknown', timestamp = new Date().toISOString() } = metadata;
  
  let markdownContent = `# RedHawk Security Analysis\n\n`;
  
  // Add metadata section
  markdownContent += `**Analysis Time**: ${new Date(timestamp).toLocaleString()}\n`;
  markdownContent += `**Security Level**: ${securityLevel}\n\n`;
  
  // Add main response
  markdownContent += `## Analysis Results\n\n${response}\n\n`;
  
  // Add log analysis details if available
  if (logAnalysis) {
    if (logAnalysis.recommendedActions && logAnalysis.recommendedActions.length > 0) {
      markdownContent += `## Recommended Actions\n\n`;
      logAnalysis.recommendedActions.forEach(action => {
        markdownContent += `- ${action}\n`;
      });
      markdownContent += '\n';
    }
    
    if (logAnalysis.predictionCounts) {
      markdownContent += `## Log Entry Classifications\n\n`;
      markdownContent += '| Category | Count | Percentage |\n';
      markdownContent += '|----------|-------|------------|\n';
      
      for (const [category, count] of Object.entries(logAnalysis.predictionCounts)) {
        const percentage = logAnalysis.predictionPercentages && 
                         logAnalysis.predictionPercentages[category] || 'N/A';
        
        markdownContent += `| ${category} | ${count} | ${percentage} |\n`;
      }
      markdownContent += '\n';
    }
  }
  
  // Add footer
  markdownContent += `---\n\n`;
  markdownContent += `*This analysis was generated by RedHawk Assistant. Always verify security findings with your team.*`;
  
  return markdownContent;
}

/**
 * Convert markdown to HTML for display
 * @param {string} markdown - Markdown formatted string
 * @returns {string} HTML string
 */
function convertMarkdownToHtml(markdown) {
  return md.render(markdown);
}

/**
 * Format assistant response as HTML (markdown converted to HTML)
 * @param {string} response - The assistant's text response
 * @param {object} metadata - Optional metadata about the response
 * @returns {string} HTML string
 */
function formatResponseAsHtml(response, metadata = {}) {
  const markdown = formatResponseAsMarkdown(response, metadata);
  return convertMarkdownToHtml(markdown);
}

module.exports = {
  formatResponseAsMarkdown,
  convertMarkdownToHtml,
  formatResponseAsHtml
}; 