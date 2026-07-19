# Agent tools: geography-aware location filtering (+ prompt caching)

Design notes from a planning discussion, kept for continuing on another machine. Nothing here is implemented yet.

## Problem statement (context only, no solution — for prompting another AI)

Spotential is a location-intelligence platform that scores business opportunities by comparing an ML-predicted "capacity" for a business type against the actual business count within a census tract, backed by a FastAPI + PostgreSQL/PostGIS backend. It has an in-progress AI chat assistant (agent) that talks to Claude with tool-calling, exposing tools like `resolve_business_type` (maps free text like "coffee shop" to a supported business-type enum) and `find_top_locations` (returns the top-N census tracts for a business type, ranked by opportunity score). Right now `find_top_locations` has no concept of geography at all — it just returns a global top-N across every loaded census tract, filtered only by business type. The goal is to let users ask natural-language questions like "top 5 locations for opening a gym in Vancouver," "top 6 locations for opening a gym in Burnaby, Vancouver" (multiple cities in one prompt, correctly capped at 6 total, not 6-per-city), "top 5 locations for opening a gym in Canada," "top 5 locations for opening a gym in BC," or "top 5 locations for opening a gym" with no location mentioned at all — and have the backend correctly scope (or not scope) the results accordingly. The database has a geography hierarchy modeled (`Country` → `State` → `City` → `Neighbourhood` tables, with each census tract carrying nullable foreign keys into all four levels), and it has been populated by running the one-time reverse-geocoding ingestion script.

## Feature

The agent backend (`backend/service/AgentService.py`, uncommitted on `feature/agentic-backend`) exposes 3 tools to Claude: `resolve_business_type`, `geocode_location`, and `find_top_locations`. The goal is to make `find_top_locations` handle location scoping so prompts like these all work:

- "top 5 locations for opening a gym in Vancouver"
- "top 6 locations for opening a gym in Burnaby, Vancouver" (multiple cities, one combined ranked result set)
- "top 5 locations for opening a gym in Kitsilano and Yaletown" (multiple neighbourhoods, same combined-ranking behavior)
- "top 5 locations for opening a gym in Canada"
- "top 5 locations for opening a gym in BC"
- "top 5 locations for opening a gym" (no location at all)

Separately, since this codebase sets no `cache_control` anywhere today, this round also adds one prompt-caching breakpoint to `AgentService.py` — an orthogonal cost optimization, not tied to the geography feature itself.

## Current state (why this is a gap)

`find_top_locations` → `PredictionService.get_top_tracts()` has **no geography filter at all** today — it's a global top-N over every loaded census tract, filtered only by `business_type`. Only the unscoped "top 5 gyms" case already works.

- `backend/models/geography.py` defines `Country` / `State` / `City` / `Neighbourhood`.
- `CensusTract` (`backend/models/census.py:17-20`) carries nullable `country_id` / `state_id` / `city_id` / `neighbourhood_id` FKs — each populated **independently** per tract, not derived from one another at query time.
- `backend/scripts/census/load_census_geo.py` (`enrich_tracts()`) reverse-geocodes every tract's centroid via Nominatim and fills those FKs in. This has been run against production. Real query results:
  - `countries`: 1 row — `Canada`
  - `states`: 1 row — `British Columbia`
  - `cities`: 19 rows — `Bowen Island Municipality, Burnaby, City of Langley, Coquitlam, Delta, District of North Vancouver, Electoral Area A, Maple Ridge, New Westminster, North Vancouver, Pitt Meadows, Port Coquitlam, Port Moody, Richmond, Surrey, Township of Langley, Vancouver, West Vancouver, White Rock`
  - `neighbourhoods`: 202 rows, 197 distinct names (5 names duplicated across different cities, e.g. two rows both named "Downtown")
  - 531 of 535 census tracts now have `city_id` set.
- `backend/scripts/census/load_tract.py:21` loads all tracts whose `CTUID` starts with `933` — the StatCan code for the **Vancouver Census Metropolitan Area**, spanning Vancouver, Burnaby, Richmond, Surrey, and other Lower Mainland municipalities. So "Burnaby" is in-scope data; the agent's current system prompt ("Only discuss Vancouver locations") undersells actual coverage.
- "Canada" / "British Columbia"-level queries need no special-casing: every loaded tract already belongs to that one country/state row, so filtering by them is a no-op that returns the same set as unfiltered.

