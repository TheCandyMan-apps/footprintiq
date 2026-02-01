import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Guard against undefined event.key (can happen with some input methods)
      if (!event.key) return;
      
      for (const shortcut of shortcuts) {
        if (!shortcut.key) continue;
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const metaMatch = shortcut.meta === undefined || shortcut.meta === event.metaKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && metaMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export function useGlobalShortcuts(handlers: {
  onSearch?: () => void;
  onFilter?: () => void;
  onHelp?: () => void;
  onGoTop?: () => void;
}) {
  const shortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      action: () => handlers.onSearch?.(),
      description: 'Focus global search',
    },
    {
      key: 'f',
      action: () => handlers.onFilter?.(),
      description: 'Open filters',
    },
    {
      key: '?',
      shift: true,
      action: () => handlers.onHelp?.(),
      description: 'Show keyboard shortcuts',
    },
    {
      key: 'g',
      action: () => {
        // Listen for second 'g'
        const handler = (e: KeyboardEvent) => {
          if (e.key === 'g') {
            e.preventDefault();
            handlers.onGoTop?.();
          }
          document.removeEventListener('keydown', handler);
        };
        document.addEventListener('keydown', handler);
        setTimeout(() => document.removeEventListener('keydown', handler), 1000);
      },
      description: 'Go to top (press g twice)',
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
