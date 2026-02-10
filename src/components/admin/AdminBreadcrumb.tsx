import { Link } from 'react-router-dom';
import { ChevronRight, Shield } from 'lucide-react';

interface AdminBreadcrumbProps {
  currentPage: string;
}

export function AdminBreadcrumb({ currentPage }: AdminBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link 
        to="/admin/dashboard" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Shield className="h-4 w-4" />
        Admin
      </Link>
      <ChevronRight className="h-4 w-4" />
      <span className="text-foreground font-medium">{currentPage}</span>
    </nav>
  );
}