The existing `geocode_location` tool (Nominatim, hardcoded Vancouver bounding box) solves a different problem — free-text → raw lat/lng for a point — and stays untouched.

## Tool architecture decision

Resolution logic lives in a new, deliberately small `GeographyService`, exposed to Claude as a **single fused tool** — optional fields added directly to `find_top_locations` — rather than a separate `resolve_location` tool requiring a chained call. Why fused, not split: the agent runs on Haiku with a hard `MAX_TOOL_ITERATIONS = 4` cap; splitting would double the iteration cost per query for no accuracy gain, since ambiguity clarification already works today via ordinary multi-turn chat regardless of tool granularity.

**No id-resolution step for `country`/`state`/`city` at all.** An earlier draft of this design had `GeographyService` resolve every geography field's name to a database ID uniformly (via a generic `GeographyFilter(level, id)` type), then have `PredictionService` filter `CensusTract` by ID. That turned out to be unnecessary complexity for three of the four fields: since `country`/`state`/`city` are JSON-schema `enum` fields (see below), Claude can only ever send a string that exactly matches one real row — there's nothing to "resolve," so `PredictionService` just joins `CensusTract` → `City`/`State`/`Country` and filters by **name** directly in one query. Only `neighbourhood` (free text, genuinely ambiguity-prone) still needs a dedicated resolution step in `GeographyService`, because an ambiguous match has to be caught *before* it's used in a join — otherwise two same-named neighbourhoods in different cities would silently merge into one query instead of surfacing as a clarifying question.

**Enum-constrain the closed, stable levels — sourced live from the DB, not hardcoded.** `country` (1 value), `state` (1 value), and `city` (19 values) are small, closed sets for this single-metro dataset, so they're JSON-schema `enum` fields — identical in mechanism to how `business_type` is already enum-constrained. These lists are **not** a static config file like `config/business_type.py`, though — `country`/`state`/`city` names are *derived data* from `load_census_geo.py`'s ingestion, not a fixed developer-authored taxonomy, so a checked-in copy would silently drift the moment ingestion changes. Instead, they're queried **once at app startup** and held in `app.state`, mirroring the existing pattern for the ML model (`fastapi_app.state.model = joblib.load(...)` in `main.py`).

**`neighbourhood` stays free text, resolved via exact-then-ILIKE fallback.** Its values come from Nominatim's raw `neighbourhood`/`suburb` tags — 197 distinct entries, too large and geocoder-noisy to embed as an enum. `not_found`/`ambiguous` as explicit outcomes only ever originate from this one field.

**`city` and `neighbourhood` are lists (`IN`-clause semantics); `state`/`country` stay single strings.** An earlier design (predating this session) handled "top 6 gyms in Burnaby, Vancouver" via two separate parallel tool calls, one per city — reasonable on its face since Claude's tool loop already dispatches parallel calls in one turn "for free." But that design has a real bug: each call is independently capped at `min(limit, 5)` in `PredictionService`, so "top 6" across two cities could return up to **10** results (5 from each, merged), not 6. Fixed by making `city` — and, for the identical reason, `neighbourhood` — array-typed tool fields with `IN`-clause filtering in `PredictionService`: one tool call, one ranked query, correctly capped at the requested total. `state`/`country` are deliberately **not** lists — this dataset has exactly one of each, so there's nothing to combine; a list there would be complexity with zero real use case, unlike `city`/`neighbourhood` where multi-value requests are an explicit target prompt.

**Prompt caching**, unrelated to the geography design but bundled into this round: `AgentService.chat()`'s `messages.create` call gets a `cache_control` breakpoint on `system` (which, combined with `tools` rendering just before it in the API's prefix order, caches both together). Every iteration of the tool-calling loop within a single `chat()` call re-sends byte-identical `tools`+`system` content, so the first iteration writes the cache and every subsequent iteration reads it at a fraction of the cost. Not doing the more advanced moving message-level breakpoint (caching the growing conversation history too) this round — flagged as a future follow-up if usage grows beyond this app's current tight rate limits (3/min, 10/day per IP).

