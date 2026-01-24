import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { ScanResult } from '@/hooks/useScanResultsData';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlatformCatalog, buildCategoryMap, getCategoryFromCatalog } from '@/hooks/usePlatformCatalog';

// ============= HELPER FUNCTIONS =============

function extractSite(result: any): string {
  if (result.evidence && Array.isArray(result.evidence)) {
    const siteEvidence = result.evidence.find((e: any) => e.key === 'site');
    if (siteEvidence?.value) return siteEvidence.value;
  }
  if (result.meta?.platform) return result.meta.platform;
  if (result.meta?.site) return result.meta.site;
  if (result.site) return result.site;
  return '';
}

function extractUrl(result: any): string {
  if (result.evidence && Array.isArray(result.evidence)) {
    const urlEvidence = result.evidence.find((e: any) => e.key === 'url');
    if (urlEvidence?.value) return urlEvidence.value;
  }
  if (result.url) return result.url;
  return '';
}

function extractUsername(result: any): string {
  if (result.evidence && Array.isArray(result.evidence)) {
    const usernameEvidence = result.evidence.find((e: any) => e.key === 'username');
    if (usernameEvidence?.value) return usernameEvidence.value;
  }
  if (result.meta?.username) return result.meta.username;
  return '';
}

function deriveStatus(result: any): string {
  if (result.status) return result.status.toLowerCase();
  if (result.kind === 'profile_presence') return 'found';
  
  if (result.evidence && Array.isArray(result.evidence)) {
    const existsEvidence = result.evidence.find((e: any) => e.key === 'exists');
    if (existsEvidence?.value === true) return 'found';
    if (existsEvidence?.value === false) return 'not_found';
  }
  
  const meta = result.meta || result.metadata || {};
  if (meta.status) return meta.status.toLowerCase();
  if (meta.exists === true) return 'found';
  if (meta.exists === false) return 'not_found';
  
  return 'unknown';
}

// ============= CONFIDENCE & REASONING =============

export type ConfidenceLevel = 'strong' | 'medium' | 'weak';

export interface ConfidenceSignals {
  usernameMatch: boolean;
  emailMatch: boolean;
  displayNameReuse: boolean;
  bioSimilarity: boolean;
}

function calculateConfidence(
  entity: { url: string; displayName: string; bio: string; signals: { emails: string[] } },
  searchedUsername: string
): { score: number; level: ConfidenceLevel; signals: ConfidenceSignals } {
  let score = 0;
  const signals: ConfidenceSignals = { 
    usernameMatch: false, 
    emailMatch: false, 
    displayNameReuse: false, 
    bioSimilarity: false 
  };
  const normalized = searchedUsername.toLowerCase();
  
  // Username in URL, displayName, or bio: +40
  if (entity.url.toLowerCase().includes(normalized) || 
      entity.displayName.toLowerCase().includes(normalized) ||
      entity.bio.toLowerCase().includes(normalized)) {
    score += 40;
    signals.usernameMatch = true;
  }
  
  // Email found: +60
  if (entity.signals.emails.length > 0) {
    score += 60;
    signals.emailMatch = true;
  }
  
  // Display name present: +25 (potential reuse signal)
  if (entity.displayName && entity.displayName.length > 2) {
    score += 25;
    signals.displayNameReuse = true;
  }
  
  // Bio has content: +15 (potential similarity signal)
  if (entity.bio && entity.bio.length > 20) {
    score += 15;
    signals.bioSimilarity = true;
  }
  
  const finalScore = Math.min(score, 100);
  const level: ConfidenceLevel = finalScore >= 70 ? 'strong' : finalScore >= 40 ? 'medium' : 'weak';
  return { score: finalScore, level, signals };
}

function generateReasoning(
  viewMode: 'category' | 'all', 
  legType: string, 
  entity: { category: string; displayName: string },
  searchedUsername: string
): string {
  if (viewMode === 'category') {
    return `Grouped under ${entity.category}`;
  }
  
  switch (legType) {
    case 'username': return `Matched username "${searchedUsername}" in profile`;
    case 'email': return `Matched email extracted from profile text`;
    case 'displayName': return `Matched reused display name "${entity.displayName}"`;
    case 'unlinked': return `No strong pivot match detected`;
    default: return `Connected via ${legType}`;
  }
}

// ============= TYPES =============

export type MindMapViewMode = 'all' | 'category';
export type ConnectByMode = 'username' | 'email' | 'profile';

