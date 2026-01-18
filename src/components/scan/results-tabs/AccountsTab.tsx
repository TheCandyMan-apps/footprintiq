import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ForensicVerifyButton } from '@/components/forensic';
import { ExternalLink, Search, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScanResult } from '@/hooks/useScanResultsData';

interface AccountsTabProps {
  results: ScanResult[];
  jobId: string;
}

const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'found':
      return 'default';
    case 'claimed':
      return 'secondary';
    case 'not_found':
      return 'outline';
    default:
      return 'outline';
  }
};

export function AccountsTab({ results, jobId }: AccountsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter results
  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch = searchQuery === '' || 
        result.site?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.url?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        result.status?.toLowerCase() === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [results, searchQuery, statusFilter]);

  // Count by status
  const statusCounts = useMemo(() => {
    const counts = { found: 0, claimed: 0, not_found: 0, unknown: 0 };
    results.forEach(r => {
      const status = r.status?.toLowerCase() || 'unknown';
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      } else {
        counts.unknown++;
      }
    });
    return counts;
  }, [results]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search platforms or URLs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({results.length})</SelectItem>
            <SelectItem value="found">Found ({statusCounts.found})</SelectItem>
            <SelectItem value="claimed">Claimed ({statusCounts.claimed})</SelectItem>
            <SelectItem value="not_found">Not Found ({statusCounts.not_found})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="default" className="bg-green-600">
          Found: {statusCounts.found}
        </Badge>
        <Badge variant="secondary" className="bg-blue-600">
          Claimed: {statusCounts.claimed}
        </Badge>
        <Badge variant="outline">Not Found: {statusCounts.not_found}</Badge>
        <Badge variant="outline" className="ml-auto">
          Showing: {filteredResults.length} of {results.length}
        </Badge>
      </div>

      {/* Results table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-xs sm:text-sm">ID</TableHead>
              <TableHead className="text-xs sm:text-sm">Platform</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="hidden md:table-cell text-xs sm:text-sm">URL</TableHead>
              <TableHead className="w-28 text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No results match your filters'
                    : 'No accounts found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredResults.map((result) => (
                <TableRow key={result.id}>
                  <TableCell className="text-muted-foreground text-xs">
                    {result.id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium">
                    <Badge variant="outline" className="font-mono text-xs">
                      {result.site || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(result.status)} className="text-xs">
                      {result.status || 'unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-md truncate text-xs text-muted-foreground">
                    {result.url || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {result.url && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 w-8 p-0"
                          >
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label="Open profile"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <ForensicVerifyButton
                            findingId={result.id}
                            url={result.url}
                            platform={result.site || 'Unknown'}
                            scanId={jobId}
                          />
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AccountsTab;
