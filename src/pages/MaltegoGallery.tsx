import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BatchExportDialog } from '@/components/maltego/BatchExportDialog';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
import { Download, Search, Filter, Eye, Calendar, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MaltegoScan {
  id: string;
  entity: string;
  created_at: string;
  results: any;
  scan_type: string;
  status: string;
}

export default function MaltegoGallery() {
  const navigate = useNavigate();
  const [scans, setScans] = useState<MaltegoScan[]>([]);
  const [filteredScans, setFilteredScans] = useState<MaltegoScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [batchExportOpen, setBatchExportOpen] = useState(false);

  useEffect(() => {
    loadScans();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [scans, searchQuery, filterType, filterDate]);

  const loadScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter for maltego scans and ensure proper structure
      const maltegoScans = (data || [])
        .filter((scan: any) => scan.results?.nodes && scan.results?.edges)
        .map((scan: any) => ({
          id: scan.id,
          entity: scan.email || scan.username || scan.phone || 'Unknown',
          created_at: scan.created_at,
          results: scan.results,
          scan_type: 'maltego_ai',
          status: scan.status || 'completed'
        })) as MaltegoScan[];

      setScans(maltegoScans);
    } catch (error: any) {
      console.error('[MaltegoGallery] Error loading scans:', error);
      toast.error('Failed to load scans');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...scans];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(scan =>
        scan.entity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(scan => {
        const entityType = scan.results?.nodes?.[0]?.type || 'unknown';
        return entityType === filterType;
      });
    }

    // Date filter
    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(scan => {
        const scanDate = new Date(scan.created_at);
        const daysDiff = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filterDate) {
          case 'today':
            return daysDiff === 0;
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          default:
            return true;
        }
      });
    }

    setFilteredScans(filtered);
  };

  const handleViewScan = (scanId: string) => {
    navigate(`/results/${scanId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Maltego Graph Gallery - FootprintIQ</title>
        <meta
          name="description"
          content="Browse and export your Maltego AI OSINT graph analysis results"
        />
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Network className="h-8 w-8 text-primary" />
              Maltego Graph Gallery
            </h1>
            <p className="text-muted-foreground mt-2">
              Browse, filter, and export your AI-driven OSINT graph analysis results
            </p>
          </div>

          {/* Filters & Actions */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>
                    Search and filter your Maltego scans
                  </CardDescription>
                </div>
                <Button onClick={() => setBatchExportOpen(true)} disabled={scans.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Batch Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by entity..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Entity Type Filter */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="ip">IP Address</SelectItem>
                    <SelectItem value="domain">Domain</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Filter */}
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger>
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Count */}
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {filteredScans.length} of {scans.length} scans
                </span>
                {(searchQuery || filterType !== 'all' || filterDate !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setFilterDate('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scan Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Loading scans...</p>
            </div>
          ) : filteredScans.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No scans found</h3>
                  <p className="text-muted-foreground mb-4">
                    {scans.length === 0
                      ? 'Start your first Maltego AI scan to see results here'
                      : 'Try adjusting your filters'}
                  </p>
                  {scans.length === 0 && (
                    <Button onClick={() => navigate('/scan')}>
                      Start New Scan
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScans.map((scan) => (
                <Card key={scan.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg truncate">{scan.entity}</CardTitle>
                        <CardDescription>
                          {new Date(scan.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={scan.status === 'completed' ? 'default' : 'secondary'}>
                        {scan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Nodes: </span>
                        <span className="font-medium">{scan.results?.nodes?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Links: </span>
                        <span className="font-medium">{scan.results?.edges?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Transforms: </span>
                        <span className="font-medium">{scan.results?.transforms_executed || 0}</span>
                      </div>
                    </div>

                    {/* Graph Preview */}
                    <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                      <Network className="h-12 w-12 text-slate-600" />
                    </div>

                    {/* Actions */}
                    <Button
                      className="w-full"
                      onClick={() => handleViewScan(scan.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Graph
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Batch Export Dialog */}
      <BatchExportDialog
        open={batchExportOpen}
        onOpenChange={setBatchExportOpen}
        scans={scans.filter(s => s.status === 'completed')}
      />
    </div>
  );
}
