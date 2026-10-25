---
name: find-content-pillars
description: Use when starting SEO content strategy for a website — given a description of the site/product, research the niche and produce a ranked shortlist of content pillars (main hub pages) by traffic potential and competitiveness. The discovery step before planning any single cluster.
---

# Find Content Pillars (SEO discovery)

## Overview

Given a description of a site/product, find the **best content pillars** — the broad hub pages a site should build clusters around — and rank them by **traffic potential** vs **competitiveness**, so the user can pick which to build first.

This is the **discovery** step. It does NOT plan individual articles or keywords for a pillar — that's the next skill (`pillar-cluster-planner`). Output here is a pillar shortlist; the user picks one and hands it to B.

**REQUIRED BACKGROUND:** Read the `seo-core` skill (`.claude/skills/seo-core/SKILL.md`) — the canonical SEO brain. §1 (Keyword & SERP research) gives the estimate-only data sources, difficulty/competitiveness heuristic, and gap-reporting rules this skill applies to pillar discovery.

## When to Use

- "I have an X app and want a website/blog about Y — what should it cover?"
- Start of SEO strategy; deciding the site's main topic hubs
- Before `pillar-cluster-planner` (which needs a chosen pillar as input)
- Quarterly re-run, or on niche/competitor/product shift

**Not for:** planning one pillar's articles/keywords → use `pillar-cluster-planner`.

## Step 1 — Ask for the description (don't assume)

Ask the user a short batched set, then research:

1. **What's the product/site?** (one line — "free Couch-to-5K running app")
2. **What do you want the site to be about / who's the audience?**
3. **Target geo + language** (changes competitors/spelling)
4. **Top competitors** (or "find them")
5. **Business wedge** — the differentiator (free, offline, cheaper, niche angle)

Skip any the user already gave. Never invent geo/competitors silently.

## Step 2 — Research candidate pillars

Apply seo-core §1's SERP sources. To find pillar-sized topics:

- Autocomplete the niche roots (broad seeds). A seed that itself branches into 10+ sub-queries/questions = **pillar-sized**. A seed with few branches = just an article, not a pillar.
- Check who ranks for each candidate head term → competitiveness (EASY/MED/HARD per heuristic).
- Scan competitor sitemaps for the hubs they already built (counter or differentiate).
- Note which candidates map to the wedge (defensible commercial angle).

A good pillar is: **broad enough** to spawn 15+ sub-topics, **winnable** (MED, not HARD-locked), **maps to audience/wedge**, and **has its own search demand** as a phrase.

## Step 3 — Output: ranked pillar shortlist

Write `docs/seo/notes/pillars.md`. Rank by opportunity = **traffic potential ÷ competitiveness** (winnable + high-demand first). Each pillar row:

```markdown
# Content Pillars — <site>

Estimate-only (SERP-reasoned, no paid tools). Ranked by traffic potential vs competitiveness.

## 1. How to Start Running for Beginners  ⭐ build first
- **Pillar keyword:** how to start running for beginners
- **Suggested slug:** /start-running
- **WP category:** How to Start Running  (each pillar = one WordPress category)
- **Traffic potential:** High (broad beginner intent; 20+ sub-questions in autocomplete/PAA)
- **Competitiveness:** MED — gear blogs (REI/Nike/ASICS) rank, no NHS/Wikipedia monopoly → winnable
- **Audience/wedge fit:** core beginner audience; soft-funnel to free app + /pace-calculator
- **Why:** biggest non-branded demand a young domain can realistically win
- **Spoke potential:** breathing, pace, frequency, gear, nutrition, injuries, weight loss…

## 2. Running for Weight Loss (Beginners)
- ... (same fields)

## Deferred (too competitive for now)
- "couch to 5k plan" — HARD (NHS/BBC own SERP); revisit once domain authority grows
```

Include 4–8 viable pillars + a **Deferred** list of HARD ones to revisit later.

## Step 4 — Report gaps + next step

Per seo-core §1, state estimates aren't measured numbers. End by telling the user: pick a pillar from the shortlist and run **`pillar-cluster-planner`** on it to get the full build-ready cluster plan.

## Quick Reference

```
ask description → research roots (branch size + who-ranks) → rank pillars by traffic÷competitiveness → pillars.md → hand pick to pillar-cluster-planner
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Jumping straight to keywords/articles | This skill stops at pillars; pillar-cluster-planner does keywords |
| Picking HARD head terms as pillars | Pillar must be winnable (MED); defer HARD |
| Pillar too narrow | Must spawn 15+ sub-topics, else it's an article |
| No competitiveness call | Every pillar needs a difficulty + who-ranks reason |
| Faking volumes | Label estimates; report the gap (see seo-core §1) |
