import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText, 
  Play, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Spinner } from '@/components/ui';
import { useSpecStore, useExecutionStore } from '@/stores';
import { formatDate, formatDuration, calculateSuccessRate } from '@/lib/utils';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6b7280'];

export function Dashboard() {
  const navigate = useNavigate();
  const { specs, fetchSpecs, isLoading: specsLoading } = useSpecStore();
  const { executions, fetchExecutions, isLoading: executionsLoading } = useExecutionStore();
  const [stats, setStats] = useState({
    totalSpecs: 0,
    totalExecutions: 0,
    passedTests: 0,
    failedTests: 0,
    successRate: 0,
    avgDuration: 0,
  });

  useEffect(() => {
    fetchSpecs();
    fetchExecutions();
  }, []);

  useEffect(() => {
    if (executions.length > 0) {
      const totalPassed = executions.reduce((sum, exec) => sum + exec.passedTests, 0);
      const totalFailed = executions.reduce((sum, exec) => sum + exec.failedTests, 0);
      const totalTests = totalPassed + totalFailed;
      const avgDur = executions.reduce((sum, exec) => sum + exec.duration, 0) / executions.length;

      setStats({
        totalSpecs: specs.length,
        totalExecutions: executions.length,
        passedTests: totalPassed,
        failedTests: totalFailed,
        successRate: calculateSuccessRate(totalPassed, totalTests),
        avgDuration: avgDur,
      });
    } else {
      setStats({
        totalSpecs: specs.length,
        totalExecutions: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0,
        avgDuration: 0,
      });
    }
  }, [specs, executions]);

  // Chart data
  const pieChartData = [
    { name: 'Passed', value: stats.passedTests },
    { name: 'Failed', value: stats.failedTests },
  ].filter(item => item.value > 0);

  const recentExecutionsData = executions.slice(0, 5).map((exec) => ({
    name: formatDate(exec.startedAt).split(',')[0],
    passed: exec.passedTests,
    failed: exec.failedTests,
    skipped: exec.skippedTests,
  }));

  if (specsLoading || executionsLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Swagger AI Agent Test Management Platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Specs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSpecs}</div>
            <p className="text-xs text-muted-foreground">OpenAPI specifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">Test runs completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.passedTests} passed / {stats.failedTests} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
            <p className="text-xs text-muted-foreground">Per execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Executions Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentExecutionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={recentExecutionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passed" fill="#10b981" name="Passed" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  <Bar dataKey="skipped" fill="#f59e0b" name="Skipped" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No execution data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No test results available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Specs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Swagger Specifications</CardTitle>
            <Button onClick={() => navigate('/specs')} variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {specs.length > 0 ? (
            <div className="space-y-4">
              {specs.slice(0, 5).map((spec) => (
                <div
                  key={spec.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <h4 className="font-medium">{spec.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Version {spec.version} • {formatDate(spec.createdAt)}
                    </p>
                  </div>
                  <Button onClick={() => navigate(`/specs/${spec.id}`)} variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No specifications uploaded yet</p>
              <Button onClick={() => navigate('/specs')}>Upload Your First Spec</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Executions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Test Executions</CardTitle>
            <Button onClick={() => navigate('/execution')} variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {executions.length > 0 ? (
            <div className="space-y-4">
              {executions.slice(0, 5).map((exec) => (
                <div
                  key={exec.runId}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    {exec.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : exec.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <h4 className="font-medium">Run #{exec.runId.slice(0, 8)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exec.passedTests}/{exec.totalTests} passed • {formatDuration(exec.duration)}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/reports/${exec.runId}`)} variant="ghost" size="sm">
                    View Report
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Play className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No test executions yet</p>
              <Button onClick={() => navigate('/execution')}>Run Your First Test</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
