import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainLayout } from './components/layout';
import {
  Dashboard,
  SpecsPage,
  TestGenerationPage,
  ExecutionPage,
  ReportsPage,
} from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/specs" element={<SpecsPage />} />
            <Route path="/specs/:id" element={<SpecsPage />} />
            <Route path="/test-generation" element={<TestGenerationPage />} />
            <Route path="/execution" element={<ExecutionPage />} />
            <Route path="/execution/:id" element={<ExecutionPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:runId" element={<ReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
