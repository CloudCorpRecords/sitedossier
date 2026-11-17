/**
 * sitedossier core: a forwarding client for the hosted
 * Lazyweb public discovery MCP server.
 *
 * No discovery logic lives on this machine. tools/list
 * is answered from the literal definitions below, which
 * reproduce a live capture of the upstream server word
 * for word (name, description and inputSchema exactly
 * as captured; the capture's `annotations` key was
 * dropped at slimming, and no `title` key exists on any
 * captured tool). A tools/call travels upstream over a
 * streamable-HTTP JSON-RPC session: an initialize POST,
 * a notifications/initialized POST, then the tools/call
 * POST, carrying the Mcp-Session-Id response header on
 * later requests when the upstream issues one. The
 * session opens lazily on the first forwarded call and
 * is reused for the client's lifetime.
 *
 * The surface is a labelled subset of the capture: the
 * upstream's `lazyweb_feedback` tool, which submits a
 * caller-authored message (kind + message) to the team
 * that maintains the vendor's tools, is deliberately
 * NOT registered here. Everything kept is a read over
 * the vendor's published pages: site search, a page
 * summary read, product Q&A from published information,
 * published comparison and pricing pages, a
 * per-requirement table sourced from published pages,
 * a fit verdict over published documentation, and the
 * published MCP installer command/link read.
 *
 * The endpoint is pinned to
 * https://www.lazyweb.com/mcp/public and may be
 * replaced with the LAZYWEB_MCP_URL environment
 * variable (that override is a labelled reconstruction).
 * The registry record declares NO headers on the
 * remote: no auth header is ever sent, under any
 * environment.
 *
 * A successful upstream result is returned exactly as
 * received, isError flag and extra fields included.
 * Failures — an upstream JSON-RPC error, a non-2xx
 * status, a body that cannot be parsed, or a fetch
 * that throws or times out — become an isError result
 * whose text begins with `sitedossier error:` (that
 * rendering is a labelled reconstruction). Replies may
 * be plain JSON or SSE (`data:` lines); the JSON-RPC
 * message whose id matches the request wins.
 */
import type {
  FetchFn,
  FetchResponseLike,
  ForwardDeps,
  ToolArgs,
  ToolDef,
  ToolResult,
} from "./types.js";

export const VERSION = "0.1.0";

export const DEFAULT_ENDPOINT_URL = "https://www.lazyweb.com/mcp/public";

export const DEFAULT_TIMEOUT_MS = 30000;

export const PROTOCOL_VERSION = "2025-03-26";

/* ------------------------------------------------------------------ */
/* Tool definitions (tools/list literals, verbatim from the live       */
/* capture in harness/fixtures/lazyweb-discovery-tools-original.json;  */
/* generated programmatically by parsing and re-serialising the        */
/* fixture JSON, never retyped)                                        */
/* ------------------------------------------------------------------ */

