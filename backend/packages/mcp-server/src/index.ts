#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

const API_KEY = process.env.MICROMINDS_API_KEY;
if (!API_KEY) {
  console.error("MICROMINDS_API_KEY environment variable is required");
  process.exit(1);
}

const API_URL = process.env.MICROMINDS_BASE_URL || "http://localhost:3001";

const server = new Server(
  {
    name: "microminds-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "x-api-key": API_KEY,
  },
});

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_api",
        description: "Search for available MicroMinds micro-APIs. Use this to find listingIds, schemas, and prices.",
        inputSchema: {
          type: "object",
          properties: {
            q: {
              type: "string",
              description: "Optional search query to match listing name or description",
            },
            maxPrice: {
              type: "string",
              description: "Optional maximum price in wei",
            },
          },
        },
      },
      {
        name: "call_api",
        description: "Execute a MicroMinds micro-API call via the Gateway (Escrow protected). Returns the provider's data.",
        inputSchema: {
          type: "object",
          properties: {
            listingId: {
              type: "string",
              description: "The UUID of the micro-API listing to call",
            },
            input: {
              type: "object",
              description: "The JSON input data required by the micro-API (check schema_input)",
            },
          },
          required: ["listingId", "input"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  if (request.params.name === "search_api") {
    try {
      const q = request.params.arguments?.q as string | undefined;
      const maxPrice = request.params.arguments?.maxPrice as string | undefined;

      const response = await axios.get(`${API_URL}/listings`, {
        params: { q, maxPrice },
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error searching APIs: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "call_api") {
    try {
      const listingId = request.params.arguments?.listingId as string;
      const input = request.params.arguments?.input as object;

      if (!listingId || !input) {
        throw new McpError(ErrorCode.InvalidParams, "listingId and input are required");
      }

      const response = await axiosInstance.post("/call", {
        listingId,
        input,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      if (error.response) {
        return {
          content: [
            {
              type: "text",
              text: `API Call failed: ${JSON.stringify(error.response.data, null, 2)}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Error executing API call: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MicroMinds MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
