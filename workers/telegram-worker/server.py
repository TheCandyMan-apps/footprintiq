"""
Telegram OSINT Worker — Cloud Run Service

Handlers:
  GET  /health                     → healthcheck
  POST /telegram/username          → basic profile lookup (existing)
  POST /telegram/phone-presence    → phone number → Telegram account presence check
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

    entity = None
    try:
        entity = await client.get_entity(handle)
    except Exception as e:
        err_str = str(e).lower()
        if "invite" in err_str or "private" in err_str:
            return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "This appears to be a private channel.")
        if "no user" in err_str or "not found" in err_str or "cannot find" in err_str or "invalid" in err_str:
            log.info(f"[channel_scrape] get_entity failed for '{handle}', trying ResolveUsername fallback")
            try:
                from telethon.tl.functions.contacts import ResolveUsernameRequest
                resolved = await client(ResolveUsernameRequest(handle))
                if resolved.chats:
                    entity = resolved.chats[0]
                elif resolved.users:
                    entity = resolved.users[0]
                else:
                    return error_response("INVALID_TARGET", f"Channel not found: {handle}", 404)
            except Exception as e2:
                log.warning(f"[channel_scrape] ResolveUsername also failed: {e2}")
                return error_response("INVALID_TARGET", f"Channel not found: {handle}", 404)
        else:
            raise

    if entity is None:
        return error_response("INVALID_TARGET", f"Could not resolve entity for: {handle}", 404)

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

    entity = None
    try:
        entity = await client.get_entity(handle)
    except Exception as e:
        err_str = str(e).lower()
        if "invite" in err_str or "private" in err_str:
            return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "This appears to be a private channel.")
        if "no user" in err_str or "not found" in err_str or "cannot find" in err_str or "invalid" in err_str:
            log.info(f"[activity_intel] get_entity failed for '{handle}', trying ResolveUsername fallback")
            try:
                from telethon.tl.functions.contacts import ResolveUsernameRequest
                resolved = await client(ResolveUsernameRequest(handle))
                if resolved.chats:
                    entity = resolved.chats[0]
                elif resolved.users:
                    entity = resolved.users[0]
                else:
                    return error_response("INVALID_TARGET", f"Channel not found: {handle}", 404)
            except Exception as e2:
                log.warning(f"[activity_intel] ResolveUsername also failed: {e2}")
                return error_response("INVALID_TARGET", f"Channel not found: {handle}", 404)
        else:
            raise

    if entity is None:
        return error_response("INVALID_TARGET", f"Could not resolve entity for: {handle}", 404)

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


# ── Username Lookup ──────────────────────────────────────────────

async def handle_username_lookup(payload: dict) -> dict:
    """
    Public profile lookup for a Telegram username.

    Handles both entity types returned by get_entity():
      - User  → personal account (returns public profile fields only)
      - Channel → delegates to handle_channel_scrape()

    Public-only fields extracted for User entities:
      display_name, username, bio (if not restricted), photo_present,
      verified, bot, last_seen_bucket

    Returns artifacts under the 'channel_profile' key so the existing
    ChannelProfileCard UI component renders without modification.

    Privacy compliance: no private messages, no contact list, no mutual
    contacts — only data visible to any authenticated Telegram user.
    """
    scan_id = payload.get("scanId", "")
    raw = (
        payload.get("username", "")
        or payload.get("channel", "")
        or payload.get("query", "")
    )

    if is_private_target(raw):
        return error_response(
            "PRIVATE_CHANNEL_UNSUPPORTED",
            "Private invite links are not supported. Public usernames only.",
            403,
        )

    handle = normalize_target(raw)
    if not handle or len(handle) < 4:
        return error_response("INVALID_TARGET", f"Could not normalize target: {raw}")

    log.info(f"[username_lookup] scanId={scan_id} target={handle}")

    client = await _get_client()

    from telethon.tl.types import (
        Channel,
        User,
        ChatPhotoEmpty,
        UserStatusRecently,
        UserStatusLastWeek,
        UserStatusLastMonth,
        UserStatusOffline,
        UserStatusOnline,
    )

    # ── Try get_entity first, fall back to ResolveUsernameRequest ──
    entity = None
    try:
        entity = await client.get_entity(handle)
    except Exception as e:
        err_str = str(e).lower()
        err_type = type(e).__name__

        # FloodWaitError must surface as 429 so the proxy/n8n can back off gracefully
        if "floodwait" in err_type.lower() or "flood_wait" in err_str:
            wait = getattr(e, 'seconds', 60)
            return error_response("FLOOD_WAIT", f"Rate limited by Telegram — retry after {wait}s", 429)

        # Private account or invite-only channel
        if "invite" in err_str or "private" in err_str:
            return error_response("PRIVATE_CHANNEL_UNSUPPORTED", "This appears to be a private account/channel.")

        # For ALL other errors, attempt ResolveUsername fallback before giving up.
        # This catches ValueError, PeerIdInvalidError, UsernameNotOccupiedError, etc.
        log.info(f"[username_lookup] get_entity raised {err_type}: {e} — trying ResolveUsername fallback")
        try:
            from telethon.tl.functions.contacts import ResolveUsernameRequest
            resolved = await client(ResolveUsernameRequest(handle))
            if resolved.users:
                entity = resolved.users[0]
                log.info(f"[username_lookup] ResolveUsername resolved user: {getattr(entity, 'username', handle)}")
            elif resolved.chats:
                entity = resolved.chats[0]
                log.info(f"[username_lookup] ResolveUsername resolved chat/channel: {getattr(entity, 'username', handle)}")
            else:
                return error_response("INVALID_TARGET", f"Account not found: {handle}", 404)
        except Exception as e2:
            e2_type = type(e2).__name__
            if "floodwait" in e2_type.lower():
                wait = getattr(e2, 'seconds', 60)
                return error_response("FLOOD_WAIT", f"Rate limited — retry after {wait}s", 429)
            log.warning(f"[username_lookup] ResolveUsername also failed: {e2}")
            return error_response("INVALID_TARGET", f"Account not found: {handle}", 404)

    if entity is None:
        return error_response("INVALID_TARGET", f"Could not resolve entity for: {handle}", 404)

    # ── Channel / Supergroup → delegate ──────────────────────────
    if isinstance(entity, Channel):
        log.info(f"[username_lookup] entity is Channel — delegating to handle_channel_scrape")
        return await handle_channel_scrape(payload)

    # ── Personal account ─────────────────────────────────────────
    if not isinstance(entity, User):
        return error_response("INVALID_TARGET", f"Unrecognised entity type for '{handle}'.")

    # Map last-seen status to a readable bucket
    status = getattr(entity, "status", None)
    if isinstance(status, UserStatusOnline):
        last_seen_bucket = "recently"
    elif isinstance(status, UserStatusRecently):
        last_seen_bucket = "recently"
    elif isinstance(status, UserStatusLastWeek):
        last_seen_bucket = "within_week"
    elif isinstance(status, UserStatusLastMonth):
        last_seen_bucket = "within_month"
    elif isinstance(status, UserStatusOffline):
        last_seen_bucket = "long_ago"
    else:
        last_seen_bucket = "unknown"

    # Attempt to fetch bio via GetFullUserRequest (public if user hasn't hidden it)
    bio = None
    try:
        from telethon.tl.functions.users import GetFullUserRequest
        full = await client(GetFullUserRequest(id=entity))
        bio = getattr(full.full_user, "about", None) or None
    except Exception as e:
        log.warning(f"[username_lookup] GetFullUser failed (non-fatal): {e}")

    first_name = getattr(entity, "first_name", "") or ""
    last_name = getattr(entity, "last_name", "") or ""
    display_name = f"{first_name} {last_name}".strip() or handle
    username = getattr(entity, "username", None) or handle
    photo_present = bool(entity.photo and not isinstance(entity.photo, ChatPhotoEmpty))
    verified = getattr(entity, "verified", False)
    is_bot = getattr(entity, "bot", False)
    profile_url = f"https://t.me/{username}"

    profile = {
        "type": "user",
        "display_name": display_name,
        "first_name": first_name,
        "last_name": last_name,
        "username": username,
        "bio": truncate(bio, 300) if bio else None,
        "photo_present": photo_present,
        "verified": verified,
        "bot": is_bot,
        "last_seen": last_seen_bucket,
        "profile_url": profile_url,
        # Surfaced in ChannelProfileCard — match channel shape where possible
        "title": display_name,
        "subscriber_count": None,
        "last_message_ts": None,
        "language_guess": None,
    }

    severity = "medium" if verified else "info"

    findings = [
        {
            "kind": "telegram_username",
            "provider": "telegram",
            "severity": severity,
            "evidence": {
                "display_name": display_name,
                "username": username,
                "bio": profile["bio"],
                "photo_present": photo_present,
                "verified": verified,
                "bot": is_bot,
                "last_seen": last_seen_bucket,
                "profile_url": profile_url,
                "account_type": "bot" if is_bot else "personal",
            },
        }
    ]

    log.info(
        f"[username_lookup] personal account found: username={username} "
        f"verified={verified} bot={is_bot} last_seen={last_seen_bucket}"
    )

    return {
        "ok": True,
        "findings": findings,
        "artifacts": {
            # Keyed as channel_profile so ChannelProfileCard renders it unchanged
            "channel_profile": profile,
        },
    }


# ── Phone Presence ───────────────────────────────────────────────

async def handle_phone_presence(payload: dict) -> dict:
    """
    Check whether a phone number has a publicly visible Telegram account.

    Uses Telethon's ImportContacts + ResolvePhone approach:
      1. Temporarily import the phone as a contact (required by Telegram API).
      2. Inspect the returned user object for public profile data.
      3. Immediately delete the imported contact to leave no trace.

    Returns a 'phone_presence' finding with only publicly available data:
    - Whether the account exists
    - Display name (if public)
    - Username (if set and public)
    - Photo present (boolean)
    - Account verified flag
    - Last seen bucket (if visible): 'recently', 'within_week', 'within_month', 'long_ago'

    Privacy compliance: we never store the contact, never access private chats,
    and never return data that isn't already visible to any Telegram user.
    """
    scan_id = payload.get("scanId", "")
    phone_raw = payload.get("phone", "") or payload.get("phoneE164", "") or payload.get("query", "")

    if not phone_raw:
        return error_response("MISSING_PHONE", "phone field is required.")

    # Normalise: strip spaces/dashes, ensure + prefix
    phone = re.sub(r"[\s\-\(\)]", "", str(phone_raw).strip())
    if not phone.startswith("+"):
        phone = "+" + phone

    # Basic E.164 sanity check (7–15 digits after +)
    if not re.match(r"^\+\d{7,15}$", phone):
        return error_response("INVALID_PHONE", f"Could not parse phone number: {phone_raw}")

    log.info(f"[phone_presence] scanId={scan_id} phone={phone[:6]}***")

    client = await _get_client()

    from telethon.tl.functions.contacts import ImportContactsRequest, DeleteContactsRequest
    from telethon.tl.types import InputPhoneContact, UserStatusRecently, UserStatusLastWeek, UserStatusLastMonth, UserStatusOffline, UserStatusOnline
    import time

    # Use a random client_id for this ephemeral contact import
    contact_id = int(time.time()) % 2147483647

    try:
        result = await client(ImportContactsRequest(contacts=[
            InputPhoneContact(
                client_id=contact_id,
                phone=phone,
                first_name="OSINT",
                last_name="Query",
            )
        ]))
    except Exception as e:
        log.warning(f"[phone_presence] ImportContacts error: {e}")
        return error_response("LOOKUP_FAILED", f"Failed to query phone: {e}", 500)

    users = getattr(result, "users", [])

    # Always clean up imported contact immediately
    if users:
        try:
            from telethon.tl.types import InputUser
            await client(DeleteContactsRequest(id=[
                InputUser(user_id=u.id, access_hash=u.access_hash) for u in users
            ]))
        except Exception as cleanup_err:
            log.warning(f"[phone_presence] Contact cleanup failed (non-fatal): {cleanup_err}")

    if not users:
        # Phone number not linked to any Telegram account (or account is hidden)
        findings = [{
            "kind": "phone_presence",
            "provider": "telegram",
            "severity": "info",
            "evidence": {
                "phone": phone,
                "registered": False,
                "message": "No Telegram account found for this number.",
            },
        }]
        return {"ok": True, "findings": findings, "artifacts": {}}

    user = users[0]

    # Map last-seen status to a human-readable bucket
    status = getattr(user, "status", None)
    status_type = type(status).__name__ if status else "Unknown"
    last_seen_bucket = None
    if isinstance(status, UserStatusRecently):
        last_seen_bucket = "recently"
    elif isinstance(status, UserStatusLastWeek):
        last_seen_bucket = "within_week"
    elif isinstance(status, UserStatusLastMonth):
        last_seen_bucket = "within_month"
    elif isinstance(status, UserStatusOffline):
        last_seen_bucket = "offline"
    elif isinstance(status, UserStatusOnline):
        last_seen_bucket = "online"
    else:
        last_seen_bucket = "hidden"

    from telethon.tl.types import ChatPhotoEmpty

    profile = {
        "phone": phone,
        "registered": True,
        "user_id": user.id,
        "first_name": getattr(user, "first_name", "") or "",
        "last_name": getattr(user, "last_name", "") or "",
        "username": getattr(user, "username", None),
        "bio": None,  # Bio requires GetFullUser — skip to avoid rate-limit risk
        "photo_present": bool(user.photo and not isinstance(user.photo, ChatPhotoEmpty)),
        "verified": getattr(user, "verified", False),
        "bot": getattr(user, "bot", False),
        "last_seen": last_seen_bucket,
        "profile_url": f"https://t.me/{user.username}" if getattr(user, "username", None) else None,
    }

    display_name = f"{profile['first_name']} {profile['last_name']}".strip() or "Unknown"

    severity = "medium" if profile["username"] else "info"

    findings = [{
        "kind": "phone_presence",
        "provider": "telegram",
        "severity": severity,
        "evidence": {
            **profile,
            "display_name": display_name,
        },
    }]

    log.info(f"[phone_presence] Found account: user_id={user.id} username={profile['username']} last_seen={last_seen_bucket}")

    return {
        "ok": True,
        "findings": findings,
        "artifacts": {
            "phone_profile": profile,
        },
    }


# ── HTTP Server ──────────────────────────────────────────────────

ROUTES = {
    "/telegram/username":        handle_username_lookup,   # handles both User and Channel entities
    "/telegram/channel-scrape":  handle_channel_scrape,
    "/telegram/activity-intel":  handle_activity_intel,
    "/telegram/phone-presence":  handle_phone_presence,    # phone number → Telegram account check
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

        # Strip query string from path (handles cases where proxy appends ?params)
        clean_path = self.path.split("?")[0].rstrip("/") or "/"

        # Auth check
        provided_key = self.headers.get("X-Worker-Key", "")
        if WORKER_TOKEN and provided_key != WORKER_TOKEN:
            log.warning(f"[{request_id}] Unauthorized request to {clean_path}")
            self._send_json({"ok": False, "error": "Unauthorized"}, 401)
            return

        # Route
        handler = ROUTES.get(clean_path)
        if not handler:
            log.warning(f"[{request_id}] Unknown route: {clean_path} (raw: {self.path})")
            self._send_json({"ok": False, "error": f"Unknown route: {clean_path}"}, 404)
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
        log.info(f"[{request_id}] {clean_path} scanId={scan_id}")

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
