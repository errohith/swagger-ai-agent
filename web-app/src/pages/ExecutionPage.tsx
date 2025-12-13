import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Spinner,
} from '@/components/ui';
import { useSpecStore, useExecutionStore } from '@/stores';
import {
  executionService,
  environmentService,
  specService,
  Environment,
} from '@/services/api';
import { formatDate, formatDuration } from '@/lib/utils';

export function ExecutionPage() {
  const navigate = useNavigate();
  const { specs, selectedSpec, fetchSpecs } = useSpecStore();
  const { executions, fetchExecutions, addExecution, updateExecution } = useExecutionStore();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnv, setSelectedEnv] = useState<string>('');
  const [operations, setOperations] = useState<any[]>([]);
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showNewEnvModal, setShowNewEnvModal] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);

  useEffect(() => {
    if (specs.length === 0) {
      fetchSpecs();
    }
    fetchExecutions();
  }, []);

  useEffect(() => {
    if (selectedSpec) {
      loadEnvironments(selectedSpec.id);
      loadOperations(selectedSpec.id);
    }
  }, [selectedSpec]);

  const loadEnvironments = async (specId: string) => {
    try {
      const envs = await environmentService.listEnvironments(specId);
      setEnvironments(envs);
    } catch (error) {
      console.error('Failed to load environments:', error);
    }
  };

  const loadOperations = async (specId: string) => {
    try {
      const ops = await specService.getOperations(specId);
      setOperations(ops);
    } catch (error) {
      console.error('Failed to load operations:', error);
    }
  };

  const handleExecute = async () => {
    if (!selectedSpec || !selectedEnv) return;

    setIsExecuting(true);
    try {
      const result = await executionService.executeRun({
        specId: selectedSpec.id,
        environmentId: selectedEnv,
        operationIds: selectedOperations.length > 0 ? selectedOperations : undefined,
      });
      addExecution(result);
      navigate(`/reports/${result.runId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to execute tests');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleRetry = async (runId: string) => {
    try {
      const result = await executionService.retryFailed({ runId });
      updateExecution(result);
      navigate(`/reports/${result.runId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to retry tests');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Execution</h1>
        <p className="text-muted-foreground">
          Execute API tests with MCP integration
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1 space-y-4">
          {/* Spec Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Specification</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedSpec?.id || ''}
                onChange={(e) => {
                  const spec = specs.find((s) => s.id === e.target.value);
                  useSpecStore.getState().selectSpec(spec || null);
                }}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select a specification...</option>
                {specs.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.title} (v{spec.version})
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Environment Selection */}
          {selectedSpec && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Environment</CardTitle>
                  <Button
                    onClick={() => setShowNewEnvModal(true)}
                    variant="outline"
                    size="sm"
                  >
                    New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {environments.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      No environments configured
                    </p>
                    <Button onClick={() => setShowNewEnvModal(true)} size="sm">
                      Create Environment
                    </Button>
                  </div>
                ) : (
                  <>
                    <select
                      value={selectedEnv}
                      onChange={(e) => setSelectedEnv(e.target.value)}
                      className="w-full p-2 border rounded-lg mb-2"
                    >
                      <option value="">Select environment...</option>
                      {environments.map((env) => (
                        <option key={env.id} value={env.id}>
                          {env.name} ({env.baseUrl})
                        </option>
                      ))}
                    </select>
                    {selectedEnv && (
                      <Button
                        onClick={() => {
                          const env = environments.find(e => e.id === selectedEnv);
                          if (env) setEditingEnv(env);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Edit Environment
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Operations Selection */}
          {selectedSpec && operations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operations (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {operations.map((op) => (
                    <label
                      key={op.operationId}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOperations.includes(op.operationId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOperations([...selectedOperations, op.operationId]);
                          } else {
                            setSelectedOperations(
                              selectedOperations.filter((id) => id !== op.operationId)
                            );
                          }
                        }}
                      />
                      <Badge variant="outline" className="text-xs">
                        {op.method.toUpperCase()}
                      </Badge>
                      <span className="font-mono text-xs">{op.path}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Execute Button */}
          <Button
            onClick={handleExecute}
            disabled={!selectedSpec || !selectedEnv || isExecuting}
            className="w-full"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Executing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Execute Tests
              </>
            )}
          </Button>
        </div>

        {/* Right Panel - Execution History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Execution History</CardTitle>
                <Button onClick={() => fetchExecutions()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Executions Yet</h3>
                  <p className="text-muted-foreground">
                    Configure and execute your first test run
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executions.map((exec) => (
                    <div
                      key={exec.runId}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {exec.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : exec.status === 'failed' ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : exec.status === 'running' ? (
                            <Spinner size="sm" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <div>
                            <h4 className="font-semibold">Run #{exec.runId.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(exec.startedAt)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            exec.status === 'completed'
                              ? 'success'
                              : exec.status === 'failed'
                              ? 'destructive'
                              : 'default'
                          }
                        >
                          {exec.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total:</span>{' '}
                          <span className="font-semibold">{exec.totalTests}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Passed:</span>{' '}
                          <span className="font-semibold text-green-600">{exec.passedTests}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Failed:</span>{' '}
                          <span className="font-semibold text-red-600">{exec.failedTests}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>{' '}
                          <span className="font-semibold">{formatDuration(exec.duration)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/reports/${exec.runId}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Report
                        </Button>
                        {exec.failedTests > 0 && (
                          <Button
                            onClick={() => handleRetry(exec.runId)}
                            variant="outline"
                            size="sm"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry Failed
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Environment Modal */}
      {showNewEnvModal && selectedSpec && (
        <NewEnvironmentModal
          specId={selectedSpec.id}
          onClose={() => setShowNewEnvModal(false)}
          onSuccess={(env) => {
            setEnvironments([...environments, env]);
            setSelectedEnv(env.id);
            setShowNewEnvModal(false);
          }}
        />
      )}

      {/* Edit Environment Modal */}
      {editingEnv && (
        <EditEnvironmentModal
          environment={editingEnv}
          onClose={() => setEditingEnv(null)}
          onSuccess={(updatedEnv) => {
            setEnvironments(
              environments.map((e) => (e.id === updatedEnv.id ? updatedEnv : e))
            );
            setEditingEnv(null);
          }}
        />
      )}
    </div>
  );
}

// New Environment Modal
function NewEnvironmentModal({
  specId,
  onClose,
  onSuccess,
}: {
  specId: string;
  onClose: () => void;
  onSuccess: (env: Environment) => void;
}) {
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !baseUrl.trim()) return;

    setIsCreating(true);
    try {
      const env = await environmentService.createEnvironment({
        specId,
        name,
        baseUrl,
      });
      onSuccess(env);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create environment');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Environment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production, Staging, Development..."
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base URL</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !name || !baseUrl}>
              {isCreating && <Spinner size="sm" className="mr-2" />}
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Edit Environment Modal
function EditEnvironmentModal({
  environment,
  onClose,
  onSuccess,
}: {
  environment: Environment;
  onClose: () => void;
  onSuccess: (env: Environment) => void;
}) {
  const [name, setName] = useState(environment.name);
  const [baseUrl, setBaseUrl] = useState(environment.baseUrl);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!name.trim() || !baseUrl.trim()) return;

    setIsUpdating(true);
    try {
      const env = await environmentService.updateEnvironment(environment.id, {
        name,
        baseUrl,
      });
      onSuccess(env);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update environment');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Environment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Environment Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Production, Staging, Development..."
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Base URL</label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !name || !baseUrl}>
              {isUpdating && <Spinner size="sm" className="mr-2" />}
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
