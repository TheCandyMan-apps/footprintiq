import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Activity, TrendingUp, Shield } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  id: string;
  type: 'scan' | 'case' | 'monitor' | 'workspace' | 'report';
  title: string;
  subtitle?: string;
  url: string;
  icon: any;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const searchResults: SearchResult[] = [];

        // Search cases
        const { data: cases } = await supabase
          .from('cases')
          .select('id, title, description')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10);

        if (cases) {
          cases.forEach(c => {
            searchResults.push({
              id: c.id,
              type: 'case',
              title: c.title,
              subtitle: c.description?.substring(0, 60),
              url: `/cases/${c.id}`,
              icon: FileText
            });
          });
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchData, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setQuery('');
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Search scans, cases, workspaces..." 
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? 'Searching...' : 'No results found.'}
        </CommandEmpty>
        
        {results.length > 0 && (
          <CommandGroup heading="Results">
            {results.map((result) => (
              <CommandItem
                key={`${result.type}-${result.id}`}
                onSelect={() => handleSelect(result.url)}
                className="flex items-start gap-3 py-3"
              >
                <result.icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{result.title}</div>
                  {result.subtitle && (
                    <div className="text-sm text-muted-foreground line-clamp-1">
                      {result.subtitle}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground uppercase">
                  {result.type}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => handleSelect('/scan')}>
            <Search className="h-4 w-4 mr-2" />
            New Scan
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/cases')}>
            <FileText className="h-4 w-4 mr-2" />
            View Cases
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/monitoring')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Monitoring
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/security')}>
            <Shield className="h-4 w-4 mr-2" />
            Security Dashboard
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
