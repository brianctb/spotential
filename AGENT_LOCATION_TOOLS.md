# Agent tools: geography-aware location filtering

Design notes from a planning discussion, kept for continuing on another machine. Nothing here is implemented yet.

## Problem statement (context only, no solution — for prompting another AI)

Spotential is a location-intelligence platform that scores business opportunities by comparing an ML-predicted "capacity" for a business type against the actual business count within a census tract, backed by a FastAPI + PostgreSQL/PostGIS backend. It has an in-progress AI chat assistant (agent) that talks to Claude with tool-calling, exposing tools like `resolve_business_type` (maps free text like "coffee shop" to a supported business-type enum) and `find_top_locations` (returns the top-N census tracts for a business type, ranked by opportunity score). Right now `find_top_locations` has no concept of geography at all — it just returns a global top-N across every loaded census tract, filtered only by business type. The goal is to let users ask natural-language questions like "top 5 locations for opening a gym in Vancouver," "top 5 locations for opening a gym in Burnaby," "top 6 locations for opening a gym in Burnaby, Vancouver" (multiple places in one prompt), "top 5 locations for opening a gym in Canada," or "top 5 locations for opening a gym" with no location mentioned at all — and have the backend correctly scope (or not scope) the results accordingly. The database does have a geography hierarchy already modeled (`Country` → `State` → `City` → `Neighbourhood` tables, with each census tract carrying nullable foreign keys into all four levels, populated by a one-time reverse-geocoding ingestion step), but nothing currently reads that hierarchy to filter or interpret location text. The open problem is: given an arbitrary free-text location string typed by a user (or extracted by the LLM from their message), how do you reliably determine which level of the hierarchy it refers to (a neighbourhood? a city? a state/province? a country?), how do you handle the fact that the same real-world place might be stored under different names or abbreviations than what a user types (e.g. "BC" vs "British Columbia"), and how do you handle genuine ambiguity where the same name could refer to different real places in different regions (e.g. "Surrey" existing both near Vancouver and in the UK) — especially with an eye toward this system eventually covering more than one metro area or country, not just its current single-region dataset.

## Feature

The agent backend (`backend/service/AgentService.py`, uncommitted on `feature/agentic-backend`) exposes 3 tools to Claude: `resolve_business_type`, `geocode_location`, and `find_top_locations`. The goal is to make `find_top_locations` handle free-text location scoping so prompts like these all work:

- "top 5 locations for opening a gym in Vancouver"
- "top 5 locations for opening a gym in Burnaby"
- "top 6 locations for opening a gym in Burnaby, Vancouver" (multiple places in one prompt)
- "top 5 locations for opening a gym in Canada"
- "top 5 locations for opening a gym" (no location at all)

## Current state (why this is a gap)

`find_top_locations` → `PredictionService.get_top_tracts()` has **no geography filter at all** today — it's a global top-N over every loaded census tract, filtered only by `business_type`. Only the unscoped "top 5 gyms" case already works.

Key discovery: the geography hierarchy needed to fix this **already exists and is already populated**, so this is a filtering gap, not a data gap:

- `backend/models/geography.py` defines `Country` / `State` / `City` / `Neighbourhood`.
- `CensusTract` (`backend/models/census.py:17-20`) carries nullable `country_id` / `state_id` / `city_id` / `neighbourhood_id` FKs.
- `backend/scripts/census/load_census_geo.py` (`enrich_tracts()`) reverse-geocodes every tract's centroid via Nominatim and fills those FKs in — already run, not a pending step.
- `backend/scripts/census/load_tract.py:21` loads all tracts whose `CTUID` starts with `933` — the StatCan code for the **Vancouver Census Metropolitan Area**, which spans Vancouver, Burnaby, Richmond, Surrey, and other Lower Mainland municipalities, not just the city of Vancouver. So "Burnaby" is already in-scope data; the agent's current system prompt ("Only discuss Vancouver locations") undersells actual coverage.
- "Canada" / "British Columbia"-level queries need no special-casing: every loaded tract already belongs to that one country/state row, so filtering by `country_id`/`state_id` is a no-op that returns the same set as unfiltered — which is the practically-correct answer given the loaded dataset.

The existing `geocode_location` tool (Nominatim, hardcoded Vancouver bounding box) solves a different problem — free-text → raw lat/lng for a point — and stays untouched.

## Tool architecture decision

Resolution logic lives in a new reusable `GeographyService`, but is exposed to Claude as a **single fused tool** — an optional `location` field added directly to `find_top_locations` — rather than a separate `resolve_location` tool requiring a chained call.

Why: the agent runs on Haiku with a hard `MAX_TOOL_ITERATIONS = 4` cap already in the code (a reliability safety net the author clearly anticipated needing). A resolve→query chain requires Claude to correctly plan two rounds of parallel tool calls per multi-location query — a real failure risk on a small model. A fused tool needs only one call per location, and "top 6 in Burnaby, Vancouver" still works because the existing loop (`AgentService.chat`, `backend/service/AgentService.py:144-159`) already dispatches every `tool_use` block Claude requests in a single turn — Claude can call `find_top_locations` twice in parallel, once per city, with no new orchestration logic needed.

The modularity concern (why not a separate tool, for reuse/composability) is addressed at the *code* layer instead: `GeographyService.resolve_location()` is a standalone, reusable service method. Any future tool (e.g. a "analyze this specific point" tool) can call it directly without duplicating resolution logic — the reuse just doesn't have to be forced onto the conversation loop.

A `place` label on result cards (so merged multi-city answers show which city each card belongs to) was discussed and explicitly deferred — "maybe later," not part of this round.

