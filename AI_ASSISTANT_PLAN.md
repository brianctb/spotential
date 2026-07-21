# AI Assistant Plan (Phase 1 implemented; Phase 2 not started)

A working design for a natural-language chat feature: user asks things like *"best 5 locations in Vancouver to open a gym"* or *"good coffee shop spots near Kitsilano"*, gets a reply plus clickable location results, and clicking a result flies the map to it and runs the normal analysis flow — same as dropping a pin manually. Phase 1's backend (`POST /agent/chat`, tool-calling, geography-aware location filtering — see `AGENT_LOCATION_TOOLS.md`) is built and live. Kept here as historical design record and as the plan for the still-unbuilt frontend wiring and Phase 2.

## Phase 1 — Tool-calling chat assistant (build this first)

### Key decisions

- **Claude API (Haiku 4.5), not OpenAI.** This is intent-routing + structured extraction (pick a tool, extract business type / limit / location text), not deep reasoning — cheapest capable tier is right. Enum-constrained tool schemas fit Anthropic's tool-use well; prompt caching helps if system prompt/tool defs get reused across turns.
- **Separate API credits required.** Claude Code (Pro/Max subscription) and the Claude Developer API (console.anthropic.com) are different products/billing — Claude Code usage doesn't grant API credits. Need an API key from console.anthropic.com with a small prepaid balance + spend-limit alert.
- **Biggest cost risk is bots on a public endpoint, not real traffic** (portfolio site, minimal expected users). Mitigate with tight `slowapi` rate limiting on the chat route and keep the API key server-side only.
- **No MCP server.** MCP is for exposing tools to *external* MCP clients. Here the only consumer is our own FastAPI backend calling the Anthropic Messages API directly — plain tool-use is simpler and the right scope.
- **No LangChain/CrewAI/pgvector for Phase 1.** `BusinessType` is a fixed 11-value enum (`backend/config/business_type.py`) — enum-constrained tool params solve type resolution, no semantic search needed. Ranking is a single indexed SQL query, not something requiring an agent framework.
- **Chat panel with custom lightweight state, not the Vercel AI SDK wire protocol.** A real chat UI is needed (multi-turn, assistant replies can carry a list of interactive result cards) but adopting `useChat`'s SSE protocol means FastAPI has to speak a Next.js-oriented wire format for no real benefit — a single Haiku tool-use round resolves in ~1-2s and the payload (a short reply + already-computed result objects) has nothing worth streaming token-by-token. A stateless `POST /agent/chat` returning plain JSON (`{reply, results[]}`) is enough. Frontend owns message history. Revisit Vercel AI SDK if/when real token streaming for narrative explanations is wanted (Phase 2+).

### Architecture

```
User: "best 5 locations in Vancouver to open a gym"
  → POST /agent/chat { messages: [...history, newUserMessage] }
  → AgentService sends one Claude turn (Haiku) with three tools:
       - resolve_business_type(query)                     -> enum-constrained BusinessType
       - geocode_location(query)                           -> {lat, lng} (Nominatim, bounded to Vancouver)
       - find_top_locations(business_type, limit, order)   -> ranked tracts from `model_predictions`
    Claude picks tool(s) based on intent (still a single dispatch round, just possibly >1 tool
    in parallel — e.g. resolve_business_type + find_top_locations together):
       "best 5 ... gym"        -> resolve_business_type + find_top_locations(limit=5, desc)
       "spots near Kitsilano"  -> resolve_business_type + geocode_location
```

**Note (as shipped):** `geocode_location` was dropped from the final implementation. Only `resolve_business_type` and `find_top_locations` exist today — the latter absorbed geography scoping directly (`city`/`neighbourhood`/`state`/`country` params), see `AGENT_LOCATION_TOOLS.md`.

```
  → backend executes the matched tool(s), sends the tool_result(s) back to Claude for a final
    reply (this round-trip is just correct tool-use mechanics, not the "agentic" part), returns
    { reply: str, results: AgentLocationResult[] }
  → frontend renders `reply` as a bubble; each result renders as a card (rank/label/score) with
    a "View on map" button that reuses the existing draft->URL commit flow (mapStore setters +
    flyToLocation + URLSearchParams push, same as SpotentiateButton) — same highlight/analysis
    result as a manual pin drop, just triggered per-card.
```

### `find_top_locations` is a cheap DB read, not live inference