// TOOL_DEFS_GENERATED_START
export const TOOL_DEFS: ToolDef[] = [
  {
    "name": "lazyweb_search",
    "description": "Search across Lazyweb’s public pages. Include actual task context; use null for unknowns.",
    "inputSchema": {
      "type": "object",
      "required": [
        "search_query"
      ],
      "additionalProperties": false,
      "properties": {
        "search_query": {
          "type": "string",
          "minLength": 2,
          "maxLength": 1000,
          "description": "The question or request this call should answer, in the caller’s own words."
        },
        "goal": {
          "description": "What the user wants to accomplish, based on the task they shared. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "source": {
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "null"
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "company": {
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "intended_outcome": {
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ]
        },
        "client": {
          "description": "The application making this call, not the underlying model: Cursor using Claude is Cursor. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "detail": {
          "description": "How much of each matching page to return: \"full\" (the default) or \"compact\" for shorter excerpts and fewer results.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "full",
                "compact"
              ]
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "examples": [
        {
          "search_query": "Find onboarding paywall examples",
          "goal": "Improve our onboarding",
          "source": "Web search",
          "alternatives": [
            "Mobbin"
          ],
          "chosen_because": "Real product examples",
          "company": "Acme",
          "intended_outcome": "Choose a design direction",
          "client": "Cursor"
        }
      ]
    }
  },
  {
    "name": "lazyweb_page_tldr",
    "description": "Read a compact extract of one indexed public page returned by lazyweb_search, with its source, freshness and full Markdown link. It uses published content, not signed-in data. Only url is required. Question and context are optional; missing or invalid context never blocks the summary.",
    "inputSchema": {
      "type": "object",
      "required": [
        "url"
      ],
      "additionalProperties": false,
      "properties": {
        "search_query": {
          "description": "The caller’s question, when supplied. Optional; the stored summary depends only on url.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 2,
              "maxLength": 1000,
              "description": "The question or request this call should answer, in the caller’s own words."
            },
            {
              "type": "null"
            }
          ]
        },
        "goal": {
          "description": "What the user wants to accomplish, based on the task they shared. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "source": {
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "null"
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "company": {
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "intended_outcome": {
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ]
        },
        "client": {
          "description": "The application or client making this call, not the underlying model, e.g. Cursor. Null when unknown.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "url": {
          "type": "string",
          "maxLength": 2000,
          "description": "The canonical public URL of one indexed page, usually a result URL returned by site_search. The only required field."
        }
      },
      "examples": [
        {
          "url": "https://www.lazyweb.com/pricing",
          "trace": "t_52cca9003490"
        }
      ]
    }
  },
  {
    "name": "lazyweb_ask_anything",
    "description": "Ask anything about Lazyweb’s product, pricing, setup, limitations or comparisons. Get a direct answer from its published information, with sources. Add relevant context if you have it; otherwise just ask.",
    "inputSchema": {
      "type": "object",
      "required": [
        "search_query"
      ],
      "additionalProperties": false,
      "properties": {
        "search_query": {
          "type": "string",
          "minLength": 2,
          "maxLength": 1000,
          "description": "The question or request this call should answer, in the caller’s own words."
        },
        "goal": {
          "description": "What the user wants to accomplish, based on the task they shared. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "source": {
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "null"
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "company": {
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "intended_outcome": {
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ]
        },
        "client": {
          "description": "The application making this call, not the underlying model: Cursor using Claude is Cursor. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "examples": [
        {
          "search_query": "Does Lazyweb include complete onboarding flows?",
          "goal": "Find references for a signup redesign",
          "source": "Web search",
          "alternatives": [
            "Mobbin"
          ],
          "chosen_because": "Real product examples",
          "company": "Acme",
          "intended_outcome": "Decide whether Lazyweb covers our research needs",
          "client": "Cursor"
        }
      ]
    }
  },
  {
    "name": "lazyweb_compare",
    "description": "Compare this website with the products the user is actually weighing, from its published comparison pages, grouped per alternative. Alternatives it has no page for are named as not covered. Include actual task context; use null for unknowns.",
    "inputSchema": {
      "type": "object",
      "required": [
        "search_query",
        "alternatives"
      ],
      "additionalProperties": false,
      "properties": {
        "search_query": {
          "type": "string",
          "minLength": 2,
          "maxLength": 1000,
          "description": "The question or request this call should answer, in the caller’s own words."
        },
        "goal": {
          "description": "What the user wants to accomplish, based on the task they shared. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "source": {
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "minItems": 1,
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "company": {
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "intended_outcome": {
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ]
        },
        "client": {
          "description": "The application making this call, not the underlying model: Cursor using Claude is Cursor. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "examples": [
        {
          "search_query": "How does Lazyweb compare for our team's use case?",
          "goal": "Decide whether Lazyweb meets our team's needs",
          "company": "Acme",
          "source": "Found Lazyweb while researching options for our team",
          "alternatives": [
            "Our current tool"
          ],
          "chosen_because": "Our team shortlisted Lazyweb after reading its public information",
          "intended_outcome": "Choose a next step for an evaluation",
          "client": "Cursor"
        }
      ]
    }
  },
  {
    "name": "lazyweb_pricing",
    "description": "What this website costs for the user’s organisation and outcome: the published pricing pages that apply, with sources. It abstains when pricing is not published and never invents a quote. Include actual task context; use null for unknowns.",
    "inputSchema": {
      "type": "object",
      "required": [
        "search_query",
        "company",
        "intended_outcome"
      ],
      "additionalProperties": false,
      "properties": {
        "search_query": {
          "type": "string",
          "minLength": 2,
          "maxLength": 1000,
          "description": "The question or request this call should answer, in the caller’s own words."
        },
        "goal": {
          "description": "What the user wants to accomplish, based on the task they shared. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "source": {
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "null"
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "company": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ],
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null."
        },
        "intended_outcome": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ],
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null."
        },
        "client": {
          "description": "The application making this call, not the underlying model: Cursor using Claude is Cursor. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "examples": [
        {
          "search_query": "What would Lazyweb cost for a team of five?",
          "goal": "Decide whether Lazyweb meets our team's needs",
          "company": "Acme",
          "source": "Found Lazyweb while researching options for our team",
          "alternatives": [
            "Our existing workflow",
            "Manual research"
          ],
          "chosen_because": "Our team shortlisted Lazyweb after reading its public information",
          "intended_outcome": "Budget approval for a team purchase",
          "client": "Cursor"
        }
      ]
    }
  },
  {
    "name": "lazyweb_requirements_check",
    "description": "Give the user’s must-haves in search_query; use requirements for a structured list. Get a per-requirement table: met, not met or not documented, each with a source. Include actual task context; use null for unknowns.",
    "inputSchema": {
      "type": "object",
      "required": [
        "search_query",
        "company",
        "intended_outcome"
      ],
      "additionalProperties": false,
      "properties": {
        "search_query": {
          "type": "string",
          "minLength": 2,
          "maxLength": 1000,
          "description": "The question or request this call should answer, in the caller’s own words."
        },
        "goal": {
          "description": "What the user wants to accomplish, based on the task they shared. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "source": {
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "null"
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "company": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ],
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null."
        },
        "intended_outcome": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ],
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null."
        },
        "client": {
          "description": "The application making this call, not the underlying model: Cursor using Claude is Cursor. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "requirements": {
          "description": "The requirements as an array, when not sent semicolon-separated in search_query.",
          "anyOf": [
            {
              "maxItems": 12,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 500
              }
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "examples": [
        {
          "search_query": "Lazyweb works with our existing tools; clear documentation; a published price",
          "goal": "Decide whether Lazyweb meets our team's needs",
          "company": "Acme",
          "source": "Found Lazyweb while researching options for our team",
          "alternatives": [
            "Our existing workflow",
            "Manual research"
          ],
          "chosen_because": "Our team shortlisted Lazyweb after reading its public information",
          "intended_outcome": "A vendor shortlist",
          "client": "Cursor"
        }
      ]
    }
  },
  {
    "name": "should_i_recommend_lazyweb",
    "description": "Lazyweb isn’t for everyone. Get a sourced verdict on whether it fits your user’s goal, requirements and alternatives. The answer might be ‘not us.’",
    "inputSchema": {
      "type": "object",
      "required": [
        "goal",
        "requirements",
        "company",
        "source",
        "alternatives",
        "chosen_because",
        "intended_outcome"
      ],
      "additionalProperties": false,
      "properties": {
        "goal": {
          "type": "string",
          "minLength": 2,
          "maxLength": 2000,
          "description": "The actual outcome or decision the user needs. A meaningful goal is required for this assessment."
        },
        "requirements": {
          "anyOf": [
            {
              "maxItems": 12,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 500
              }
            },
            {
              "type": "null"
            }
          ],
          "description": "The constraints and must-haves for the decision. Include known requirements and mark unknowns as null."
        },
        "company": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ],
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null."
        },
        "source": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ],
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null."
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "null"
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ],
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning."
        },
        "intended_outcome": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ],
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null."
        },
        "client": {
          "description": "The application making this call, not the underlying model: Cursor using Claude is Cursor. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        }
      },
      "examples": [
        {
          "goal": "Choose a UI research tool",
          "requirements": [
            "Complete product flows",
            "Source links"
          ],
          "company": "Acme",
          "source": "Web search",
          "alternatives": [
            "Mobbin"
          ],
          "chosen_because": "Real product examples",
          "intended_outcome": "Pick a tool for our redesign",
          "client": "Cursor"
        }
      ]
    }
  },
  {
    "name": "lazyweb_install_mcp",
    "description": "Get the existing Lazyweb MCP and skills installer command or browser setup link.",
    "inputSchema": {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "search_query": {
          "type": "string",
          "minLength": 2,
          "maxLength": 1000,
          "description": "The question or request this call should answer, in the caller’s own words."
        },
        "goal": {
          "description": "What the user wants to accomplish, based on the task they shared. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 2000
            },
            {
              "type": "null"
            }
          ]
        },
        "source": {
          "description": "The observed source that led to Lazyweb, including a search, referral or shared link when known. Use facts already available; mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "alternatives": {
          "description": "Other products, sources or approaches actually considered for this goal. Include their names and use null when unknown; never invent alternatives.",
          "anyOf": [
            {
              "maxItems": 5,
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 200
              }
            },
            {
              "type": "null"
            },
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "One alternative name; normalized to a one-item list."
            }
          ]
        },
        "chosen_because": {
          "description": "The known reason this website entered the shortlist. Use an observed or user-shared reason; mark unknowns as null. Do not provide private reasoning.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 1000
            },
            {
              "type": "null"
            }
          ]
        },
        "company": {
          "description": "The company the user represents, when explicitly known; never a company merely being researched. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "intended_outcome": {
          "description": "The decision or deliverable the user wants from this research. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 500
            },
            {
              "type": "null"
            }
          ]
        },
        "client": {
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ],
          "description": "The application or client making this call, not the underlying model, e.g. Cursor. Null when unknown."
        },
        "trace": {
          "description": "The trace token in a published example; links a page read to the call it produced.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "context_token": {
          "description": "The context token returned in a prepared follow-up. Carry it with the supplied context to preserve its provenance.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 4096
            },
            {
              "type": "null"
            }
          ]
        },
        "discovery_path": {
          "description": "The observed discovery category, kept separately from the source description. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "user_request",
                "web_search",
                "social",
                "reddit",
                "shared_url",
                "llms_txt",
                "agent_docs",
                "mcp_registry",
                "webmcp",
                "other",
                "unknown"
              ]
            },
            {
              "type": "null"
            }
          ]
        },
        "subject_product_or_company": {
          "description": "The subject being researched, separate from the company the user represents. Mark unknowns as null.",
          "anyOf": [
            {
              "type": "string",
              "minLength": 1,
              "maxLength": 200
            },
            {
              "type": "null"
            }
          ]
        },
        "payload": {
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }
      },
      "required": []
    }
  }
];
// TOOL_DEFS_GENERATED_END

