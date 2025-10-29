import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    {
      key: "d",
      ctrl: true,
      action: () => navigate("/dashboard"),
      description: "Go to Dashboard",
    },
    {
      key: "n",
      ctrl: true,
      action: () => navigate("/scan"),
      description: "New Scan",
    },
    {
      key: "c",
      ctrl: true,
      action: () => navigate("/cases"),
      description: "View Cases",
    },
    {
      key: "a",
      ctrl: true,
      shift: true,
      action: () => navigate("/analytics"),
      description: "Analytics",
    },
    {
      key: "/",
      ctrl: true,
      action: () => {
        // GlobalSearch is already triggered by Cmd+K
        toast.info("Use Cmd/Ctrl + K to search");
      },
      description: "Search",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlMatch &&
          shiftMatch &&
          altMatch
        ) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return shortcuts;
}
