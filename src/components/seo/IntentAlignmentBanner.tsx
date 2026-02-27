/**
 * IntentAlignmentBanner — Positioning statement to reduce bounce from intent mismatch.
 * Clarifies what the tool does and doesn't do, in a neutral and reassuring tone.
 */
import { Shield, Globe, HeartHandshake } from 'lucide-react';

export function IntentAlignmentBanner() {
  return (
    <div className="bg-muted/30 border-b border-border/50">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <p className="text-sm text-muted-foreground text-center mb-3">
          This tool analyses publicly available OSINT data to help you understand digital exposure. It does not access private accounts or hidden databases.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { icon: Globe, label: 'Public sources only' },
            { icon: Shield, label: 'Defensive use' },
            { icon: HeartHandshake, label: 'Privacy-first design' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="w-3.5 h-3.5 text-primary/70" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
