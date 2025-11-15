import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, Search, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ResultsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedProviders: string[];
  onProviderToggle: (provider: string) => void;
  availableProviders: string[];
  providerStats?: Record<string, number>;
}

export function ResultsFilters({
  searchQuery,
  onSearchChange,
  selectedProviders,
  onProviderToggle,
  availableProviders,
  providerStats = {},
}: ResultsFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = selectedProviders.length > 0;

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case 'maigret': return 'Maigret';
      case 'whatsmyname': return 'WhatsMyName';
      case 'gosearch': return 'GoSearch';
      default: return provider;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'maigret': return 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20';
      case 'whatsmyname': return 'bg-green-500/10 text-green-600 hover:bg-green-500/20';
      case 'gosearch': return 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20';
      default: return 'bg-muted text-foreground hover:bg-muted/80';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by platform name or URL..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onSearchChange('')}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Provider Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-3.5 w-3.5" />
              Filter by Tool
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {selectedProviders.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by OSINT Tool</Label>
                <p className="text-xs text-muted-foreground">
                  Show results from specific tools only
                </p>
              </div>
              
              <div className="space-y-2">
                {availableProviders.map((provider) => (
                  <button
                    key={provider}
                    onClick={() => onProviderToggle(provider)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedProviders.includes(provider)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getProviderColor(provider)}`} />
                      <span className="text-sm font-medium">{getProviderLabel(provider)}</span>
                    </div>
                    {providerStats[provider] !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {providerStats[provider]} found
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    selectedProviders.forEach(p => onProviderToggle(p));
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Active filter badges */}
        {selectedProviders.map((provider) => (
          <Badge
            key={provider}
            variant="secondary"
            className={`gap-1.5 ${getProviderColor(provider)}`}
          >
            {getProviderLabel(provider)}
            <button
              onClick={() => onProviderToggle(provider)}
              className="ml-1 hover:bg-background/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Provider Statistics Summary */}
      {Object.keys(providerStats).length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {Object.entries(providerStats).map(([provider, count]) => (
            <div key={provider} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${getProviderColor(provider)}`} />
              <span className="font-medium">{getProviderLabel(provider)}:</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
