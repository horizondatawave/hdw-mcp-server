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
    LINKEDIN_EMAIL: "/api/linkedin/email/user",
    LINKEDIN_USER_POSTS: "/api/linkedin/user/posts",
    LINKEDIN_USER_REACTIONS: "/api/linkedin/user/reactions",
    LINKEDIN_USER_COMMENTS: "/api/linkedin/user/comments",
    LINKEDIN_SEARCH_POSTS: "/api/linkedin/search/posts",
    REDDIT_SEARCH_POSTS: "/api/reddit/search/posts",
    CHAT_MESSAGES: "/api/linkedin/management/chat/messages",
    CHAT_MESSAGE: "/api/linkedin/management/chat/message",
    USER_CONNECTION: "/api/linkedin/management/user/connection",
    POST_COMMENT: "/api/linkedin/management/post/comment",
    USER_CONNECTIONS: "/api/linkedin/management/user/connections",
    LINKEDIN_POST_REPOSTS: "/api/linkedin/post/reposts",
    LINKEDIN_POST_COMMENTS: "/api/linkedin/post/comments",
    LINKEDIN_POST_REACTIONS: "/api/linkedin/post/reactions",
    LINKEDIN_GOOGLE_COMPANY: "/api/linkedin/google/company",
    LINKEDIN_COMPANY: "/api/linkedin/company",
    LINKEDIN_COMPANY_EMPLOYEES: "/api/linkedin/company/employees",
    LINKEDIN_COMPANY_POSTS: "/api/linkedin/company/posts",
    LINKEDIN_POST: "/api/linkedin/management/post",
    LINKEDIN_SN_SEARCH_USERS: "/api/linkedin/sn_search/users",
    CONVERSATIONS: "/api/linkedin/management/conversations",
    GOOGLE_SEARCH: "/api/google/search",
    INSTAGRAM_USER: "/api/instagram/user",
    INSTAGRAM_USER_POSTS: "/api/instagram/user/posts",
    INSTAGRAM_POST_COMMENTS: "/api/instagram/post/comments"
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

// URN validation and normalization
const normalizeUserURN = (urn: string): string => {
  if (!urn.includes("fsd_profile:")) {
    return `fsd_profile:${urn}`;
  }
  return urn;
};

