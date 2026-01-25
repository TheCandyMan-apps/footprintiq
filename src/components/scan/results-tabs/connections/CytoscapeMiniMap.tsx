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

// Simplified stylesheet for mini-map - no labels, reduced complexity
const MINIMAP_STYLES: cytoscape.CssStyleDeclaration[] = [
  // All nodes - simplified dots
  {
    selector: 'node',
    style: {
      'background-color': '#6b7280',
      'width': 4,
      'height': 4,
      'border-width': 0,
      'label': '',
      'opacity': 0.6,
    },
  },
  // Root/Identity nodes - slightly larger
  {
    selector: 'node.root-node, node.identity',
    style: {
      'background-color': '#3b82f6',
      'width': 8,
      'height': 8,
      'opacity': 1,
    },
  },
  // Leg/Category nodes - medium size
  {
    selector: 'node.leg-node, node.group-node',
    style: {
      'background-color': '#10b981',
      'width': 6,
      'height': 6,
      'opacity': 0.8,
    },
  },
  // Profile/Account nodes - tiny
  {
    selector: 'node.profile-node, node.account',
    style: {
      'background-color': '#9ca3af',
      'width': 3,
      'height': 3,
      'opacity': 0.5,
    },
  },
  // Edges - very faint
  {
    selector: 'edge',
    style: {
      'line-color': '#d1d5db',
      'width': 0.5,
      'opacity': 0.3,
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
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

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

  // Initialize mini cytoscape instance
  useEffect(() => {
    if (!containerRef.current || !mainCy || !shouldRender || isCollapsed) {
      return;
    }

    // Get elements from main graph - clone data only (no positions for preset)
    const elements: ElementDefinition[] = mainCy.elements().map((ele) => ({
      data: { ...ele.data() },
      classes: ele.classes().join(' '),
      position: ele.isNode() ? { ...ele.position() } : undefined,
    }));

    const miniCy = cytoscape({
      container: containerRef.current,
      elements,
      style: MINIMAP_STYLES,
      layout: { name: 'preset' }, // Use same positions as main graph
      userZoomingEnabled: false,
      userPanningEnabled: false,
      boxSelectionEnabled: false,
      autoungrabify: true,
      autounselectify: true,
      minZoom: 0.01,
      maxZoom: 1,
    });

    // Fit mini graph to container
    miniCy.fit(undefined, 5);
    
    miniCyRef.current = miniCy;

    return () => {
      miniCy.destroy();
      miniCyRef.current = null;
    };
  }, [mainCy, shouldRender, isCollapsed]);

  // Update viewport rectangle on main graph pan/zoom
  const updateViewportRect = useCallback(() => {
    if (!mainCy || !miniCyRef.current || !viewportRef.current || !containerRef.current) return;

    const mainExtent = mainCy.extent();
    const mainZoom = mainCy.zoom();
    const mainPan = mainCy.pan();
    const miniZoom = miniCyRef.current.zoom();
    const miniPan = miniCyRef.current.pan();
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate viewport dimensions in mini-map coordinates
    const viewportWidth = (containerRect.width / mainZoom) * miniZoom;
    const viewportHeight = (containerRect.height / mainZoom) * miniZoom;
    
    // Calculate viewport position in mini-map coordinates
    const vpX = (-mainPan.x / mainZoom) * miniZoom + miniPan.x;
    const vpY = (-mainPan.y / mainZoom) * miniZoom + miniPan.y;
    
    viewportRef.current.style.width = `${Math.max(20, Math.min(viewportWidth, containerRect.width - 4))}px`;
    viewportRef.current.style.height = `${Math.max(15, Math.min(viewportHeight, containerRect.height - 4))}px`;
    viewportRef.current.style.left = `${Math.max(0, Math.min(vpX, containerRect.width - 20))}px`;
    viewportRef.current.style.top = `${Math.max(0, Math.min(vpY, containerRect.height - 15))}px`;
  }, [mainCy]);

  // Subscribe to main graph viewport changes
  useEffect(() => {
    if (!mainCy || !shouldRender || isCollapsed) return;

    const handlers = {
      'pan zoom': updateViewportRect,
      'layoutstop': () => {
        // Re-sync mini-map when layout changes
        if (miniCyRef.current) {
          const elements: ElementDefinition[] = mainCy.elements().map((ele) => ({
            data: { ...ele.data() },
            classes: ele.classes().join(' '),
            position: ele.isNode() ? { ...ele.position() } : undefined,
          }));
          miniCyRef.current.json({ elements });
          miniCyRef.current.fit(undefined, 5);
          setTimeout(updateViewportRect, 50);
        }
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      mainCy.on(event, handler);
    });

    // Initial update
    setTimeout(updateViewportRect, 100);

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        mainCy.off(event, handler);
      });
    };
  }, [mainCy, shouldRender, isCollapsed, updateViewportRect]);

  // Handle viewport rectangle dragging
  const handleViewportMouseDown = useCallback((e: React.MouseEvent) => {
    if (!mainCy) return;
    e.preventDefault();
    e.stopPropagation();
    
    const pan = mainCy.pan();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setIsDragging(true);
  }, [mainCy]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !mainCy || !miniCyRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Convert mini-map delta to main graph delta
    const mainZoom = mainCy.zoom();
    const miniZoom = miniCyRef.current.zoom();
    const scale = mainZoom / miniZoom;
    
    const newPan = {
      x: dragStartRef.current.panX - dx * scale,
      y: dragStartRef.current.panY - dy * scale,
    };
    
    mainCy.pan(newPan);
    onViewportDrag?.(newPan);
  }, [isDragging, mainCy, onViewportDrag]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Click on mini-map to pan main graph there
  const handleMiniMapClick = useCallback((e: React.MouseEvent) => {
    if (!mainCy || !miniCyRef.current || !containerRef.current || isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const miniZoom = miniCyRef.current.zoom();
    const miniPan = miniCyRef.current.pan();
    const mainZoom = mainCy.zoom();
    
    // Convert click position to model coordinates
    const modelX = (clickX - miniPan.x) / miniZoom;
    const modelY = (clickY - miniPan.y) / miniZoom;
    
    // Calculate new pan to center on clicked point
    const newPan = {
      x: -(modelX * mainZoom) + rect.width / 2,
      y: -(modelY * mainZoom) + rect.height / 2,
    };
    
    mainCy.animate({ pan: newPan }, { duration: 200 });
  }, [mainCy, isDragging]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'absolute bottom-14 right-3 z-20 transition-all duration-200',
        isCollapsed ? 'w-auto' : 'w-40',
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
              className="h-8 px-2 bg-background/80 backdrop-blur-sm border border-border shadow-md hover:bg-background/90"
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
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-border/50 bg-muted/30">
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

          {/* Mini-map container */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="relative w-40 h-28 cursor-pointer"
                onClick={handleMiniMapClick}
              >
                <div 
                  ref={containerRef}
                  className="w-full h-full bg-muted/20"
                />
                
                {/* Viewport rectangle */}
                <div
                  ref={viewportRef}
                  className={cn(
                    'absolute border-2 border-primary/70 bg-primary/10 rounded-sm pointer-events-auto transition-colors',
                    isDragging ? 'cursor-grabbing border-primary' : 'cursor-grab hover:border-primary hover:bg-primary/20'
                  )}
                  style={{
                    left: 0,
                    top: 0,
                    width: 40,
                    height: 30,
                  }}
                  onMouseDown={handleViewportMouseDown}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs max-w-[150px]">
              <p>Overview map — drag rectangle or click to pan</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default CytoscapeMiniMap;
