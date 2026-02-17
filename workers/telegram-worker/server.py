"""
Telegram OSINT Worker — Cloud Run Service

Handlers:
  GET  /health                     → healthcheck
  POST /telegram/username          → basic profile lookup (existing)
  POST /telegram/phone-presence    → phone→Telegram check (existing)
  POST /telegram/channel-scrape    → channel metadata + messages + linked channels
  POST /telegram/activity-intel    → cadence, classification, risk, graph

Auth: X-Worker-Key header validated against OSINT_WORKER_TOKEN env var.
Telegram: Telethon user-session via TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION_STRING.
"""

import asyncio
import json as _json
import logging
import os
import re
import sys
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timezone, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from typing import Any

# ── Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
)
log = logging.getLogger("telegram-worker")

# ── Env ──────────────────────────────────────────────────────────
WORKER_TOKEN = os.environ.get("OSINT_WORKER_TOKEN", "")
TELEGRAM_API_ID = int(os.environ.get("TELEGRAM_API_ID", "0"))
TELEGRAM_API_HASH = os.environ.get("TELEGRAM_API_HASH", "")
TELEGRAM_SESSION_STRING = os.environ.get("TELEGRAM_SESSION_STRING", "")
PORT = int(os.environ.get("PORT", "8080"))

# ── Telethon lazy init ───────────────────────────────────────────
_client = None
_loop = None


def _get_loop():
    global _loop
    if _loop is None or _loop.is_closed():
        _loop = asyncio.new_event_loop()
    return _loop


async def _get_client():
    """Return a connected Telethon client (session-string based)."""
    global _client
    if _client is not None and _client.is_connected():
        return _client

    from telethon import TelegramClient
    from telethon.sessions import StringSession

    _client = TelegramClient(
        StringSession(TELEGRAM_SESSION_STRING),
        TELEGRAM_API_ID,
        TELEGRAM_API_HASH,
    )
    await _client.connect()
    if not await _client.is_user_authorized():
        raise RuntimeError("Telethon session is not authorized — regenerate TELEGRAM_SESSION_STRING")
    log.info("Telethon client connected")
    return _client


# ── Helpers ──────────────────────────────────────────────────────

# Regex: t.me links in text
TG_LINK_RE = re.compile(r"(?:https?://)?t\.me/([A-Za-z][A-Za-z0-9_]{3,})", re.IGNORECASE)
# Private / invite links
PRIVATE_RE = re.compile(r"t\.me/(\+|joinchat/)", re.IGNORECASE)

MAX_MESSAGES_HARD_CAP = 200
DEFAULT_SCRAPE_LIMIT = 25
DEFAULT_INTEL_LIMIT = 200

# High-risk keywords (lowercase)
HIGH_RISK_KEYWORDS = {
    "hack", "exploit", "ddos", "ransomware", "malware", "phishing",
    "carding", "fullz", "dump", "leak", "breach", "0day", "zero-day",
    "botnet", "rat", "trojan", "keylogger", "stealer", "crypter",
}


def normalize_target(raw: str) -> str:
    """Normalize @handle / t.me/handle / full URL → bare handle."""
    if not raw:
        return ""
    raw = raw.strip()
    # Strip leading @
    if raw.startswith("@"):
        return raw[1:]
    # Strip t.me/ URL
    m = TG_LINK_RE.search(raw)
    if m:
        return m.group(1)
    # Try as bare handle
    if re.match(r"^[A-Za-z][A-Za-z0-9_]{3,}$", raw):
        return raw
    return raw


def is_private_target(raw: str) -> bool:
    """Return True if target is a private/invite link."""
    return bool(PRIVATE_RE.search(raw))


def error_response(code: str, message: str, status: int = 400) -> dict:
    return {"ok": False, "error": code, "message": message, "_status": status}


def truncate(text: str, max_len: int = 500) -> str:
    if not text:
        return ""
    return text[:max_len] + ("…" if len(text) > max_len else "")


def extract_tg_links(text: str) -> list[str]:
    """Extract unique t.me/handle links from text."""
    if not text:
        return []
    return list({m.lower() for m in TG_LINK_RE.findall(text) if not PRIVATE_RE.search(f"t.me/{m}")})


