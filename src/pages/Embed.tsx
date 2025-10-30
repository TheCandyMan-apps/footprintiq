/**
 * Embed Page - Hosts the embeddable widget
 * Loaded in iframe by partner sites via fiq-widget.js
 */

import { PresenceWidget } from "@/embed/PresenceWidget";
import { useEffect } from "react";

export default function Embed() {
  useEffect(() => {
    // Send resize events to parent window
    const sendHeight = () => {
      const height = document.body.scrollHeight;
      window.parent.postMessage(
        { type: 'fiq-widget-resize', height },
        '*'
      );
    };

    // Send initial height
    sendHeight();

    // Update on content changes
    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4">
      <PresenceWidget />
    </div>
  );
}
