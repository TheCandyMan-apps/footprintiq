import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { AlignJustify, AlignLeft } from 'lucide-react';

interface DensityToggleProps {
  density: 'compact' | 'comfortable';
  onChange: (density: 'compact' | 'comfortable') => void;
}

export function DensityToggle({ density, onChange }: DensityToggleProps) {
  return (
    <ToggleGroup type="single" value={density} onValueChange={(v) => v && onChange(v as any)}>
      <ToggleGroupItem value="compact" aria-label="Compact view" size="sm">
        <AlignJustify className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="comfortable" aria-label="Comfortable view" size="sm">
        <AlignLeft className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
