import { useEffect, useState } from "react";
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
import { Search, Network, Bell, Settings, CreditCard, HelpCircle, FileText, BarChart } from "lucide-react";
import { Hotkey } from "@/components/ui/hotkey";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

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

  const runCommand = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-lg hover:border-primary transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Quick actions...</span>
        <Hotkey keys={["mod", "k"]} className="ml-auto" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <Search className="mr-2 h-4 w-4" />
              <span>New Scan</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/search'))}>
              <Search className="mr-2 h-4 w-4" />
              <span>Entity Search</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/graph'))}>
              <Network className="mr-2 h-4 w-4" />
              <span>Open Graph</span>
              <Hotkey keys={["g", "g"]} className="ml-auto" />
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/monitoring'))}>
              <Bell className="mr-2 h-4 w-4" />
              <span>Monitoring</span>
              <Hotkey keys={["g", "m"]} className="ml-auto" />
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/cases'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Cases</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/analytics'))}>
              <BarChart className="mr-2 h-4 w-4" />
              <span>Analytics</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => runCommand(() => navigate('/admin/providers'))}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Providers</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/organization?tab=billing'))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Help">
            <CommandItem onSelect={() => runCommand(() => navigate('/support'))}>
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help Center</span>
              <Hotkey keys={["?"]} className="ml-auto" />
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
