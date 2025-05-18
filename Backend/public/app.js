// API Base URL
const API_BASE_URL = 'http://localhost:3001';

// DOM Elements
const urlScanForm = document.getElementById('url-scan-form');
const targetUrlInput = document.getElementById('target-url');
const scanButton = document.getElementById('scan-button');
const urlSpinner = document.getElementById('url-spinner');
const urlResultsInfo = document.getElementById('url-results-info');
const urlResultsContainer = document.getElementById('url-results-container');
const urlSummary = document.getElementById('url-summary');
const technologiesList = document.getElementById('technologies-list');
const vulnerabilitiesList = document.getElementById('vulnerabilities-list');
const rawHeaders = document.getElementById('raw-headers');
const dbSaveStatus = document.getElementById('db-save-status');

const logAnalysisForm = document.getElementById('log-analysis-form');
const logFileInput = document.getElementById('log-file');
const useSampleFileLink = document.getElementById('use-sample-file');
const analyzeButton = document.getElementById('analyze-button');
const logSpinner = document.getElementById('log-spinner');
const logResultsInfo = document.getElementById('log-results-info');
const logResultsContainer = document.getElementById('log-results-container');
const logAnalysisId = document.getElementById('log-analysis-id');
const analysisIdValue = document.getElementById('analysis-id-value');
const copyAnalysisIdButton = document.getElementById('copy-analysis-id');
const logSummary = document.getElementById('log-summary');
const threatsList = document.getElementById('threats-list');

const logAnalysisIdInput = document.getElementById('log-analysis-id-input');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatSpinner = document.getElementById('chat-spinner');
const chatMessages = document.getElementById('chat-messages');

const refreshDbButton = document.getElementById('refresh-db-button');
const dbSpinner = document.getElementById('db-spinner');
const scanResultsTable = document.getElementById('scan-results-table');
const scanResultsBody = document.getElementById('scan-results-body');
const dbResultsInfo = document.getElementById('db-results-info');

const resultModal = document.getElementById('resultModal');
const modalBodyContent = document.getElementById('modal-body-content');

// Check server status
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            console.log('Server is running');
            console.log('Database status:', data.database);
            
            // Update UI with server status
            if (data.database !== 'connected') {
                dbSaveStatus.textContent = 'Database is not connected. Scan results may not be saved.';
                dbSaveStatus.classList.remove('d-none');
            }
        } else {
            alert('Server is not running properly. Some features may not work.');
        }
    } catch (error) {
        console.error('Error checking server status:', error);
        alert('Cannot connect to the server. Please ensure it is running.');
    }
}

// URL Scanning Functions
async function scanUrl(url) {
    try {
        urlSpinner.classList.remove('d-none');
        scanButton.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/api/scan/scan-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ target_url: url })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        displayUrlScanResults(data);
        
        // Fetch the database after scanning to update the table
        fetchScanResults();
        
        return data;
    } catch (error) {
        console.error('Error scanning URL:', error);
        urlResultsInfo.textContent = `Error scanning URL: ${error.message}`;
        urlResultsInfo.classList.remove('d-none');
        urlResultsContainer.classList.add('d-none');
    } finally {
        urlSpinner.classList.add('d-none');
        scanButton.disabled = false;
    }
}

function displayUrlScanResults(data) {
    urlResultsInfo.classList.add('d-none');
    urlResultsContainer.classList.remove('d-none');
    
    // Display summary
    urlSummary.textContent = data.summary || 'No summary available';
    
    // Display technologies
    technologiesList.innerHTML = '';
    if (data.raw_results && data.raw_results.technologies && data.raw_results.technologies.length > 0) {
        data.raw_results.technologies.forEach(tech => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = tech;
            technologiesList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = 'No technologies detected';
        technologiesList.appendChild(li);
    }
    
    // Display vulnerabilities
    vulnerabilitiesList.innerHTML = '';
    
    if (data.vulnerabilities && data.vulnerabilities.length > 0) {
        data.vulnerabilities.forEach(vuln => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-danger';
            li.textContent = vuln;
            vulnerabilitiesList.appendChild(li);
        });
    } else if (data.raw_results && data.raw_results.outdated && data.raw_results.outdated.length > 0) {
        data.raw_results.outdated.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item list-group-item-warning';
            li.textContent = `Outdated software: ${item}`;
            vulnerabilitiesList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.className = 'list-group-item list-group-item-success';
        li.textContent = 'No vulnerabilities detected';
        vulnerabilitiesList.appendChild(li);
    }
    
    // Display raw headers
    if (data.raw_results && data.raw_results.headers) {
        rawHeaders.textContent = JSON.stringify(data.raw_results.headers, null, 2);
    } else {
        rawHeaders.textContent = 'No header information available';
    }
    
    // Display database save status
    if (data.note) {
        dbSaveStatus.textContent = data.note;
        dbSaveStatus.classList.remove('d-none');
    } else {
        dbSaveStatus.classList.add('d-none');
    }
}

