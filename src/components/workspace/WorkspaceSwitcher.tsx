import { useMemo } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, CheckCircle2 } from "lucide-react";

export function WorkspaceSwitcher() {
  const { workspace, workspaces, loading, switchWorkspace } = useWorkspace();

  const hasMultiple = useMemo(() => (workspaces?.length || 0) > 1, [workspaces]);

  if (loading) {
    return (
      <div className="h-9 w-44 rounded-md bg-muted animate-pulse" aria-label="Loading workspace" />
    );
  }

  if (!workspace) {
    return (
      <Button variant="secondary" size="sm" disabled>
        Setting up workspace...
      </Button>
    );
  }

  if (!hasMultiple) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        <span className="truncate max-w-[160px]" title={workspace.name}>
          {workspace.name}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="truncate max-w-[140px]" title={workspace.name}>
            {workspace.name}
          </span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm">
        <DropdownMenuLabel>Select workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces.map((ws) => (
          <DropdownMenuItem
            key={ws.id}
            onClick={() => switchWorkspace(ws.id)}
            className="cursor-pointer"
          >
            <span className="truncate">{ws.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
