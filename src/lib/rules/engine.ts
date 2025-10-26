import { supabase } from '@/integrations/supabase/client';

export interface WatchlistRule {
  type: 'avatar_hash' | 'pgp_key' | 'email_pattern' | 'phone_prefix' | 'asn' | 'vt_reputation';
  operator: 'equals' | 'contains' | 'matches' | 'greater_than' | 'less_than';
  value: string;
}

interface EntityNode {
  id: string;
  entity_type: string;
  entity_value: string;
  metadata: any;
}

/**
 * Evaluate if an entity matches a watchlist rule
 */
export function evaluateRule(entity: EntityNode, rule: WatchlistRule): boolean {
  const { type, operator, value } = rule;
  
  try {
    switch (type) {
      case 'avatar_hash':
        return evaluateAvatarHash(entity, operator, value);
      
      case 'pgp_key':
        return evaluatePGPKey(entity, operator, value);
      
      case 'email_pattern':
        return evaluateEmailPattern(entity, operator, value);
      
      case 'phone_prefix':
        return evaluatePhonePrefix(entity, operator, value);
      
      case 'asn':
        return evaluateASN(entity, operator, value);
      
      case 'vt_reputation':
        return evaluateVTReputation(entity, operator, value);
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Rule evaluation error:', error);
    return false;
  }
}

function evaluateAvatarHash(entity: EntityNode, operator: string, value: string): boolean {
  const avatarHash = entity.metadata?.avatar_hash;
  if (!avatarHash) return false;

  switch (operator) {
    case 'equals':
      return avatarHash === value;
    case 'contains':
      return avatarHash.includes(value);
    case 'matches':
      return new RegExp(value).test(avatarHash);
    default:
      return false;
  }
}

function evaluatePGPKey(entity: EntityNode, operator: string, value: string): boolean {
  const pgpKey = entity.metadata?.pgp_key || entity.metadata?.pgp_fingerprint;
  if (!pgpKey) return false;

  switch (operator) {
    case 'equals':
      return pgpKey === value;
    case 'contains':
      return pgpKey.includes(value);
    case 'matches':
      return new RegExp(value).test(pgpKey);
    default:
      return false;
  }
}

function evaluateEmailPattern(entity: EntityNode, operator: string, value: string): boolean {
  if (entity.entity_type !== 'email' && entity.entity_type !== 'username') return false;
  
  const emailValue = entity.entity_value;

  switch (operator) {
    case 'equals':
      return emailValue === value;
    case 'contains':
      return emailValue.includes(value);
    case 'matches':
      return new RegExp(value).test(emailValue);
    default:
      return false;
  }
}

function evaluatePhonePrefix(entity: EntityNode, operator: string, value: string): boolean {
  if (entity.entity_type !== 'phone') return false;
  
  const phoneValue = entity.entity_value;

  switch (operator) {
    case 'equals':
      return phoneValue === value;
    case 'contains':
      return phoneValue.startsWith(value);
    default:
      return false;
  }
}

function evaluateASN(entity: EntityNode, operator: string, value: string): boolean {
  const asn = entity.metadata?.asn || entity.metadata?.autonomous_system_number;
  if (!asn) return false;

  const asnString = String(asn);

  switch (operator) {
    case 'equals':
      return asnString === value;
    case 'contains':
      return asnString.includes(value);
    default:
      return false;
  }
}

function evaluateVTReputation(entity: EntityNode, operator: string, value: string): boolean {
  const reputation = entity.metadata?.vt_reputation || entity.metadata?.reputation_score;
  if (typeof reputation !== 'number') return false;

  const threshold = parseFloat(value);
  if (isNaN(threshold)) return false;

  switch (operator) {
    case 'greater_than':
      return reputation > threshold;
    case 'less_than':
      return reputation < threshold;
    case 'equals':
      return reputation === threshold;
    default:
      return false;
  }
}

/**
 * Find entities that match watchlist rules
 */
export async function findMatchingEntities(
  watchlistId: string,
  rules: WatchlistRule[],
  limit: number = 100
): Promise<string[]> {
  try {
    // Get all entities for the user
    const { data: entities, error } = await supabase
      .from('entity_nodes')
      .select('id, entity_type, entity_value, metadata')
      .limit(limit * 2); // Fetch more than needed for filtering

    if (error) throw error;
    if (!entities) return [];

    // Filter entities that match ANY rule
    const matchingEntityIds: string[] = [];

    for (const entity of entities) {
      const matches = rules.some(rule => evaluateRule(entity as any, rule));
      if (matches) {
        matchingEntityIds.push(entity.id);
      }
    }

    return matchingEntityIds.slice(0, limit);
  } catch (error) {
    console.error('Find matching entities error:', error);
    return [];
  }
}

/**
 * Expand watchlist membership based on rules
 */
export async function expandWatchlist(watchlistId: string): Promise<number> {
  try {
    // Get watchlist rules
    const { data: watchlist, error: watchlistError } = await supabase
      .from('watchlists')
      .select('rules, is_active')
      .eq('id', watchlistId)
      .single();

    if (watchlistError) throw watchlistError;
    if (!watchlist.is_active) return 0;

    const rules = watchlist.rules as any as WatchlistRule[];
    if (!rules || rules.length === 0) return 0;

    // Find matching entities
    const entityIds = await findMatchingEntities(watchlistId, rules);

    if (entityIds.length === 0) return 0;

    // Get existing members
    const { data: existingMembers } = await supabase
      .from('watchlist_members')
      .select('entity_id')
      .eq('watchlist_id', watchlistId);

    const existingIds = new Set(existingMembers?.map(m => m.entity_id) || []);

    // Add new members
    const newMembers = entityIds
      .filter(id => !existingIds.has(id))
      .map(entity_id => ({
        watchlist_id: watchlistId,
        entity_id,
        added_by: 'system',
      }));

    if (newMembers.length === 0) return 0;

    const { error: insertError } = await supabase
      .from('watchlist_members')
      .insert(newMembers);

    if (insertError) throw insertError;

    return newMembers.length;
  } catch (error) {
    console.error('Expand watchlist error:', error);
    return 0;
  }
}

/**
 * Run expansion for all active watchlists (scheduled job)
 */
export async function expandAllWatchlists(): Promise<{
  total: number;
  expanded: number;
  added: number;
}> {
  try {
    const { data: watchlists, error } = await supabase
      .from('watchlists')
      .select('id, name')
      .eq('is_active', true);

    if (error) throw error;
    if (!watchlists) return { total: 0, expanded: 0, added: 0 };

    let totalAdded = 0;
    let expandedCount = 0;

    for (const watchlist of watchlists) {
      const added = await expandWatchlist(watchlist.id);
      if (added > 0) {
        expandedCount++;
        totalAdded += added;
        console.log(`Watchlist "${watchlist.name}" added ${added} new members`);
      }
    }

    return {
      total: watchlists.length,
      expanded: expandedCount,
      added: totalAdded,
    };
  } catch (error) {
    console.error('Expand all watchlists error:', error);
    return { total: 0, expanded: 0, added: 0 };
  }
}