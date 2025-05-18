const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// Model imports
require('./models/LogAnalysis');
require('./models/ChatConversation');
require('./models/ScanResult');

// Route imports
const logRoutes = require('./routes/logRoutes');
const chatRoutes = require('./routes/chatRoutes');
const scanRoutes = require('./routes/scanRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redhawk';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple frontend for testing URL scanning
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>RedHawk URL Scanner</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #333; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input[type="text"] { width: 100%; padding: 8px; font-size: 16px; }
        button { padding: 10px 15px; background: #4CAF50; color: white; border: none; cursor: pointer; }
        #result { margin-top: 20px; white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 4px; }
        .spinner { display: none; }
        .spinner.active { display: inline-block; }
      </style>
    </head>
    <body>
      <h1>RedHawk URL Scanner</h1>
      <div class="form-group">
        <label for="url">Enter URL to scan:</label>
        <input type="text" id="url" placeholder="https://example.com" value="https://example.com">
      </div>
      <button id="scanBtn">Scan URL</button>
      <span class="spinner" id="spinner">Scanning...</span>
      <div id="result"></div>

      <script>
        document.getElementById('scanBtn').addEventListener('click', async () => {
          const url = document.getElementById('url').value;
          const resultDiv = document.getElementById('result');
          const spinner = document.getElementById('spinner');
          
          if (!url) {
            resultDiv.textContent = 'Please enter a URL';
            return;
          }
          
          resultDiv.textContent = '';
          spinner.classList.add('active');
          
          try {
            const response = await fetch('/api/scan/scan-url', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ target_url: url })
            });
            
            const data = await response.json();
            resultDiv.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultDiv.textContent = 'Error: ' + error.message;
          } finally {
            spinner.classList.remove('active');
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Connect to MongoDB with improved error handling and retry logic
console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);

// Retry connection function with exponential backoff
const connectWithRetry = () => {
  console.log('MongoDB connection attempt...');
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log(`MongoDB Connected: ${MONGO_URI.split('@').pop() || 'localhost'}`);
  }).catch(err => {
    console.error(`MongoDB Connection Error: ${err.message}`);
    console.log('Will use mock data mode since MongoDB is unavailable');
    // Set a global flag to indicate we're in mock data mode
    global.USE_MOCK_DATA = true;
  });
};

// Initial connection attempt
connectWithRetry();

// Routes
app.use('/api', logRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/scan', scanRoutes);

// Test URL scanning endpoint
app.get('/test-url-scan', (req, res) => {
  const targetUrl = req.query.url || 'https://example.com';
  const pythonScriptPath = path.join(__dirname, 'AI/url_scan.py');
  
  console.log(`Testing URL scan for: ${targetUrl}`);
  console.log(`Script path: ${pythonScriptPath}`);
  
  exec(`python "${pythonScriptPath}" "${targetUrl}" --skip-ai`, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing URL scan: ${error.message}`);
      return res.status(500).json({ error: 'Failed to scan URL', details: error.message, stderr });
    }

    try {
      const scanOutput = JSON.parse(stdout);
      res.status(200).json(scanOutput);
    } catch (err) {
      console.error(`Error parsing scan output: ${err.message}`);
      res.status(500).json({ 
        error: 'Failed to parse scan results', 
        details: err.message,
        stdout: stdout,
        stderr: stderr
      });
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Serve the test dashboard frontend
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test interface available at http://localhost:${PORT}`);
  console.log(`Test dashboard available at http://localhost:${PORT}/dashboard`);
  console.log(`Test API endpoint: http://localhost:${PORT}/test-url-scan?url=https://example.com`);
});