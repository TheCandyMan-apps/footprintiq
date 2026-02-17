
## Telegram OSINT Expansion — Implementation Plan

### Architecture Overview

```
n8n Master WF (single webhook)
  → telegram-proxy Edge Function (action routing + tier gating)
    → Cloud Run Worker (same service, new action handlers)
      → scan_artifacts (heavy data)
      → findings (summaries)
```

### Supported Actions

| Action           | Tier   | Worker Path                  | Description                              |
|------------------|--------|------------------------------|------------------------------------------|
| `username`       | free+  | `/telegram/username`         | Basic profile lookup (existing)          |
| `phone_presence` | pro+   | `/telegram/phone-presence`   | Phone→Telegram check (existing)          |
| `channel_scrape` | free+  | `/telegram/channel-scrape`   | Channel metadata + messages + links      |
| `activity_intel` | pro+   | `/telegram/activity-intel`   | Cadence, NER, risk, network mapping      |

### Action→Service Map (Future-Proof)

`telegram-proxy` uses `ACTION_SERVICE_MAP` to resolve worker URLs per action.
Each action has a `serviceUrlEnv` override — set it to split heavy actions
(e.g. `channel_scrape`) to a separate Cloud Run service without changing n8n.

### Worker API Contracts

#### POST `/telegram/channel-scrape`

**Request:**
```json
{
  "scanId": "uuid",
  "workspaceId": "uuid",
  "userId": "uuid",
  "tier": "free",
  "action": "channel_scrape",
  "channel": "@channelusername",
  "messageLimit": 25
}
```

**Response:**
```json
{
  "ok": true,
  "channel_metadata": {
    "title": "Channel Name",
    "username": "channelusername",
    "description": "Bio text...",
    "subscriber_count": 12345,
    "verified": false,
    "language_guess": "en",
    "last_post_at": "2026-02-17T10:30:00Z",
    "creation_hint": null,
    "photo_url": "https://..."
  },
  "messages": [
    {
      "id": 12345,
      "timestamp": "2026-02-17T10:30:00Z",
      "text_snippet": "First 500 chars...",
      "link_entities": ["https://example.com"],
      "has_media": true,
      "media_type": "photo",
      "is_forwarded": false,
      "forward_source": null,
      "views": 1200
    }
  ],
  "linked_channels": [
    {
      "username": "related_channel",
      "title": "Related Channel",
      "source": "bio_link",
      "url": "https://t.me/related_channel"
    }
  ],
  "findings": [
    {
      "kind": "channel_profile",
      "provider": "telegram",
      "severity": "info",
      "evidence": { "title": "...", "subscribers": 12345 }
    }
  ]
}
```

#### POST `/telegram/activity-intel`

**Request:**
```json
{
  "scanId": "uuid",
  "workspaceId": "uuid",
  "userId": "uuid",
  "tier": "pro",
  "action": "activity_intel",
  "channel": "@channelusername",
  "messageLimit": 200
}
```

**Response:**
```json
{
  "ok": true,
  "activity_analysis": {
    "posting_cadence": {
      "per_hour": { "0": 2, "1": 0, "...": "..." },
      "per_day_of_week": { "mon": 12, "tue": 15, "...": "..." },
      "per_week": [{ "week": "2026-W07", "count": 45 }],
      "avg_posts_per_day": 3.2,
      "burst_periods": [
        { "start": "2026-02-10T14:00Z", "end": "2026-02-10T16:00Z", "count": 12 }
      ]
    },
    "last_seen_active": "2026-02-17T10:30:00Z",
    "content_classification": {
      "top_topics": ["crypto", "technology", "news"],
      "named_entities": [
        { "text": "Bitcoin", "type": "CRYPTO", "count": 15 },
        { "text": "Elon Musk", "type": "PERSON", "count": 3 }
      ],
      "language_distribution": { "en": 0.85, "ru": 0.15 }
    },
    "link_analysis": {
      "domain_frequency": { "example.com": 12, "t.me": 8 },
      "total_links": 45
    },
    "forward_patterns": {
      "total_forwards": 20,
      "top_sources": [
        { "channel": "@source_channel", "count": 8 }
      ]
    }
  },
  "risk_indicators": {
    "overall_risk_score": 35,
    "flags": [
      { "type": "high_forward_ratio", "severity": "low", "detail": "60% forwarded content" },
      { "type": "suspicious_links", "severity": "medium", "detail": "3 links to known phishing domains" }
    ]
  },
  "graph": {
    "nodes": [
      { "id": "@target", "type": "channel", "label": "Target Channel" }
    ],
    "edges": [
      { "source": "@target", "target": "@source_channel", "type": "forwards_from", "weight": 8 }
    ]
  },
  "findings": [
    {
      "kind": "activity_intel",
      "provider": "telegram",
      "severity": "info",
      "evidence": { "avg_posts_per_day": 3.2, "risk_score": 35 }
    }
  ]
}
```

### n8n Master Workflow Design

Single webhook, minimal orchestration:

1. **Trigger**: Webhook receives `{ action, channel/username, scanId, ... }`
2. **SET Defaults**: Extract body fields
3. **Progress Start**: POST to `n8n-scan-progress` with status="running"
4. **HTTP Call**: POST to `telegram-proxy` with full payload + `x-n8n-key`
5. **Results**: POST to `n8n-scan-results` with findings from proxy response
6. **Progress Complete**: POST to `n8n-scan-progress` with status="completed" or "error"

No branching in n8n. Action routing, tier gating, and data processing all happen
inside `telegram-proxy` and the worker.

### Implementation Steps

- [x] Step 1: Update `telegram-proxy` with action routing, tier gating, service map
- [ ] Step 2: Add `channel_scrape` + `activity_intel` handlers to Cloud Run worker
- [ ] Step 3: Build n8n Master Workflow (single webhook)
- [ ] Step 4: Wire `n8n-scan-trigger` to fire Master WF for channel/intel scans
- [ ] Step 5: Extend Telegram results UI for channel + intel panels
- [ ] Step 6: End-to-end testing

### Ethical Guardrails

- Public channels only — no private group data
- No admin/member list collection
- No deanonymization or private-group inference
- Network mapping uses only explicit t.me links/forwards/mentions
- "Public data only" badge on all results
- "Responsible Use" tooltips
