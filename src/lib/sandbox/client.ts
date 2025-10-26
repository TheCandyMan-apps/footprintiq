import { supabase } from "@/integrations/supabase/client";

export interface PluginManifest {
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

export interface SandboxExecutionResult {
  success: boolean;
  findings: Array<{
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    source: string;
    metadata?: Record<string, any>;
  }>;
  metadata: {
    executionTime: number;
    bytesReturned: number;
    pluginId: string;
    pluginVersion: string;
  };
  error?: string;
}

export async function executeSandboxPlugin(
  artifact: string,
  artifactType: string,
  manifest: PluginManifest
): Promise<SandboxExecutionResult> {
  const { data, error } = await supabase.functions.invoke("sandbox-execute", {
    body: {
      artifact,
      artifactType,
      manifest,
    },
  });

  if (error) {
    throw new Error(`Sandbox execution failed: ${error.message}`);
  }

  return data;
}

export async function getSandboxHealth(): Promise<{
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
}> {
  const { data, error } = await supabase.functions.invoke("sandbox-health");

  if (error) {
    throw new Error(`Health check failed: ${error.message}`);
  }

  return data;
}
