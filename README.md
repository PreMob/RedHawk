# RedHawk Cybersecurity Platform

<div align="center">
  <img src="frontend/public/logo.png" alt="RedHawk Logo" width="120" height="120" />
  
  **Advanced Threat Detection & Security Log Analysis Platform**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)
  [![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
</div>

## 🚀 Overview

RedHawk is a comprehensive cybersecurity platform that provides real-time monitoring, AI-powered security log analysis, and intelligent threat detection. Built with modern web technologies, it combines machine learning capabilities with an intuitive interface to help security professionals identify and respond to cyber threats effectively.

### ✨ Key Features

- **🔍 Advanced Log Analysis**: AI-powered analysis of security logs with threat detection and classification
- **🤖 Intelligent Assistant**: ChatGPT-powered cybersecurity assistant for expert guidance and recommendations
- **🌐 URL Security Scanning**: Real-time URL analysis for malware, phishing, and vulnerability detection
- **📊 Interactive Dashboard**: Comprehensive security overview with real-time metrics and visualizations
- **🎯 Threat Intelligence**: Automated threat categorization and risk assessment
- **📈 Predictive Analytics**: Machine learning models for anomaly detection and threat prediction
- **🔔 Real-time Alerts**: Instant notifications for high-priority security incidents
- **📋 Detailed Reporting**: Comprehensive security reports with actionable recommendations

## 🏗️ Architecture

RedHawk follows a modern full-stack architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │     Backend      │    │   AI Engine     │
│   (Next.js)     │◄──►│   (Node.js)      │◄──►│   (Python)      │
│                 │    │                  │    │                 │
│ • React 19      │    │ • Express.js     │    │ • Scikit-learn  │
│ • TailwindCSS   │    │ • MongoDB        │    │ • OpenAI API    │
│ • TypeScript    │    │ • RESTful APIs   │    │ • Pandas        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
RedHawk/
├── frontend/                 # Next.js React frontend
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── hooks/               # Custom React hooks
│   └── public/              # Static assets
├── Backend/                 # Node.js Express backend
│   ├── AI/                  # Python ML models and assistant
│   ├── controllers/         # Route controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── utils/               # Utility functions
├── uploads/                 # Temporary file storage
└── README.md               # This file
```

## 🚦 Getting Started

### Prerequisites

Before running RedHawk, ensure you have:

- **Node.js** 18.0 or higher
- **Python** 3.8 or higher
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/RedHawk.git
   cd RedHawk
   ```

2. **Backend Setup**
   ```bash
   cd Backend
   npm install
   
   # Install Python dependencies
   pip install -r ../requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=3001
   MONGO_URI=mongodb://127.0.0.1:27017/redhawk
   OPENAI_API_KEY=your_openai_api_key_here
   GITHUB_TOKEN=your_github_token_here
   NODE_ENV=development
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Backend
   npm run dev
   ```
   The backend will be available at `http://localhost:3001`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

3. **Access the Application**
   
   Open your browser and navigate to `http://localhost:3000`

## 📖 Usage Guide

### Log Analysis

1. **Upload Security Logs**
   - Navigate to the onboarding page
   - Upload CSV or LOG files using the file upload component
   - The AI engine will automatically analyze the logs for threats

2. **Review Analysis Results**
   - View detailed threat classifications
   - Check security recommendations
   - Monitor high-priority alerts

### URL Security Scanning

1. **Enter Target URL**
   - Use the URL testing feature on the main page
   - Enter the URL you want to scan
   - Wait for the security analysis results

2. **Review Security Report**
   - Check for malware indicators
   - Review phishing risk assessment
   - Follow recommended security actions

### AI Assistant

1. **Interactive Chat**
   - Access the AI assistant through the dashboard
   - Ask cybersecurity-related questions
   - Get expert recommendations and guidance

2. **Contextual Analysis**
   - The assistant has access to your log analysis data
   - Ask specific questions about your security posture
   - Receive tailored recommendations

## 🔧 API Endpoints

### Log Analysis
- `POST /api/analyze-log` - Upload and analyze security logs
- `GET /api/log-analysis/:id` - Retrieve analysis results
- `GET /api/log-analyses` - List all analyses

### Chat Assistant
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat/conversations/:sessionId` - Get conversation history

### URL Scanning
- `POST /api/scan-url` - Scan URL for security threats
- `GET /api/scan-results/:id` - Get scan results

## 🤖 AI Features

### Machine Learning Models

RedHawk includes several ML models for threat detection:

- **Anomaly Detection**: Identifies unusual patterns in log data
- **Threat Classification**: Categorizes security events (normal, attack, probe, etc.)
- **Risk Assessment**: Scores threats based on severity and confidence

### AI Assistant Capabilities

- **Cybersecurity Expertise**: Deep knowledge of security concepts and best practices
- **Contextual Analysis**: Understands your specific log data and security context
- **Actionable Recommendations**: Provides specific steps to improve security posture
- **Real-time Chat**: Interactive conversation for security guidance

## 🔒 Security Features

- **Multi-factor Authentication**: Secure user access (planned)
- **Encrypted Data Storage**: All sensitive data is encrypted at rest
- **Secure File Upload**: Validated and sanitized file processing
- **API Rate Limiting**: Protection against abuse and DoS attacks
- **Input Validation**: Comprehensive validation of all user inputs

## 🛠️ Development

### Technology Stack

**Frontend:**
- Next.js 14 with App Router
- React 19 with TypeScript
- TailwindCSS for styling
- Radix UI components
- Lucide React icons

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- RESTful API architecture
- File upload handling with Multer

**AI & ML:**
- Python with scikit-learn
- OpenAI GPT API integration
- Pandas for data processing
- Custom ML pipeline for threat detection

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd frontend
npm test

# Python AI tests
cd Backend/AI
python -m pytest
```

## 📊 Performance & Monitoring

- **Real-time Processing**: Log analysis completed in seconds
- **Scalable Architecture**: Designed to handle large log files
- **Performance Monitoring**: Built-in metrics and logging
- **Resource Optimization**: Efficient memory and CPU usage

## 🔮 Roadmap

- [ ] **Enhanced ML Models**: More sophisticated threat detection algorithms
- [ ] **Real-time Log Streaming**: Live log monitoring and analysis
- [ ] **Advanced Visualizations**: Interactive security dashboards
- [ ] **Integration APIs**: Connect with popular SIEM tools
- [ ] **Mobile Application**: iOS and Android companion apps
- [ ] **Compliance Reporting**: Generate reports for various security standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support, email support@redhawk-security.com or join our community:

- 📧 **Email**: support@redhawk-security.com
- 💬 **Discord**: [Join our server](https://discord.gg/redhawk)
- 📖 **Documentation**: [docs.redhawk-security.com](https://docs.redhawk-security.com)
- 🐛 **Bug Reports**: Use GitHub Issues

## 🏆 Acknowledgments

- OpenAI for the GPT API
- The cybersecurity community for threat intelligence
- All contributors and beta testers

---

<div align="center">
  <strong>Made with ❤️ by the RedHawk Security Team</strong>
  <br>
  <em>Protecting your digital assets with AI-powered intelligence</em>
</div>