`ModelPrediction` (`backend/models/model_outputs.py`) already stores a precomputed `prediction_score` per `(tract_id, business_type)`, populated offline by `scripts/analysis/precompute_tracts.py`. So "top 5 gym locations" is just:

```sql
SELECT * FROM model_predictions WHERE business_type = :bt ORDER BY prediction_score DESC LIMIT :n
```

joined with `CensusTract` for a representative point (`ST_X/ST_Y(ST_Centroid(geom))` — no existing centroid method, would need to add one; there's a one-off precedent in `scripts/census/load_census_geo.py`). No live XGBoost inference needed for this feature. Caveat: this cache is only as fresh as the last `precompute_tracts.py` run.

### Backend steps (implemented)

1. `uv add anthropic`; `ANTHROPIC_API_KEY` in `backend/.env`/`.env.dev` (read via `os.environ`, matching existing pattern).
2. ~~Small Nominatim geocoding helper~~ — superseded by DB-driven geography filtering, see `AGENT_LOCATION_TOOLS.md`.
3. `PredictionService.get_top_tracts(...)` — queries `model_predictions` joined to `CensusTract`, geography-filterable, capped server-side regardless of requested limit.
4. Schemas actually live in `backend/schema/agent.py` (not `schema/response.py` as originally planned): `AgentLocationResult` (tract_id, label, business_type, score, lat, lng), `AgentChatResponse` (reply, results[]).
5. `backend/service/AgentService.py` (not `agent_service.py` as originally planned): constructor-injected with `PredictionService`, `CensusService`, `GeographyService`, same `Depends` pattern as `AnalysisService`; defines tool schemas, runs the Anthropic SDK's beta Tool Runner loop, returns `AgentChatResponse`.
6. `backend/routers/agent.py`: `POST /agent/chat`, body `{messages: [...]}` (stateless, frontend owns history), wired via `dependencies.py`.
7. Rate limit on this route: `3/minute;10/day` per IP (tighter than originally planned `8/minute;30/day`), stricter than the app default.

### Frontend steps (not yet done)

1. `frontend/src/api/agent.ts` typed wrapper (pattern after `api/analysis.ts`); `pnpm generate:types` once backend schemas exist.
2. Chat panel component (e.g. `components/chat/ChatPanel.tsx`), likely in a `Sheet`, with message history in local/zustand state.
3. Render plain text bubble for `reply`; if `results.length`, a `Card` per result using existing `ui/card.tsx`/`ui/button.tsx` — no new UI library needed.
4. Extract the "commit a resolved point" logic currently inline in `SpotentiateButton.tsx` (mapStore setters + `flyToLocation` + URLSearchParams push) into a small shared function/hook so both the button and chat result cards call the same code.
5. TanStack Query mutation (pattern after `useAnalysisQuery`) posting `{messages}`, appending the response to chat state; `sonner` toast on failure.

### Cost controls checklist

- Server-side-only API key.
- Tight per-IP rate limit on `/agent/chat`.
- Haiku model, capped `limit` on `find_top_locations`, short system prompt.
- Spend-limit alert in the Anthropic console.

## Phase 2 — Real agentic loop (stretch goal, do not build yet)

Only worth doing once Phase 1 is shipped and there's a query type that genuinely can't be answered by picking one tool (or one parallel batch of tools) a single time. What it needs beyond Phase 1:

- **A real multi-round loop** in `AgentService`: after getting a tool_result back to Claude, check if the *new* response also requests tools (because it decided, based on what it just learned, that it needs more information) — if so, execute those too and repeat, until Claude stops requesting tools. Phase 1's single round-trip doesn't need this because its 3 tools are independent/parallelizable; Phase 2 needs it because later tool calls depend on earlier results.
- **A query designed to require chaining**, e.g. *"should I open a gym or a cafe in Kitsilano?"* — forces: geocode once → look up gym score → look up cafe score → compare the two numbers itself → produce a reasoned recommendation. The model has to plan a sequence it wasn't handed in advance, which is the actual demonstration of agentic behavior.
- **Narrative explanations grounded in retrieval** ("why does this tract score well?") — this is where `ROADMAP.md`'s pgvector/RAG idea earns its complexity, and where real token streaming (adopting the full Vercel AI SDK protocol properly) starts to matter, since the output becomes long-form generated prose instead of a short reply + structured data.
- **Multi-agent orchestration (CrewAI-style)** is a further step beyond even this — only relevant if you want specialized sub-agents handing off to each other, not just a longer single-agent loop. Treat as optional, not required for "agentic" to be true.
