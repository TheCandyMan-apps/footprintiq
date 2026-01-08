import { Finding } from "../ufm";

/**
 * Persona DNA - Privacy-Preserving Identity Hash
 * 
 * Generates a deterministic hash from username patterns, activity cadence,
 * platform mix, and behavioral signals WITHOUT storing raw PII.
 * Uses PUBLIC_PERSONA_SALT for determinism across scans.
 */

const PUBLIC_PERSONA_SALT = "footprintiq_persona_v1";

interface PersonaFeatures {
  usernameTokens: string[];
  platformMix: string[];
  activityPattern: number[];
  bioTokens: string[];
  cadenceHistogram: number[];
}

/**
 * Extract persona features from findings
 */
export function extractPersonaFeatures(findings: Finding[]): PersonaFeatures {
  const usernameTokens: Set<string> = new Set();
  const platformMix: Set<string> = new Set();
  const activityPattern: number[] = new Array(7).fill(0); // Day of week histogram
  const bioTokens: Set<string> = new Set();
  const cadenceHistogram: number[] = new Array(24).fill(0); // Hour of day histogram

  findings.forEach((finding) => {
    // Extract username patterns
    if (finding.type === "social_media" || finding.type === "identity") {
      (finding.evidence || []).forEach((e) => {
        if (e.key === "username" && typeof e.value === "string") {
          const tokens = tokenizeUsername(e.value);
          tokens.forEach((t) => usernameTokens.add(t));
        }
        if (e.key === "bio" && typeof e.value === "string") {
          const tokens = tokenizeBio(e.value);
          tokens.forEach((t) => bioTokens.add(t));
        }
      });
    }

    // Track platform presence
    platformMix.add(finding.provider);

    // Build activity histogram
    const timestamp = new Date(finding.observedAt);
    activityPattern[timestamp.getDay()]++;
    cadenceHistogram[timestamp.getHours()]++;
  });

  return {
    usernameTokens: Array.from(usernameTokens).sort(),
    platformMix: Array.from(platformMix).sort(),
    activityPattern,
    bioTokens: Array.from(bioTokens).sort(),
    cadenceHistogram,
  };
}

/**
 * Tokenize username into patterns (e.g., "john_doe123" -> ["john", "doe", "###"])
 */
function tokenizeUsername(username: string): string[] {
  const tokens: string[] = [];
  
  // Split by common separators
  const parts = username.toLowerCase().split(/[._\-]/);
  
  parts.forEach((part) => {
    if (/^\d+$/.test(part)) {
      tokens.push("###"); // Numeric pattern
    } else if (/^[a-z]+$/.test(part)) {
      if (part.length >= 3) tokens.push(part); // Keep meaningful text tokens
    }
  });
  
  return tokens;
}

/**
 * Tokenize bio into common linguistic patterns
 */
function tokenizeBio(bio: string): string[] {
  const tokens: string[] = [];
  const words = bio.toLowerCase().split(/\s+/);
  
  // Extract emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
  const emojis = bio.match(emojiRegex) || [];
  if (emojis.length > 0) tokens.push("EMOJI");
  
  // Common bio patterns
  if (words.includes("he/him") || words.includes("she/her")) tokens.push("PRONOUNS");
  if (words.includes("ceo") || words.includes("founder")) tokens.push("EXEC");
  if (words.includes("engineer") || words.includes("developer")) tokens.push("TECH");
  
  return tokens;
}

/**
 * Generate deterministic Persona DNA hash
 */
export async function generatePersonaDNA(features: PersonaFeatures): Promise<string> {
  const composite = [
    features.usernameTokens.join("|"),
    features.platformMix.join("|"),
    features.activityPattern.join(","),
    features.bioTokens.join("|"),
    features.cadenceHistogram.join(","),
  ].join("::") + "::" + PUBLIC_PERSONA_SALT;

  const encoder = new TextEncoder();
  const data = encoder.encode(composite);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  
  return hashHex.substring(0, 16); // 64-bit hash for display
}

/**
 * Complete Persona DNA generation from findings
 */
export async function computePersonaDNA(findings: Finding[]): Promise<{
  dna: string;
  features: PersonaFeatures;
  confidence: number;
}> {
  const features = extractPersonaFeatures(findings);
  const dna = await generatePersonaDNA(features);
  
  // Confidence based on feature richness
  const confidence = Math.min(
    1.0,
    (features.usernameTokens.length * 0.3 +
      features.platformMix.length * 0.3 +
      features.bioTokens.length * 0.2 +
      (features.activityPattern.filter((x) => x > 0).length / 7) * 0.2)
  );
  
  return { dna, features, confidence };
}
