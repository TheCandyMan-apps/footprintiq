interface PolicyCheck {
  allowed: boolean;
  reason?: string;
  gatedBy?: string;
}

const ALLOW_DARKWEB_SOURCES = import.meta.env.VITE_ALLOW_DARKWEB_SOURCES === "true";
const ALLOW_ENTERPRISE_ENRICHMENT = import.meta.env.VITE_ALLOW_ENTERPRISE_ENRICHMENT === "true";

const POLICY_GATES: Record<string, { flag: boolean; tag: string; description: string }> = {
  darkweb: {
    flag: ALLOW_DARKWEB_SOURCES,
    tag: "darkweb",
    description: "Dark web and paste sources (IntelX, DeHashed, DarkSearch)",
  },
  enterprise: {
    flag: ALLOW_ENTERPRISE_ENRICHMENT,
    tag: "enterprise",
    description: "Enterprise enrichment APIs (SecurityTrails, WHOISXML, URLScan)",
  },
};

export async function ensureAllowed(providerId: string, policyTag?: string): Promise<PolicyCheck> {
  // If no policy tag, allow by default
  if (!policyTag) {
    return { allowed: true };
  }
  
  const gate = POLICY_GATES[policyTag];
  if (!gate) {
    console.warn(`[policy] Unknown policy tag: ${policyTag}`);
    return { allowed: true };
  }
  
  if (!gate.flag) {
    console.warn(`[policy] Provider ${providerId} gated by policy: ${policyTag} (${gate.description})`);
    return {
      allowed: false,
      reason: `Gated by policy: ${policyTag}`,
      gatedBy: policyTag,
    };
  }
  
  return { allowed: true };
}

export function getPolicyStatus(): Record<string, { enabled: boolean; description: string }> {
  const status: Record<string, any> = {};
  
  Object.entries(POLICY_GATES).forEach(([tag, gate]) => {
    status[tag] = {
      enabled: gate.flag,
      description: gate.description,
    };
  });
  
  return status;
}
