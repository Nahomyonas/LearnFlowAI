# 🧭 LearnFlow AI — GitHub Issue Creation Guide

## 🎯 Purpose
This guide standardizes how we create GitHub issues for LearnFlow AI. It ensures consistent formatting and traceability across sessions and collaborators.

---

## 🧩 1. When to Create an Issue
Create a GitHub issue whenever:
- You finish a task (to track bugs or regressions)
- You start a new feature (for visibility)
- You discover a follow-up improvement or refactor
- You want to link a future task to a roadmap item (e.g., soft delete or AI integration)

---

## ⚙️ 2. Command Template
We use the **GitHub CLI (`gh`)** for structured issue creation.

**Basic format:**
```bash
gh issue create --repo Nahomyonas/LearnFlowAI \
  --title "<short, descriptive title>" \
  --label "<label1,label2,...>" \
  --body '
## Summary
<short summary of the problem or feature>

## Repro / Context
<how to reproduce if bug, or context if feature>

## Expected
<what should happen>

## Actual
<what happens currently>

## Proposed Fix / Plan
<solution direction, implementation idea>

## Acceptance Criteria
- [ ] itemized criteria for completion
'
```
> ✅ Always quote the entire `--body` block and use **single quotes** for multiline input.

---

## 🏷️ 3. Labels
Use simple, consistent labels for clarity:

| Label | Color | Use For |
|--------|--------|----------|
| bug | 🔴 Red | Regressions, broken flows |
| enhancement | 🟦 Blue | New features or UX improvements |
| frontend | 🟨 Yellow | Dashboard / UI work |
| backend | 🟩 Green | API / DB / Drizzle / Zod changes |

If missing, create them once:
```bash
gh label create bug --color D73A4A --description "Something isn't working"
gh label create enhancement --color A2EEEF --description "New feature or improvement"
gh label create frontend --color FEF2C0 --description "Frontend/UI related"
gh label create backend --color 1D76DB --description "Backend/API/DB related"
```

---

## 🪶 4. Style Rules
- **Titles:** Imperative, short, consistent (e.g., `Fix: Commit Brief → Course flow fails`)
- **Body:** Use markdown checklists, clear reproduction steps, and structured `Expected / Actual` sections
- **Labels:** Match area + type (e.g., `enhancement,frontend` or `bug,backend`)
- **Scope:** One issue per logical change (avoid multi-feature bundles)

---

## 🧱 5. Example Issues
### Feature Example
```bash
gh issue create --repo Nahomyonas/LearnFlowAI \
  --title "AI Outline Generator (summarizeForCourse helper)" \
  --label enhancement,backend \
  --body '
## Summary
Implement helper to generate module + lesson outlines from a course brief using AI.

## Plan
- [ ] Create summarizeForCourse(brief)
- [ ] Validate LLM output with aiOutlineContract
- [ ] Save AI-generated structure under brief.ai_draft

## Acceptance Criteria
- [ ] Helper callable via /api/ai/generate-outline
- [ ] Output matches schema and passes Zod validation
'
```

### Bug Example
```bash
gh issue create --repo Nahomyonas/LearnFlowAI \
  --title "Lessons not loading until user creates a new lesson" \
  --label bug,frontend \
  --body '
## Summary
Lessons don’t load initially on dashboard expand.

## Repro
1) Sign in
2) Expand a course
3) Observe: “No lessons yet” until adding one.

## Expected
Existing lessons should display on first expand.

## Actual
They appear only after adding a new one.

## Proposed Fix
Delay lesson fetch until modules state is fully updated, or re-read after loadModules() resolves.
'
```

---

## 🧭 6. Session Workflow Rule
At the end of every session:
1. ✅ Mark finished work items.
2. 🪶 Convert regressions or improvements into GitHub issues using this format.
3. 📋 Add them under **“Created GitHub Issues”** in the session summary canvas.

This keeps **LearnFlow’s project state** synchronized between ChatGPT sessions and the GitHub repository.

---

📘 **File Path Recommendation:** `/docs/github-issues.md`

