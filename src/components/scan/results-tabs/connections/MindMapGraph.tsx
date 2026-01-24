import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { ScanResult } from '@/hooks/useScanResultsData';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePlatformCatalog, buildCategoryMap, getCategoryFromCatalog } from '@/hooks/usePlatformCatalog';

export type MindMapViewMode = 'all' | 'category';
export type ConnectByMode = 'username' | 'email' | 'profile';

interface ProfileEntity {
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
}

interface MindMapGraphProps {
  results: ScanResult[];
  username: string;
  viewMode: MindMapViewMode;
  connectBy: ConnectByMode;
  showConnections: boolean;
  onNodeClick: (entity: ProfileEntity | null) => void;
  onNodeDoubleClick: (entity: ProfileEntity) => void;
  className?: string;
}

// Category colors for legs
const CATEGORY_COLORS: Record<string, string> = {
  'Social': '#3b82f6',
  'Messaging': '#8b5cf6',
  'Developer': '#10b981',
  'Gaming': '#f59e0b',
  'Media': '#ec4899',
  'Creative': '#f97316',
  'Professional': '#6366f1',
  'Forums': '#14b8a6',
  'E-Commerce': '#eab308',
  'Travel & Reviews': '#06b6d4',
  'Dating': '#f43f5e',
  'Crypto': '#a855f7',
  'NSFW': '#ef4444',
  'Education': '#22c55e',
  'Blogging': '#64748b',
  'Finance': '#0ea5e9',
  'Other': '#6b7280',
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
  className,
}: MindMapGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    content: { displayName: string; category?: string; platform?: string; url?: string };
  } | null>(null);

  // Fetch platform catalog for category mapping
  const { data: platformCatalog } = usePlatformCatalog();
  const categoryMap = useMemo(() => buildCategoryMap(platformCatalog), [platformCatalog]);

  // Extract profile entities from scan results
  const profileEntities = useMemo((): ProfileEntity[] => {
    const entities: ProfileEntity[] = [];
    const seenUrls = new Set<string>();
    
    results.forEach(result => {
      // Only include found/claimed profile_presence results
      const status = (result.status || '').toLowerCase();
      const kind = (result as any).kind;
      
      const isFound = status === 'found' || status === 'claimed' || status === 'exists' || 
                      (result as any).found === true ||
                      kind === 'profile_presence';
      
      if (!isFound || !result.url) return;
      
      // Deduplicate by URL
      if (seenUrls.has(result.url)) return;
      seenUrls.add(result.url);
      
      const meta = (result.meta || (result as any).metadata || {}) as Record<string, any>;
      const evidence = (result as any).evidence;
      
      // Extract platform name
      const platform = result.site || meta.platform || meta.site || (result as any).platform || 'Unknown';
      
      // Get category from catalog
      const category = getCategoryFromCatalog(platform, categoryMap);
      
      // Extract display name
      const displayName = meta.displayName || meta.username || meta.handle || meta.name || '';
      
      // Extract bio
      const bio = meta.bio || meta.description || 
                  (Array.isArray(evidence) ? evidence.find((e: any) => e.key === 'bio')?.value : '') || '';
      
      // Extract avatar
      const avatar = meta.avatar || meta.avatarUrl || meta.profile_image || '';
      
      // Extract emails from bio/displayName
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const textToSearch = `${displayName} ${bio}`;
      const emails = textToSearch.match(emailRegex) || [];
      
      entities.push({
        id: `${platform}__${result.url}`,
        platform,
        url: result.url,
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
      });
    });
    
    // Cap at MAX_PROFILES_DISPLAYED
    return entities.slice(0, MAX_PROFILES_DISPLAYED);
  }, [results, categoryMap]);

  // Track if we're capping
  const isCapped = results.length > MAX_PROFILES_DISPLAYED;
  const cappedCount = results.length - MAX_PROFILES_DISPLAYED;

  // Build legs based on view mode
  const legs = useMemo(() => {
    if (viewMode === 'category') {
      // Group by category
      const categoryGroups = new Map<string, ProfileEntity[]>();
      
      profileEntities.forEach(entity => {
        const cat = entity.category || 'Other';
        if (!categoryGroups.has(cat)) {
          categoryGroups.set(cat, []);
        }
        categoryGroups.get(cat)!.push(entity);
      });
      
      return Array.from(categoryGroups.entries())
        .filter(([_, profiles]) => profiles.length > 0)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([category, profiles]) => ({
          id: `leg-cat-${category.toLowerCase().replace(/\s+/g, '-')}`,
          label: `${category} (${profiles.length})`,
          type: 'category' as const,
          category,
          color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
          profiles,
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
        
        // Check username match
        if (connectBy === 'username' || connectBy === 'profile') {
          const entityUsername = (entity.displayName || '').toLowerCase();
          if (entityUsername.includes(normalizedUsername) || normalizedUsername.includes(entityUsername)) {
            usernameProfiles.push(entity);
            assigned = true;
          }
        }
        
        // Check email match
        if (!assigned && (connectBy === 'email' || connectBy === 'profile')) {
          for (const email of entity.signals.emails) {
            if (!emailGroups.has(email)) {
              emailGroups.set(email, []);
            }
            emailGroups.get(email)!.push(entity);
            assigned = true;
            break;
          }
        }
        
        // Check display name reuse
        if (!assigned && connectBy === 'profile') {
          for (const dn of entity.signals.displayNames) {
            const key = dn.toLowerCase();
            if (!displayNameGroups.has(key)) {
              displayNameGroups.set(key, []);
            }
            displayNameGroups.get(key)!.push(entity);
            assigned = true;
            break;
          }
        }
        
        if (!assigned) {
          unlinkedProfiles.push(entity);
        }
      });
      
      const legsResult: Array<{
        id: string;
        label: string;
        type: 'username' | 'email' | 'displayName' | 'unlinked';
        category: string;
        color: string;
        profiles: ProfileEntity[];
      }> = [];
      
      // Username leg
      if (usernameProfiles.length > 0) {
        legsResult.push({
          id: 'leg-username',
          label: `@${username} (${usernameProfiles.length})`,
          type: 'username',
          category: 'Username',
          color: '#3b82f6',
          profiles: usernameProfiles,
        });
      }
      
      // Email legs (max 6)
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
            profiles,
          });
        });
      
      // Display name legs (reused 2+ times, max 6)
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
            profiles,
          });
        });
      
      // Unlinked leg
      if (unlinkedProfiles.length > 0) {
        legsResult.push({
          id: 'leg-unlinked',
          label: `Unlinked (${unlinkedProfiles.length})`,
          type: 'unlinked',
          category: 'Unlinked',
          color: '#6b7280',
          profiles: unlinkedProfiles,
        });
      }
      
      return legsResult;
    }
  }, [profileEntities, viewMode, connectBy, username]);

  // Build cytoscape elements with preset positions
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
      const legAngle = (2 * Math.PI * legIndex) / legs.length - Math.PI / 2; // Start from top
      
      // Leg node position
      const legX = LEG_RADIUS * Math.cos(legAngle);
      const legY = LEG_RADIUS * Math.sin(legAngle);
      
      elements.push({
        data: {
          id: leg.id,
          label: leg.label,
          type: 'leg',
          category: leg.category,
          color: leg.color,
          profileCount: leg.profiles.length,
        },
        position: { x: legX, y: legY },
        classes: 'leg-node',
      });
      
      // Edge from root to leg
      if (showConnections) {
        elements.push({
          data: {
            id: `edge-root-${leg.id}`,
            source: 'root',
            target: leg.id,
          },
          classes: 'root-edge',
        });
      }
      
      // Profile nodes positioned along arc for this leg
      const arcWidth = Math.PI / Math.max(3, legs.length); // Arc width per leg
      
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
          },
          position: { x: profileX, y: profileY },
          classes: 'profile-node',
        });
        
        // Edge from leg to profile
        if (showConnections) {
          elements.push({
            data: {
              id: `edge-${leg.id}-${profile.id}`,
              source: leg.id,
              target: profile.id,
            },
            classes: 'leg-edge',
          });
        }
      });
    });
    
    return elements;
  }, [legs, username, showConnections]);

  // Initialize cytoscape with preset layout
  useEffect(() => {
    if (!containerRef.current) return;

    const elements = buildElements();
    
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      layout: { name: 'preset' }, // Use preset positions
      style: [
        // Root node - large diamond
        {
          selector: 'node.root-node',
          style: {
            'background-color': '#3b82f6',
            'border-width': 4,
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
            'width': 60,
            'height': 60,
            'shape': 'diamond',
            'z-index': 100,
          },
        },
        // Leg nodes - medium circles
        {
          selector: 'node.leg-node',
          style: {
            'background-color': 'data(color)',
            'border-width': 2,
            'border-color': '#ffffff',
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
            'width': 40,
            'height': 40,
            'shape': 'ellipse',
            'z-index': 50,
          },
        },
        // Profile nodes - small circles
        {
          selector: 'node.profile-node',
          style: {
            'background-color': 'data(color)',
            'background-opacity': 0.8,
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
            'width': 24,
            'height': 24,
            'shape': 'ellipse',
            'z-index': 10,
          },
        },
        // Root edges
        {
          selector: 'edge.root-edge',
          style: {
            'line-color': '#6b7280',
            'line-opacity': 0.4,
            'width': 2,
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
            'width': 30,
            'height': 30,
            'z-index': 100,
          },
        },
        {
          selector: 'node.leg-node:hover',
          style: {
            'border-width': 3,
            'border-color': '#3b82f6',
            'width': 48,
            'height': 48,
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
        // Dimmed state for non-focused
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.3,
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.1,
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
      ],
      minZoom: 0.3,
      maxZoom: 3,
      wheelSensitivity: 0.3,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;

    // Event handlers
    cy.on('tap', 'node.profile-node', (e) => {
      const node = e.target;
      const entity = node.data('entity') as ProfileEntity;
      if (entity) {
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
      // Highlight this leg and its profiles
      cy.elements().removeClass('highlighted dimmed');
      
      const legId = node.id();
      const connectedEdges = cy.edges(`[source = "${legId}"], [target = "${legId}"]`);
      const connectedNodes = connectedEdges.connectedNodes();
      
      node.addClass('highlighted');
      connectedNodes.addClass('highlighted');
      connectedEdges.removeClass('dimmed');
      
      // Dim everything else
      cy.elements().not(node).not(connectedNodes).not(connectedEdges).not('#root').addClass('dimmed');
    });

    cy.on('tap', (e) => {
      if (e.target === cy) {
        cy.elements().removeClass('highlighted dimmed');
        onNodeClick(null);
      }
    });

    // Hover tooltips
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
          },
        });
      }
    });

    cy.on('mouseout', 'node', () => {
      setTooltipData(null);
    });

    // Fit to view
    cy.fit(undefined, 50);

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [buildElements, onNodeClick, onNodeDoubleClick]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() * 1.3);
  }, []);

  const handleZoomOut = useCallback(() => {
    cyRef.current?.zoom(cyRef.current.zoom() / 1.3);
  }, []);

  const handleFit = useCallback(() => {
    cyRef.current?.fit(undefined, 50);
  }, []);

  const handleReset = useCallback(() => {
    cyRef.current?.fit(undefined, 50);
    cyRef.current?.elements().removeClass('highlighted dimmed');
  }, []);

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

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="fixed z-50 px-2.5 py-1.5 bg-popover border border-border rounded-md shadow-lg text-xs pointer-events-none"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="font-medium text-foreground">{tooltipData.content.displayName}</div>
          <div className="text-muted-foreground">
            {tooltipData.content.platform} • {tooltipData.content.category}
          </div>
        </div>
      )}
    </div>
  );
}

export default MindMapGraph;
