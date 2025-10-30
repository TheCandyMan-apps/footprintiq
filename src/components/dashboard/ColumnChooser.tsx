import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';

const AVAILABLE_COLUMNS = [
  { id: 'time', label: 'Time', required: true },
  { id: 'entity', label: 'Entity', required: true },
  { id: 'provider', label: 'Provider', required: false },
  { id: 'severity', label: 'Severity', required: true },
  { id: 'confidence', label: 'Confidence', required: false },
  { id: 'category', label: 'Category', required: false },
];

interface ColumnChooserProps {
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
}

export function ColumnChooser({ selectedColumns, onChange }: ColumnChooserProps) {
  const toggleColumn = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      onChange(selectedColumns.filter((id) => id !== columnId));
    } else {
      onChange([...selectedColumns, columnId]);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Show Columns</h4>
          <div className="space-y-2">
            {AVAILABLE_COLUMNS.map((column) => (
              <div key={column.id} className="flex items-center gap-2">
                <Checkbox
                  id={column.id}
                  checked={selectedColumns.includes(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                  disabled={column.required}
                />
                <Label htmlFor={column.id} className="text-sm cursor-pointer">
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
