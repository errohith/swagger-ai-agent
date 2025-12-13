import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle2,
  Code,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Spinner,
} from '@/components/ui';
import { useSpecStore } from '@/stores';
import { specService, Spec } from '@/services/api';
import { formatDate } from '@/lib/utils';

export function SpecsPage() {
  const navigate = useNavigate();
  const { specs, fetchSpecs, addSpec, removeSpec, selectSpec, isLoading } = useSpecStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedSpecDetail, setSelectedSpecDetail] = useState<Spec | null>(null);
  const [operations, setOperations] = useState<any[]>([]);

  useEffect(() => {
    fetchSpecs();
  }, []);

  const handleViewSpec = async (spec: Spec) => {
    setSelectedSpecDetail(spec);
    try {
      const ops = await specService.getOperations(spec.id);
      setOperations(ops);
    } catch (error) {
      console.error('Failed to fetch operations:', error);
      setOperations([]);
    }
  };

  const handleDeleteSpec = async (specId: string) => {
    if (confirm('Are you sure you want to delete this specification?')) {
      try {
        await specService.deleteSpec(specId);
        removeSpec(specId);
      } catch (error) {
        console.error('Failed to delete spec:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Swagger Specifications</h1>
          <p className="text-muted-foreground">
            Manage and view your OpenAPI specifications
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="w-full sm:w-auto">
          <Upload className="mr-2 h-4 w-4" />
          Upload Spec
        </Button>
      </div>

      {/* In-Memory Storage Warning */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex gap-3">
          <svg className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">Data stored in memory</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Uploaded specs are stored in memory and will be lost when the backend server restarts. Please re-upload your specs after any server restart.
            </p>
          </div>
        </div>
      </div>

      {/* Specs List */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : specs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No specifications yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Upload your first OpenAPI/Swagger specification to get started
            </p>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Specification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {specs.map((spec) => (
            <Card key={spec.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{spec.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Version {spec.version}
                    </p>
                  </div>
                  <Badge variant={spec.format === 'yaml' ? 'default' : 'secondary'}>
                    {spec.format.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spec.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {spec.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created: {formatDate(spec.createdAt)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewSpec(spec)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      onClick={() => {
                        selectSpec(spec);
                        navigate('/test-generation');
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Code className="mr-2 h-4 w-4" />
                      Generate Tests
                    </Button>
                    <Button
                      onClick={() => handleDeleteSpec(spec.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadSpecModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={async (spec) => {
            addSpec(spec);
            setShowUploadModal(false);
            // Refresh the specs list to show the newly uploaded spec
            await fetchSpecs();
          }}
        />
      )}

      {/* Spec Detail Modal */}
      {selectedSpecDetail && (
        <SpecDetailModal
          spec={selectedSpecDetail}
          operations={operations}
          onClose={() => {
            setSelectedSpecDetail(null);
            setOperations([]);
          }}
        />
      )}
    </div>
  );
}

// Upload Spec Modal Component
function UploadSpecModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (spec: Spec) => void;
}) {
  const [specContent, setSpecContent] = useState('');
  const [format, setFormat] = useState<'yaml' | 'json'>('yaml');
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
  } | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleClose = () => {
    // Only confirm if there's unsaved content and upload wasn't successful
    if (specContent.trim() && !uploadSuccess) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleValidate = async () => {
    if (!specContent.trim()) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await specService.validateSpec({ specContent, format });
      setValidationResult(result);
    } catch (error: any) {
      setValidationResult({
        valid: false,
        errors: [error.response?.data?.message || 'Validation failed'],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!specContent.trim()) return;

    setIsUploading(true);

    try {
      const spec = await specService.ingestSpec({ specContent, format });
      setUploadSuccess(true);
      // Show success message
      alert('Specification uploaded successfully!');
      // Call onSuccess which will close the modal and refresh the list
      onSuccess(spec);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload specification');
      setIsUploading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSpecContent(content);
      
      // Auto-detect format
      if (file.name.endsWith('.json')) {
        setFormat('json');
      } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        setFormat('yaml');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Upload OpenAPI Specification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload File (YAML or JSON)
            </label>
            <Input
              type="file"
              accept=".yaml,.yml,.json"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Format</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="yaml"
                  checked={format === 'yaml'}
                  onChange={(e) => setFormat(e.target.value as 'yaml')}
                  className="mr-2"
                />
                YAML
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="json"
                  checked={format === 'json'}
                  onChange={(e) => setFormat(e.target.value as 'json')}
                  className="mr-2"
                />
                JSON
              </label>
            </div>
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Specification Content
            </label>
            <div className="border rounded-lg overflow-hidden">
              <Editor
                height="400px"
                language={format === 'yaml' ? 'yaml' : 'json'}
                value={specContent}
                onChange={(value) => setSpecContent(value || '')}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          {/* Validation Result */}
          {validationResult && (
            <div
              className={`p-4 rounded-lg ${
                validationResult.valid
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {validationResult.valid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">
                  {validationResult.valid
                    ? 'Specification is valid'
                    : 'Validation errors found'}
                </span>
              </div>
              {validationResult.errors && (
                <ul className="list-disc list-inside text-sm">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button onClick={handleClose} variant="outline" disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleValidate} disabled={isValidating || isUploading || !specContent.trim()}>
              {isValidating && <Spinner size="sm" className="mr-2" />}
              Validate
            </Button>
            <Button onClick={handleUpload} disabled={isUploading || !specContent.trim()}>
              {isUploading && <Spinner size="sm" className="mr-2" />}
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Spec Detail Modal Component
function SpecDetailModal({
  spec,
  operations,
  onClose,
}: {
  spec: Spec;
  operations: any[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{spec.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Version {spec.version}
              </p>
            </div>
            <Badge>{spec.format.toUpperCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {spec.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{spec.description}</p>
            </div>
          )}

          {/* Operations */}
          <div>
            <h3 className="font-semibold mb-4">API Operations ({operations.length})</h3>
            <div className="space-y-2">
              {operations.map((op, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        op.method === 'get'
                          ? 'default'
                          : op.method === 'post'
                          ? 'success'
                          : op.method === 'delete'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {op.method.toUpperCase()}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{op.path}</p>
                      {op.summary && (
                        <p className="text-xs text-muted-foreground">{op.summary}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>{' '}
                {formatDate(spec.createdAt)}
              </div>
              <div>
                <span className="text-muted-foreground">Updated:</span>{' '}
                {formatDate(spec.updatedAt)}
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
