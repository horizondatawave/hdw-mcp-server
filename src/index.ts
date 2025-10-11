// src/index.ts - Smithery TypeScript runtime adapter
import { z } from "zod";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/**
 * Configuration schema for AnySite MCP server
 * Supports both ANYSITE_* naming conventions
 */
export const configSchema = z.object({
  ANYSITE_ACCESS_TOKEN: z.string().describe("AnySite API access token"),
  ANYSITE_ACCOUNT_ID: z.string().describe("AnySite account ID").optional(),
});

/**
 * Default export required by Smithery TypeScript runtime
 * Creates and configures the MCP server with environment variables
 */
export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  // Set environment variables from config
  if (config?.ANYSITE_ACCESS_TOKEN) {
    process.env.ANYSITE_ACCESS_TOKEN = config.ANYSITE_ACCESS_TOKEN;
  }
  if (config?.ANYSITE_ACCOUNT_ID) {
    process.env.ANYSITE_ACCOUNT_ID = config.ANYSITE_ACCOUNT_ID;
  }

  // Import and run the existing server implementation
  // The server.ts file will handle all tool registration and logic
  import("./server.js").then(() => {
    console.log("AnySite MCP server initialized");
  }).catch((error) => {
    console.error("Failed to initialize server:", error);
    throw error;
  });

  // Return a basic server instance for Smithery
  // The actual server is created in server.ts
  const server = new Server(
    {
      name: "anysite-mcp-server",
      version: "0.3.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  return server;
}
