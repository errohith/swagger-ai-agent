# 🚀 Quick Start Guide - Swagger AI Agent Web App

## Prerequisites
- Node.js 18+ installed
- Backend server running on `http://localhost:3001`

## Installation & Setup

### 1. Navigate to the web-app directory
```bash
cd web-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

The application will start on **http://localhost:3000**

## First-Time Usage

### Step 1: Upload a Swagger Specification
1. Open the application in your browser
2. Click on "Swagger Specs" in the sidebar
3. Click "Upload Spec" button
4. Either:
   - Upload a YAML/JSON file, OR
   - Paste your OpenAPI specification content
5. Click "Validate" to check the specification
6. Click "Upload" to save

### Step 2: Create an Environment
1. Navigate to "Execution" page
2. Select your uploaded specification
3. Click "New" to create an environment
4. Enter:
   - Environment name (e.g., "Production", "Staging")
   - Base URL (e.g., "https://api.example.com")
5. Click "Create"

### Step 3: Generate Tests
1. Navigate to "Test Generation" page
2. Select your specification
3. Select operations (or leave blank for all)
4. Click "Generate Tests"
5. Review the generated code
6. Click "Download" or "Run Tests"

### Step 4: Execute Tests
1. Navigate to "Execution" page
2. Select specification and environment
3. Optionally select specific operations
4. Click "Execute Tests"
5. View real-time execution progress

### Step 5: View Reports
1. Click "View Report" on any execution
2. Analyze metrics and charts
3. Review individual test cases
4. Download report if needed
5. Retry failed tests if necessary

## Available Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Troubleshooting

### Backend Connection Error
- Ensure backend server is running on port 3001
- Check `http://localhost:3001/api` is accessible

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Change port in vite.config.ts
server: {
  port: 3002, // Change to any available port
}
```

## Features Overview

| Feature | Description |
|---------|-------------|
| 📊 Dashboard | View analytics, metrics, and recent activity |
| 📄 Specs Management | Upload, validate, and manage OpenAPI specifications |
| 🧪 Test Generation | Generate automated test code from specs |
| ⚡ Execution | Run tests with MCP integration |
| 📈 Reports | Detailed analysis with charts and metrics |

## Mobile Access

The application is fully responsive! Access it from:
- 📱 Smartphones (iOS/Android)
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktops

## Support

Need help? Check:
1. [README.md](./README.md) - Detailed documentation
2. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - Architecture and features
3. Browser console for errors
4. Network tab for API issues

---

Happy Testing! 🎉
