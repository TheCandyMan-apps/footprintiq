import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signBody(body: string, secret: string): Promise<{ ts: string; sig: string }> {
  const ts = String(Math.floor(Date.now() / 1000));
  const message = `${ts}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return { ts, sig: bufToHex(signatureBuffer) };
}

const N8N_WEBHOOK_HMAC_SECRET = Deno.env.get("N8N_WEBHOOK_HMAC_SECRET");

Deno.test("HMAC signed request returns 200 or processes correctly", async () => {
  if (!N8N_WEBHOOK_HMAC_SECRET) {
    console.log("Skipping: N8N_WEBHOOK_HMAC_SECRET not set locally");
    return;
  }

  const body = JSON.stringify({
    scanId: "00000000-0000-0000-0000-000000000000",
    status: "running",
    message: "HMAC e2e test",
    provider: "test",
  });

  const { ts, sig } = await signBody(body, N8N_WEBHOOK_HMAC_SECRET);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/n8n-scan-progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "x-fpiq-ts": ts,
      "x-fpiq-sig": sig,
    },
    body,
  });

  const text = await res.text();
  console.log(`Status: ${res.status}, Body: ${text}`);

  // Should NOT be 401 — HMAC should pass
  assertNotEquals(res.status, 401, `Got 401 — HMAC verification failed: ${text}`);
});

Deno.test("Wrong HMAC signature returns 401 AUTH_HMAC_MISMATCH", async () => {
  const body = JSON.stringify({
    scanId: "00000000-0000-0000-0000-000000000000",
    status: "running",
    message: "Bad sig test",
  });

  const ts = String(Math.floor(Date.now() / 1000));

  const res = await fetch(`${SUPABASE_URL}/functions/v1/n8n-scan-progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "x-fpiq-ts": ts,
      "x-fpiq-sig": "0000000000000000000000000000000000000000000000000000000000000000",
    },
    body,
  });

  const json = await res.json();
  console.log(`Status: ${res.status}, Code: ${json.code}`);
  assertEquals(res.status, 401);
  assertEquals(json.code, "AUTH_HMAC_MISMATCH");
});

Deno.test("Expired timestamp returns 401 AUTH_HMAC_BAD_TS", async () => {
  const body = JSON.stringify({ scanId: "test", status: "running" });
  const oldTs = String(Math.floor(Date.now() / 1000) - 600); // 10 min ago

  const res = await fetch(`${SUPABASE_URL}/functions/v1/n8n-scan-progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "x-fpiq-ts": oldTs,
      "x-fpiq-sig": "0000000000000000000000000000000000000000000000000000000000000000",
    },
    body,
  });

  const json = await res.json();
  console.log(`Status: ${res.status}, Code: ${json.code}`);
  assertEquals(res.status, 401);
  assertEquals(json.code, "AUTH_HMAC_BAD_TS");
});
