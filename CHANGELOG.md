# Changelog

## 0.1.0 (2026-10-28)

- First release: a forwarding client for the hosted Lazyweb public discovery MCP server. The eight captured tools of the labelled subset are answered locally for tools/list, and every tools/call is forwarded upstream over a streamable-HTTP JSON-RPC session (initialize, notifications/initialized, tools/call, honouring the Mcp-Session-Id header when the upstream issues one).
- Tools: `lazyweb_search`, `lazyweb_page_tldr`, `lazyweb_ask_anything`, `lazyweb_compare`, `lazyweb_pricing`, `lazyweb_requirements_check`, `should_i_recommend_lazyweb`, `lazyweb_install_mcp` (the last carries `required: []`, served verbatim). The captured `lazyweb_feedback` tool is deliberately omitted: it submits a caller-authored message to the team that maintains the vendor's tools, which this rebuild does not do.
- Upstream results pass through verbatim, including the isError flag; upstream failures surface as `sitedossier error:` text results.
- One bin serves the CLI (one subcommand per tool, plus `--version`) and the stdio MCP server (`mcp` subcommand). The upstream endpoint can be overridden via `LAZYWEB_MCP_URL`. The registry record declares no headers on the remote, so no auth header is ever sent.