export interface ProfileEntity {
  id: string;
  platform: string;
  url: string;
  displayName: string;
  bio: string;
  avatar: string;
  provider: string;
  confidence: number;
  category: string;
  signals: {
    emails: string[];
    usernames: string[];
    displayNames: string[];
  };
  // New enrichment fields
  reasoning: string;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number;
  confidenceSignals: ConfidenceSignals;
  iconUrl?: string;
  initials: string;
}

export interface LegData {
  id: string;
  label: string;
  type: 'category' | 'username' | 'email' | 'displayName' | 'unlinked';
  category: string;
  color: string;
  profiles: ProfileEntity[];
  reasoning: string;
}

interface MindMapGraphProps {
  results: ScanResult[];
  username: string;
  viewMode: MindMapViewMode;
  connectBy: ConnectByMode;
  showConnections: boolean;
  onNodeClick: (entity: ProfileEntity | null) => void;
  onNodeDoubleClick: (entity: ProfileEntity) => void;
  onLegClick?: (leg: LegData | null) => void;
  className?: string;
}

// ============= COLOR SYSTEM =============

const CATEGORY_COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6',
  '#06b6d4', '#f97316', '#22c55e', '#ef4444', '#a855f7',
];

function getCategoryColor(category: string): string {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash) + category.charCodeAt(i);
    hash |= 0;
  }
  return CATEGORY_COLOR_PALETTE[Math.abs(hash) % CATEGORY_COLOR_PALETTE.length];
}

const CATEGORY_ICONS: Record<string, string> = {
  'Social': '👥',
  'Messaging': '💬',
  'Developer': '💻',
  'Gaming': '🎮',
  'Media': '📺',
  'Creative': '🎨',
  'Professional': '💼',
  'Forums': '📋',
  'E-Commerce': '🛒',
  'Travel & Reviews': '✈️',
  'Dating': '💕',
  'Crypto': '🪙',
  'NSFW': '🔞',
  'Education': '📚',
  'Blogging': '✍️',
  'Finance': '💰',
  'Other': '🌐',
};

const MAX_PROFILES_DISPLAYED = 200;

