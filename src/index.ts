// src/index.ts - Smithery TypeScript runtime adapter
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import https from "https";
import { Buffer } from "buffer";

/**
 * Configuration schema for AnySite MCP server
 */
export const configSchema = z.object({
  ANYSITE_ACCESS_TOKEN: z.string().describe("AnySite API access token"),
  ANYSITE_ACCOUNT_ID: z.string().describe("AnySite account ID (required for management operations)").optional(),
});

// API Configuration
let API_KEY: string;
let ACCOUNT_ID: string | undefined;

const API_CONFIG = {
  BASE_URL: "https://api.anysite.io",
  ENDPOINTS: {
    SEARCH_USERS: "/api/linkedin/search/users",
    USER_PROFILE: "/api/linkedin/user",
    LINKEDIN_EMAIL: "/api/linkedin/email",
    LINKEDIN_USER_POSTS: "/api/linkedin/user/posts",
    GOOGLE_SEARCH: "/api/google/search",
    INSTAGRAM_USER: "/api/instagram/user",
  }
};

// Logging function
const log = (...args: any[]) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}]`, ...args);
};

const formatError = (error: any): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

// HTTP Request function
const makeRequest = (endpoint: string, data: any, method: string = "POST"): Promise<any> => {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_CONFIG.BASE_URL);
    const postData = JSON.stringify(data);

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
        "access-token": API_KEY,
        ...(ACCOUNT_ID && { "x-account-id": ACCOUNT_ID })
      }
    };

    const req = https.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`API error ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Default export required by Smithery TypeScript runtime
 */
export default function createServer({ config }: { config: z.infer<typeof configSchema> }) {
  // Set environment variables and global API credentials
  if (config?.ANYSITE_ACCESS_TOKEN) {
    process.env.ANYSITE_ACCESS_TOKEN = config.ANYSITE_ACCESS_TOKEN;
    API_KEY = config.ANYSITE_ACCESS_TOKEN;
  }
  if (config?.ANYSITE_ACCOUNT_ID) {
    process.env.ANYSITE_ACCOUNT_ID = config.ANYSITE_ACCOUNT_ID;
    ACCOUNT_ID = config.ANYSITE_ACCOUNT_ID;
  }

  if (!API_KEY) {
    throw new Error("ANYSITE_ACCESS_TOKEN is required");
  }

  log("Initializing AnySite MCP Server with Smithery runtime");

  // Create MCP server
  const server = new McpServer({
    name: "anysite-mcp-server",
    version: "0.3.0"
  });

  // Register search_linkedin_users tool
  server.tool(
    "search_linkedin_users",
    "Search for LinkedIn users with various filters",
    {
      keywords: z.string().optional().describe("Search keywords"),
      first_name: z.string().optional().describe("First name"),
      last_name: z.string().optional().describe("Last name"),
      title: z.string().optional().describe("Job title"),
      company_keywords: z.string().optional().describe("Company keywords"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ keywords, first_name, last_name, title, company_keywords, count, timeout }) => {
      const requestData: any = { timeout, count };
      if (keywords) requestData.keywords = keywords;
      if (first_name) requestData.first_name = first_name;
      if (last_name) requestData.last_name = last_name;
      if (title) requestData.title = title;
      if (company_keywords) requestData.company_keywords = company_keywords;

      log("Starting LinkedIn users search with:", JSON.stringify(requestData));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.SEARCH_USERS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      } catch (error) {
        log("LinkedIn search error:", error);
        return {
          content: [
            {
              type: "text",
              text: `LinkedIn search API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Register get_linkedin_profile tool
  server.tool(
    "get_linkedin_profile",
    "Get detailed information about a LinkedIn user profile",
    {
      user: z.string().describe("User alias, URL, or URN"),
      with_experience: z.boolean().default(true).describe("Include experience info"),
      with_education: z.boolean().default(true).describe("Include education info"),
      with_skills: z.boolean().default(true).describe("Include skills info")
    },
    async ({ user, with_experience, with_education, with_skills }) => {
      const requestData = { timeout: 300, user, with_experience, with_education, with_skills };
      log("Starting LinkedIn profile lookup for:", user);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, requestData);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      } catch (error) {
        log("LinkedIn profile lookup error:", error);
        return {
          content: [
            {
              type: "text",
              text: `LinkedIn API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Register google_search tool
  server.tool(
    "google_search",
    "Perform Google search",
    {
      query: z.string().describe("Search query"),
      count: z.number().default(10).describe("Max results (1-20)"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ query, count, timeout }) => {
      const requestData = {
        timeout,
        query,
        count: Math.min(Math.max(1, count), 20)
      };
      log(`Starting Google search for: ${query}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.GOOGLE_SEARCH, requestData);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      } catch (error) {
        log("Google search error:", error);
        return {
          content: [
            {
              type: "text",
              text: `Google search API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  // Register get_instagram_user tool
  server.tool(
    "get_instagram_user",
    "Get Instagram user information",
    {
      user: z.string().describe("User ID, alias or URL"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, timeout }) => {
      const requestData = { timeout, user };
      log("Starting Instagram user lookup for:", user);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER, requestData);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      } catch (error) {
        log("Instagram user lookup error:", error);
        return {
          content: [
            {
              type: "text",
              text: `Instagram user API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }
  );

  log("AnySite MCP Server initialized with", 4, "tools (partial implementation)");
  log("Note: Full 27-tool implementation available via STDIO mode (npm install @anysite/mcp)");

  return server;
}
