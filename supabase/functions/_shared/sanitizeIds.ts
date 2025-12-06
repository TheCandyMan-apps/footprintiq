/**
 * Sanitize IDs received from n8n workflows.
 * n8n expression mode can prepend '=' to values when expressions are misconfigured.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Sanitize a scanId value from n8n.
 * Strips leading '=' characters (n8n expression artifact) and validates UUID format.
 * 
 * @param rawId - The raw scanId value from n8n
 * @returns Cleaned UUID string or null if invalid
 */
export function sanitizeScanId(rawId: string | undefined | null): string | null {
  if (!rawId) return null;
  
  // Strip leading '=' (n8n expression artifact) and trim whitespace
  const cleaned = String(rawId).replace(/^=+/, '').trim();
  
  // Validate UUID format
  if (!UUID_REGEX.test(cleaned)) {
    console.warn(`[sanitizeScanId] Invalid UUID format after cleaning: "${rawId}" → "${cleaned}"`);
    return null;
  }
  
  // Log if sanitization was needed (helps debug n8n config issues)
  if (rawId !== cleaned) {
    console.log(`[sanitizeScanId] Cleaned scanId: "${rawId}" → "${cleaned}"`);
  }
  
  return cleaned;
}

/**
 * Sanitize a generic string value from n8n.
 * Strips leading '=' characters and trims whitespace.
 * 
 * @param rawValue - The raw string value from n8n
 * @returns Cleaned string or null if empty
 */
export function sanitizeN8nString(rawValue: string | undefined | null): string | null {
  if (!rawValue) return null;
  
  const cleaned = String(rawValue).replace(/^=+/, '').trim();
  
  if (!cleaned) return null;
  
  if (rawValue !== cleaned) {
    console.log(`[sanitizeN8nString] Cleaned value: "${rawValue}" → "${cleaned}"`);
  }
  
  return cleaned;
}
