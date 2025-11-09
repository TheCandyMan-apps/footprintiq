import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { COMMON_TAGS } from '@/constants/templateCategories';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const addCommonTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onChange([...tags, tag]);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Tags (optional)</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder="Type tag and press Enter..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-2"
      />
      <div className="flex flex-wrap gap-1">
        <span className="text-xs text-muted-foreground mr-2">Quick add:</span>
        {COMMON_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addCommonTag(tag)}
            disabled={tags.includes(tag)}
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