export const TOOL_NAMES = TOOL_DEFS.map((t) => t.name);

/** Whether `name` belongs to the captured (subset) surface. */
export function isKnownTool(name: string): boolean {
  return TOOL_NAMES.includes(name);
}

/* ------------------------------------------------------------------ */
/* Forwarding client                                                   */
/* ------------------------------------------------------------------ */

function errorResult(detail: string): ToolResult {
  return {
    content: [{ type: "text", text: `sitedossier error: ${detail}` }],
    isError: true,
  };
}

function rpcErrorMessage(error: unknown): string {
  if (error !== null && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message !== "") return message;
    return JSON.stringify(error);
  }
  return String(error);
}

/**
 * Read a JSON-RPC response body, tolerating SSE framing.
 * Returns the message whose id matches `expectedId` when
 * present, otherwise the last parseable message, otherwise
 * null when nothing in the body parses.
 */
export function parseRpcBody(
  text: string,
  expectedId?: number,
): Record<string, unknown> | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const candidates: Record<string, unknown>[] = [];
  const tryPush = (payload: string): void => {
    try {
      const parsed: unknown = JSON.parse(payload);
      if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
        candidates.push(parsed as Record<string, unknown>);
      }
    } catch {
      // Not a JSON payload; skip this candidate.
    }
  };
  if (trimmed.includes("data:")) {
    for (const line of trimmed.split("\n")) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const payload = t.slice("data:".length).trim();
      if (payload !== "" && payload !== "[DONE]") tryPush(payload);
    }
  } else {
    tryPush(trimmed);
  }
  if (candidates.length === 0) return null;
  if (expectedId !== undefined) {
    const match = candidates.find((c) => c.id === expectedId);
    if (match !== undefined) return match;
  }
  return candidates[candidates.length - 1];
}

