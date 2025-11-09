import { Badge } from '@/components/ui/badge';
import { TEMPLATE_CATEGORIES } from '@/constants/templateCategories';

interface CategoryBadgeProps {
  category: string | null;
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  if (!category) return null;

  const cat = TEMPLATE_CATEGORIES.find((c) => c.value === category);
  if (!cat) return null;

  return (
    <Badge variant="secondary" className="text-xs">
      <span className="mr-1">{cat.icon}</span>
      {cat.label}
    </Badge>
  );
}
