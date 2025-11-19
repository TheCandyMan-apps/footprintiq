import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileJson, FileSpreadsheet, FileText, FileCode, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Artifact {
  id: string;
  artifact_type: string;
  file_url: string;
  signed_url: string | null;
  file_size_bytes: number | null;
  generated_at: string;
  downloaded_at: string | null;
}

interface ArtifactDownloadCardProps {
  artifacts: Artifact[];
  isGenerating?: boolean;
  onRegenerate?: () => void;
}

const ARTIFACT_CONFIG = {
  csv: { icon: FileSpreadsheet, label: 'CSV Export', color: 'text-green-600' },
  json: { icon: FileJson, label: 'JSON Export', color: 'text-blue-600' },
  txt: { icon: FileText, label: 'Text Report', color: 'text-gray-600' },
  html: { icon: FileCode, label: 'HTML Report', color: 'text-orange-600' },
  pdf: { icon: FileText, label: 'PDF Report', color: 'text-red-600' },
  xmind: { icon: FileCode, label: 'XMind Map', color: 'text-purple-600' },
};

export function ArtifactDownloadCard({ artifacts, isGenerating, onRegenerate }: ArtifactDownloadCardProps) {
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleDownload = async (artifact: Artifact) => {
    if (!artifact.signed_url) return;
    
    // Open in new tab for download
    window.open(artifact.signed_url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Artifacts
            </CardTitle>
            <CardDescription>
              Download scan results in various formats
            </CardDescription>
          </div>
          {onRegenerate && !isGenerating && artifacts.length > 0 && (
            <Button variant="outline" size="sm" onClick={onRegenerate}>
              Regenerate
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Generating artifacts...</span>
          </div>
        ) : artifacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No artifacts available for this scan.</p>
            <p className="text-sm mt-2">Select export formats when starting a scan to generate artifacts.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {artifacts.map((artifact) => {
              const config = ARTIFACT_CONFIG[artifact.artifact_type as keyof typeof ARTIFACT_CONFIG];
              if (!config) return null;

              const Icon = config.icon;

              return (
                <div
                  key={artifact.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    <div>
                      <div className="font-medium">{config.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(artifact.file_size_bytes)} • Generated {formatDistanceToNow(new Date(artifact.generated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {artifact.downloaded_at && (
                      <Badge variant="secondary" className="text-xs">
                        Downloaded
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleDownload(artifact)}
                      disabled={!artifact.signed_url}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
