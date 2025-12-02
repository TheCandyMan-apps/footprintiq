import { useState } from 'react';
import { Header } from '@/components/Header';
import { AdminNav } from '@/components/admin/AdminNav';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Download, 
  Database, 
  FileJson, 
  Table2, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Loader2,
  HardDrive,
  FileText
} from 'lucide-react';

const CORE_TABLES = [
  { name: 'scans', description: 'All scan records' },
  { name: 'findings', description: 'Scan findings and results' },
  { name: 'profiles', description: 'User profiles' },
  { name: 'workspaces', description: 'Workspace configurations' },
  { name: 'workspace_members', description: 'Workspace memberships' },
  { name: 'user_roles', description: 'User roles and permissions' },
  { name: 'credits_ledger', description: 'Credit transactions' },
  { name: 'scan_events', description: 'Scan execution events' },
  { name: 'cases', description: 'Investigation cases' },
  { name: 'api_keys', description: 'API key records' },
];

export default function DatabaseExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [lastExport, setLastExport] = useState<{ type: string; timestamp: string; size: string } | null>(null);

  const downloadJson = (data: unknown, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return json.length;
  };

  const handleExport = async (type: 'schema' | 'core-data' | 'all-data' | 'full' | 'selected') => {
    setIsExporting(true);
    setExportType(type);
    setProgress(10);

    try {
      const body: Record<string, unknown> = { exportType: type };
      if (type === 'selected') {
        body.tables = selectedTables;
      }

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('database-export', {
        body,
      });

      setProgress(70);

      if (error) throw error;

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `footprintiq-${type}-export-${timestamp}.json`;
      const size = downloadJson(data, filename);

      setProgress(100);
      setLastExport({
        type,
        timestamp: new Date().toISOString(),
        size: `${(size / 1024).toFixed(1)} KB`,
      });

      toast.success(`Export complete: ${filename}`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(error.message || 'Export failed');
    } finally {
      setIsExporting(false);
      setExportType(null);
      setProgress(0);
    }
  };

  const toggleTable = (tableName: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableName) ? prev.filter((t) => t !== tableName) : [...prev, tableName]
    );
  };

  return (
    <>
      <SEO title="Database Export | Admin" />
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-6">
          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 shrink-0">
              <AdminNav />
            </aside>

            <main className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Database Export</h1>
                <p className="text-muted-foreground mt-1">
                  Export your database schema and data for backup or migration
                </p>
              </div>

              {isExporting && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Exporting {exportType}...</p>
                        <Progress value={progress} className="mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {lastExport && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Last Export</AlertTitle>
                  <AlertDescription>
                    {lastExport.type} export completed at{' '}
                    {new Date(lastExport.timestamp).toLocaleString()} ({lastExport.size})
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Schema Export */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <CardTitle>Schema Export</CardTitle>
                    </div>
                    <CardDescription>
                      Export database schema including table structures and RLS policies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Table definitions</Badge>
                      <Badge variant="outline">RLS policies</Badge>
                      <Badge variant="outline">Indexes</Badge>
                    </div>
                    <Button
                      onClick={() => handleExport('schema')}
                      disabled={isExporting}
                      className="w-full"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export Schema
                    </Button>
                  </CardContent>
                </Card>

                {/* Core Data Export */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Table2 className="h-5 w-5 text-primary" />
                      <CardTitle>Core Data Export</CardTitle>
                    </div>
                    <CardDescription>
                      Export essential tables: scans, findings, profiles, workspaces
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">~10 tables</Badge>
                      <Badge variant="secondary">Essential data</Badge>
                    </div>
                    <Button
                      onClick={() => handleExport('core-data')}
                      disabled={isExporting}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Core Data
                    </Button>
                  </CardContent>
                </Card>

                {/* Full Data Export */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-primary" />
                      <CardTitle>Full Data Export</CardTitle>
                    </div>
                    <CardDescription>
                      Export all tables including logs, events, and history
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">All tables</Badge>
                      <Badge variant="outline">May be large</Badge>
                    </div>
                    <Button
                      onClick={() => handleExport('all-data')}
                      disabled={isExporting}
                      variant="secondary"
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </CardContent>
                </Card>

                {/* Complete Backup */}
                <Card className="border-primary">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <CardTitle>Complete Backup</CardTitle>
                      <Badge>Recommended</Badge>
                    </div>
                    <CardDescription>
                      Full export including schema and all data for complete migration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Schema + Data</Badge>
                      <Badge variant="default">Migration ready</Badge>
                    </div>
                    <Button
                      onClick={() => handleExport('full')}
                      disabled={isExporting}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Complete Backup
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Custom Table Selection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileJson className="h-5 w-5 text-primary" />
                    <CardTitle>Custom Export</CardTitle>
                  </div>
                  <CardDescription>Select specific tables to export</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {CORE_TABLES.map((table) => (
                      <label
                        key={table.name}
                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          checked={selectedTables.includes(table.name)}
                          onCheckedChange={() => toggleTable(table.name)}
                        />
                        <div>
                          <p className="font-medium text-sm">{table.name}</p>
                          <p className="text-xs text-muted-foreground">{table.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <Button
                    onClick={() => handleExport('selected')}
                    disabled={isExporting || selectedTables.length === 0}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected ({selectedTables.length} tables)
                  </Button>
                </CardContent>
              </Card>

              {/* Migration Guide */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <CardTitle>Migration Guide</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <h4>To migrate to your own Supabase project:</h4>
                    <ol className="space-y-2">
                      <li>
                        <strong>Create a new Supabase project</strong> at{' '}
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          supabase.com/dashboard
                        </a>
                      </li>
                      <li>
                        <strong>Copy migration files</strong> from{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          supabase/migrations/
                        </code>{' '}
                        to your new project
                      </li>
                      <li>
                        <strong>Run migrations</strong> using Supabase CLI:{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          supabase db push
                        </code>
                      </li>
                      <li>
                        <strong>Import data</strong> using the exported JSON files via SQL Editor
                        or custom import script
                      </li>
                      <li>
                        <strong>Update environment variables</strong> in your new Lovable project
                        with the new Supabase credentials
                      </li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
