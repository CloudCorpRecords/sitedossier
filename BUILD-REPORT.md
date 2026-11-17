# BUILD-REPORT — sitedossier (Lane B, Batch B5)

Rebuild of `com.lazyweb/discovery` v0.1.0 (remote
`https://www.lazyweb.com/mcp/public`), harvest index 1638, Tier C.
Forwarding client to the published remote; labelled subset of 8 of the
9 captured tools (`lazyweb_feedback` omitted per the no-send rule).

## Resume note

This build was a **resume of a partial build**: a previous builder died
mid-build (platform failure, no report). The partial state on disk was
verified firsthand against the fixture and spec before anything was
trusted, then completed. Nothing in the partial source conflicted with
the fixture or the spec, so **no source files were rewritten**.

## What was verified in the partial work (firsthand)

- `server.json` — name `io.github.CloudCorpRecords/sitedossier`;
  description exactly the spec string, 92 chars; OCI entry carries NO
  `version` field; npm entry version `0.1.0`; top-level version `0.1.0`.
- `Dockerfile` — label
  `io.modelcontextprotocol.server.name="io.github.CloudCorpRecords/sitedossier"`
  present.
- `package.json` — `@reneturcios/sitedossier` 0.1.0, `mcpName` matches,
  one bin (`sitedossier` → `dist/cli.js`), fleet dependency ranges.
- `src/mcp.ts` — low-level `Server` API (not McpServer/zod);
  tools/list answered locally from the literal `TOOL_DEFS`;
  unknown tools → McpError MethodNotFound, non-object args →
  InvalidParams, both before any network hop.
- `src/forward.ts` — endpoint pinned to
  `https://www.lazyweb.com/mcp/public` (env override `LAZYWEB_MCP_URL`,
  labelled reconstruction); session flow initialize →
  notifications/initialized → tools/call honouring `Mcp-Session-Id`;
  headers are only Content-Type / Accept / Mcp-Session-Id — **no
  Authorization header is ever sent**; failures render as
  `sitedossier error:` text; upstream results pass through verbatim.
- `src/cli.ts`, `src/types.ts`, `src/index.ts`, `tsconfig.json`,
  `.gitignore`, README, CHANGELOG (newest heading `0.1.0 (2026-10-28)`),
  LICENSE, and all 4 `.github/workflows/` files (publish-container
  IMAGE `ghcr.io/cloudcorprecords/sitedossier`, smoke test asserts the
  `sitedossier` server name) — all present and consistent.
- The `TOOL_DEFS` literals in `forward.ts` were **not** eyeball-trusted:
  they are proven by the registration-integrity test (deep-equal
  against the fixture's 8 tools, in order) and by the parity run below.

## What was completed in this resume

- `test/forward.test.ts` existed but was **incomplete**: it carried the
  full fake-fetch harness plus the registration-integrity and omission
  suites (19 tests) and stopped there. Appended the remaining suites in
  the leavecalc style, adapted to this surface: session establishment
  and reuse (8), no-Authorization-under-any-environment (5),
  tools/call forwarding (8), upstream failures → `sitedossier error:`
  (8), parseRpcBody (5), MCP-layer validation (6), CLI (8).
- **One fix to the pre-existing test code (flagged):** in
  "lazyweb_install_mcp carries required: [] verbatim", the final
  assertion used `assert.equal` (reference equality) on two distinct
  schema objects, which can never pass; changed to `assert.deepEqual`.
  The printed actual/expected were identical, confirming a test bug,
  not a data mismatch. No source file was changed for this.
- `package-lock.json` generated CLEAN Route 3 (no `node_modules` in
  the dir): `npm install --package-lock-only --ignore-scripts
  --offline`. Verified: parses, name `@reneturcios/sitedossier`,
  **exactly 128 package entries**.

## Pipeline results

- `npm ci --ignore-scripts --offline` — OK.
- `npm run build` — OK (`dist/` produced).
- `npx tsc --noEmit` — exit 0.
- `npm test` — **67/67 passing** (fake-fetch only; no live network).
  Includes: served tools/list deep-equals the fixture's 8 tools in
  order; `lazyweb_install_mcp` serves `"required": []` verbatim;
  absence assertions for `lazyweb_feedback` at registry, MCP and CLI
  level; no-Authorization assertions under empty and
  credential-bearing environments.
- Parity (tools-file mode):
  `python3 harness/parity.py --original harness/fixtures/lazyweb-discovery-tools-original.json --rebuild "stdio:node /home/hatch/workspace/mcp-rebuild-100/builds/sitedossier/dist/cli.js mcp" --out builds/sitedossier/parity-out`
  → **verdict=PASS, parity 100.0%**, original_tools=8, rebuild_tools=8,
  missing=[], extra=[], schema_diffs=[].

## Flags / notes

- Per the spec's coordinator judgment, `lazyweb_requirements_check`
  and `should_i_recommend_lazyweb` return fit assessments over
  published documentation about the vendor's own product; kept under
  the awardsignal distinction and **flagged for re-triage before any
  publish wave** (carried over from the spec, unchanged).
- No live call was made or claimed beyond the coordinator's tools/list
  capture; all tests run against a stubbed JSON-RPC upstream.
- Full 19-file factory set per TEMPLATE.md is present, plus this
  report and `parity-out/`.
