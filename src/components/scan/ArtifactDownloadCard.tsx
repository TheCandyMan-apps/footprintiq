import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileJson, FileSpreadsheet, FileText, FileCode, Loader2, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { HelpIcon } from '@/components/ui/help-icon';
import { useState } from 'react';

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
  const [regenerating, setRegenerating] = useState(false);
  
  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await onRegenerate?.();
    } finally {
      setRegenerating(false);
    }
  };
  
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
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              Export Artifacts
              <HelpIcon helpKey="artifacts" />
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </div>
          {artifacts.length > 0 && onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isGenerating || regenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          )}
        </div>
        <CardDescription>
          Download scan results in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium mb-1">Generating artifacts...</p>
            <p className="text-xs text-muted-foreground">
              This usually takes 10-30 seconds
            </p>
          </div>
        )}
        
        {!isGenerating && artifacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm font-medium mb-1 text-muted-foreground">
              No artifacts available for this scan
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Artifacts can be generated after the scan completes
            </p>
            {onRegenerate && (
              <Button 
                onClick={handleRegenerate} 
                disabled={regenerating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                Generate Artifacts Now
              </Button>
            )}
          </div>
        )}
        
        {!isGenerating && artifacts.length > 0 && (
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
