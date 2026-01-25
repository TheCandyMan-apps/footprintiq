import { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape, { Core, ElementDefinition } from 'cytoscape';
import { ChevronDown, ChevronUp, Map } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CytoscapeMiniMapProps {
  /** The main Cytoscape instance to mirror */
  mainCy: Core | null;
  /** Current graph mode for styling */
  graphMode?: 'correlation' | 'mindmap';
  /** Minimum node count before showing mini-map (default: 25) */
  minNodeThreshold?: number;
  /** Force show regardless of node count */
  forceShow?: boolean;
  /** Callback when user drags viewport rectangle */
  onViewportDrag?: (pan: { x: number; y: number }) => void;
  className?: string;
}

// HIGH-CONTRAST stylesheet for mini-map - visible against dark/light backgrounds
const MINIMAP_STYLES: cytoscape.CssStyleDeclaration[] = [
  // All nodes - contrasting solid dots
  {
    selector: 'node',
    style: {
      'background-color': '#334155',
      'border-color': '#94a3b8',
      'border-width': 1,
      'width': 6,
      'height': 6,
      'label': '',
      'opacity': 0.95,
    },
  },
  // Root/Identity nodes - larger and prominent
  {
    selector: 'node.root-node, node.identity',
    style: {
      'background-color': '#2563eb',
      'border-color': '#1d4ed8',
      'border-width': 2,
      'width': 12,
      'height': 12,
      'opacity': 1,
    },
  },
  // Leg/Category nodes - medium size green
  {
    selector: 'node.leg-node, node.group-node',
    style: {
      'background-color': '#059669',
      'border-color': '#047857',
      'border-width': 1,
      'width': 9,
      'height': 9,
      'opacity': 0.95,
    },
  },
  // Profile/Account nodes - visible dots
  {
    selector: 'node.profile-node, node.account',
    style: {
      'background-color': '#64748b',
      'border-color': '#475569',
      'border-width': 1,
      'width': 5,
      'height': 5,
      'opacity': 0.85,
    },
  },
  // Edges - visible but subtle
  {
    selector: 'edge',
    style: {
      'line-color': '#94a3b8',
      'width': 1,
      'opacity': 0.4,
      'curve-style': 'straight',
    },
  },
] as any;

export function CytoscapeMiniMap({
  mainCy,
  graphMode = 'mindmap',
  minNodeThreshold = 25,
  forceShow = false,
  onViewportDrag,
  className,
}: CytoscapeMiniMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const miniCyRef = useRef<Core | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const justDraggedRef = useRef(false);

  // Check if mini-map should be shown
  useEffect(() => {
    if (!mainCy) {
      setShouldRender(false);
      return;
    }
    const nodeCount = mainCy.nodes().length;
    const show = forceShow || graphMode === 'mindmap' || nodeCount > minNodeThreshold;
    setShouldRender(show);
  }, [mainCy, graphMode, minNodeThreshold, forceShow]);

  // Helper to check if nodes have valid positions
  const hasValidPositions = useCallback((cy: Core): boolean => {
    const nodes = cy.nodes();
    if (nodes.length === 0) return false;
    
    let validCount = 0;
    nodes.forEach((node) => {
      const pos = node.position();
      if (pos && (pos.x !== 0 || pos.y !== 0)) {
        validCount++;
      }
    });
    
    // Need at least some nodes with non-zero positions
    return validCount > Math.min(3, nodes.length);
  }, []);

  // Initialize or reinitialize the mini-map
  const initOverview = useCallback(() => {
    if (!containerRef.current || !mainCy || !shouldRender || isCollapsed) {
      return;
    }

    // Check container has real size
    const containerRect = containerRef.current.getBoundingClientRect();
    if (containerRect.width < 50 || containerRect.height < 50) {
      // Container too small, retry later
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = setTimeout(initOverview, 150);
      return;
    }

    // Check if main cy has valid positions
    if (!hasValidPositions(mainCy)) {
      // No valid positions yet, retry later
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = setTimeout(initOverview, 150);
      return;
    }

    // Destroy existing instance
    if (miniCyRef.current) {
      miniCyRef.current.destroy();
      miniCyRef.current = null;
    }

    // Get elements from main graph with positions
    const elements: ElementDefinition[] = mainCy.elements().map((ele) => ({
      data: { ...ele.data() },
      classes: ele.classes().join(' '),
      position: ele.isNode() ? { ...ele.position() } : undefined,
    }));

    const miniCy = cytoscape({
      container: containerRef.current,
      elements,
      style: MINIMAP_STYLES,
      layout: { name: 'preset' },
      userZoomingEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      autoungrabify: true,
      autounselectify: true,
      minZoom: 0.001,
      maxZoom: 2,
    });

    // Fit mini graph to container with padding
    miniCy.fit(undefined, 8);
    
    miniCyRef.current = miniCy;
    setIsInitialized(true);

    // Update viewport rect after short delay
    setTimeout(() => updateViewportRect(), 50);
  }, [mainCy, shouldRender, isCollapsed]);

  // Initialize after layout is ready
  useEffect(() => {
    if (!mainCy || !shouldRender || isCollapsed) {
      return;
    }

    // Reset initialization state when dependencies change
    setIsInitialized(false);

    // Wait for layoutstop event
    const handleLayoutStop = () => {
      if (initTimeoutRef.current) clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = setTimeout(initOverview, 100);
    };

    mainCy.one('layoutstop', handleLayoutStop);

    // Fallback timer in case layoutstop already fired or never fires
    initTimeoutRef.current = setTimeout(initOverview, 300);

    return () => {
      mainCy.off('layoutstop', handleLayoutStop);
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [mainCy, shouldRender, isCollapsed, initOverview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (miniCyRef.current) {
        miniCyRef.current.destroy();
        miniCyRef.current = null;
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  // Update viewport rectangle on main graph pan/zoom
  // KEY FIX: Don't clamp in model-space (that causes "resize only" behavior).
  // Instead, compute the full camera view and clamp only in pixel-space for rendering.
  const updateViewportRect = useCallback(() => {
    if (!mainCy || !miniCyRef.current || !viewportRef.current || !containerRef.current) return;

    const mainContainer = mainCy.container();
    if (!mainContainer) return;

    const miniCy = miniCyRef.current;
    const mainContainerRect = mainContainer.getBoundingClientRect();
    const miniWidth = containerRef.current.clientWidth;
    const miniHeight = containerRef.current.clientHeight;

    const mainZoom = mainCy.zoom();
    const mainPan = mainCy.pan();
    const miniZoom = miniCy.zoom();
    const miniPan = miniCy.pan();
    
    // Calculate what model coordinates are visible in the main graph (full camera view)
    const visibleModelLeft = -mainPan.x / mainZoom;
    const visibleModelTop = -mainPan.y / mainZoom;
    const visibleModelRight = visibleModelLeft + mainContainerRect.width / mainZoom;
    const visibleModelBottom = visibleModelTop + mainContainerRect.height / mainZoom;
    
    // Convert model coords directly to mini-map pixel coords (NO model-space clipping)
    const vpLeft = visibleModelLeft * miniZoom + miniPan.x;
    const vpTop = visibleModelTop * miniZoom + miniPan.y;
    const vpRight = visibleModelRight * miniZoom + miniPan.x;
    const vpBottom = visibleModelBottom * miniZoom + miniPan.y;
    
    // Calculate width/height from the full viewport (maintains correct size)
    const vpWidth = vpRight - vpLeft;
    const vpHeight = vpBottom - vpTop;
    
    // Apply minimum sizes for visibility
    const width = Math.max(16, vpWidth);
    const height = Math.max(12, vpHeight);
    
    // Clamp position in pixel-space only (keeps box within mini-map bounds for rendering)
    // But preserve the actual left/top so position changes are visible
    const left = vpLeft;
    const top = vpTop;
    
    // Always show the viewport (it represents the camera position)
    viewportRef.current.style.display = 'block';
    viewportRef.current.style.width = `${width}px`;
    viewportRef.current.style.height = `${height}px`;
    viewportRef.current.style.left = `${left}px`;
    viewportRef.current.style.top = `${top}px`;
  }, [mainCy]);

  // Subscribe to main graph viewport changes
  useEffect(() => {
    if (!mainCy || !shouldRender || isCollapsed || !isInitialized) return;

    const handleViewChange = () => updateViewportRect();
    
    const handleLayoutStop = () => {
      // Re-sync mini-map elements when layout changes
      if (miniCyRef.current && hasValidPositions(mainCy)) {
        const elements: ElementDefinition[] = mainCy.elements().map((ele) => ({
          data: { ...ele.data() },
          classes: ele.classes().join(' '),
          position: ele.isNode() ? { ...ele.position() } : undefined,
        }));
        miniCyRef.current.json({ elements });
        miniCyRef.current.fit(undefined, 8);
        setTimeout(updateViewportRect, 50);
      }
    };

    mainCy.on('pan zoom', handleViewChange);
    mainCy.on('layoutstop', handleLayoutStop);

    // Initial update
    updateViewportRect();

    return () => {
      mainCy.off('pan zoom', handleViewChange);
      mainCy.off('layoutstop', handleLayoutStop);
    };
  }, [mainCy, shouldRender, isCollapsed, isInitialized, updateViewportRect, hasValidPositions]);

  // Handle viewport rectangle dragging using Pointer Events for robust capture
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!mainCy || !viewportRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Capture pointer for reliable tracking even when cursor leaves the element
    viewportRef.current.setPointerCapture(e.pointerId);
    
    const pan = mainCy.pan();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setIsDragging(true);
  }, [mainCy]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current || !mainCy || !miniCyRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Convert mini-map delta to main graph delta
    const mainZoom = mainCy.zoom();
    const miniZoom = miniCyRef.current.zoom();
    const scale = mainZoom / miniZoom;
    
    // Move viewport box in same direction as drag (subtract to invert pan direction)
    const newPan = {
      x: dragStartRef.current.panX - dx * scale,
      y: dragStartRef.current.panY - dy * scale,
    };
    
    mainCy.pan(newPan);
    onViewportDrag?.(newPan);
  }, [isDragging, mainCy, onViewportDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (viewportRef.current) {
      viewportRef.current.releasePointerCapture(e.pointerId);
    }
    if (isDragging) {
      justDraggedRef.current = true;
      // Reset after a short delay to allow click event to be suppressed
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 100);
    }
    setIsDragging(false);
    dragStartRef.current = null;
  }, [isDragging]);

  // Click on mini-map background to pan main graph there
  const handleMiniMapClick = useCallback((e: React.MouseEvent) => {
    // Skip if we just finished dragging
    if (justDraggedRef.current) return;
    if (!mainCy || !miniCyRef.current || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const miniZoom = miniCyRef.current.zoom();
    const miniPan = miniCyRef.current.pan();
    const mainZoom = mainCy.zoom();
    const mainContainer = mainCy.container();
    if (!mainContainer) return;
    
    const mainRect = mainContainer.getBoundingClientRect();
    
    // Convert click position to model coordinates
    const modelX = (clickX - miniPan.x) / miniZoom;
    const modelY = (clickY - miniPan.y) / miniZoom;
    
    // Calculate new pan to center on clicked point
    const newPan = {
      x: -(modelX * mainZoom) + mainRect.width / 2,
      y: -(modelY * mainZoom) + mainRect.height / 2,
    };
    
    mainCy.animate({ pan: newPan }, { duration: 200 });
  }, [mainCy]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'absolute bottom-14 z-20 transition-all duration-200',
        isCollapsed ? 'w-auto' : 'w-[200px]',
        graphMode === 'mindmap' ? 'right-3' : 'left-3',
        className
      )}
    >
      {/* Collapsed state - just a button */}
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(false)}
              className="h-8 px-2 bg-background/90 backdrop-blur-sm border border-border shadow-md hover:bg-background"
            >
              <Map className="w-3.5 h-3.5 mr-1" />
              <ChevronUp className="w-3 h-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            Show overview map
          </TooltipContent>
        </Tooltip>
      ) : (
        /* Expanded state - mini-map */
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-border/50 bg-muted/40">
            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
              <Map className="w-3 h-3" />
              Overview
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsCollapsed(true)}
                  className="h-5 w-5 hover:bg-muted/50"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Collapse overview
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Mini-map container - explicit size */}
          <div 
            className="relative"
            style={{ width: '200px', height: '140px' }}
          >
            {/* Cytoscape container - click to pan */}
            <div 
              ref={containerRef}
              className="absolute inset-0 bg-slate-100 dark:bg-slate-900 cursor-pointer"
              style={{ width: '200px', height: '140px' }}
              onClick={handleMiniMapClick}
            />
            
            {/* Viewport rectangle - uses Pointer Events for robust drag capture */}
            <div
              ref={viewportRef}
              className={cn(
                'absolute rounded-sm select-none touch-none',
                isDragging 
                  ? 'cursor-grabbing shadow-lg' 
                  : 'cursor-grab hover:shadow-md'
              )}
              style={{
                left: 0,
                top: 0,
                width: 40,
                height: 30,
                border: '2px solid #2563eb',
                backgroundColor: isDragging 
                  ? 'rgba(37, 99, 235, 0.25)' 
                  : 'rgba(37, 99, 235, 0.15)',
                zIndex: 10,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
          
          {/* Hint text */}
          <div className="px-2 py-1 text-[9px] text-muted-foreground text-center border-t border-border/30">
            Drag box or click to pan
          </div>
        </div>
      )}
    </div>
  );
}

export default CytoscapeMiniMap;
