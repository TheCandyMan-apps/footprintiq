import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Search, Network, Bell, Settings, CreditCard, HelpCircle, FileText, BarChart,
  Zap, Code, Users, GitBranch, Calendar, Download, List, Shield, Keyboard, Filter
} from "lucide-react";
import { Hotkey } from "@/components/ui/hotkey";
import { Badge } from "@/components/ui/badge";

interface Command {
  id: string;
  label: string;
  keywords?: string[];
  icon: any;
  action: () => void;
  group: string;
  shortcut?: string[];
  badge?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Track recent commands in localStorage
  const getRecentCommands = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem("recentCommands") || "[]");
    } catch {
      return [];
    }
  };

  const addRecentCommand = (commandId: string) => {
    const recent = getRecentCommands();
    const updated = [commandId, ...recent.filter(id => id !== commandId)].slice(0, 5);
    localStorage.setItem("recentCommands", JSON.stringify(updated));
  };

  // All available commands
  const allCommands: Command[] = useMemo(() => [
    // Navigation
    { id: "new-scan", label: "New Scan", icon: Search, action: () => navigate('/'), group: "Navigation" },
    { id: "advanced-scan", label: "Advanced Scan", keywords: ["multi", "provider"], icon: Zap, action: () => navigate('/scan/advanced'), group: "Navigation" },
    { id: "batch-scan", label: "Batch Scan", keywords: ["bulk", "csv"], icon: List, action: () => navigate('/scan/batch'), group: "Navigation", badge: "Pro" },
    { id: "entity-search", label: "Entity Search", icon: Search, action: () => navigate('/search'), group: "Navigation" },
    { id: "graph", label: "Open Graph", keywords: ["network", "visualization"], icon: Network, action: () => navigate('/graph'), group: "Navigation", shortcut: ["g", "g"] },
    { id: "monitoring", label: "Monitoring", keywords: ["alerts", "watch"], icon: Bell, action: () => navigate('/monitoring'), group: "Navigation", shortcut: ["g", "m"] },
    { id: "cases", label: "Cases", keywords: ["investigations"], icon: FileText, action: () => navigate('/cases'), group: "Navigation" },
    { id: "analytics", label: "Analytics", keywords: ["dashboard", "insights"], icon: BarChart, action: () => navigate('/analytics'), group: "Navigation" },
    { id: "workflows", label: "Workflows", keywords: ["automation", "pipelines"], icon: GitBranch, action: () => navigate('/workflows'), group: "Navigation", badge: "Pro" },
    
    // Settings
    { id: "providers", label: "Providers", keywords: ["health", "admin"], icon: Settings, action: () => navigate('/admin/providers'), group: "Settings" },
    { id: "billing", label: "Billing", keywords: ["subscription", "plan"], icon: CreditCard, action: () => navigate('/organization?tab=billing'), group: "Settings" },
    { id: "api-keys", label: "API Keys", keywords: ["automation", "integration"], icon: Code, action: () => navigate('/api-keys'), group: "Settings", badge: "Pro" },
    { id: "organization", label: "Organization Settings", icon: Settings, action: () => navigate('/organization'), group: "Settings" },
    { id: "security", label: "Security Dashboard", keywords: ["admin"], icon: Shield, action: () => navigate('/admin/security'), group: "Settings", badge: "Admin" },
    
    // Help & Learning
    { id: "help", label: "Help Center", icon: HelpCircle, action: () => navigate('/help'), group: "Help & Learning" },
    { id: "tour-onboarding", label: "Start Guided Tour", keywords: ["tutorial"], icon: HelpCircle, action: () => navigate('/onboarding?tour=onboarding'), group: "Help & Learning" },
    { id: "tour-search", label: "Search Tour", icon: Search, action: () => navigate('/onboarding?tour=search'), group: "Help & Learning" },
    { id: "tour-graph", label: "Graph Tour", icon: Network, action: () => navigate('/onboarding?tour=graph'), group: "Help & Learning" },
    { id: "support", label: "Support", icon: HelpCircle, action: () => navigate('/support'), group: "Help & Learning" },
    { id: "shortcuts", label: "Keyboard Shortcuts", keywords: ["hotkeys"], icon: Keyboard, action: () => navigate('/help'), group: "Help & Learning" },
    
    // Power Features
    { id: "referrals", label: "Referral Program", keywords: ["credits", "earn"], icon: Users, action: () => navigate('/referrals'), group: "Power Features" },
    { id: "export-bulk", label: "Bulk Export", keywords: ["download", "batch"], icon: Download, action: () => navigate('/cases'), group: "Power Features" },
    { id: "scheduled-scans", label: "Scheduled Scans", keywords: ["recurring", "automation"], icon: Calendar, action: () => navigate('/monitoring'), group: "Power Features" },
    { id: "advanced-filters", label: "Advanced Filters", keywords: ["search", "query"], icon: Filter, action: () => navigate('/search'), group: "Power Features" },
  ], [navigate]);

  // Fuzzy search implementation
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return allCommands;
    
    const query = searchQuery.toLowerCase();
    return allCommands.filter(cmd => {
      const labelMatch = cmd.label.toLowerCase().includes(query);
      const keywordMatch = cmd.keywords?.some(kw => kw.toLowerCase().includes(query));
      return labelMatch || keywordMatch;
    });
  }, [searchQuery, allCommands]);

  // Group commands
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.group]) groups[cmd.group] = [];
      groups[cmd.group].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Recent commands
  const recentCommandIds = getRecentCommands();
  const recentCommands = useMemo(() => 
    allCommands.filter(cmd => recentCommandIds.includes(cmd.id)),
    [allCommands, recentCommandIds]
  );

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === "/" && !open) {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
      if (e.key === "?" && !open) {
        e.preventDefault();
        navigate('/support');
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, navigate]);

  const runCommand = (commandId: string, callback: () => void) => {
    addRecentCommand(commandId);
    setOpen(false);
    setSearchQuery("");
    callback();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-tour="command-palette"
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-lg hover:border-primary transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Quick actions...</span>
        <Hotkey keys={["mod", "k"]} className="ml-auto" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search commands, features, or shortcuts..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center text-sm">
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
              <p className="text-xs text-muted-foreground mt-2">
                Try "scan", "graph", "monitoring", or "help"
              </p>
            </div>
          </CommandEmpty>
          
          {/* Recent Commands */}
          {!searchQuery && recentCommands.length > 0 && (
            <>
              <CommandGroup heading="Recent">
                {recentCommands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <CommandItem 
                      key={cmd.id} 
                      onSelect={() => runCommand(cmd.id, cmd.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{cmd.label}</span>
                      {cmd.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {cmd.badge}
                        </Badge>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {/* Grouped Commands */}
          {Object.entries(groupedCommands).map(([group, commands], index) => (
            <div key={group}>
              <CommandGroup heading={group}>
                {commands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <CommandItem 
                      key={cmd.id} 
                      onSelect={() => runCommand(cmd.id, cmd.action)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{cmd.label}</span>
                      {cmd.shortcut && (
                        <Hotkey keys={cmd.shortcut} className="ml-auto" />
                      )}
                      {cmd.badge && !cmd.shortcut && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {cmd.badge}
                        </Badge>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {index < Object.keys(groupedCommands).length - 1 && <CommandSeparator />}
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
