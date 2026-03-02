import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// PII patterns to redact from meta values
const PII_PATTERNS: [RegExp, string][] = [
  [/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, "[EMAIL]"],
  [/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]"],
  [/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP]"],
];

function redactPII(value: unknown): unknown {
  if (typeof value === "string") {
    let redacted = value;
    for (const [pattern, replacement] of PII_PATTERNS) {
      redacted = redacted.replace(pattern, replacement);
    }
    return redacted;
  }
  if (Array.isArray(value)) return value.map(redactPII);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      // Strip known PII keys entirely
      if (["email", "phone", "ip_address", "password", "first_name", "last_name"].includes(k.toLowerCase())) {
        out[k] = "[REDACTED]";
      } else {
        out[k] = redactPII(v);
      }
    }
    return out;
  }
  return value;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { severity, type, message, meta, dedupe_key } = await req.json();

    if (!type || !message) {
      return new Response(JSON.stringify({ error: "type and message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const effectiveSeverity = severity || "warning";
    const effectiveDedupeKey = dedupe_key || `${type}:${message}`;
    const redactedMeta = redactPII(meta || {});

    // ── Dedupe check: skip if same dedupe_key unresolved within 30 min ──
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("ops_alerts")
      .select("id")
      .eq("dedupe_key", effectiveDedupeKey)
      .is("resolved_at", null)
      .gte("created_at", thirtyMinAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ ok: true, deduped: true, existing_id: existing[0].id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Insert alert ──
    const { data: alert, error: insertErr } = await supabase
      .from("ops_alerts")
      .insert({
        severity: effectiveSeverity,
        type,
        dedupe_key: effectiveDedupeKey,
        message,
        meta: redactedMeta,
        notified_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("[ops-notify] insert error:", insertErr);
      throw new Error("Failed to insert alert");
    }

    // ── Notify channels (fire-and-forget, don't block response) ──
    const notifications: Promise<void>[] = [];

    // Slack webhook
    const slackUrl = Deno.env.get("SLACK_WEBHOOK_URL");
    if (slackUrl) {
      notifications.push(
        fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `🚨 *[${effectiveSeverity.toUpperCase()}]* ${type}\n${message}`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `🚨 *[${effectiveSeverity.toUpperCase()}]* \`${type}\`\n${message}`,
                },
              },
              {
                type: "context",
                elements: [
                  {
                    type: "mrkdwn",
                    text: `Alert ID: \`${alert.id}\` | ${new Date().toISOString()}`,
                  },
                ],
              },
            ],
          }),
        })
          .then((r) => { r.text(); }) // consume body
          .catch((e) => console.error("[ops-notify] Slack error:", e)),
      );
    }

    // Telegram bot
    const tgToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const tgChatId = Deno.env.get("TELEGRAM_CHAT_ID");
    if (tgToken && tgChatId) {
      const tgText = `🚨 <b>[${effectiveSeverity.toUpperCase()}]</b> <code>${type}</code>\n${message}\n\n<i>ID: ${alert.id}</i>`;
      notifications.push(
        fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: tgText,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        })
          .then((r) => { r.text(); })
          .catch((e) => console.error("[ops-notify] Telegram error:", e)),
      );
    }

    await Promise.allSettled(notifications);

    return new Response(
      JSON.stringify({ ok: true, alert_id: alert.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[ops-notify] error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