// Log Analysis Functions
async function analyzeLogFile(formData) {
    try {
        logSpinner.classList.remove('d-none');
        analyzeButton.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/api/analyze-log`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        displayLogAnalysisResults(data);
        
        return data;
    } catch (error) {
        console.error('Error analyzing log file:', error);
        logResultsInfo.textContent = `Error analyzing log file: ${error.message}`;
        logResultsInfo.classList.remove('d-none');
        logResultsContainer.classList.add('d-none');
    } finally {
        logSpinner.classList.add('d-none');
        analyzeButton.disabled = false;
    }
}

function displayLogAnalysisResults(data) {
    logResultsInfo.classList.add('d-none');
    logResultsContainer.classList.remove('d-none');
    
    // Display analysis ID
    if (data.analysis && data.analysis.logAnalysisId) {
        analysisIdValue.textContent = data.analysis.logAnalysisId;
        // Auto-fill the chat input
        logAnalysisIdInput.value = data.analysis.logAnalysisId;
    } else {
        analysisIdValue.textContent = 'No ID available';
    }
    
    // Display summary
    if (data.analysis && data.analysis.summary) {
        logSummary.textContent = data.analysis.summary;
    } else {
        logSummary.textContent = 'No summary available';
    }
    
    // Display threats
    threatsList.innerHTML = '';
    if (data.analysis && data.analysis.threats && data.analysis.threats.length > 0) {
        data.analysis.threats.forEach(threat => {
            const tr = document.createElement('tr');
            
            const typeCell = document.createElement('td');
            typeCell.textContent = threat.type || 'Unknown';
            
            const severityCell = document.createElement('td');
            severityCell.textContent = threat.severity || 'Unknown';
            
            const countCell = document.createElement('td');
            countCell.textContent = threat.count || '1';
            
            const descCell = document.createElement('td');
            descCell.textContent = threat.description || 'No description';
            
            tr.appendChild(typeCell);
            tr.appendChild(severityCell);
            tr.appendChild(countCell);
            tr.appendChild(descCell);
            
            threatsList.appendChild(tr);
        });
    } else {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 4;
        td.textContent = 'No threats detected or data unavailable';
        td.className = 'text-center';
        tr.appendChild(td);
        threatsList.appendChild(tr);
    }
}

// Chat Functions
async function sendChatMessage(message, logAnalysisId) {
    try {
        chatSpinner.classList.remove('d-none');
        sendButton.disabled = true;
        
        // Add user message to chat
        addMessageToChat('user', message);
        
        const response = await fetch(`${API_BASE_URL}/api/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                logAnalysisId: logAnalysisId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add assistant message to chat
        if (data.response) {
            addMessageToChat('assistant', data.response);
        } else {
            addMessageToChat('assistant', 'Sorry, I could not generate a response.');
        }
        
        return data;
    } catch (error) {
        console.error('Error sending chat message:', error);
        addMessageToChat('system', `Error: ${error.message}`);
    } finally {
        chatSpinner.classList.add('d-none');
        sendButton.disabled = false;
    }
}

