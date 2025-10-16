/**
 * Plugin Registry
 * 
 * Framework for modular OSINT enrichers that extend scan capabilities.
 * Plugins can enrich username, email, domain, phone, or IP findings.
 */

import { Finding } from "../ufm";

export type PluginType = "username" | "email" | "domain" | "phone" | "ip";

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  description: string;
  author: string;
  enabled: boolean;
  requiresApiKey?: boolean;
}

export interface PluginContext {
  query: string;
  existingFindings: Finding[];
}

export interface PluginResult {
  findings: Finding[];
  metadata?: Record<string, unknown>;
}

export type PluginEnricher = (context: PluginContext) => Promise<PluginResult>;

export interface Plugin {
  metadata: PluginMetadata;
  enrich: PluginEnricher;
}

/**
 * Global plugin registry
 */
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.id)) {
      console.warn(`Plugin ${plugin.metadata.id} already registered, overwriting`);
    }
    this.plugins.set(plugin.metadata.id, plugin);
  }

  /**
   * Unregister a plugin
   */
  unregister(pluginId: string): void {
    this.plugins.delete(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by type
   */
  getByType(type: PluginType): Plugin[] {
    return this.getAll().filter((p) => p.metadata.type === type);
  }

  /**
   * Get enabled plugins by type
   */
  getEnabled(type: PluginType): Plugin[] {
    return this.getByType(type).filter((p) => p.metadata.enabled);
  }

  /**
   * Enable/disable a plugin
   */
  setEnabled(pluginId: string, enabled: boolean): void {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.metadata.enabled = enabled;
      this.savePluginState();
    }
  }

  /**
   * Execute all enabled plugins for a type
   */
  async executePlugins(
    type: PluginType,
    context: PluginContext
  ): Promise<Finding[]> {
    const enabledPlugins = this.getEnabled(type);
    const results: Finding[] = [];

    for (const plugin of enabledPlugins) {
      try {
        const result = await plugin.enrich(context);
        results.push(...result.findings);
      } catch (error) {
        console.error(`Plugin ${plugin.metadata.id} failed:`, error);
      }
    }

    return results;
  }

  /**
   * Save plugin enabled state to localStorage
   */
  private savePluginState(): void {
    const state: Record<string, boolean> = {};
    this.plugins.forEach((plugin, id) => {
      state[id] = plugin.metadata.enabled;
    });
    localStorage.setItem("pluginRegistry_state", JSON.stringify(state));
  }

  /**
   * Load plugin enabled state from localStorage
   */
  loadPluginState(): void {
    const stateJson = localStorage.getItem("pluginRegistry_state");
    if (!stateJson) return;

    try {
      const state: Record<string, boolean> = JSON.parse(stateJson);
      Object.entries(state).forEach(([id, enabled]) => {
        const plugin = this.plugins.get(id);
        if (plugin) {
          plugin.metadata.enabled = enabled;
        }
      });
    } catch (error) {
      console.error("Failed to load plugin state:", error);
    }
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();

/**
 * Helper to create a plugin
 */
export function createPlugin(
  metadata: PluginMetadata,
  enrich: PluginEnricher
): Plugin {
  return { metadata, enrich };
}
