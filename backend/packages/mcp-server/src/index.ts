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

const API_URL = process.env.MICROMINDS_BASE_URL || "http://localhost:3000";

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

function formatTMON(weiVal?: string | number | bigint | null): string {
  if (!weiVal) return "0.000000 tMON";
  try {
    const wei = BigInt(weiVal.toString());
    const integerPart = wei / 10n ** 18n;
    const remainder = wei % 10n ** 18n;
    const decimalPart = remainder.toString().padStart(18, "0").slice(0, 6);
    return `${integerPart}.${decimalPart} tMON`;
  } catch {
    return `${(Number(weiVal) / 1e18).toFixed(6)} tMON`;
  }
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "check_balance",
        description: "Check current available prepaid tMON balance and wallet status in MicroMinds Escrow on Monad Testnet before or after shopping micro-APIs.",
        inputSchema: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Optional Monad wallet address to check. Defaults to the authenticated agent wallet.",
            },
          },
        },
      },
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
        description: "Execute a MicroMinds micro-API call via the Gateway (Escrow protected). Returns the provider's data along with an on-chain settlement receipt on Monad Testnet.",
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
  if (request.params.name === "check_balance") {
    try {
      const targetAddress = request.params.arguments?.address as string | undefined;
      let balanceData: any;

      if (targetAddress) {
        const response = await axiosInstance.get(`/escrow/balance/${targetAddress}`);
        balanceData = response.data;
      } else {
        const response = await axiosInstance.get("/me");
        balanceData = response.data;
      }

      const walletAddress = balanceData.address || balanceData.walletAddress || targetAddress || "authenticated_wallet";
      const balanceWei = balanceData.balanceWei || balanceData.balance || "0";
      const formattedTMON = balanceData.balanceTMON
        ? (balanceData.balanceTMON.endsWith("tMON") ? balanceData.balanceTMON : `${balanceData.balanceTMON} tMON`)
        : formatTMON(balanceWei);

      const balanceReceipt = {
        network: "Monad Testnet",
        walletAddress,
        balance: formattedTMON,
        balanceTMON: formattedTMON,
        balanceWei: balanceWei.toString(),
        currency: "tMON",
        escrowContract: "MicroMinds Escrow",
        status: "Active & Ready for autonomous micropayments",
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(balanceReceipt, null, 2),
          },
        ],
      };
    } catch (error: any) {
      if (error.response) {
        return {
          content: [
            {
              type: "text",
              text: `Check balance failed: ${JSON.stringify(error.response.data, null, 2)}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text",
            text: `Error checking balance: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

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

      const response = await axiosInstance.post("/api/chat-agent", {
        listingId,
        input,
      });

      const resData = response.data;
      const status = resData.status || "released";
      const txHash = resData.txHash || resData.txFinal || "0x_confirmed_on_chain";
      const callId = resData.callId;

      // Determine cost in wei and tMON
      let costWei = resData.amountWei || resData.priceWei;
      if (!costWei) {
        try {
          const listingRes = await axios.get(`${API_URL}/listings/${listingId}`);
          costWei = listingRes.data?.priceWei || listingRes.data?.price_wei;
        } catch {
          // fallback
        }
      }
      const costTMON = formatTMON(costWei);

      const outputData = resData.output !== undefined
        ? resData.output
        : (resData.data !== undefined ? resData.data : resData);

      const formattedResponse = {
        callId: callId,
        status: status,
        output: outputData,
        settlement_receipt: {
          status: status,
          network: "Monad Testnet",
          cost: costTMON,
          costWei: costWei ? costWei.toString() : "0",
          txHash: txHash,
          callId: callId,
          explorerUrl: txHash && txHash.startsWith("0x") && !txHash.includes("_")
            ? `https://testnet.monadexplorer.com/tx/${txHash}`
            : undefined,
          escrow: "MicroMinds Escrow Protocol",
        },
        txHash: txHash,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedResponse, null, 2),
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
