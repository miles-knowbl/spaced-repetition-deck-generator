# Estimate: Spaced Repetition Deck Generator

| Property | Value |
|----------|-------|
| **Spec Reference** | SPEC-001 |
| **Estimated By** | Agentic Harness |
| **Date** | 2026-01-21 |

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Effort** | 8-10 days |
| **Complexity** | Medium |
| **Risk Level** | Low |
| **Confidence** | High (85%) |

---

## Breakdown by Phase

### Phase 1: Foundation (2 days)

| Task | Effort | Notes |
|------|--------|-------|
| Project setup (Next.js + TypeScript + Tailwind) | 2h | Standard setup |
| Basic layout and routing | 2h | Simple two-panel layout |
| DeckStore (Zustand) | 2h | Straightforward state management |
| Type definitions | 1h | Card, Deck interfaces |
| **Subtotal** | **1 day** | |

### Phase 2: Core Features (4 days)

| Task | Effort | Notes |
|------|--------|-------|
| Manual card entry form | 3h | Form + validation |
| Card preview list | 4h | List, edit, delete UI |
| AI generation API route | 4h | OpenAI integration + streaming |
| AI generation form | 4h | Form + streaming display |
| File parser (CSV/TXT) | 3h | Using papaparse |
| File import form | 2h | Dropzone + options |
| Edit card modal | 2h | Modal form |
| **Subtotal** | **3 days** | |

### Phase 3: Export (2 days)

| Task | Effort | Notes |
|------|--------|-------|
| Research Anki .apkg format | 2h | SQLite structure, media |
| Implement .apkg generation | 6h | SQLite + ZIP |
| Export API route | 2h | Generate + serve file |
| Download functionality | 1h | Browser download |
| **Subtotal** | **1.5 days** | |

### Phase 4: Polish (2 days)

| Task | Effort | Notes |
|------|--------|-------|
| Error handling | 3h | All error states |
| Loading states | 2h | Spinners, progress |
| Responsive design | 3h | Mobile support |
| Unit tests | 4h | Store, parser, utils |
| E2E tests | 4h | Full workflows |
| **Subtotal** | **2 days** | |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Anki format complexity | Medium | Medium | Well-documented, existing libraries |
| OpenAI rate limiting | Low | Medium | Add retry logic, rate limit handling |
| Streaming complexity | Low | Low | Well-supported in Next.js |
| Browser compatibility | Low | Low | Standard APIs |

---

## Dependencies

| Dependency | Risk | Notes |
|------------|------|-------|
| OpenAI API | Low | Requires API key, has costs |
| better-sqlite3 | Low | Mature library |
| jszip | Low | Mature library |

---

## Assumptions

1. OpenAI API key will be available
2. No need for user authentication
3. No need for persistent storage
4. Single-user local usage (no concurrent access concerns)
5. Modern browser support only (ES2020+)

---

## Confidence Factors

| Factor | Assessment |
|--------|------------|
| Requirements clarity | High - well-defined scope |
| Technical complexity | Medium - standard web app + some Anki format work |
| External dependencies | Low - minimal, well-documented |
| Team familiarity | High - standard tech stack |

**Overall Confidence: 85%**

---

## Recommendations

1. **Start with export research**: Validate .apkg generation approach early
2. **Implement streaming early**: Improves UX significantly
3. **Test Anki import**: Verify generated files work in actual Anki app
4. **Consider fallback**: If .apkg is complex, CSV export is simpler alternative