export function MindMapGraph({
  results,
  username,
  viewMode,
  connectBy,
  showConnections,
  onNodeClick,
  onNodeDoubleClick,
  onLegClick,
  className,
}: MindMapGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    content: { displayName: string; category?: string; platform?: string; url?: string; reasoning?: string; confidenceLevel?: ConfidenceLevel };
  } | null>(null);
  
  // Focus mode state
  const [showAllEdges, setShowAllEdges] = useState(false);
  const [focusedLegId, setFocusedLegId] = useState<string | null>(null);
  const [focusedProfileId, setFocusedProfileId] = useState<string | null>(null);

  // Fetch platform catalog for category mapping
  const { data: platformCatalog } = usePlatformCatalog();
  const categoryMap = useMemo(() => buildCategoryMap(platformCatalog), [platformCatalog]);

  // Extract profile entities from scan results with enrichment
  const profileEntities = useMemo((): ProfileEntity[] => {
    const entities: ProfileEntity[] = [];
    const seenUrls = new Set<string>();
    
    results.forEach(result => {
      const status = deriveStatus(result);
      const extractedUrl = extractUrl(result);
      const extractedSite = extractSite(result);
      
      const isFound = status === 'found' || status === 'claimed' || status === 'exists';
      if (!isFound || !extractedUrl) return;
      
      if (seenUrls.has(extractedUrl)) return;
      seenUrls.add(extractedUrl);
      
      const meta = (result.meta || (result as any).metadata || {}) as Record<string, any>;
      const evidence = (result as any).evidence;
      
      const platform = extractedSite || meta.platform || meta.site || 'Unknown';
      const category = getCategoryFromCatalog(platform, categoryMap);
      const extractedUsername = extractUsername(result);
      const displayName = extractedUsername || meta.displayName || meta.username || meta.handle || meta.name || '';
      const bio = meta.bio || meta.description || 
                  (Array.isArray(evidence) ? evidence.find((e: any) => e.key === 'bio')?.value : '') || '';
      const avatar = meta.avatar || meta.avatarUrl || meta.profile_image || '';
      
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const textToSearch = `${displayName} ${bio}`;
      const emails = textToSearch.match(emailRegex) || [];
      
      // Calculate confidence
      const entityForConfidence = { 
        url: extractedUrl, 
        displayName, 
        bio, 
        signals: { emails } 
      };
      const { score, level, signals } = calculateConfidence(entityForConfidence, username);
      
      // Get icon URL from catalog
      const catalogEntry = platformCatalog?.find(p => 
        p.platform.toLowerCase() === platform.toLowerCase()
      );
      const iconUrl = catalogEntry?.icon_url || undefined;
      
      // Generate initials
      const initials = displayName 
        ? displayName.slice(0, 2).toUpperCase()
        : platform.slice(0, 2).toUpperCase();
      
      entities.push({
        id: `${platform}__${extractedUrl}`,
        platform,
        url: extractedUrl,
        displayName,
        bio,
        avatar,
        provider: (result as any).provider || 'unknown',
        confidence: meta.confidence || 0.7,
        category,
        signals: {
          emails,
          usernames: displayName ? [displayName] : [],
          displayNames: displayName ? [displayName] : [],
        },
        reasoning: '', // Will be set per-leg context
        confidenceLevel: level,
        confidenceScore: score,
        confidenceSignals: signals,
        iconUrl,
        initials,
      });
    });
    
    // Sort by confidence score and cap
    return entities
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, MAX_PROFILES_DISPLAYED);
  }, [results, categoryMap, username, platformCatalog]);

  const isCapped = results.length > MAX_PROFILES_DISPLAYED;
  const cappedCount = results.length - MAX_PROFILES_DISPLAYED;

  // Build legs based on view mode with reasoning
  const legs = useMemo((): LegData[] => {
    if (viewMode === 'category') {
      const categoryGroups = new Map<string, ProfileEntity[]>();
      
      profileEntities.forEach(entity => {
        const cat = entity.category || 'Other';
        if (!categoryGroups.has(cat)) {
          categoryGroups.set(cat, []);
        }
        categoryGroups.get(cat)!.push({
          ...entity,
          reasoning: `Grouped under ${cat}`,
        });
      });
      
      return Array.from(categoryGroups.entries())
        .filter(([_, profiles]) => profiles.length > 0)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([category, profiles]) => ({
          id: `leg-cat-${category.toLowerCase().replace(/\s+/g, '-')}`,
          label: `${category} (${profiles.length})`,
          type: 'category' as const,
          category,
          color: getCategoryColor(category),
          profiles: profiles.sort((a, b) => b.confidenceScore - a.confidenceScore),
          reasoning: `Category: ${category}`,
        }));
    } else {
      // View All - group by pivots
      const usernameProfiles: ProfileEntity[] = [];
      const emailGroups = new Map<string, ProfileEntity[]>();
      const displayNameGroups = new Map<string, ProfileEntity[]>();
      const unlinkedProfiles: ProfileEntity[] = [];
      
      const normalizedUsername = username.toLowerCase();
      
      profileEntities.forEach(entity => {
        let assigned = false;
        
        if (connectBy === 'username' || connectBy === 'profile') {
          const entityUsername = (entity.displayName || '').toLowerCase();
          if (entityUsername.includes(normalizedUsername) || normalizedUsername.includes(entityUsername)) {
            usernameProfiles.push({
              ...entity,
              reasoning: generateReasoning('all', 'username', entity, username),
            });
            assigned = true;
          }
        }
        
        if (!assigned && (connectBy === 'email' || connectBy === 'profile')) {
          for (const email of entity.signals.emails) {
            if (!emailGroups.has(email)) {
              emailGroups.set(email, []);
            }
            emailGroups.get(email)!.push({
              ...entity,
              reasoning: generateReasoning('all', 'email', entity, username),
            });
            assigned = true;
            break;
          }
        }
        
        if (!assigned && connectBy === 'profile') {
          for (const dn of entity.signals.displayNames) {
            const key = dn.toLowerCase();
            if (!displayNameGroups.has(key)) {
              displayNameGroups.set(key, []);
            }
            displayNameGroups.get(key)!.push({
              ...entity,
              reasoning: generateReasoning('all', 'displayName', entity, username),
            });
            assigned = true;
            break;
          }
        }
        
        if (!assigned) {
          unlinkedProfiles.push({
            ...entity,
            reasoning: generateReasoning('all', 'unlinked', entity, username),
          });
        }
      });
      
      const legsResult: LegData[] = [];
      
      if (usernameProfiles.length > 0) {
        legsResult.push({
          id: 'leg-username',
          label: `@${username} (${usernameProfiles.length})`,
          type: 'username',
          category: 'Username',
          color: '#3b82f6',
          profiles: usernameProfiles.sort((a, b) => b.confidenceScore - a.confidenceScore),
          reasoning: `Matched username "${username}" in URL/bio/displayName`,
        });
      }
      
      Array.from(emailGroups.entries())
        .filter(([_, profiles]) => profiles.length > 0)
        .slice(0, 6)
        .forEach(([email, profiles]) => {
          legsResult.push({
            id: `leg-email-${email.replace(/[^a-z0-9]/gi, '-')}`,
            label: `${email} (${profiles.length})`,
            type: 'email',
            category: 'Email',
            color: '#f59e0b',
            profiles: profiles.sort((a, b) => b.confidenceScore - a.confidenceScore),
            reasoning: `Matched email "${email}" extracted from profile text`,
          });
        });
      
      Array.from(displayNameGroups.entries())
        .filter(([_, profiles]) => profiles.length >= 2)
        .slice(0, 6)
        .forEach(([dn, profiles]) => {
          legsResult.push({
            id: `leg-dn-${dn.replace(/[^a-z0-9]/gi, '-')}`,
            label: `"${dn}" (${profiles.length})`,
            type: 'displayName',
            category: 'Display Name',
            color: '#8b5cf6',
            profiles: profiles.sort((a, b) => b.confidenceScore - a.confidenceScore),
            reasoning: `Matched reused display name "${dn}" across ${profiles.length} profiles`,
          });
        });
      
      if (unlinkedProfiles.length > 0) {
        legsResult.push({
          id: 'leg-unlinked',
          label: `Unlinked (${unlinkedProfiles.length})`,
          type: 'unlinked',
          category: 'Unlinked',
          color: '#6b7280',
          profiles: unlinkedProfiles.sort((a, b) => b.confidenceScore - a.confidenceScore),
          reasoning: `No strong pivot match`,
        });
      }
      
      return legsResult;
    }
  }, [profileEntities, viewMode, connectBy, username]);

  // Build cytoscape elements with enhanced styling
  const buildElements = useCallback(() => {
    const elements: cytoscape.ElementDefinition[] = [];
    
    // Root node at center
    elements.push({
      data: {
        id: 'root',
        label: username,
        type: 'root',
      },
      position: { x: 0, y: 0 },
      classes: 'root-node',
    });
    
    const LEG_RADIUS = 200;
    const PROFILE_RADIUS_START = 350;
    const RING_SPACING = 50;
    const PROFILES_PER_RING = 10;
    
    legs.forEach((leg, legIndex) => {
      const legAngle = (2 * Math.PI * legIndex) / legs.length - Math.PI / 2;
      
      const legX = LEG_RADIUS * Math.cos(legAngle);
      const legY = LEG_RADIUS * Math.sin(legAngle);
      
      const categoryIcon = CATEGORY_ICONS[leg.category] || CATEGORY_ICONS.Other;
      
      elements.push({
        data: {
          id: leg.id,
          label: leg.label,
          type: 'leg',
          category: leg.category,
          color: leg.color,
          profileCount: leg.profiles.length,
          reasoning: leg.reasoning,
          legType: leg.type,
          categoryIcon,
        },
        position: { x: legX, y: legY },
        classes: 'leg-node',
      });
      
      // Root → Leg edge (always show)
      if (showConnections) {
        elements.push({
          data: {
            id: `edge-root-${leg.id}`,
            source: 'root',
            target: leg.id,
            edgeType: 'root-leg',
          },
          classes: 'root-edge',
        });
      }
      
      const arcWidth = Math.PI / Math.max(3, legs.length);
      
      leg.profiles.forEach((profile, profileIndex) => {
        const ringIndex = Math.floor(profileIndex / PROFILES_PER_RING);
        const posInRing = profileIndex % PROFILES_PER_RING;
        const profilesInThisRing = Math.min(PROFILES_PER_RING, leg.profiles.length - ringIndex * PROFILES_PER_RING);
        
        const radius = PROFILE_RADIUS_START + ringIndex * RING_SPACING;
        const startAngle = legAngle - arcWidth / 2;
        const angleStep = arcWidth / Math.max(1, profilesInThisRing - 1);
        const angle = profilesInThisRing === 1 ? legAngle : startAngle + angleStep * posInRing;
        
        const profileX = radius * Math.cos(angle);
        const profileY = radius * Math.sin(angle);
        
        // Opacity based on confidence
        const opacityLevel = profile.confidenceLevel === 'strong' ? 0.95 : 
                            profile.confidenceLevel === 'medium' ? 0.75 : 0.55;
        
        elements.push({
          data: {
            id: profile.id,
            label: profile.platform.length > 10 ? profile.platform.slice(0, 9) + '…' : profile.platform,
            fullLabel: profile.platform,
            type: 'profile',
            platform: profile.platform,
            url: profile.url,
            displayName: profile.displayName,
            bio: profile.bio,
            category: profile.category,
            color: leg.color,
            avatar: profile.avatar,
            entity: profile,
            reasoning: profile.reasoning,
            confidenceLevel: profile.confidenceLevel,
            confidenceScore: profile.confidenceScore,
            opacityLevel,
            iconUrl: profile.iconUrl,
            initials: profile.initials,
            legId: leg.id,
          },
          position: { x: profileX, y: profileY },
          classes: `profile-node confidence-${profile.confidenceLevel}`,
        });
        
        // Leg → Profile edge (only show if showAllEdges is true)
        if (showConnections && showAllEdges) {
          elements.push({
            data: {
              id: `edge-${leg.id}-${profile.id}`,
              source: leg.id,
              target: profile.id,
              edgeType: 'leg-profile',
            },
            classes: 'leg-edge',
          });
        }
      });
    });
    
    return elements;
  }, [legs, username, showConnections, showAllEdges]);

  // Initialize cytoscape
  useEffect(() => {
    if (!containerRef.current) return;

    const elements = buildElements();
    
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      layout: { name: 'preset' },
      style: [
        // Root node - large diamond with glow effect via overlay
        {
          selector: 'node.root-node',
          style: {
            'background-color': '#3b82f6',
            'border-width': 5,
            'border-color': '#1d4ed8',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 12,
            'font-size': 14,
            'font-weight': 700,
            'color': '#1f2937',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.95,
            'text-background-padding': '4px',
            'width': 70,
            'height': 70,
            'shape': 'diamond',
            'z-index': 100,
            'overlay-color': '#3b82f6',
            'overlay-opacity': 0.15,
            'overlay-padding': 8,
          },
        },
        // Leg nodes - ring colored by category
        {
          selector: 'node.leg-node',
          style: {
            'background-color': '#f8fafc',
            'border-width': 4,
            'border-color': 'data(color)',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 8,
            'font-size': 11,
            'font-weight': 600,
            'color': '#1f2937',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.9,
            'text-background-padding': '3px',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'width': 45,
            'height': 45,
            'shape': 'ellipse',
            'z-index': 50,
          },
        },
        // Profile nodes - confidence-based styling
        {
          selector: 'node.profile-node',
          style: {
            'background-color': 'data(color)',
            'background-opacity': 'data(opacityLevel)' as any,
            'border-width': 1,
            'border-color': '#ffffff',
            'label': 'data(label)',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'font-size': 9,
            'font-weight': 500,
            'color': '#374151',
            'text-background-color': '#ffffff',
            'text-background-opacity': 0.85,
            'text-background-padding': '2px',
            'width': 26,
            'height': 26,
            'shape': 'ellipse',
            'z-index': 10,
          },
        },
        // Strong confidence - bright with pulse effect
        {
          selector: 'node.profile-node.confidence-strong',
          style: {
            'background-opacity': 1,
            'border-width': 2,
            'border-color': '#22c55e',
            'width': 28,
            'height': 28,
          },
        },
        // Medium confidence
        {
          selector: 'node.profile-node.confidence-medium',
          style: {
            'background-opacity': 0.8,
            'border-width': 1.5,
            'border-color': '#f59e0b',
          },
        },
        // Weak confidence - dimmed
        {
          selector: 'node.profile-node.confidence-weak',
          style: {
            'background-opacity': 0.5,
            'border-width': 1,
            'border-color': '#9ca3af',
            'width': 22,
            'height': 22,
          },
        },
        // Root edges
        {
          selector: 'edge.root-edge',
          style: {
            'line-color': '#6b7280',
            'line-opacity': 0.5,
            'width': 2.5,
            'curve-style': 'bezier',
          },
        },
        // Leg to profile edges
        {
          selector: 'edge.leg-edge',
          style: {
            'line-color': '#9ca3af',
            'line-opacity': 0.25,
            'width': 1,
            'curve-style': 'bezier',
          },
        },
        // Hover states
        {
          selector: 'node.profile-node:hover',
          style: {
            'background-opacity': 1,
            'border-width': 2,
            'border-color': '#3b82f6',
            'width': 32,
            'height': 32,
            'z-index': 100,
          },
        },
        {
          selector: 'node.leg-node:hover',
          style: {
            'border-width': 4,
            'border-color': '#3b82f6',
            'width': 52,
            'height': 52,
            'background-color': '#eff6ff',
          },
        },
        // Selected states
        {
          selector: 'node:selected',
          style: {
            'border-width': 3,
            'border-color': '#2563eb',
          },
        },
        // Dimmed state for focus mode
        {
          selector: '.dimmed',
          style: {
            'opacity': 0.15,
          },
        },
        // Focused path highlighting
        {
          selector: '.focused',
          style: {
            'opacity': 1,
            'border-width': 3,
            'border-color': '#2563eb',
          },
        },
        {
          selector: '.selectedPath',
          style: {
            'opacity': 1,
            'border-width': 3,
            'border-color': '#2563eb',
          },
        },
        // Highlighted state
        {
          selector: 'node.highlighted',
          style: {
            'border-width': 3,
            'border-color': '#2563eb',
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-opacity': 0.8,
            'width': 2,
          },
        },
      ],
      minZoom: 0.3,
      maxZoom: 3,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;

    // Event handlers
    cy.on('tap', 'node.profile-node', (e) => {
      const node = e.target;
      const entity = node.data('entity') as ProfileEntity;
      
      if (entity) {
        // Focus mode: highlight path
        cy.elements().removeClass('focused selectedPath dimmed highlighted');
        cy.elements().addClass('dimmed');
        
        const legId = node.data('legId');
        const leg = cy.$(`#${legId}`);
        const rootEdge = cy.edges(`[source = "root"][target = "${legId}"]`);
        
        cy.$('#root').removeClass('dimmed').addClass('selectedPath');
        leg.removeClass('dimmed').addClass('selectedPath');
        node.removeClass('dimmed').addClass('selectedPath');
        rootEdge.removeClass('dimmed').addClass('highlighted');
        
        setFocusedProfileId(node.id());
        setFocusedLegId(legId);
        onNodeClick(entity);
      }
    });

    cy.on('dbltap', 'node.profile-node', (e) => {
      const node = e.target;
      const entity = node.data('entity') as ProfileEntity;
      if (entity) {
        onNodeDoubleClick(entity);
      }
    });

    cy.on('tap', 'node.leg-node', (e) => {
      const node = e.target;
      
      // Focus mode: highlight leg and its profiles
      cy.elements().removeClass('focused selectedPath dimmed highlighted');
      cy.elements().addClass('dimmed');
      
      const legId = node.id();
      const connectedProfiles = cy.nodes(`[legId = "${legId}"]`);
      const rootEdge = cy.edges(`[source = "root"][target = "${legId}"]`);
      
      cy.$('#root').removeClass('dimmed').addClass('focused');
      node.removeClass('dimmed').addClass('focused');
      connectedProfiles.removeClass('dimmed').addClass('focused');
      rootEdge.removeClass('dimmed').addClass('highlighted');
      
      // Show leg→profile edges temporarily
      const legEdges = cy.edges(`[source = "${legId}"]`);
      legEdges.forEach(edge => {
        edge.removeClass('dimmed').addClass('highlighted');
      });
      
      // Animate fit to branch
      cy.animate({
        fit: { eles: node.union(connectedProfiles), padding: 60 },
      }, {
        duration: 250,
        easing: 'ease-out',
      });
      
      setFocusedLegId(legId);
      setFocusedProfileId(null);
      
      // Notify parent about leg selection
      const legData = legs.find(l => l.id === legId);
      if (legData && onLegClick) {
        onLegClick(legData);
      }
    });

    cy.on('tap', (e) => {
      if (e.target === cy) {
        cy.elements().removeClass('focused selectedPath dimmed highlighted');
        setFocusedLegId(null);
        setFocusedProfileId(null);
        onNodeClick(null);
        if (onLegClick) onLegClick(null);
      }
    });

    // Hover tooltips with enhanced info
    cy.on('mouseover', 'node.profile-node', (e) => {
      const node = e.target;
      const renderedPos = node.renderedPosition();
      const container = containerRef.current?.getBoundingClientRect();
      
      if (container) {
        setTooltipData({
          x: container.left + renderedPos.x,
          y: container.top + renderedPos.y - 40,
          content: {
            displayName: node.data('displayName') || node.data('platform'),
            platform: node.data('platform'),
            category: node.data('category'),
            url: node.data('url'),
            reasoning: node.data('reasoning'),
            confidenceLevel: node.data('confidenceLevel'),
          },
        });
      }
    });

    cy.on('mouseout', 'node', () => {
      setTooltipData(null);
    });

    // Fit to view with animation
    cy.animate({
      fit: { eles: cy.elements(), padding: 50 },
    }, {
      duration: 300,
      easing: 'ease-out',
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [buildElements, onNodeClick, onNodeDoubleClick, onLegClick, legs]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    cyRef.current?.animate({
      zoom: (cyRef.current.zoom() * 1.3),
      center: { eles: cyRef.current.$('#root') },
    }, { duration: 150 });
  }, []);

  const handleZoomOut = useCallback(() => {
    cyRef.current?.animate({
      zoom: (cyRef.current.zoom() / 1.3),
    }, { duration: 150 });
  }, []);

  const handleFit = useCallback(() => {
    cyRef.current?.animate({
      fit: { eles: cyRef.current.elements(), padding: 50 },
    }, { duration: 250, easing: 'ease-out' });
  }, []);

  const handleReset = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    
    cy.elements().removeClass('focused selectedPath dimmed highlighted');
    cy.animate({
      fit: { eles: cy.elements(), padding: 50 },
    }, { duration: 250, easing: 'ease-out' });
    
    setFocusedLegId(null);
    setFocusedProfileId(null);
    onNodeClick(null);
    if (onLegClick) onLegClick(null);
  }, [onNodeClick, onLegClick]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      {/* Graph container */}
      <div 
        ref={containerRef} 
        className="w-full h-full bg-gradient-to-br from-background via-muted/20 to-background"
      />

      {/* Capped warning */}
      {isCapped && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs text-amber-600 dark:text-amber-400">
          Showing {MAX_PROFILES_DISPLAYED} of {results.length} profiles (+{cappedCount} not displayed)
        </div>
      )}

      {/* Edge visibility toggle */}
      <div className="absolute top-2 left-2 flex items-center gap-2 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border rounded-lg">
        <Switch
          id="show-all-edges"
          checked={showAllEdges}
          onCheckedChange={setShowAllEdges}
          className="h-4 w-7 data-[state=checked]:bg-primary"
        />
        <Label htmlFor="show-all-edges" className="text-[10px] text-muted-foreground cursor-pointer flex items-center gap-1">
          {showAllEdges ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          All edges
        </Label>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-1 shadow-lg">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <div className="h-px bg-border my-0.5" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFit}>
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleReset}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Focus indicator */}
      {(focusedLegId || focusedProfileId) && (
        <div className="absolute bottom-3 left-3 px-2.5 py-1.5 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary flex items-center gap-2">
          <span>Focus mode active</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 px-1.5 text-[10px]" 
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      )}

      {/* Enhanced Tooltip */}
      {tooltipData && (
        <div
          className="fixed z-50 px-3 py-2 bg-popover border border-border rounded-lg shadow-xl text-xs pointer-events-none max-w-[200px]"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-semibold text-foreground">{tooltipData.content.displayName}</div>
          <div className="text-muted-foreground">
            {tooltipData.content.platform} • {tooltipData.content.category}
          </div>
          {tooltipData.content.reasoning && (
            <div className="mt-1 pt-1 border-t border-border/50 text-[10px] text-muted-foreground/80">
              {tooltipData.content.reasoning}
            </div>
          )}
          {tooltipData.content.confidenceLevel && (
            <div className={cn(
              'mt-1 text-[10px] font-medium',
              tooltipData.content.confidenceLevel === 'strong' && 'text-green-600',
              tooltipData.content.confidenceLevel === 'medium' && 'text-amber-600',
              tooltipData.content.confidenceLevel === 'weak' && 'text-gray-500',
            )}>
              {tooltipData.content.confidenceLevel.charAt(0).toUpperCase() + tooltipData.content.confidenceLevel.slice(1)} confidence
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MindMapGraph;