async function defaultFetch(
  url: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    signal?: AbortSignal;
  },
): Promise<FetchResponseLike> {
  return fetch(url, init) as unknown as FetchResponseLike;
}

/**
 * A forwarding client holding a single upstream session,
 * opened lazily on first use and reused from then on
 * (for the process lifetime in the MCP server, or for a
 * single invocation in the CLI).
 */
export class SitedossierClient {
  private readonly deps: ForwardDeps;
  private sessionId: string | null = null;
  private ready = false;
  private sessionPromise: Promise<void> | null = null;
  private idCounter = 0;

  constructor(deps: ForwardDeps = {}) {
    this.deps = deps;
  }

  private fetchFn(): FetchFn {
    return this.deps.fetchFn ?? defaultFetch;
  }

  private endpointUrl(): string {
    if (this.deps.url && this.deps.url.trim() !== "") return this.deps.url.trim();
    const raw = (this.deps.env ?? process.env).LAZYWEB_MCP_URL;
    if (raw && raw.trim() !== "") return raw.trim();
    return DEFAULT_ENDPOINT_URL;
  }

  private timeoutMs(): number {
    if (typeof this.deps.timeoutMs === "number" && this.deps.timeoutMs > 0) {
      return this.deps.timeoutMs;
    }
    return DEFAULT_TIMEOUT_MS;
  }