A `place` label on result cards (so merged multi-city answers show which city each card belongs to) was discussed and explicitly deferred — "maybe later," not part of this round.

## Problems raised and solutions

### 1. No geography filter on `find_top_locations`

**Fix**: extend `PredictionService.get_top_tracts()` to accept optional `neighbourhood_ids: list[int]`, `cities: list[str]`, `state: Optional[str]`, `country: Optional[str]`, joining `CensusTract` → `City`/`State`/`Country` by name (`neighbourhood_ids` filters `CensusTract.neighbourhood_id` directly, no join needed — see below) and `AND`-ing one clause per provided field. Zero fields provided → identical query to today's unfiltered call.

### 2. How do we know if free text is a city, state, or country?

**Fix**: don't guess — Claude fills the field it already knows the answer belongs to (`city`, `state`, `country`, or `neighbourhood`), via separate optional tool-schema fields rather than one string. `city`/`state`/`country` need no further resolution (enum-guaranteed exact match). `neighbourhood` goes through `GeographyService.resolve_neighbourhoods(queries, cities=...)` — exact-then-ILIKE per query, optionally scoped to the cities list already provided in the same call, short-circuiting on the first `ambiguous`/`not_found`.

### 3. Aliases — "BC" vs "British Columbia"

No `State.code` column, no alias table. Claude is instructed (system prompt) to always use full names for `state`/`country`. Combined with `state`/`country` being enum-constrained to the real stored full names, Claude is choosing from actual valid values rather than guessing blind.

### 4. Ambiguity — "Surrey" (BC) vs "Surrey" (UK)

