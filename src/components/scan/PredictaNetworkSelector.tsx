import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Globe,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { usePredictaSearch, PredictaNetwork } from "@/hooks/usePredictaSearch";

interface PredictaNetworkSelectorProps {
  queryType: 'email' | 'phone' | 'username' | 'name';
  selectedNetworks: string[];
  onSelectionChange: (networks: string[]) => void;
}

export function PredictaNetworkSelector({
  queryType,
  selectedNetworks,
  onSelectionChange,
}: PredictaNetworkSelectorProps) {
  const { fetchNetworks, networks, networksLoading } = usePredictaSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (networks.length === 0 && !networksLoading) {
      fetchNetworks();
    }
  }, [fetchNetworks, networks.length, networksLoading]);

  // Filter networks that support the current query type
  const compatibleNetworks = networks.filter((network) =>
    network.supportedInputs.includes(queryType)
  );

  // Filter by search query
  const filteredNetworks = compatibleNetworks.filter((network) =>
    network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    network.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group networks by type
  const groupedNetworks = filteredNetworks.reduce((acc, network) => {
    const type = network.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(network);
    return acc;
  }, {} as Record<string, PredictaNetwork[]>);

  const isAllSelected = selectedNetworks.includes('all') || selectedNetworks.length === 0;

  const handleSelectAll = () => {
    onSelectionChange(['all']);
  };

  const handleToggleNetwork = (networkId: string) => {
    // If currently "all", switch to specific selection
    if (isAllSelected) {
      onSelectionChange([networkId]);
      return;
    }

    const newSelection = selectedNetworks.includes(networkId)
      ? selectedNetworks.filter((id) => id !== networkId)
      : [...selectedNetworks, networkId];

    // If nothing selected, default back to all
    if (newSelection.length === 0) {
      onSelectionChange(['all']);
    } else {
      onSelectionChange(newSelection);
    }
  };

  if (networksLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading available networks...
      </div>
    );
  }

  if (compatibleNetworks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 border rounded-lg">
        <XCircle className="h-4 w-4" />
        No networks support {queryType} queries
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto py-3 px-4"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-medium">Network Selection</span>
              <Badge variant="secondary" className="ml-2">
                {isAllSelected
                  ? `All ${compatibleNetworks.length} networks`
                  : `${selectedNetworks.length} selected`}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-3 space-y-3">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={isAllSelected ? 'default' : 'outline'}
                size="sm"
                onClick={handleSelectAll}
                className="gap-1"
              >
                <CheckCircle2 className="h-3 w-3" />
                All Networks
              </Button>
              <div className="flex-1" />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter networks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 w-48"
                />
              </div>
            </div>

            {/* Network List */}
            <ScrollArea className="h-64">
              <div className="space-y-4 pr-3">
                {Object.entries(groupedNetworks).map(([type, typeNetworks]) => (
                  <div key={type}>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {type} ({typeNetworks.length})
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {typeNetworks.map((network) => {
                        const isSelected =
                          isAllSelected || selectedNetworks.includes(network.id);
                        return (
                          <label
                            key={network.id}
                            className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${
                              isSelected && !isAllSelected
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => handleToggleNetwork(network.id)}
                              disabled={isAllSelected}
                            />
                            <span className="text-sm truncate">{network.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Supported Query Types Note */}
            <p className="text-xs text-muted-foreground">
              Showing {compatibleNetworks.length} networks that support{' '}
              <span className="font-medium">{queryType}</span> queries
            </p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