function addMessageToChat(role, content) {
    const messageElement = document.createElement('div');
    
    if (role === 'user') {
        messageElement.className = 'user-message';
    } else if (role === 'assistant') {
        messageElement.className = 'assistant-message';
    } else {
        messageElement.className = 'system-message';
    }
    
    messageElement.textContent = content;
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Database View Functions
async function fetchScanResults() {
    try {
        dbSpinner.classList.remove('d-none');
        refreshDbButton.disabled = true;
        
        const response = await fetch(`${API_BASE_URL}/api/scan/results`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        displayScanResults(data);
        
        return data;
    } catch (error) {
        console.error('Error fetching scan results:', error);
        dbResultsInfo.textContent = `Error fetching database records: ${error.message}`;
        dbResultsInfo.classList.remove('d-none');
        scanResultsTable.classList.add('d-none');
    } finally {
        dbSpinner.classList.add('d-none');
        refreshDbButton.disabled = false;
    }
}

function displayScanResults(data) {
    scanResultsBody.innerHTML = '';
    
    if (data && data.results && data.results.length > 0) {
        dbResultsInfo.classList.add('d-none');
        scanResultsTable.classList.remove('d-none');
        
        data.results.forEach(result => {
            const row = document.createElement('tr');
            
            // ID
            const idCell = document.createElement('td');
            idCell.textContent = result._id;
            
            // URL
            const urlCell = document.createElement('td');
            urlCell.textContent = result.targetUrl;
            
            // Scan Date
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(result.scanDate).toLocaleString();
            
            // Vulnerabilities
            const vulnCell = document.createElement('td');
            if (result.vulnerabilities && result.vulnerabilities.length > 0) {
                vulnCell.textContent = result.vulnerabilities.length;
                vulnCell.className = 'text-danger';
            } else {
                vulnCell.textContent = '0';
                vulnCell.className = 'text-success';
            }
            
            // Actions
            const actionsCell = document.createElement('td');
            const viewButton = document.createElement('button');
            viewButton.className = 'btn btn-sm btn-outline-primary';
            viewButton.textContent = 'View';
            viewButton.addEventListener('click', () => showResultDetails(result));
            actionsCell.appendChild(viewButton);
            
            row.appendChild(idCell);
            row.appendChild(urlCell);
            row.appendChild(dateCell);
            row.appendChild(vulnCell);
            row.appendChild(actionsCell);
            
            scanResultsBody.appendChild(row);
        });
    } else {
        dbResultsInfo.textContent = 'No scan results found in the database.';
        dbResultsInfo.classList.remove('d-none');
        scanResultsTable.classList.add('d-none');
    }
}

function showResultDetails(result) {
    // Create content for modal
    let content = `
        <div class="mb-3">
            <h6>URL</h6>
            <p>${result.targetUrl}</p>
        </div>
        <div class="mb-3">
            <h6>Scan Date</h6>
            <p>${new Date(result.scanDate).toLocaleString()}</p>
        </div>
        <div class="mb-3">
            <h6>Summary</h6>
            <div class="alert alert-secondary">${result.summary || 'No summary available'}</div>
        </div>
    `;
    
    // Add vulnerabilities if present
    if (result.vulnerabilities && result.vulnerabilities.length > 0) {
        content += `
            <div class="mb-3">
                <h6>Vulnerabilities</h6>
                <ul class="list-group">
        `;
        
        result.vulnerabilities.forEach(vuln => {
            content += `<li class="list-group-item list-group-item-danger">${vuln}</li>`;
        });
        
        content += `
                </ul>
            </div>
        `;
    } else {
        content += `
            <div class="mb-3">
                <h6>Vulnerabilities</h6>
                <div class="alert alert-success">No vulnerabilities detected</div>
            </div>
        `;
    }
    
    // Add raw scan data if present
    if (result.rawScanData) {
        content += `
            <div class="mb-3">
                <h6>Raw Scan Data</h6>
                <pre class="bg-light p-3">${JSON.stringify(result.rawScanData, null, 2)}</pre>
            </div>
        `;
    }
    
    modalBodyContent.innerHTML = content;
    
    // Show modal
    const modal = new bootstrap.Modal(resultModal);
    modal.show();
}

// Event Listeners
urlScanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = targetUrlInput.value.trim();
    if (url) {
        await scanUrl(url);
    }
});

logAnalysisForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (logFileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', logFileInput.files[0]);
        await analyzeLogFile(formData);
    }
});

useSampleFileLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Create a FormData object pointing to the sample file
    const formData = new FormData();
    formData.append('sampleFile', 'true');
    formData.append('path', 'C:\\Users\\pbpan\\OneDrive\\Desktop\\Aventus\\RedHawk\\uploads\\clean_log.csv');
    
    // This is a simulated file upload with the path
    await analyzeLogFile(formData);
});

copyAnalysisIdButton.addEventListener('click', () => {
    const idText = analysisIdValue.textContent;
    navigator.clipboard.writeText(idText)
        .then(() => {
            copyAnalysisIdButton.textContent = 'Copied!';
            setTimeout(() => {
                copyAnalysisIdButton.textContent = 'Copy';
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
        });
});

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    const logId = logAnalysisIdInput.value.trim();
    
    if (message && logId) {
        await sendChatMessage(message, logId);
        chatInput.value = '';
    } else if (!logId) {
        addMessageToChat('system', 'Please enter a Log Analysis ID first.');
    }
});

refreshDbButton.addEventListener('click', async () => {
    await fetchScanResults();
});

// Initial setup
document.addEventListener('DOMContentLoaded', async () => {
    // Check server status
    await checkServerStatus();
    
    // Fetch scan results
    await fetchScanResults();
    
    // Set URL in form if in query string
    const urlParams = new URLSearchParams(window.location.search);
    const urlParam = urlParams.get('url');
    if (urlParam) {
        targetUrlInput.value = urlParam;
    }
}); 