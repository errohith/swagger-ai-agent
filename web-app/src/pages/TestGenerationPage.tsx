import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Code, Download, Play, Settings } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Spinner,
} from '@/components/ui';
import { useSpecStore } from '@/stores';
import { testGenService, specService } from '@/services/api';

export function TestGenerationPage() {
  const navigate = useNavigate();
  const { specs, selectedSpec, fetchSpecs, selectSpec } = useSpecStore();
  const [operations, setOperations] = useState<any[]>([]);
  const [selectedOperations, setSelectedOperations] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingOps, setIsLoadingOps] = useState(false);

  useEffect(() => {
    if (specs.length === 0) {
      fetchSpecs();
    }
  }, []);

  useEffect(() => {
    if (selectedSpec) {
      loadOperations(selectedSpec.id);
    }
  }, [selectedSpec]);

  const loadOperations = async (specId: string) => {
    setIsLoadingOps(true);
    try {
      const ops = await specService.getOperations(specId);
      setOperations(ops);
    } catch (error) {
      console.error('Failed to load operations:', error);
    } finally {
      setIsLoadingOps(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!selectedSpec) return;

    setIsGenerating(true);
    try {
      const result = await testGenService.generateTests({
        specId: selectedSpec.id,
        operationIds: selectedOperations.length > 0 ? selectedOperations : undefined,
        testFramework: 'jest',
        includeAuth: true,
      });
      setGeneratedCode(result.testCode);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate tests');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSpec?.title || 'api'}.test.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleOperation = (operationId: string) => {
    setSelectedOperations((prev) =>
      prev.includes(operationId)
        ? prev.filter((id) => id !== operationId)
        : [...prev, operationId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Generation</h1>
        <p className="text-muted-foreground">
          Generate automated tests from your OpenAPI specifications
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1 space-y-4">
          {/* Spec Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Specification</CardTitle>
            </CardHeader>
            <CardContent>
              {specs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    No specifications available
                  </p>
                  <Button onClick={() => navigate('/specs')} size="sm">
                    Upload Spec
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {specs.map((spec) => (
                    <button
                      key={spec.id}
                      onClick={() => selectSpec(spec)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedSpec?.id === spec.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">{spec.title}</div>
                      <div className="text-xs text-muted-foreground">v{spec.version}</div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operations Selection */}
          {selectedSpec && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Operations</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingOps ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : operations.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No operations found
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2 mb-3">
                      <Button
                        onClick={() => setSelectedOperations(operations.map((op) => op.operationId))}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => setSelectedOperations([])}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Clear
                      </Button>
                    </div>
                    {operations.map((op) => (
                      <label
                        key={op.operationId}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedOperations.includes(op.operationId)}
                          onChange={() => toggleOperation(op.operationId)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {op.method.toUpperCase()}
                            </Badge>
                            <span className="text-sm font-mono">{op.path}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          {selectedSpec && (
            <Button
              onClick={handleGenerateTests}
              disabled={isGenerating || operations.length === 0}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Code className="mr-2 h-5 w-5" />
                  Generate Tests
                </>
              )}
            </Button>
          )}
        </div>

        {/* Right Panel - Generated Code */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Generated Test Code</CardTitle>
                {generatedCode && (
                  <div className="flex gap-2">
                    <Button onClick={handleDownload} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedSpec) {
                          navigate('/execution');
                        }
                      }}
                      size="sm"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Run Tests
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generatedCode ? (
                <div className="border rounded-lg overflow-hidden">
                  <Editor
                    height="600px"
                    language="javascript"
                    value={generatedCode}
                    theme="vs-light"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-center">
                  <Settings className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tests Generated Yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Select a specification and operations, then click "Generate Tests" to create
                    automated test code
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
