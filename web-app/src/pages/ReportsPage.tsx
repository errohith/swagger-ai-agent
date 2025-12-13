import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  RefreshCw 
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Spinner,
} from '@/components/ui';
import { executionService, ExecutionResult } from '@/services/api';
import { formatDate, formatDuration, calculateSuccessRate } from '@/lib/utils';

const COLORS = {
  passed: '#10b981',
  failed: '#ef4444',
  skipped: '#f59e0b',
  pending: '#6b7280',
};

export function ReportsPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (runId) {
      loadExecution(runId);
    }
  }, [runId]);

  const loadExecution = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await executionService.getExecutionResult(id);
      setExecution(result);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load execution report');
      navigate('/execution');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!execution) return;
    
    try {
      const result = await executionService.retryFailed({ runId: execution.runId });
      setExecution(result);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to retry tests');
    }
  };

  const handleDownloadReport = () => {
    if (!execution) return;

    const report = JSON.stringify(execution, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${execution.runId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!execution) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-muted-foreground">No execution data found</p>
        <Button onClick={() => navigate('/execution')} className="mt-4">
          Go to Execution
        </Button>
      </div>
    );
  }

  const pieData = [
    { name: 'Passed', value: execution.passedTests },
    { name: 'Failed', value: execution.failedTests },
    { name: 'Skipped', value: execution.skippedTests },
  ].filter((item) => item.value > 0);

  const successRate = calculateSuccessRate(execution.passedTests, execution.totalTests);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/execution')} variant="outline" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Test Report</h1>
            <p className="text-muted-foreground">
              Run #{execution.runId.slice(0, 8)} • {formatDate(execution.startedAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {execution.failedTests > 0 && (
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Failed
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant={
                execution.status === 'completed'
                  ? 'success'
                  : execution.status === 'failed'
                  ? 'destructive'
                  : 'default'
              }
              className="text-lg"
            >
              {execution.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{execution.totalTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{execution.passedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{execution.failedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[{
                name: 'Results',
                Passed: execution.passedTests,
                Failed: execution.failedTests,
                Skipped: execution.skippedTests,
              }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Passed" fill={COLORS.passed} />
                <Bar dataKey="Failed" fill={COLORS.failed} />
                <Bar dataKey="Skipped" fill={COLORS.skipped} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Test Cases Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases ({execution.testCases.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {execution.testCases.map((testCase, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 flex-1">
                    {testCase.status === 'passed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : testCase.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {testCase.method.toUpperCase()}
                        </Badge>
                        <span className="font-medium text-sm">{testCase.path}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Operation ID: {testCase.operationId}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={testCase.status === 'passed' ? 'success' : testCase.status === 'failed' ? 'destructive' : 'default'}>
                      {testCase.status}
                    </Badge>
                    {testCase.duration !== undefined && (
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(testCase.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {testCase.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <p className="font-semibold text-red-800 mb-1">Error:</p>
                    <pre className="text-red-700 whitespace-pre-wrap font-mono text-xs">
                      {testCase.error}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Execution Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Execution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Run ID:</span>
              <p className="font-mono">{execution.runId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Spec ID:</span>
              <p className="font-mono">{execution.specId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Environment ID:</span>
              <p className="font-mono">{execution.environmentId}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <p className="font-semibold">{formatDuration(execution.duration)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Started At:</span>
              <p>{formatDate(execution.startedAt)}</p>
            </div>
            {execution.completedAt && (
              <div>
                <span className="text-muted-foreground">Completed At:</span>
                <p>{formatDate(execution.completedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