## Problems raised and solutions

### 1. No geography filter on `find_top_locations`

**Fix**: extend `PredictionService.get_top_tracts()` to accept an optional resolved location and join `ModelPrediction` → `CensusTract` to filter by whichever FK column matches the resolved level (`neighbourhood_id` / `city_id` / `state_id` / `country_id`).

### 2. How do we know if free text is a city, state, or country?

**Fix**: `GeographyService.resolve_location(query)` tries each level from most to least specific — `Neighbourhood` → `City` → `State` → `Country` — with an exact case-insensitive match first, then a partial (`ILIKE '%query%'`) fallback. The first level that produces a hit wins. This works because the FK hierarchy already models exactly this structure; no new schema needed for the basic case.

### 3. Aliases — "BC" vs "British Columbia"

Nominatim only ever returns the full province name ("British Columbia") when populating `State.name` — never the abbreviation — so a user typing "BC" can't match via substring matching in either direction. This is a real schema gap: `Country` already has both `name` ("Canada") and `code` ("CA") in `models/geography.py`, but `State` only has `name`.

**Fix**: add `code: Optional[str]` to `State`, populate it in `get_or_create_state` (`load_census_geo.py`) via a small static ISO 3166-2 lookup table for Canada's 13 provinces/territories (fixed, enumerable, cheap to maintain — unlike city nicknames, which are a much longer non-enumerable tail we're deliberately not trying to solve generically). The resolver checks `code` alongside `name`.

### 4. Ambiguity — "Surrey" (BC) vs "Surrey" (UK)

This is a genuine disambiguation problem, but it's structurally gated: `City`/`State`/`Country`/`Neighbourhood` rows in this system are *only* ever created as a byproduct of reverse-geocoding a census tract we've actually ingested (`load_census_geo.py`'s `get_or_create_city` only runs against tracts already in `census_tracts`). There's no independent gazetteer — the geography tables contain exactly "places we have real analysis data for." A UK "Surrey" row can't silently appear; it would only exist the day someone deliberately ingests UK data, which is a planned, visible event, not a silent regression as the BC dataset grows.

That said, the return shape should support disambiguation from the start so that day isn't a breaking API change:

**Fix**: `resolve_location` returns three outcomes instead of two — `found` (single unambiguous match), `ambiguous` (multiple equally-plausible matches, e.g. a real future name collision), `not_found`. On `ambiguous`, return all candidates qualified with their full hierarchy path (e.g. "Surrey, British Columbia, Canada" vs "Surrey, England, United Kingdom") so the tool layer can hand them to Claude and have it ask a one-line clarifying question instead of silently picking one. Collapsing "found exactly one" and "found several, picked the first" into the same outcome would let a fragile heuristic match masquerade as a confident answer — the whole point of the three-way split is to never let that happen silently.

Complementary: accept qualified input like `"Surrey, BC"` — split on the comma, resolve the region part first, then match the place part scoped to that region (`City.name ILIKE 'surrey' AND City.state_id == <resolved BC id>`). This lets users self-disambiguate up front, which is the common real case when someone already knows a name is ambiguous.

### 5. Is the ILIKE-matching approach fragile?

Yes, honestly — pure string matching over free text is a heuristic, not a proof. The mitigation isn't a smarter matcher; it's making the resolver's failure modes explicit (`not_found` and `ambiguous` as distinct, first-class outcomes) so a fragile match is never silently treated as a certain one. The system prompt should tell Claude to say plainly when a location isn't covered, and to ask for clarification rather than guess when it's ambiguous.

## Planned file changes (not yet implemented)

- `backend/models/geography.py` — add `code: Optional[str]` to `State`
- `backend/scripts/census/load_census_geo.py` — populate `State.code` via a static Canadian province/territory abbreviation table
- `backend/service/GeographyService.py` — new; `resolve_location(query) -> LocationResolution` (`status: found|ambiguous|not_found`)
- `backend/service/PredictionService.py` — `get_top_tracts()` gains an optional geography filter + join
- `backend/service/AgentService.py` — `find_top_locations` tool schema gains optional `location` field; handler branches on resolution status; system prompt updated to reflect actual coverage (Metro Vancouver / Lower Mainland) and to ask for clarification instead of guessing
- `backend/dependencies.py` — new `get_geography_service` provider, wired into `get_agent_service`
- An Alembic migration for the new `State.code` column

No frontend changes needed — `AgentChatResponse` / `AgentLocationResult` shapes are unchanged.

## Verification plan (once implemented)

1. `cd backend && uv run fastapi dev`, then exercise `POST /agent/chat` with:
   - "top 5 locations for opening a gym in Vancouver" vs "...in Burnaby" — different City rows, provably different tract sets.
   - "top 6 locations for opening a gym in Burnaby, Vancouver" — confirm two parallel `find_top_locations` calls happen in one turn and results merge.
   - "top 5 locations for opening a gym in Canada" — same result set as no location (country filter is a no-op over this dataset).
   - "top 5 locations for opening a gym" (no location) — unchanged, still global top-5.
   - "top 5 locations for opening a gym in Toronto" — `not_found`; Claude should say plainly the location isn't covered, not hallucinate.
   - "top 5 locations for opening a gym in BC" vs "...in British Columbia" — both resolve to the same `State` row via `code`/`name` respectively.
2. Re-run `load_census_geo.py` after the `State.code` migration to confirm existing `State` rows get backfilled.
3. `cd backend && uv run pyright` to confirm the new service and signature changes type-check cleanly.
