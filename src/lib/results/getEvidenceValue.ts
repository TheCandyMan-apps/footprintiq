/**
 * Safely extract a value from an evidence field that may be:
 *  - an array of { key: string; value: string } objects
 *  - a plain object keyed by field name
 *  - null / undefined
 *
 * Key matching is case-insensitive.
 */
export function getEvidenceValue(
  evidence: unknown,
  key: string,
): string | undefined {
  if (!evidence || !key) return undefined;

  const lowerKey = key.toLowerCase();

  // Array of { key, value } entries (primary format from findings)
  if (Array.isArray(evidence)) {
    const entry = evidence.find(
      (e: any) =>
        typeof e?.key === 'string' && e.key.toLowerCase() === lowerKey,
    );
    return entry?.value != null ? String(entry.value) : undefined;
  }

  // Plain object format
  if (typeof evidence === 'object') {
    const obj = evidence as Record<string, unknown>;
    for (const k of Object.keys(obj)) {
      if (k.toLowerCase() === lowerKey && obj[k] != null) {
        return String(obj[k]);
      }
    }
  }

  return undefined;
}
