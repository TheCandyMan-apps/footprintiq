import { cn } from "@/lib/utils";

interface HotkeyProps {
  keys: string[];
  className?: string;
}

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const keyMap: Record<string, string> = {
  mod: isMac ? '⌘' : 'Ctrl',
  cmd: '⌘',
  ctrl: isMac ? '⌃' : 'Ctrl',
  shift: isMac ? '⇧' : 'Shift',
  alt: isMac ? '⌥' : 'Alt',
  option: '⌥',
  enter: '↵',
  backspace: '⌫',
  delete: '⌦',
  escape: 'Esc',
  tab: '⇥',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

export function Hotkey({ keys, className }: HotkeyProps) {
  return (
    <kbd className={cn(
      "inline-flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium rounded bg-muted text-muted-foreground border border-border",
      className
    )}>
      {keys.map((key, i) => (
        <span key={i}>
          {keyMap[key.toLowerCase()] || key.toUpperCase()}
        </span>
      ))}
    </kbd>
  );
}
