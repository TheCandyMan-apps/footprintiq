import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Severity } from "@/lib/ufm";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface FindingFiltersProps {
  availableSeverities: Severity[];
  availableTypes: string[];
  availableProviders: string[];
  selectedSeverities: Severity[];
  selectedTypes: string[];
  selectedProviders: string[];
  searchQuery: string;
  onSeveritiesChange: (severities: Severity[]) => void;
  onTypesChange: (types: string[]) => void;
  onProvidersChange: (providers: string[]) => void;
  onSearchChange: (query: string) => void;
  onClearAll: () => void;
}

export const FindingFilters = ({
  availableSeverities,
  availableTypes,
  availableProviders,
  selectedSeverities,
  selectedTypes,
  selectedProviders,
  searchQuery,
  onSeveritiesChange,
  onTypesChange,
  onProvidersChange,
  onSearchChange,
  onClearAll,
}: FindingFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSeverity = (severity: Severity) => {
    if (selectedSeverities.includes(severity)) {
      onSeveritiesChange(selectedSeverities.filter((s) => s !== severity));
    } else {
      onSeveritiesChange([...selectedSeverities, severity]);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const toggleProvider = (provider: string) => {
    if (selectedProviders.includes(provider)) {
      onProvidersChange(selectedProviders.filter((p) => p !== provider));
    } else {
      onProvidersChange([...selectedProviders, provider]);
    }
  };

  const hasActiveFilters =
    selectedSeverities.length > 0 ||
    selectedTypes.length > 0 ||
    selectedProviders.length > 0 ||
    searchQuery.length > 0;

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <Label className="text-base font-semibold">Filters</Label>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="h-8"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8"
          >
            {isExpanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>

      <Input
        placeholder="Search findings..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />

      {isExpanded && (
        <>
          <Separator />

          {/* Severity Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Severity</Label>
            <div className="flex flex-wrap gap-2">
              {availableSeverities.map((severity) => (
                <Badge
                  key={severity}
                  variant={
                    selectedSeverities.includes(severity) ? "default" : "outline"
                  }
                  className="cursor-pointer capitalize"
                  onClick={() => toggleSeverity(severity)}
                >
                  {severity}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Type Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Finding Type</Label>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleType(type)}
                >
                  {type.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Provider Filters */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Provider</Label>
            <div className="flex flex-wrap gap-2">
              {availableProviders.map((provider) => (
                <Badge
                  key={provider}
                  variant={
                    selectedProviders.includes(provider) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => toggleProvider(provider)}
                >
                  {provider}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
