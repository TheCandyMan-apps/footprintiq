import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AlertRow, Severity } from '@/types/dashboard';
import { formatRelativeTime, formatConfidence } from '@/lib/format';
import { Download, Columns, Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsTableProps {
  data: AlertRow[];
  loading?: boolean;
  onRowClick: (alert: AlertRow) => void;
  onExport?: (format: 'csv' | 'pdf') => void;
  canExport?: boolean;
  selectedColumns?: string[];
  density?: 'compact' | 'comfortable';
}

const SEVERITY_COLORS: Record<Severity, string> = {
  low: 'bg-accent/20 text-accent border-accent/30',
  medium: 'bg-primary/20 text-primary border-primary/30',
  high: 'bg-destructive/20 text-destructive border-destructive/30',
  critical: 'bg-destructive text-destructive-foreground border-destructive',
};

const ALL_COLUMNS = ['time', 'entity', 'provider', 'severity', 'confidence', 'category'];

export function AlertsTable({ 
  data, 
  loading, 
  onRowClick, 
  onExport,
  canExport = false,
  selectedColumns = ALL_COLUMNS,
  density = 'comfortable',
}: AlertsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (row) =>
        (row.entity || '').toLowerCase().includes(query) ||
        (row.provider || '').toLowerCase().includes(query) ||
        (row.category || '').toLowerCase().includes(query) ||
        (row.description || '').toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Alerts ({filteredData.length})</CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>


            {canExport && onExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem onClick={() => onExport('csv')}>
                    Export as CSV
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem onClick={() => onExport('pdf')}>
                    Export as PDF
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectedColumns.includes('time') && <TableHead>Time</TableHead>}
                {selectedColumns.includes('entity') && <TableHead>Entity</TableHead>}
                {selectedColumns.includes('provider') && <TableHead>Provider</TableHead>}
                {selectedColumns.includes('severity') && <TableHead>Severity</TableHead>}
                {selectedColumns.includes('confidence') && <TableHead>Confidence</TableHead>}
                {selectedColumns.includes('category') && <TableHead>Category</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={selectedColumns.length} className="text-center py-8 text-muted-foreground">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((alert) => (
                  <TableRow
                    key={alert.id}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50 transition-colors',
                      density === 'compact' ? 'h-10' : 'h-16'
                    )}
                    onClick={() => onRowClick(alert)}
                  >
                    {selectedColumns.includes('time') && (
                      <TableCell className="font-mono text-sm">
                        {formatRelativeTime(alert.time)}
                      </TableCell>
                    )}
                    {selectedColumns.includes('entity') && (
                      <TableCell className="font-medium">{alert.entity}</TableCell>
                    )}
                    {selectedColumns.includes('provider') && (
                      <TableCell>
                        <Badge variant="outline">{alert.provider}</Badge>
                      </TableCell>
                    )}
                    {selectedColumns.includes('severity') && (
                      <TableCell>
                        <Badge className={SEVERITY_COLORS[alert.severity]}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                    )}
                    {selectedColumns.includes('confidence') && (
                      <TableCell>{formatConfidence(alert.confidence)}</TableCell>
                    )}
                    {selectedColumns.includes('category') && (
                      <TableCell className="text-muted-foreground">
                        {alert.category}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
