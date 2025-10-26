# Phase 9: AI Analyst, Dark-Web Signal, Live Monitoring

## Completed Features

### 1. AI Analyst (RAG-based)
- ✅ AI indexer for building RAG chunks from findings and graph
- ✅ AI retriever with recency-boosted relevance scoring
- ✅ AI orchestrator with LLM prompts (via Lovable AI/Gemini)
- ✅ Edge function `ai-analyst` for server-side AI calls
- ✅ Redaction rules enforced (no raw PII/credentials exposed)
- ✅ Provenance tracking (citing finding IDs and providers)

### 2. Dark-Web Signal Score
- ✅ Signal calculator using IntelX, DeHashed, DarkSearch metadata
- ✅ Weighted scoring by provider quality and recency
- ✅ Policy gate enforcement (ALLOW_DARKWEB_SOURCES)
- ✅ DarkWebSignalBadge component with trend indicators
- ✅ Explainable scores with user-friendly messages

### 3. Live Monitoring
- ✅ Monitor diff engine for comparing scan results
- ✅ Queue manager for scheduling and executing jobs
- ✅ Worker for executing scans and processing diffs
- ✅ Alert thresholds (high severity, new providers, score changes)
- ✅ MonitorDiffViewer component for visual diff display

### 4. Database Schema
- ✅ `ai_chunks` table for RAG storage
- ✅ `monitor_runs` table for tracking executions
- ✅ `analyst_reports` table for storing AI analyses
- ✅ Proper RLS policies on all new tables

### 5. Configuration
- ✅ Extended config.ts with AI, monitoring, and alerts settings
- ✅ Environment variable validation with Zod

## Next Steps for Full Implementation

1. **AI Analyst UI Pages** - Create `/ai-analyst` page with scope picker and report viewer
2. **Monitor Run Details** - Add `/monitoring/:runId` page showing live diff viewer
3. **Case Integration** - Add "Attach to Case" buttons for analyst reports
4. **Evidence Pack v2** - Include analyst reports, diffs, dark-web summaries in exports
5. **Admin Policies** - Add UI controls for toggling dark-web access and thresholds
6. **Testing** - Unit tests for scoring, diff engine, and orchestrator

## Architecture Notes

- All AI calls go through edge functions (server-side only)
- Dark-web findings use metadata only (no raw PII)
- Monitoring uses incremental diff algorithm
- RAG chunks auto-update on new findings
- Rate limiting handled by Lovable AI gateway
