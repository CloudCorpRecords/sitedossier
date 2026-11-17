# sitedossier

Research a vendor's public site without scraping it yourself or guessing at prices. sitedossier is a small forwarding client for the hosted Lazyweb public discovery MCP service: the tool list is served from your own machine using the captured definitions, and each call is sent upstream keyless, with the service's answer returned exactly as it arrived.

Eight of the service's nine captured tools are exposed. You can search across the vendor's public pages, read a compact extract of one indexed page, ask questions answered from published information with sources, pull published comparison and pricing pages, check your must-haves requirement by requirement against published pages, get a sourced fit verdict, and read the published MCP installer command. The ninth captured tool, `lazyweb_feedback`, is deliberately left out: it submits a caller-authored message to the team that maintains the vendor's tools, and this rebuild sends nothing on anyone's behalf.

## The tools

- **`lazyweb_search`** — Search across Lazyweb's public pages. Requires `search_query`; optional context fields (goal, source, alternatives, company, intended outcome and more) can be supplied or set to null.
- **`lazyweb_page_tldr`** — A compact extract of one indexed public page returned by search, with its source, freshness and full Markdown link. Requires `url` only.
- **`lazyweb_ask_anything`** — Ask anything about the product, pricing, setup, limitations or comparisons and get a direct answer from published information, with sources. Requires `search_query`.
- **`lazyweb_compare`** — Compare the site with the products you are actually weighing, from its published comparison pages, grouped per alternative. Requires `search_query` and `alternatives`.
- **`lazyweb_pricing`** — The published pricing pages that apply to your organisation and outcome, with sources. It abstains when pricing is not published and never invents a quote. Requires `search_query`, `company` and `intended_outcome`.
- **`lazyweb_requirements_check`** — A per-requirement table — met, not met or not documented — each row with a source. Requires `search_query`, `company` and `intended_outcome`; a structured `requirements` list is optional.
- **`should_i_recommend_lazyweb`** — A sourced verdict on whether the product fits your user's goal, requirements and alternatives; the answer might be "not us". Requires `goal`, `requirements`, `company`, `source`, `alternatives`, `chosen_because` and `intended_outcome`.
- **`lazyweb_install_mcp`** — The existing Lazyweb MCP and skills installer command or browser setup link. No required fields.

## Install and run

As an MCP server via npm:

```bash
npx -y @reneturcios/sitedossier mcp
```

MCP client configuration:

```json
{
  "mcpServers": {
    "sitedossier": {
      "command": "npx",
      "args": ["-y", "@reneturcios/sitedossier", "mcp"]
    }
  }
}
```

As a container:

```bash
docker run -i ghcr.io/cloudcorprecords/sitedossier
docker run --rm ghcr.io/cloudcorprecords/sitedossier lazyweb_search '{"search_query":"Find onboarding paywall examples"}'
```

## CLI

A single binary covers both the command line and the MCP server. Every tool is a subcommand whose one argument is a JSON string of that tool's inputs:

```bash
sitedossier lazyweb_search '{"search_query":"Find onboarding paywall examples"}'
sitedossier lazyweb_page_tldr '{"url":"https://www.lazyweb.com/pricing"}'
sitedossier lazyweb_pricing '{"search_query":"What would it cost for a team of five?","company":"Acme","intended_outcome":"Budget approval"}'
sitedossier lazyweb_install_mcp '{}'
sitedossier --version
```

Exit codes: `0` for a successful forwarded call, `1` when the result that comes back is an error, and `2` for usage mistakes like an unknown subcommand or a JSON argument that does not parse. `lazyweb_feedback` is not a subcommand and exits `2` like any other unknown name.

## Configuration

- `LAZYWEB_MCP_URL` — Replaces the upstream endpoint. Defaults to the pinned hosted endpoint, `https://www.lazyweb.com/mcp/public`. (This override variable is a reconstruction introduced by this rebuild.)

The Lazyweb discovery registry record lists no headers for its remote, so sitedossier never attaches an authentication header — every call goes upstream keyless.

When the upstream cannot answer — it returns a JSON-RPC error, answers with a non-2xx status, sends a body that cannot be read, or the request itself fails — the caller receives an error result whose text begins with `sitedossier error:`.

## How forwarding works

The first call of a process opens a session against the upstream: an `initialize` request (protocol version `2025-03-26`), a `notifications/initialized` notification, and then the `tools/call`. If the service issues an `Mcp-Session-Id` header during initialize, sitedossier repeats it on subsequent requests and keeps reusing that one session until the process ends. Replies are understood in both plain JSON and server-sent-events framing. Successful results are passed through untouched, `isError` flag and any extra fields included.

## Development

```bash
npm install
npm run build   # tsc -> dist/ (dist/cli.js is the bin)
npm test        # tsx --test test/*.test.ts — stubbed upstream, no network
npm run dev     # run the CLI from source
```

The suite compares the served tool list against the captured surface tool for tool, asserts the omitted `lazyweb_feedback` tool is absent at the registry, MCP and CLI levels, walks the session handshake and its reuse, proves no `Authorization` header is sent under any environment, and confirms that arguments travel upstream unchanged and results return unchanged.

## License

MIT — see `LICENSE`. Copyright (c) 2026 Rene Turcios.
