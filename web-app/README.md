# Swagger AI Agent - Web Application

A modern, responsive web application for business analysts to manage Swagger/OpenAPI specifications, generate automated tests, execute them using MCP (Model Context Protocol), and view detailed reports with dashboards.

## Features

### 📊 Dashboard
- Real-time analytics and insights
- Test execution statistics with charts
- Recent specifications and test runs
- Success rate tracking
- Visual data representation with Recharts

### 📄 Swagger Spec Management
- Upload and validate OpenAPI/Swagger specifications (YAML or JSON)
- Monaco Editor for inline editing
- View detailed API operations
- Spec metadata management
- Quick actions for test generation

### 🧪 Test Generation
- Automatic test code generation from OpenAPI specs
- Select specific operations or generate for all
- Jest/Axios test framework support
- Monaco Editor for code preview
- Download generated test files
- Direct execution integration

### ⚡ Test Execution
- Execute tests with MCP integration
- Environment configuration
- Operation selection
- Real-time execution status
- Execution history with filtering
- Retry failed tests

### 📈 Reports & Analytics
- Comprehensive test reports
- Visual charts (Pie charts, Bar charts)
- Test case drill-down
- Error details and stack traces
- Success rate analysis
- Download reports (JSON format)

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Routing**: React Router v7
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Code Editor**: Monaco Editor
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Swagger AI Agent backend running on port 3001

### Installation

1. Navigate to the web-app directory:
```bash
cd web-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
Create a `.env` file in the web-app directory:
```env
VITE_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be created in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
web-app/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, Header, MainLayout)
│   │   └── ui/              # Reusable UI components (Button, Card, etc.)
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Main dashboard with analytics
│   │   ├── SpecsPage.tsx    # Swagger spec management
│   │   ├── TestGenerationPage.tsx  # Test generation interface
│   │   ├── ExecutionPage.tsx       # Test execution
│   │   └── ReportsPage.tsx         # Reports and analytics
│   ├── services/
│   │   └── api/             # API service layer
│   │       ├── client.ts    # Axios client configuration
│   │       ├── spec.service.ts
│   │       ├── environment.service.ts
│   │       ├── testgen.service.ts
│   │       ├── execution.service.ts
│   │       └── mcp.service.ts
│   ├── stores/              # Zustand state management
│   │   ├── specStore.ts
│   │   └── executionStore.ts
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Mobile Responsiveness

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

Features:
- Responsive sidebar with mobile drawer
- Adaptive grid layouts
- Touch-friendly controls
- Optimized charts for small screens
- Scrollable content areas

## Key Features for Business Analysts

### User-Friendly Interface
- Clean, modern design
- Intuitive navigation
- Clear visual hierarchy
- Contextual help and tooltips

### Workflow Optimization
1. **Upload Spec** → Validate and save OpenAPI specifications
2. **Generate Tests** → Automatically create test code
3. **Execute** → Run tests in configured environments
4. **Analyze** → View detailed reports and analytics

### Visual Analytics
- Success rate trends
- Test distribution charts
- Performance metrics
- Historical comparisons

### Error Handling
- Clear error messages
- Validation feedback
- Retry mechanisms
- Detailed error logs

## API Integration

The web application integrates with the following backend endpoints:

- **Spec Management**: `/api/spec/*`
- **Environment Management**: `/api/environment/*`
- **Test Generation**: `/api/testgen/*`
- **Execution**: `/api/execution/*`
- **MCP Swagger Tools**: `/api/mcp/swagger/*`
- **MCP Jest Tools**: `/api/mcp/jest/*`

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Code splitting with React lazy loading
- Optimized bundle size with Vite
- Efficient state management with Zustand
- React Query for server state caching
- Debounced search and filters

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the component naming conventions
4. Add proper error handling
5. Ensure mobile responsiveness
6. Write clean, self-documenting code

## License

Part of the Swagger AI Agent project.

---

**Built for Business Analysts** 🚀  
Simplifying API testing with AI-powered automation