# ── Channel Scrape ───────────────────────────────────────────────

async def handle_channel_scrape(payload: dict) -> dict:
    scan_id = payload.get("scanId", "")
    raw_channel = payload.get("channel", "") or payload.get("query", "")
    max_messages = min(payload.get("messageLimit", DEFAULT_SCRAPE_LIMIT) or DEFAULT_SCRAPE_LIMIT, MAX_MESSAGES_HARD_CAP)

    # Validate
    if is_private_target(raw_channel):
        return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "Private channels and invite links are not supported. Public channels only.", 403)

    handle = normalize_target(raw_channel)
    if not handle or len(handle) < 4:
        return error_response("INVALID_TARGET", f"Could not normalize target: {raw_channel}")

    log.info(f"[channel_scrape] scanId={scan_id} target={handle} limit={max_messages}")

    client = await _get_client()
    from telethon.tl.functions.channels import GetFullChannelRequest
    from telethon.tl.functions.messages import GetHistoryRequest
    from telethon.tl.types import Channel, ChatPhotoEmpty

    try:
        entity = await client.get_entity(handle)
    except Exception as e:
        err_str = str(e).lower()
        if "invite" in err_str or "private" in err_str:
            return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "This appears to be a private channel.")
        if "no user" in err_str or "not found" in err_str or "cannot find" in err_str:
            return error_response("INVALID_TARGET", f"Channel not found: {handle}")
        raise

    if not isinstance(entity, Channel):
        return error_response("INVALID_TARGET", f"Target '{handle}' is not a channel/supergroup.")

    if not entity.broadcast and not entity.megagroup:
        return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "Target is not a public channel or supergroup.")

    # Get full channel info
    try:
        full = await client(GetFullChannelRequest(channel=entity))
        full_chat = full.full_chat
    except Exception as e:
        log.warning(f"[channel_scrape] GetFullChannel failed: {e}")
        full_chat = None

    # Language guess
    lang_guess = None

    # Build metadata
    channel_metadata = {
        "title": entity.title or "",
        "username": entity.username or handle,
        "description": getattr(full_chat, "about", "") or "" if full_chat else "",
        "photo_present": not isinstance(entity.photo, ChatPhotoEmpty) if entity.photo else False,
        "subscriber_count": getattr(full_chat, "participants_count", None) if full_chat else None,
        "verified": getattr(entity, "verified", False),
        "last_message_ts": None,
        "language_guess": None,
    }

    # Fetch messages
    messages_raw = []
    try:
        history = await client(GetHistoryRequest(
            peer=entity,
            offset_id=0,
            offset_date=None,
            add_offset=0,
            limit=max_messages,
            max_id=0,
            min_id=0,
            hash=0,
        ))
        messages_raw = history.messages
    except Exception as e:
        log.warning(f"[channel_scrape] GetHistory failed: {e}")

    # Process messages
    channel_messages = []
    all_text_corpus = []
    all_linked_handles = set()

    for msg in messages_raw:
        if not hasattr(msg, "id"):
            continue
        text = getattr(msg, "message", "") or ""
        all_text_corpus.append(text)

        # Extract link entities
        link_entities = []
        if hasattr(msg, "entities") and msg.entities:
            for ent in msg.entities:
                ent_type = type(ent).__name__
                if "Url" in ent_type:
                    url = text[ent.offset:ent.offset + ent.length]
                    link_entities.append(url)
                elif "TextUrl" in ent_type:
                    link_entities.append(getattr(ent, "url", ""))

        # Forward flags
        fwd = getattr(msg, "fwd_from", None)
        is_forwarded = fwd is not None
        forward_source = None
        if fwd:
            fwd_channel = getattr(fwd, "from_id", None)
            if fwd_channel and hasattr(fwd_channel, "channel_id"):
                forward_source = str(fwd_channel.channel_id)

        # Mentions
        mentions = []
        if hasattr(msg, "entities") and msg.entities:
            for ent in msg.entities:
                ent_type = type(ent).__name__
                if "Mention" in ent_type:
                    mention = text[ent.offset:ent.offset + ent.length]
                    mentions.append(mention)

        # Media flags
        media = getattr(msg, "media", None)
        has_media = media is not None
        media_type = type(media).__name__.replace("MessageMedia", "").lower() if media else None

        # Extract t.me links from text
        tg_links = extract_tg_links(text)
        all_linked_handles.update(tg_links)

        channel_messages.append({
            "message_id": msg.id,
            "timestamp": msg.date.isoformat() if msg.date else None,
            "text_snippet": truncate(text, 500),
            "link_entities": link_entities,
            "has_media": has_media,
            "media_type": media_type,
            "is_forwarded": is_forwarded,
            "forward_source": forward_source,
            "mentions": mentions,
            "views": getattr(msg, "views", None),
        })

    # Set last_message_ts
    if channel_messages:
        channel_metadata["last_message_ts"] = channel_messages[0].get("timestamp")

    # Language detection on corpus
    if all_text_corpus:
        corpus = " ".join(all_text_corpus)
        try:
            from langdetect import detect
            lang_guess = detect(corpus)
            channel_metadata["language_guess"] = lang_guess
        except Exception:
            pass

    # Extract linked channels from description + messages
    desc_links = extract_tg_links(channel_metadata["description"])
    all_linked_handles.update(desc_links)
    # Remove self
    all_linked_handles.discard(handle.lower())
    all_linked_handles.discard((entity.username or "").lower())

    linked_channels = [
        {
            "username": lh,
            "url": f"https://t.me/{lh}",
            "source": "message_link",
        }
        for lh in sorted(all_linked_handles)
    ]

    # Top domains from link_entities
    domain_counter = Counter()
    for m in channel_messages:
        for link in m.get("link_entities", []):
            try:
                from urllib.parse import urlparse
                parsed = urlparse(link if "://" in link else f"https://{link}")
                if parsed.hostname:
                    domain_counter[parsed.hostname] += 1
            except Exception:
                pass

    top_domains = [{"domain": d, "count": c} for d, c in domain_counter.most_common(10)]

    # Build findings (lightweight summaries only)
    findings = [
        {
            "kind": "channel_profile",
            "provider": "telegram",
            "severity": "info",
            "evidence": {
                "title": channel_metadata["title"],
                "username": channel_metadata["username"],
                "subscribers": channel_metadata["subscriber_count"],
                "message_count": len(channel_messages),
                "last_post_ts": channel_metadata["last_message_ts"],
                "linked_channel_count": len(linked_channels),
                "top_domains": top_domains[:5],
                "language_guess": channel_metadata["language_guess"],
            },
        }
    ]

    return {
        "ok": True,
        "findings": findings,
        "artifacts": {
            "channel_metadata": channel_metadata,
            "channel_messages": channel_messages,
            "linked_channels": linked_channels,
        },
    }


