import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_TIMEOUT_MS = 15000; // 15 seconds
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB

interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  permissions: string[];
  methods: {
    type: "http" | "head_request" | "get_request" | "regex";
    url?: string;
    pattern?: string;
  }[];
}

interface PluginInput {
  artifact: string;
  artifactType: string;
  manifest: PluginManifest;
}

interface UFMFinding {
  category: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  source: string;
  metadata?: Record<string, any>;
}

interface PluginOutput {
  success: boolean;
  findings: UFMFinding[];
  metadata: {
    executionTime: number;
    bytesReturned: number;
    pluginId: string;
    pluginVersion: string;
  };
  error?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[SANDBOX] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    logStep("Sandbox execution started");

    // Initialize Supabase for audit logging
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Parse and validate input
    const input: PluginInput = await req.json();
    logStep("Input received", { pluginId: input.manifest?.id, artifact: input.artifact });

    if (!input.manifest || !input.artifact) {
      throw new Error("Invalid input: manifest and artifact required");
    }

    // Validate manifest structure
    if (!input.manifest.id || !input.manifest.permissions || !input.manifest.methods) {
      throw new Error("Invalid manifest structure");
    }

    const findings: UFMFinding[] = [];
    let totalBytes = 0;

    // Execute plugin methods with timeout and size limits
    for (const method of input.manifest.methods) {
      try {
        if (method.type === "http" || method.type === "get_request") {
          if (!method.url) continue;

          // Build URL with artifact
          const url = method.url.replace("{artifact}", encodeURIComponent(input.artifact));
          
          logStep("Executing HTTP request", { url });

          // Execute with timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT_MS);

          try {
            const response = await fetch(url, {
              method: "GET",
              headers: {
                "User-Agent": "FootprintIQ-Sandbox/1.0",
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Check response size
            const contentLength = response.headers.get("content-length");
            if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
              throw new Error("Response too large");
            }

            const body = await response.text();
            totalBytes += body.length;

            if (totalBytes > MAX_RESPONSE_SIZE) {
              throw new Error("Total response size exceeded");
            }

            // Basic pattern matching for findings
            if (response.ok) {
              findings.push({
                category: "profile_found",
                severity: "low",
                description: `Profile found on ${input.manifest.name}`,
                source: input.manifest.id,
                metadata: {
                  url,
                  statusCode: response.status,
                  contentLength: body.length,
                },
              });
            }
          } catch (error: any) {
            if (error.name === "AbortError") {
              throw new Error("Request timeout");
            }
            throw error;
          }
        } else if (method.type === "head_request") {
          if (!method.url) continue;

          const url = method.url.replace("{artifact}", encodeURIComponent(input.artifact));
          
          logStep("Executing HEAD request", { url });

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), MAX_TIMEOUT_MS);

          try {
            const response = await fetch(url, {
              method: "HEAD",
              headers: {
                "User-Agent": "FootprintIQ-Sandbox/1.0",
              },
              signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
              findings.push({
                category: "account_exists",
                severity: "low",
                description: `Account exists on ${input.manifest.name}`,
                source: input.manifest.id,
                metadata: {
                  url,
                  statusCode: response.status,
                },
              });
            }
          } catch (error: any) {
            if (error.name === "AbortError") {
              throw new Error("Request timeout");
            }
            // HEAD requests often fail, don't throw
            logStep("HEAD request failed", { error: error.message });
          }
        }
      } catch (methodError: any) {
        logStep("Method execution error", { 
          type: method.type, 
          error: methodError.message 
        });
        // Continue with other methods
      }
    }

    const executionTime = Date.now() - startTime;

    const output: PluginOutput = {
      success: true,
      findings,
      metadata: {
        executionTime,
        bytesReturned: totalBytes,
        pluginId: input.manifest.id,
        pluginVersion: input.manifest.version,
      },
    };

    // Audit log
    await supabaseClient.from("sandbox_runs").insert({
      plugin_id: input.manifest.id,
      artifact_type: input.artifactType,
      latency_ms: executionTime,
      status: "success",
      bytes_returned: totalBytes,
      findings_count: findings.length,
    });

    logStep("Execution completed", { 
      findings: findings.length, 
      executionTime 
    });

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logStep("Execution error", { error: errorMessage, executionTime });

    const output: PluginOutput = {
      success: false,
      findings: [],
      metadata: {
        executionTime,
        bytesReturned: 0,
        pluginId: "unknown",
        pluginVersion: "unknown",
      },
      error: errorMessage,
    };

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error.message.includes("timeout") ? 504 : 400,
    });
  }
});
