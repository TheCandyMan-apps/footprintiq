import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Trash2, XCircle, Eye, Filter, RefreshCw, StopCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { formatDistanceToNow } from "date-fns";

type ScanStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';

interface Scan {
  id: string;
  scan_type: string;
  username: string | null;
  email: string | null;
  phone: string | null;
  status: ScanStatus;
  created_at: string;
  completed_at: string | null;
  workspace_id: string;
  user_id: string;
  findingsCount: number;
  workspaceName: string;
  userEmail: string;
  userName: string;
}

export default function ScanManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [selectAllMode, setSelectAllMode] = useState(false); // Tracks if "select all" across pages is active
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScanStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: scanData, isLoading, refetch } = useQuery({
    queryKey: ['admin-scans', page, statusFilter, searchTerm],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-list-scans', {
        body: {
          page,
          pageSize,
          status: statusFilter === 'all' ? undefined : statusFilter,
          searchTerm: searchTerm || undefined
        }
      });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000 // Auto-refresh every 5 seconds
  });

  const cancelScanMutation = useMutation({
    mutationFn: async (scanId: string) => {
      const { data, error } = await supabase.functions.invoke('cancel-scan', {
        body: { scanId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Scan cancelled successfully");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to cancel scan');
    }
  });

  const bulkCancelMutation = useMutation({
    mutationFn: async (scanIds: string[]) => {
      // If scanIds is empty, use selectAll mode with filters
      const body = scanIds.length === 0
        ? { 
            selectAll: true, 
            filters: { 
              status: statusFilter === 'all' ? undefined : statusFilter,
              searchTerm: searchTerm || undefined 
            } 
          }
        : { scanIds };
      
      const { data, error } = await supabase.functions.invoke('cancel-scan', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Scans cancelled successfully");
      setSelectedScans(new Set());
      setSelectAllMode(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to cancel scans');
    }
  });

  const deleteScanMutation = useMutation({
    mutationFn: async ({ scanId, force }: { scanId: string; force: boolean }) => {
      const { data, error } = await supabase.functions.invoke('delete-scan', {
        body: { scanId, force }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Scan deleted successfully");
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete scan');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (scanIds: string[]) => {
      const body = scanIds.length === 0
        ? { 
            selectAll: true, 
            force: true,
            filters: { 
              status: statusFilter === 'all' ? undefined : statusFilter,
              searchTerm: searchTerm || undefined 
            } 
          }
        : { scanIds, force: true };
      
      const { data, error } = await supabase.functions.invoke('delete-scan', { body });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Scans deleted successfully");
      setSelectedScans(new Set());
      setSelectAllMode(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete scans');
    }
  });

  const getStatusBadge = (status: ScanStatus) => {
    const variants: Record<ScanStatus, any> = {
      pending: { variant: 'secondary', label: 'Pending' },
      running: { variant: 'default', label: 'Running' },
      completed: { variant: 'outline', label: 'Completed' },
      failed: { variant: 'destructive', label: 'Failed' },
      cancelled: { variant: 'secondary', label: 'Cancelled' },
      timeout: { variant: 'destructive', label: 'Timeout' }
    };
    
    const config = variants[status] || { variant: 'outline', label: status };
    return <Badge variant={config.variant as any}>{config.label}</Badge>;
  };

  const getTargetValue = (scan: Scan) => {
    return scan.username || scan.email || scan.phone || 'N/A';
  };

  const toggleSelectScan = (scanId: string) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scanId)) {
      newSelected.delete(scanId);
    } else {
      newSelected.add(scanId);
    }
    setSelectedScans(newSelected);
  };

  const toggleSelectPage = () => {
    if (selectedScans.size === scanData?.scans?.length) {
      setSelectedScans(new Set());
      setSelectAllMode(false);
    } else {
      setSelectedScans(new Set(scanData?.scans?.map((s: Scan) => s.id) || []));
    }
  };

  const handleSelectAll = () => {
    if (selectAllMode) {
      // Deselect all
      setSelectAllMode(false);
      setSelectedScans(new Set());
    } else {
      // Select all across pages
      setSelectAllMode(true);
      setSelectedScans(new Set(scanData?.scans?.map((s: Scan) => s.id) || []));
    }
  };

  const clearSelection = () => {
    setSelectAllMode(false);
    setSelectedScans(new Set());
  };

  const canCancelScan = (status: ScanStatus) => {
    return status === 'pending' || status === 'running';
  };

  const canDeleteScan = (scan: Scan) => {
    const scanAge = Date.now() - new Date(scan.created_at).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    
    if (scan.status === 'completed' && scanAge < thirtyDaysMs) {
      return false;
    }
    
    return ['completed', 'failed', 'cancelled', 'timeout'].includes(scan.status);
  };

  const handleBulkCancel = () => {
    if (selectAllMode) {
      bulkCancelMutation.mutate([], { onSuccess: () => clearSelection() });
    } else {
      bulkCancelMutation.mutate(Array.from(selectedScans));
    }
  };

  const handleBulkDelete = () => {
    if (selectAllMode) {
      bulkDeleteMutation.mutate([]);
    } else {
      bulkDeleteMutation.mutate(Array.from(selectedScans));
    }
  };

  const scans = scanData?.scans || [];
  const pagination = scanData?.pagination || { page: 1, pageSize, total: 0, totalPages: 1 };

  return (
    <>
      <SEO
        title="Scan Management — Admin — FootprintIQ"
        description="Manage all scans across workspaces"
        canonical="https://footprintiq.app/admin/scan-management"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Scan Management</h1>
              <p className="text-muted-foreground">
                Monitor and manage all scans across workspaces
              </p>
            </div>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID, username, email, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="timeout">Timeout</SelectItem>
                  </SelectContent>
                </Select>

                {(selectedScans.size > 0 || selectAllMode) && (
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={handleBulkCancel}
                      variant="outline"
                      disabled={bulkCancelMutation.isPending}
                      className="gap-2"
                    >
                      <StopCircle className="h-4 w-4" />
                      Cancel {selectAllMode ? pagination.total : selectedScans.size}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive"
                          disabled={bulkDeleteMutation.isPending}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete {selectAllMode ? pagination.total : selectedScans.size}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {selectAllMode ? pagination.total : selectedScans.size} Scans?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all selected scans and their associated data.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkDelete}>
                            Delete All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="ghost" onClick={clearSelection} size="sm">
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scans Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  Scans ({pagination.total} total)
                </CardTitle>
                <CardDescription>
                  Page {pagination.page} of {pagination.totalPages}
                  {selectAllMode && (
                    <span className="ml-2 text-primary font-medium">
                      • All {pagination.total} scans selected
                    </span>
                  )}
                </CardDescription>
              </div>
              <Button 
                variant={selectAllMode ? "default" : "outline"} 
                size="sm"
                onClick={handleSelectAll}
              >
                {selectAllMode ? `Deselect All (${pagination.total})` : `Select All ${pagination.total}`}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading scans...
                </div>
              ) : scans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No scans found
                </div>
              ) : (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectAllMode || (selectedScans.size === scans.length && scans.length > 0)}
                            onCheckedChange={toggleSelectPage}
                          />
                        </TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Workspace</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Findings</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scans.map((scan: Scan) => (
                        <TableRow key={scan.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectAllMode || selectedScans.has(scan.id)}
                              onCheckedChange={() => {
                                if (selectAllMode) {
                                  // Exit select-all mode and deselect this one
                                  setSelectAllMode(false);
                                  const allExceptThis = new Set<string>(scanData?.scans?.map((s: Scan) => s.id).filter((id: string) => id !== scan.id) || []);
                                  setSelectedScans(allExceptThis);
                                } else {
                                  toggleSelectScan(scan.id);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-xs truncate">
                            {getTargetValue(scan)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{scan.scan_type}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(scan.status)}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {scan.workspaceName}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {scan.userName || scan.userEmail}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{scan.findingsCount}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/results/${scan.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              
                              {canCancelScan(scan.status) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cancelScanMutation.mutate(scan.id)}
                                  disabled={cancelScanMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}

                              {canDeleteScan(scan) && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Scan?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete the scan and all associated data.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteScanMutation.mutate({ scanId: scan.id, force: true })}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                    disabled={page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
}
