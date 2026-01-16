# LENS Internal Product Language Guide

> Reference document for all LENS-related copy decisions, feature prioritization, and messaging.

---

## Core Positioning Statement

```
LENS exists to reduce false confidence, not increase certainty.
```

### What This Means

- We don't claim to know more than we do
- We expose uncertainty rather than hide it
- We value honest analysis over impressive scores
- We help users avoid overconfidence, not achieve it

### Implications

| Principle | Application |
|-----------|-------------|
| Humility over authority | Never claim definitive answers |
| Explanation over assertion | Show reasoning, not just conclusions |
| Bands over precision | Use ranges, not false decimals |
| Methodology over magic | Make the "how" visible |

---

## Language Principles

### Do Say vs. Don't Say

| Do Say | Don't Say |
|--------|-----------|
| "Explains reliability" | "Guarantees accuracy" |
| "Confidence bands" | "Match scores" |
| "Signals suggest" | "We determined" |
| "Evidence indicates" | "Proof shows" |
| "Corroboration strength" | "Certainty level" |
| "Reduces false positives" | "Eliminates errors" |
| "Transparent analysis" | "Proprietary algorithm" |
| "May belong to" | "Belongs to" |
| "Appears consistent" | "Is the same person" |
| "Insufficient evidence" | "No match" |

### Banned Phrases

Never use these in LENS-related copy:

- "100% accurate"
- "Definitive match"
- "AI-powered certainty"
- "Guaranteed results"
- "Revolutionary technology"
- "Proven identity"
- "Confirmed connection"
- "Absolute confidence"
- "Perfect accuracy"
- "Unmistakable match"

### Preferred Vocabulary

| Category | Words to Use |
|----------|--------------|
| Analysis | analyze, evaluate, assess, examine, interpret |
| Confidence | suggests, indicates, appears, correlates, corresponds |
| Evidence | signals, patterns, indicators, markers, traces |
| Uncertainty | may, might, appears to, seems, potentially |
| Methodology | based on, derived from, calculated using, informed by |

---

## Feature Prioritization Filter

### The "Why" Test

Every LENS feature must pass this test:

> **"Does this feature explain WHY, not just WHAT?"**

### Examples

| Feature Idea | Passes? | Reasoning |
|--------------|---------|-----------|
| Show confidence score | ❌ No (alone) | Only shows what, not why |
| Show confidence + contributing signals | ✅ Yes | Explains why the score exists |
| Badge: "Strong Match" | ❌ No | Label without explanation |
| Badge + signal breakdown | ✅ Yes | Shows reasoning behind label |
| "3 profiles found" | ❌ No | Just count |
| "3 profiles found: 2 corroborate, 1 contradicts" | ✅ Yes | Explains evidence relationship |
| Confidence percentage | ❌ No | False precision without context |
| Confidence band with methodology | ✅ Yes | Honest range with explanation |

### Prioritization Questions

Before building any LENS feature, ask:

1. **Does this reduce false confidence or add to it?**
2. **Can the user understand why LENS reached this conclusion?**
3. **Does this expose uncertainty or hide it?**
4. **Would a skeptical investigator find this helpful?**
5. **Could this lead someone to overconfident conclusions?**

### Red Flags in Feature Proposals

- "This will give users more confidence" → Reframe as "reduce uncertainty"
- "Show a simple score" → Must include explanation
- "Hide the complexity" → Complexity often contains truth
- "More impressive numbers" → Precision ≠ accuracy

---

## Copy Decision Framework

### Headlines

**Should:**
- Lead with the problem (noise, false positives, uncertainty)
- Position LENS as analysis, not search
- Use conditional language ("suggests," "indicates," "appears")

**Examples:**

✅ "Understand which results matter"
❌ "Find the exact matches"

✅ "Reduce false positive noise"
❌ "Get accurate results every time"

✅ "Confidence explained, not claimed"
❌ "AI-powered certainty"

### Descriptions

**Should:**
- Explain methodology, not claim results
- Acknowledge limitations upfront
- Connect features to investigator needs

**Example:**

✅ "LENS analyzes public signals across platforms to explain correlation strength. Results are probabilistic, not definitive."

❌ "LENS uses advanced AI to accurately identify matching profiles across platforms."

### CTAs

**Should:**
- Invite exploration, not promise outcomes
- Use "understand," "analyze," "explore" over "find," "discover," "uncover"

| Use | Avoid |
|-----|-------|
| "Analyze results" | "Find matches" |
| "Understand confidence" | "Get certainty" |
| "Explore signals" | "Discover truth" |
| "See explanation" | "Confirm identity" |

---

## Pro Messaging Guidelines

### Tier Differentiation