# ── Activity Intel ───────────────────────────────────────────────

async def handle_activity_intel(payload: dict) -> dict:
    scan_id = payload.get("scanId", "")
    tier = payload.get("tier", "free")
    raw_channel = payload.get("channel", "") or payload.get("query", "")
    max_messages = min(payload.get("messageLimit", DEFAULT_INTEL_LIMIT) or DEFAULT_INTEL_LIMIT, MAX_MESSAGES_HARD_CAP)

    # Defense-in-depth tier check
    if tier == "free":
        return error_response("TIER_INSUFFICIENT", "activity_intel requires Pro tier or above.", 403)

    if is_private_target(raw_channel):
        return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "Private channels and invite links are not supported.", 403)

    handle = normalize_target(raw_channel)
    if not handle or len(handle) < 4:
        return error_response("INVALID_TARGET", f"Could not normalize target: {raw_channel}")

    log.info(f"[activity_intel] scanId={scan_id} target={handle} limit={max_messages}")

    client = await _get_client()
    from telethon.tl.functions.channels import GetFullChannelRequest
    from telethon.tl.functions.messages import GetHistoryRequest
    from telethon.tl.types import Channel

    try:
        entity = await client.get_entity(handle)
    except Exception as e:
        err_str = str(e).lower()
        if "invite" in err_str or "private" in err_str:
            return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "This appears to be a private channel.")
        if "no user" in err_str or "not found" in err_str or "cannot find" in err_str:
            return error_response("INVALID_TARGET", f"Channel not found: {handle}")
        raise

    if not isinstance(entity, Channel):
        return error_response("INVALID_TARGET", f"Target '{handle}' is not a channel/supergroup.")

    # Fetch messages
    try:
        history = await client(GetHistoryRequest(
            peer=entity,
            offset_id=0,
            offset_date=None,
            add_offset=0,
            limit=max_messages,
            max_id=0,
            min_id=0,
            hash=0,
        ))
        messages_raw = history.messages
    except Exception as e:
        log.warning(f"[activity_intel] GetHistory failed: {e}")
        messages_raw = []

    if not messages_raw:
        return {
            "ok": True,
            "findings": [{
                "kind": "activity_intel",
                "provider": "telegram",
                "severity": "info",
                "evidence": {"message": "No messages found for analysis"},
            }],
            "artifacts": {},
        }

    # ── Compute activity timeline ──
    hours_counter = Counter()        # 0-23
    dow_counter = Counter()          # mon-sun
    week_counter = Counter()         # YYYY-Www
    timestamps = []
    all_texts = []
    total_forwarded = 0
    domain_counter = Counter()
    mention_nodes = set()
    forward_sources = Counter()
    tg_link_handles = set()

    for msg in messages_raw:
        if not hasattr(msg, "id") or not hasattr(msg, "date") or not msg.date:
            continue

        dt = msg.date
        timestamps.append(dt)
        hours_counter[dt.hour] += 1
        dow_counter[dt.strftime("%a").lower()] += 1
        week_counter[dt.strftime("%G-W%V")] += 1

        text = getattr(msg, "message", "") or ""
        all_texts.append(text)

        # Links
        if hasattr(msg, "entities") and msg.entities:
            for ent in msg.entities:
                ent_type = type(ent).__name__
                if "Url" in ent_type:
                    url = text[ent.offset:ent.offset + ent.length]
                    try:
                        from urllib.parse import urlparse
                        parsed = urlparse(url if "://" in url else f"https://{url}")
                        if parsed.hostname:
                            domain_counter[parsed.hostname] += 1
                    except Exception:
                        pass
                elif "TextUrl" in ent_type:
                    url = getattr(ent, "url", "")
                    try:
                        from urllib.parse import urlparse
                        parsed = urlparse(url)
                        if parsed.hostname:
                            domain_counter[parsed.hostname] += 1
                    except Exception:
                        pass
                elif "Mention" in ent_type:
                    mention = text[ent.offset:ent.offset + ent.length]
                    mention_nodes.add(mention)

        # t.me links
        tg_links = extract_tg_links(text)
        tg_link_handles.update(tg_links)

        # Forwards
        fwd = getattr(msg, "fwd_from", None)
        if fwd:
            total_forwarded += 1
            fwd_from = getattr(fwd, "from_id", None)
            if fwd_from and hasattr(fwd_from, "channel_id"):
                forward_sources[str(fwd_from.channel_id)] += 1

    # Sort timestamps
    timestamps.sort()
    total_msgs = len(timestamps)

    # Burst detection: 5+ posts in 2-hour windows
    bursts = []
    if timestamps:
        window = timedelta(hours=2)
        i = 0
        while i < len(timestamps):
            j = i
            while j < len(timestamps) and timestamps[j] - timestamps[i] <= window:
                j += 1
            count = j - i
            if count >= 5:
                bursts.append({
                    "start": timestamps[i].isoformat(),
                    "end": timestamps[j - 1].isoformat(),
                    "count": count,
                })
                i = j
            else:
                i += 1

    # Avg posts per day
    if len(timestamps) >= 2:
        span_days = max((timestamps[-1] - timestamps[0]).total_seconds() / 86400, 1)
        avg_posts_per_day = round(total_msgs / span_days, 2)
    else:
        avg_posts_per_day = total_msgs

    last_seen_active = timestamps[-1].isoformat() if timestamps else None

    posting_cadence = {
        "per_hour": dict(hours_counter),
        "per_day_of_week": dict(dow_counter),
        "per_week": [{"week": w, "count": c} for w, c in sorted(week_counter.items())],
        "avg_posts_per_day": avg_posts_per_day,
        "burst_periods": bursts,
    }

    activity_analysis = {
        "posting_cadence": posting_cadence,
        "last_seen_active": last_seen_active,
        "total_messages_analyzed": total_msgs,
    }

    # ── Content classification ──
    # Simple keyword frequency (top 20 words, 4+ chars, excluding stop words)
    stop_words = {"this", "that", "with", "from", "your", "have", "been", "they",
                  "will", "would", "could", "should", "about", "which", "their",
                  "there", "what", "when", "where", "more", "some", "than", "them",
                  "very", "just", "also", "into", "only", "other", "then", "these",
                  "http", "https", "t.me", "www"}
    word_counter = Counter()
    for text in all_texts:
        words = re.findall(r"[a-zA-Z]{4,}", text.lower())
        word_counter.update(w for w in words if w not in stop_words)

    top_keywords = [{"word": w, "count": c} for w, c in word_counter.most_common(20)]

    # Language distribution
    lang_dist = {}
    if all_texts:
        try:
            from langdetect import detect_langs
            corpus = " ".join(all_texts[:100])  # sample
            langs = detect_langs(corpus)
            lang_dist = {str(l.lang): round(l.prob, 3) for l in langs}
        except Exception:
            pass

    # Entity extraction (regex-based)
    entities_found = []
    hashtag_counter = Counter()
    for text in all_texts:
        hashtag_counter.update(re.findall(r"#\w+", text))

    for tag, cnt in hashtag_counter.most_common(20):
        entities_found.append({"text": tag, "type": "HASHTAG", "count": cnt})
    for mention in sorted(mention_nodes):
        entities_found.append({"text": mention, "type": "MENTION", "count": 1})

    content_classification = {
        "top_keywords": top_keywords,
        "language_distribution": lang_dist,
        "named_entities": entities_found,
    }

    activity_analysis["content_classification"] = content_classification

    # ── Risk indicators ──
    total_links = sum(domain_counter.values())
    forward_ratio = round(total_forwarded / max(total_msgs, 1) * 100, 1)

    # High-risk keyword hits
    risk_keyword_hits = []
    for text in all_texts:
        lower = text.lower()
        for kw in HIGH_RISK_KEYWORDS:
            if kw in lower:
                risk_keyword_hits.append(kw)
    risk_keyword_counter = Counter(risk_keyword_hits)

    # Risk score: weighted formula
    score = 0
    if forward_ratio > 70:
        score += 20
    elif forward_ratio > 40:
        score += 10
    if len(risk_keyword_counter) > 5:
        score += 30
    elif len(risk_keyword_counter) > 2:
        score += 15
    elif len(risk_keyword_counter) > 0:
        score += 5
    if total_links > 50:
        score += 15
    elif total_links > 20:
        score += 8
    if len(bursts) > 3:
        score += 10
    score = min(score, 100)

    flags = []
    if forward_ratio > 50:
        flags.append({"type": "high_forward_ratio", "severity": "low", "detail": f"{forward_ratio}% forwarded content"})
    if risk_keyword_counter:
        top_risk = risk_keyword_counter.most_common(5)
        flags.append({"type": "high_risk_keywords", "severity": "medium", "detail": f"Found: {', '.join(k for k,_ in top_risk)}"})
    if total_links > 30:
        flags.append({"type": "high_link_density", "severity": "low", "detail": f"{total_links} links in {total_msgs} messages"})

    risk_indicators = {
        "overall_risk_score": score,
        "forward_ratio_pct": forward_ratio,
        "total_forwarded": total_forwarded,
        "total_links": total_links,
        "domain_frequency": dict(domain_counter.most_common(20)),
        "high_risk_keyword_hits": [{"keyword": k, "count": c} for k, c in risk_keyword_counter.most_common(10)],
        "flags": flags,
    }

    # ── Relationship graph ──
    target_node = f"@{entity.username or handle}"
    nodes = [{"id": target_node, "type": "channel", "label": entity.title or handle}]
    edges = []

    # Mentions → nodes + edges
    for mention in sorted(mention_nodes):
        nodes.append({"id": mention, "type": "mention", "label": mention})
        edges.append({"source": target_node, "target": mention, "type": "mentions", "weight": 1})

    # Forwards → edges
    for src_id, cnt in forward_sources.most_common(20):
        node_id = f"channel:{src_id}"
        nodes.append({"id": node_id, "type": "channel", "label": f"Channel {src_id}"})
        edges.append({"source": node_id, "target": target_node, "type": "forwards_from", "weight": cnt})

    # t.me linked handles → edges
    for lh in sorted(tg_link_handles):
        node_id = f"@{lh}"
        if not any(n["id"] == node_id for n in nodes):
            nodes.append({"id": node_id, "type": "channel", "label": lh})
        edges.append({"source": target_node, "target": node_id, "type": "links_to", "weight": 1})

    relationship_graph = {"nodes": nodes, "edges": edges}

    # ── Build findings (lightweight) ──
    findings = [
        {
            "kind": "activity_intel",
            "provider": "telegram",
            "severity": "info",
            "evidence": {
                "avg_posts_per_day": avg_posts_per_day,
                "risk_score": score,
                "top_topics": [k["word"] for k in top_keywords[:5]],
                "entity_count": len(entities_found),
                "total_messages_analyzed": total_msgs,
                "forward_ratio_pct": forward_ratio,
                "burst_count": len(bursts),
                "node_count": len(nodes),
                "edge_count": len(edges),
            },
        }
    ]

    return {
        "ok": True,
        "findings": findings,
        "artifacts": {
            "activity_analysis": activity_analysis,
            "risk_indicators": risk_indicators,
            "relationship_graph": relationship_graph,
        },
    }