Structurally gated: `City`/`State`/`Country`/`Neighbourhood` rows only ever get created as a byproduct of reverse-geocoding an ingested census tract — there's no independent gazetteer, so a UK "Surrey" row can't silently appear. In practice, ambiguity can now only ever arise from `neighbourhood` — `country`/`state`/`city` resolve deterministically since Claude can only send enum-valid strings. `resolve_neighbourhoods` returns three outcomes via `GeographyResolution` — `found` (all queries resolved to unique IDs), `ambiguous` (some query matched more than one row — returns `query` + `candidates` so Claude can ask a one-line clarifying question), `not_found` (some query matched nothing — returns `query` so Claude can say plainly it isn't recognized).

**Candidates must carry city context, not just the bare name.** Production data already has same-named neighbourhoods in different cities (5 duplicate names among 202 rows, e.g. two rows both named "Downtown" — one in Vancouver, one in Surrey). If `candidates` held only `Neighbourhood.name`, an ambiguous "Downtown" query would return `["Downtown", "Downtown"]` — two identical strings Claude can't actually offer the user as a choice. So each candidate string must be formatted with its parent city, e.g. `"Downtown (Vancouver)"` / `"Downtown (Surrey)"`, which just means `resolve_neighbourhoods`' matching query joins `City` (it already does this for `cities`-scoping) and selects `City.name` alongside `Neighbourhood.name` even when `cities` isn't provided.

### 5. Is the fuzzy-matching approach fragile?

For `neighbourhood` (the only field that stays free text): yes, honestly — pure string matching over free text is a heuristic, not a proof. The mitigation isn't a smarter matcher; it's making failure modes explicit (`not_found`/`ambiguous` as distinct, first-class outcomes) so a fragile match is never silently treated as a certain one. For `country`/`state`/`city`, this concern doesn't apply — enum membership is enforced structurally by the tool schema.

### 6. "Top 6 in Burnaby, Vancouver" returning up to 10 results instead of 6

A bug in the original (pre-session) two-parallel-calls design: each `find_top_locations` call independently caps at `min(limit, 5)`, so two calls for two cities can return up to 10 merged results, not the requested 6. **Fix**: `city` (and `neighbourhood`, for the same reason) became array-typed fields, filtered with an `IN` clause in one call, so ranking happens across all named cities/neighbourhoods together with a single, correctly-applied `LIMIT`.

## Planned file changes (not yet implemented)

- `backend/main.py` — `lifespan` gains a one-time startup query (alongside `fastapi_app.state.model = joblib.load(...)`): `fastapi_app.state.supported_countries/states/cities = sorted(...)` from `Country`/`State`/`City`. No `config/geography.py` — the DB is the sole source of truth.
- `backend/schema/geography.py` (new) — one class:
  ```python
  class GeographyResolution(BaseModel):
      status: Literal["found", "ambiguous", "not_found"]
      neighbourhood_ids: list[int] = []
      query: Optional[str] = None
      candidates: list[str] = []
  ```
  (No `GeographyFilter`/`GeographyLevel` — those were dropped once `city`/`state`/`country` stopped needing id-resolution; there's no longer a generic multi-level filter type to represent, only a neighbourhood-specific result.)
- `backend/service/GeographyService.py` (new) — `resolve_neighbourhoods(queries: list[str], cities: Optional[list[str]] = None) -> GeographyResolution`. Iterates the query list, exact-then-ILIKE per item (optionally scoped to the given cities), short-circuits on the first `ambiguous`/`not_found`. Matching always joins `City` (not just when `cities` is given) so that on an `ambiguous` outcome, `candidates` can be built as `"{Neighbourhood.name} ({City.name})"` per match — a bare name list can't disambiguate two same-named neighbourhoods in different cities (see "Ambiguity" above).
- `backend/service/PredictionService.py` — `get_top_tracts()` gains `neighbourhood_ids: Optional[list[int]] = None`, `cities: Optional[list[str]] = None`, `state: Optional[str] = None`, `country: Optional[str] = None` — all four uniformly `Optional[...] = None` (not a mutable `= []` default) since each is independently optional and none should ever backfill another; joins `CensusTract` (and `City`/`State`/`Country` by name as needed) only when at least one is provided.
- `backend/service/AgentService.py`:
  - `find_top_locations` tool schema: `city` and `neighbourhood` become JSON-schema arrays (`city`'s items enum-constrained from `app.state`); `state`/`country` stay single enum strings.
  - Handler resolves `neighbourhood` (if any) via `GeographyService`, branches on `found`/`ambiguous`/`not_found`, then passes everything straight into `PredictionService.get_top_tracts()`.
  - Constructor gains `geography_service` + the three `supported_*` lists, injected via `dependencies.py`.
  - `messages.create`'s `system` param becomes `[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}]` — the prompt-caching addition.
  - System prompt rewritten for actual Metro Vancouver coverage, instructed to put every city/neighbourhood the user names into the respective array (not just the first one).
- `backend/dependencies.py` — new `get_geography_service`, `get_supported_countries`/`get_supported_states`/`get_supported_cities` (mirroring the existing `get_ml_model` pattern), wired into `get_agent_service`.

No `State.code` column, no migration for it, no frontend changes — `AgentChatResponse` / `AgentLocationResult` shapes are unchanged.

## Verification plan (once implemented)

1. `cd backend && uv run fastapi dev`, then exercise `POST /agent/chat` with:
   - "top 5 gyms in Vancouver" vs "...in Burnaby" — different tract sets.
   - "top 6 gyms in Burnaby, Vancouver" — confirm **one** `find_top_locations` call with `city=["Burnaby","Vancouver"]`, exactly 6 results ranked across both cities, not up to 10.
   - "top 5 gyms in Kitsilano and Yaletown" — same combined-ranking behavior for `neighbourhood`.
   - "top 5 gyms in BC" — only `state` filled, same result set as no location.
   - "top 5 gyms in Canada" — same result set as no location.
   - "top 5 gyms" (no location) — unchanged, still global top-5.
   - "top 5 gyms in Toronto" — not a valid `city` enum value; `strict` schema validation prevents Claude from sending it at all.
   - "top 5 gyms in Hastings-Sunrise" vs "...in Hastings" — confirm both resolve to the same neighbourhood via the ILIKE fallback.
   - "top 5 gyms in Downtown" — confirm `ambiguous`, since two different cities each have a neighbourhood literally named "Downtown".
2. Confirm caching is live: check the logged `response.usage` on a multi-iteration request (one that triggers a tool call) — `cache_creation_input_tokens` > 0 on the first `messages.create` call within that request, `cache_read_input_tokens` > 0 on the second.
3. `cd backend && uv run pyright` to confirm the new service/schema/signature changes type-check cleanly.
