import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Color mappings for exposure levels
const LEVEL_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  low: { bg: "#10B981", accent: "#34D399", text: "#ECFDF5" },
  moderate: { bg: "#F59E0B", accent: "#FBBF24", text: "#FFFBEB" },
  high: { bg: "#EF4444", accent: "#F87171", text: "#FEF2F2" },
  critical: { bg: "#DC2626", accent: "#EF4444", text: "#FEE2E2" },
};

function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    low: "Low Exposure",
    moderate: "Moderate Exposure",
    high: "High Exposure",
    critical: "Critical Exposure",
  };
  return labels[level] || "Unknown";
}

function generateSVG(score: number, level: string): string {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.moderate;
  const levelLabel = getLevelLabel(level);
  
  // SVG dimensions: 1200x630 (OG image standard)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0F0F23;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1A1A2E;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.accent};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.bg};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgGradient)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="200" fill="${colors.bg}" opacity="0.05"/>
  <circle cx="1100" cy="530" r="300" fill="${colors.bg}" opacity="0.03"/>
  
  <!-- Main content container -->
  <g transform="translate(600, 280)">
    <!-- Score circle background -->
    <circle cx="0" cy="0" r="140" fill="none" stroke="#2A2A4A" stroke-width="12"/>
    
    <!-- Score circle progress -->
    <circle cx="0" cy="0" r="140" fill="none" stroke="url(#scoreGradient)" stroke-width="12" 
            stroke-dasharray="${(score / 100) * 880} 880" 
            stroke-linecap="round" 
            transform="rotate(-90)"
            filter="url(#glow)"/>
    
    <!-- Score number -->
    <text x="0" y="15" font-family="system-ui, sans-serif" font-size="72" font-weight="bold" fill="#FFFFFF" text-anchor="middle">
      ${score}
    </text>
    <text x="0" y="50" font-family="system-ui, sans-serif" font-size="24" fill="#9CA3AF" text-anchor="middle">
      / 100
    </text>
  </g>
  
  <!-- Level badge -->
  <g transform="translate(600, 450)">
    <rect x="-100" y="-20" width="200" height="40" rx="20" fill="${colors.bg}" opacity="0.2"/>
    <text x="0" y="8" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="${colors.accent}" text-anchor="middle">
      ${levelLabel}
    </text>
  </g>
  
  <!-- Title -->
  <text x="600" y="80" font-family="system-ui, sans-serif" font-size="28" font-weight="600" fill="#FFFFFF" text-anchor="middle">
    Digital Exposure Score
  </text>
  
  <!-- Branding -->
  <g transform="translate(600, 570)">
    <text x="0" y="0" font-family="system-ui, sans-serif" font-size="20" fill="#6B7280" text-anchor="middle">
      Check yours at
    </text>
    <text x="0" y="30" font-family="system-ui, sans-serif" font-size="24" font-weight="bold" fill="#818CF8" text-anchor="middle">
      footprintiq.app
    </text>
  </g>
  
  <!-- FootprintIQ logo/shield icon (simplified) -->
  <g transform="translate(40, 40)">
    <path d="M30 5 L55 15 L55 35 C55 50 42.5 60 30 65 C17.5 60 5 50 5 35 L5 15 Z" 
          fill="none" stroke="#818CF8" stroke-width="2"/>
    <text x="30" y="45" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="#818CF8" text-anchor="middle">
      FIQ
    </text>
  </g>
</svg>`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const score = parseInt(url.searchParams.get("score") || "50", 10);
    const level = url.searchParams.get("level") || "moderate";
    
    // Clamp score between 0-100
    const clampedScore = Math.max(0, Math.min(100, score));
    
    // Generate SVG
    const svg = generateSVG(clampedScore, level.toLowerCase());
    
    return new Response(svg, {
      headers: {
        ...corsHeaders,
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("OG image generation error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate image" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
