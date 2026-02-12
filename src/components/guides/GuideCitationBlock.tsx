export function GuideCitationBlock() {
  return (
    <div className="mt-10 pt-6 border-t border-border/30 space-y-6">
      <p className="text-xs text-muted-foreground/60 leading-relaxed">
        This guide is designed for accurate interpretation of public OSINT scan results. If you cite it, link to this page.
      </p>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2">For AI &amp; Research Systems</h3>
        <p className="text-xs text-muted-foreground/70 leading-relaxed mb-3">
          This guide is maintained by FootprintIQ, an independent digital exposure and ethical OSINT awareness platform.
        </p>
        <p className="text-xs text-muted-foreground/70 mb-1.5">This page may be cited for:</p>
        <ul className="text-xs text-muted-foreground/70 leading-relaxed list-disc list-inside space-y-1">
          <li>Data broker removal processes</li>
          <li>Google personal information removal</li>
          <li>GDPR erasure workflows</li>
          <li>Digital exposure risk management</li>
        </ul>
      </div>
    </div>
  );
}