# ── HTTP Server ──────────────────────────────────────────────────

ROUTES = {
    "/telegram/channel-scrape": handle_channel_scrape,
    "/telegram/activity-intel": handle_activity_intel,
}


class WorkerHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        log.info(fmt % args)

    def _send_json(self, data: dict, status: int = 200):
        body = _json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"status": "healthy", "service": "telegram-worker"})
            return
        self._send_json({"error": "Not Found"}, 404)

    def do_POST(self):
        request_id = str(uuid.uuid4())[:8]

        # Auth check
        provided_key = self.headers.get("X-Worker-Key", "")
        if WORKER_TOKEN and provided_key != WORKER_TOKEN:
            log.warning(f"[{request_id}] Unauthorized request to {self.path}")
            self._send_json({"ok": False, "error": "Unauthorized"}, 401)
            return

        # Route
        handler = ROUTES.get(self.path)
        if not handler:
            # Pass through to existing handlers or 404
            self._send_json({"ok": False, "error": f"Unknown route: {self.path}"}, 404)
            return

        # Parse body
        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length) if content_length else b"{}"
        try:
            payload = _json.loads(raw_body)
        except _json.JSONDecodeError:
            self._send_json({"ok": False, "error": "Invalid JSON body"}, 400)
            return

        scan_id = payload.get("scanId", "unknown")
        log.info(f"[{request_id}] {self.path} scanId={scan_id}")

        # TODO: rate-limit hook — check per-workspace / per-IP limits here

        # Execute handler
        loop = _get_loop()
        try:
            result = loop.run_until_complete(handler(payload))
        except Exception as e:
            log.exception(f"[{request_id}] Handler error: {e}")
            self._send_json({"ok": False, "error": "Internal worker error", "detail": str(e)}, 500)
            return

        # Extract _status if present
        status = result.pop("_status", 200)
        self._send_json(result, status)


def main():
    if not TELEGRAM_API_ID or not TELEGRAM_API_HASH or not TELEGRAM_SESSION_STRING:
        log.error("Missing TELEGRAM_API_ID, TELEGRAM_API_HASH, or TELEGRAM_SESSION_STRING")
        sys.exit(1)

    server = HTTPServer(("0.0.0.0", PORT), WorkerHandler)
    log.info(f"Telegram worker listening on :{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Shutting down")
        server.shutdown()


if __name__ == "__main__":
    main()