| Free Tier | Pro Tier |
|-----------|----------|
| "See what was found" (data layer) | "Understand why it matters" (analysis layer) |
| "Start your analysis" | "Complete your analysis" |
| Basic confidence indicators | Full signal breakdown |
| Summary view | Detailed methodology |

### Pro Value Proposition

```
Free shows you what was found.
Pro explains what it means.
```

### Upgrade Triggers (Ethical Framing)

✅ Acceptable:
- "Want to understand which results matter most?"
- "Need to explain your findings to stakeholders?"
- "Reducing false positive noise in your workflow?"
- "Looking for the reasoning behind confidence levels?"

❌ Avoid:
- "Upgrade for more accurate results"
- "Pro users get the truth"
- "Don't miss critical matches"
- "Free tier might be wrong"

### Pro Feature Language

| Feature | Description |
|---------|-------------|
| Signal breakdown | "See which signals support or contradict correlation" |
| Confidence explanation | "Understand why a result received its confidence band" |
| Cross-platform analysis | "See how evidence from multiple sources corroborates or conflicts" |
| Methodology visibility | "Full transparency into how analysis was performed" |

---

## Anti-Patterns to Avoid

| Anti-Pattern | Why It Violates Positioning | Fix |
|--------------|----------------------------|-----|
| Showing confidence without explanation | Increases false confidence | Always pair score with reasoning |
| Using definitive language | Claims certainty we don't have | Use probabilistic language |
| Hiding methodology | Black-box breeds overconfidence | Make process visible |
| Precision theater (87.3% confidence) | False precision increases false confidence | Use bands: Strong/Likely/Weak |
| Success stories with certainty claims | Suggests certainty is achievable | Frame as "reduced uncertainty" |
| Celebrating high scores | Implies we want users to be confident | Frame as "well-evidenced" |
| Hiding low-confidence results | Pretends uncertainty doesn't exist | Show all, explain all |

---

## Acceptance Criteria Checklist

Before shipping any LENS-related feature or copy:

- [ ] Does it explain WHY, not just WHAT?
- [ ] Does it reduce false confidence or add to it?
- [ ] Is the methodology visible or hidden?
- [ ] Could this lead someone to overconfident conclusions?
- [ ] Would we be comfortable if this was wrong?
- [ ] Does it acknowledge uncertainty where it exists?
- [ ] Is the language probabilistic, not definitive?
- [ ] Does it invite understanding, not claim certainty?

---

## Example Rewrites

### Confidence Display

**Before (Violates Positioning):**
```
Confidence Score: 87%
```

**After (Aligned):**
```
Confidence: Strong (75-100%)

Why: Username consistent across 4 platforms, 
bio overlap detected, no contradicting signals found.
```

### Match Summary

**Before:**
```
Found 12 matches for this username
```

**After:**
```
Found 12 potential matches

LENS analysis:
• 3 strongly correlated
• 5 weakly correlated  
• 4 likely coincidental
```

### Feature Description

**Before:**
```
LENS uses advanced AI to accurately identify matching profiles across platforms.
```

**After:**
```
LENS analyzes public signals to explain why profiles may or may not belong to the same person.
```

### Empty State

**Before:**
```
No matches found
```

**After:**
```
Insufficient evidence for correlation

This username wasn't found on other platforms, 
or available signals don't suggest connection.
```

---

## Tone Calibration

| Context | Tone | Example |
|---------|------|---------|
| High confidence result | Explain the evidence, don't celebrate | "Strong correlation based on 5 supporting signals" |
| Low confidence result | Normal — uncertainty is honest | "Weak correlation. Limited supporting evidence." |
| Edge cases | Acknowledge ambiguity openly | "Mixed signals. Some evidence supports, some contradicts." |
| Pro upgrade prompts | Frame as "more explanation," not "better results" | "Upgrade to see the full signal breakdown" |
| Error states | Be direct about what went wrong | "Analysis couldn't complete. Here's why..." |
| Contradictions | Present both sides | "Username matches, but activity patterns suggest different users" |

---

## Integration Points

This document should be referenced when:

- Writing LENS feature copy
- Prioritizing LENS roadmap items
- Creating LENS marketing materials
- Training team members on LENS positioning
- Reviewing PRs that affect LENS UI or messaging
- Designing confidence visualizations
- Writing Pro upgrade prompts
- Creating user-facing documentation

---

## Summary

**The North Star:**

> Every LENS touchpoint should make users more informed about uncertainty, not more confident about certainty.

**The Test:**

> If a user walked away from LENS thinking "now I know for sure," we failed.
> If they walked away thinking "now I understand the evidence," we succeeded.

---

*Last updated: January 2026*
*Owner: Product Team*