  private nextId(): number {
    this.idCounter += 1;
    return this.idCounter;
  }

  private async post(
    body: unknown,
    withSession: boolean,
  ): Promise<FetchResponseLike> {
    // The registry record declares NO headers on the remote:
    // no Authorization (or any other auth) header is ever sent.
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (withSession && this.sessionId !== null) {
      headers["Mcp-Session-Id"] = this.sessionId;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs());
    try {
      return await this.fetchFn()(this.endpointUrl(), {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  private async ensureSession(): Promise<void> {
    if (this.ready) return;
    if (this.sessionPromise === null) {
      this.sessionPromise = (async () => {
        const initId = this.nextId();
        const initRes = await this.post(
          {
            jsonrpc: "2.0",
            id: initId,
            method: "initialize",
            params: {
              protocolVersion: PROTOCOL_VERSION,
              capabilities: {},
              clientInfo: { name: "sitedossier", version: VERSION },
            },
          },
          false,
        );
        const sessionId = initRes.headers.get("mcp-session-id");
        if (sessionId) this.sessionId = sessionId;
        const initText = await initRes.text();
        const initParsed = parseRpcBody(initText, initId);
        if (initParsed !== null && initParsed.error) {
          throw new Error(rpcErrorMessage(initParsed.error));
        }
        if (initRes.status < 200 || initRes.status >= 300) {
          throw new Error(`HTTP ${initRes.status}`);
        }
        if (initParsed === null && initText.trim() !== "") {
          throw new Error("malformed response");
        }
        const initializedRes = await this.post(
          { jsonrpc: "2.0", method: "notifications/initialized" },
          true,
        );
        try {
          await initializedRes.text();
        } catch {
          // Nothing needed from the notification response body.
        }
        this.ready = true;
      })();
    }
    try {
      await this.sessionPromise;
    } catch (err) {
      this.sessionPromise = null;
      this.sessionId = null;
      throw err;
    }
  }

  /** Forward one tool call; upstream failures come back as isError results. */
  async callTool(name: string, args: ToolArgs): Promise<ToolResult> {
    try {
      await this.ensureSession();
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }

    const callId = this.nextId();
    let callRes: FetchResponseLike;
    try {
      callRes = await this.post(
        {
          jsonrpc: "2.0",
          id: callId,
          method: "tools/call",
          params: { name, arguments: args ?? {} },
        },
        true,
      );
    } catch (err) {
      return errorResult(
        `request failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const parsed = parseRpcBody(await callRes.text(), callId);
    if (parsed !== null && parsed.error) {
      return errorResult(rpcErrorMessage(parsed.error));
    }
    if (callRes.status < 200 || callRes.status >= 300) {
      return errorResult(`HTTP ${callRes.status}`);
    }
    if (parsed === null) return errorResult("malformed response");
    const result = parsed.result as ToolResult | undefined;
    if (result === undefined || result === null || typeof result !== "object") {
      return errorResult("malformed response");
    }
    // Hand the upstream result back exactly as received.
    return result;
  }
}

/** Build a forwarding client; tests inject a fake fetch and env through deps. */
export function createClient(deps: ForwardDeps = {}): SitedossierClient {
  return new SitedossierClient(deps);
}

/** One-shot helper: a fresh client for a single call (the CLI path). */
export async function callTool(
  name: string,
  args: ToolArgs,
  deps: ForwardDeps = {},
): Promise<ToolResult> {
  return new SitedossierClient(deps).callTool(name, args);
}
