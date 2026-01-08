# Comprehensive Evidence Access Hardening Plan

## Problem Statement

Multiple files across the codebase directly access `finding.evidence` properties (`.length`, `.forEach()`, `.map()`, `.slice()`, `.find()`) without defensive null/undefined checks. When findings have `undefined` or `null` evidence arrays, this causes `TypeError` crashes across all scan types (username, phone, email, domain).

## Files Requiring Updates

### 1. src/lib/exports.ts

**Lines 39, 57, 339, 346, 353-354 (Legacy PDF section)**

Current vulnerabilities:
- Line 39: `if (finding.evidence.length === 0)` - crashes if `evidence` is undefined
- Line 57: `finding.evidence.forEach((evidence) => {` - crashes if undefined
- Line 339: `if (finding.evidence.length > 0)` - crashes if undefined
- Line 346: `finding.evidence.slice(0, 5).forEach(...)` - crashes if undefined
- Line 353: `if (finding.evidence.length > 5)` - crashes if undefined

**Fix Pattern:**
```typescript
// Before each access, add:
const evidence = finding.evidence || [];
// Then use: evidence.length, evidence.forEach(), etc.
```

---

### 2. src/components/FindingCard.tsx

**Lines 95, 102**

Current vulnerabilities:
- Line 95: `{finding.evidence.length > 0 && (` - crashes if undefined
- Line 102: `{finding.evidence.map((evidence, idx) => (` - crashes if undefined

**Fix Pattern:**
```typescript
// Add at component start:
const safeEvidence = finding.evidence || [];
// Replace: finding.evidence.length -> safeEvidence.length
// Replace: finding.evidence.map -> safeEvidence.map
```

---

### 3. src/lib/atlas/personaDNA.ts

**Line 34**

Current vulnerability:
- Line 34: `finding.evidence.forEach((e) => {` - crashes if undefined

**Fix Pattern:**
```typescript
// Replace:
finding.evidence.forEach((e) => {
// With:
(finding.evidence || []).forEach((e) => {
```

---

### 4. src/lib/atlas/behaviour.ts

**Line 42**

Current vulnerability:
- Line 42: `finding.evidence.forEach((e) => {` - crashes if undefined

**Fix Pattern:**
```typescript
// Replace:
finding.evidence.forEach((e) => {
// With:
(finding.evidence || []).forEach((e) => {
```

---

### 5. src/lib/pdf-export.tsx

**Lines 306, 309, 314-315**

Current vulnerabilities:
- Line 306: `{finding.evidence.length > 0 && (` - crashes if undefined
- Line 309: `{finding.evidence.slice(0, 3).map(...)` - crashes if undefined
- Line 314: `{finding.evidence.length > 3 && (` - crashes if undefined
- Line 315: `... {finding.evidence.length - 3} more` - crashes if undefined

**Fix Pattern:**
```typescript
// Add before the JSX block:
const safeEvidence = finding.evidence || [];
// Then use safeEvidence for all accesses
```

---

## Implementation Summary

| File | Lines to Fix | Access Pattern | Fix |
|------|--------------|----------------|-----|
| `exports.ts` | 39, 57 | `.length`, `.forEach()` | Add `const evidence = finding.evidence \|\| [];` |
| `exports.ts` | 339, 346, 353 | `.length`, `.slice()` | Add `const evidence = finding.evidence \|\| [];` |
| `FindingCard.tsx` | 95, 102 | `.length`, `.map()` | Add `const safeEvidence = finding.evidence \|\| [];` |
| `personaDNA.ts` | 34 | `.forEach()` | Inline `(finding.evidence \|\| []).forEach()` |
| `behaviour.ts` | 42 | `.forEach()` | Inline `(finding.evidence \|\| []).forEach()` |
| `pdf-export.tsx` | 306, 309, 314-315 | `.length`, `.slice()`, `.map()` | Add `const safeEvidence = finding.evidence \|\| [];` |

---

## Benefits

1. **All scan types protected**: Username, phone, email, and domain scans will handle missing/null evidence gracefully
2. **Export functionality stabilized**: JSON, CSV, and PDF exports won't crash on edge cases
3. **Atlas features protected**: PersonaDNA and Behavioral fingerprinting won't fail on incomplete data
4. **Consistent pattern**: Using `|| []` fallback pattern matches existing hardened files

---

## Files Changed

1. `src/lib/exports.ts` - 2 locations (CSV export + Legacy PDF)
2. `src/components/FindingCard.tsx` - 2 locations
3. `src/lib/atlas/personaDNA.ts` - 1 location
4. `src/lib/atlas/behaviour.ts` - 1 location
5. `src/lib/pdf-export.tsx` - 1 location (with multiple line changes)

**Total: 5 files, ~12 line changes**