const isValidUserURN = (urn: string): boolean => {
  return urn.startsWith("fsd_profile:");
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

  // LinkedIn user tools
  server.tool(
    "get_linkedin_email_user",
    "Get LinkedIn user details by email",
    {
      email: z.string().describe("Email address"),
      count: z.number().default(5).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ email, count, timeout }) => {
      const requestData = { timeout, email, count };
      log("Starting LinkedIn email lookup for:", email);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_EMAIL, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn email lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn email API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_posts",
    "Get LinkedIn posts for a user by URN (must include prefix, example: fsd_profile:ACoAAEWn01Q...)",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      count: z.number().default(10).describe("Max posts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      log("Starting LinkedIn user posts lookup for urn:", normalizedURN);
      const requestData = { timeout, urn: normalizedURN, count };
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_POSTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user posts lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_reactions",
    "Get LinkedIn reactions for a user by URN",
    {
      urn: z.string().describe("User URN (must include prefix, example: fsd_profile:ACoAA...)"),
      count: z.number().default(10).describe("Max reactions"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      log("Starting LinkedIn user reactions lookup for urn:", normalizedURN);
      const requestData = { timeout, urn: normalizedURN, count };
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_REACTIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user reactions lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user reactions API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_comments",
    "Get LinkedIn comments for a user by URN",
    {
      urn: z.string().describe("User URN (must include prefix)"),
      count: z.number().default(10).describe("Max comments"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      commented_after: z.number().optional().describe("Filter comments after timestamp")
    },
    async ({ urn, count, timeout, commented_after }) => {
      const normalizedURN = normalizeUserURN(urn);
      if (!isValidUserURN(normalizedURN)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      log("Starting LinkedIn user comments lookup for urn:", normalizedURN);
      const requestData: any = { timeout, urn: normalizedURN, count };
      if (commented_after !== undefined) {
        requestData.commented_after = commented_after;
      }
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_COMMENTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user comments lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user comments API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn post tools
  server.tool(
    "search_linkedin_posts",
    "Search LinkedIn posts with keywords and filters",
    {
      keywords: z.string().describe("Search keywords"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      sort: z.string().optional().describe("Sort order"),
      date_posted: z.string().optional().describe("Date filter")
    },
    async ({ keywords, count, timeout, sort, date_posted }) => {
      const requestData: any = { timeout, keywords, count };
      if (sort) requestData.sort = sort;
      if (date_posted) requestData.date_posted = date_posted;
      log("Starting LinkedIn posts search with:", JSON.stringify(requestData));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SEARCH_POSTS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn search posts error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn search posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_post_comments",
    "Get LinkedIn post comments",
    {
      urn: z.string().describe("Post URN"),
      count: z.number().default(10).describe("Max comments"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      sort: z.string().default("relevance").describe("Sort order")
    },
    async ({ urn, count, timeout, sort }) => {
      const requestData = { timeout, urn, sort, count };
      log(`Starting LinkedIn post comments lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_COMMENTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post comments lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post comments API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_post_reactions",
    "Get LinkedIn post reactions",
    {
      urn: z.string().describe("Post URN"),
      count: z.number().default(50).describe("Max reactions"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const requestData = { timeout, urn, count };
      log(`Starting LinkedIn post reactions lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_REACTIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post reactions lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post reactions API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_post_reposts",
    "Get LinkedIn post reposts",
    {
      urn: z.string().describe("Post URN"),
      count: z.number().default(10).describe("Max reposts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const requestData = { timeout, urn, count };
      log(`Starting LinkedIn post reposts lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_REPOSTS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post reposts lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post reposts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn company tools
  server.tool(
    "get_linkedin_company",
    "Get LinkedIn company information",
    {
      company: z.string().describe("Company alias, URL or URN"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ company, timeout }) => {
      const requestData = { timeout, company };
      log(`Starting LinkedIn company lookup for: ${company}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn company lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn company API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_company_employees",
    "Get LinkedIn company employees",
    {
      companies: z.array(z.string()).describe("Company URNs or aliases"),
      keywords: z.string().optional().describe("Search keywords"),
      first_name: z.string().optional().describe("First name filter"),
      last_name: z.string().optional().describe("Last name filter"),
      count: z.number().default(10).describe("Max employees"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ companies, keywords, first_name, last_name, count, timeout }) => {
      const requestData: any = { timeout, companies, count };
      if (keywords) requestData.keywords = keywords;
      if (first_name) requestData.first_name = first_name;
      if (last_name) requestData.last_name = last_name;
      log(`Starting LinkedIn company employees lookup for companies: ${companies.join(', ')}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_EMPLOYEES, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn company employees lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn company employees API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_company_posts",
    "Get LinkedIn company posts",
    {
      urn: z.string().describe("Company URN (example: company:11130470)"),
      count: z.number().default(10).describe("Max posts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ urn, count, timeout }) => {
      const requestData = { timeout, urn, count };
      log(`Starting LinkedIn company posts lookup for: ${urn}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_POSTS, requestData);
        log(`Company posts lookup complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn company posts lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn company posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_google_company",
    "Search company via Google",
    {
      keywords: z.array(z.string()).describe("Company search keywords"),
      with_urn: z.boolean().default(false).describe("Include LinkedIn URN"),
      count_per_keyword: z.number().default(1).describe("Results per keyword"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ keywords, with_urn, count_per_keyword, timeout }) => {
      const requestData = { timeout, keywords, with_urn, count_per_keyword };
      log(`Starting LinkedIn Google company search for keywords: ${keywords.join(', ')}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_GOOGLE_COMPANY, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn Google company search error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn Google company search API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // Instagram tools
  server.tool(
    "get_instagram_user_posts",
    "Get Instagram user posts",
    {
      user: z.string().describe("User ID, alias or URL"),
      count: z.number().describe("Max posts"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, count, timeout }) => {
      const requestData = { timeout, user, count };
      log(`Starting Instagram user posts lookup for: ${user}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_USER_POSTS, requestData);
        log(`Posts lookup complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Instagram user posts lookup error:", error);
        return {
          content: [{ type: "text", text: `Instagram user posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_instagram_post_comments",
    "Get Instagram post comments",
    {
      post: z.string().describe("Post ID"),
      count: z.number().describe("Max comments"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ post, count, timeout }) => {
      const requestData = { timeout, post, count };
      log(`Starting Instagram post comments lookup for: ${post}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.INSTAGRAM_POST_COMMENTS, requestData);
        log(`Comments lookup complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Instagram post comments lookup error:", error);
        return {
          content: [{ type: "text", text: `Instagram post comments API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // Reddit search
  server.tool(
    "search_reddit_posts",
    "Search Reddit posts",
    {
      query: z.string().describe("Search query"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      sort: z.string().default("relevance").describe("Sort order"),
      time_filter: z.string().default("all").describe("Time filter")
    },
    async ({ query, count, timeout, sort, time_filter }) => {
      const requestData = { timeout, query, sort, time_filter, count };
      log("Starting Reddit posts search with:", JSON.stringify(requestData));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.REDDIT_SEARCH_POSTS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("Reddit search posts error:", error);
        return {
          content: [{ type: "text", text: `Reddit search posts API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn management tools (require ACCOUNT_ID)
  server.tool(
    "get_linkedin_chat_messages",
    "Get LinkedIn chat messages (requires ACCOUNT_ID)",
    {
      user: z.string().describe("User URN (must include prefix)"),
      company: z.string().optional().describe("Company URN"),
      count: z.number().default(20).describe("Max messages"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, company, count, timeout }) => {
      const normalizedUser = normalizeUserURN(user);
      if (!isValidUserURN(normalizedUser)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      const requestData: any = { timeout, user: normalizedUser, count, account_id: ACCOUNT_ID };
      if (company) requestData.company = company;
      log("Starting LinkedIn chat messages lookup for user:", normalizedUser);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGES, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn chat messages lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn chat messages API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_chat_message",
    "Send LinkedIn chat message (requires ACCOUNT_ID)",
    {
      user: z.string().describe("Recipient user URN (must include prefix)"),
      company: z.string().optional().describe("Company URN"),
      text: z.string().describe("Message text"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, company, text, timeout }) => {
      const normalizedUser = normalizeUserURN(user);
      if (!isValidUserURN(normalizedUser)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      const requestData: any = { timeout, user: normalizedUser, text, account_id: ACCOUNT_ID };
      if (company) requestData.company = company;
      log("Starting LinkedIn send chat message for user:", normalizedUser);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGE, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn send chat message error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn send chat message API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_connection_request",
    "Send LinkedIn connection request (requires ACCOUNT_ID)",
    {
      user: z.string().describe("User URN (must include prefix)"),
      text: z.string().optional().describe("Optional message"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ user, text, timeout }) => {
      const normalizedUser = normalizeUserURN(user);
      if (!isValidUserURN(normalizedUser)) {
        return {
          content: [{ type: "text", text: "Invalid URN format. Must start with 'fsd_profile:'" }],
          isError: true
        };
      }
      const requestData: any = { timeout, user: normalizedUser, account_id: ACCOUNT_ID };
      if (text) requestData.text = text;
      log("Sending LinkedIn connection request to user:", normalizedUser);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTION, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn connection request error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn connection request API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_post_comment",
    "Comment on LinkedIn post (requires ACCOUNT_ID)",
    {
      post: z.string().describe("Post URN (activity: or comment:)"),
      text: z.string().describe("Comment text"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ post, text, timeout }) => {
      const isActivityOrComment = post.includes("activity:") || post.includes("comment:");
      if (!isActivityOrComment) {
        return {
          content: [{ type: "text", text: "URN must be for an activity or comment" }],
          isError: true
        };
      }
      let urnObj;
      if (post.startsWith("activity:")) {
        urnObj = { type: "activity", value: post.replace("activity:", "") };
      } else if (post.startsWith("comment:")) {
        urnObj = { type: "comment", value: post.replace("comment:", "") };
      } else {
        urnObj = post;
      }
      const requestData = { timeout, text, urn: urnObj, account_id: ACCOUNT_ID };
      log(`Creating LinkedIn comment on ${post}`);
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.POST_COMMENT, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn comment creation error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn comment API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "send_linkedin_post",
    "Create LinkedIn post (requires ACCOUNT_ID)",
    {
      text: z.string().describe("Post text"),
      visibility: z.string().default("ANYONE").describe("Post visibility"),
      comment_scope: z.string().default("ALL").describe("Comment scope"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ text, visibility, comment_scope, timeout }) => {
      const requestData = { text, visibility, comment_scope, timeout, account_id: ACCOUNT_ID };
      log("Creating LinkedIn post with text:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn post creation error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn post creation API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_user_connections",
    "Get user's LinkedIn connections (requires ACCOUNT_ID)",
    {
      connected_after: z.number().optional().describe("Filter connections after timestamp"),
      count: z.number().default(20).describe("Max connections"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ connected_after, count, timeout }) => {
      const requestData: any = { timeout, account_id: ACCOUNT_ID, count };
      if (connected_after != null) {
        requestData.connected_after = connected_after;
      }
      log("Starting LinkedIn user connections lookup");
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn user connections lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn user connections API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  server.tool(
    "get_linkedin_conversations",
    "Get LinkedIn conversations (requires ACCOUNT_ID)",
    {
      company: z.string().optional().describe("Company URN"),
      connected_after: z.number().optional().describe("Filter after timestamp"),
      count: z.number().default(20).describe("Max conversations"),
      timeout: z.number().default(300).describe("Timeout in seconds")
    },
    async ({ company, connected_after, count, timeout }) => {
      const requestData: any = { timeout, account_id: ACCOUNT_ID, count };
      if (company) requestData.company = company;
      if (connected_after != null) {
        requestData.connected_after = connected_after;
      }
      log("Starting LinkedIn conversations lookup");
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.CONVERSATIONS, requestData);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn conversations lookup error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn conversations API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  // LinkedIn Sales Navigator
  server.tool(
    "linkedin_sales_navigator_search_users",
    "Advanced LinkedIn Sales Navigator user search",
    {
      keywords: z.string().optional().describe("Search keywords"),
      count: z.number().default(10).describe("Max results"),
      timeout: z.number().default(300).describe("Timeout in seconds"),
      first_names: z.array(z.string()).optional().describe("First names"),
      last_names: z.array(z.string()).optional().describe("Last names"),
      current_titles: z.array(z.string()).optional().describe("Current job titles")
    },
    async ({ keywords, count, timeout, first_names, last_names, current_titles }) => {
      const requestData: any = { count, timeout };
      if (keywords) requestData.keywords = keywords;
      if (first_names) requestData.first_names = first_names;
      if (last_names) requestData.last_names = last_names;
      if (current_titles) requestData.current_titles = current_titles;
      log("Starting LinkedIn Sales Navigator users search with filters");
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SN_SEARCH_USERS, requestData);
        log(`Search complete, found ${response.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(response, null, 2) }]
        };
      } catch (error) {
        log("LinkedIn Sales Navigator search error:", error);
        return {
          content: [{ type: "text", text: `LinkedIn Sales Navigator search API error: ${formatError(error)}` }],
          isError: true
        };
      }
    }
  );

  log("AnySite MCP Server initialized with 27 tools");
  log("Management tools (chat, connections, posting) require ACCOUNT_ID");

  return server;
}
