#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  Tool
} from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import https from "https";
import { Buffer } from "buffer";
import {
  LinkedinSearchUsersArgs,
  LinkedinUserProfileArgs,
  LinkedinEmailUserArgs,
  LinkedinUserPostsArgs,
  LinkedinUserReactionsArgs,
  LinkedinChatMessagesArgs,
  SendLinkedinChatMessageArgs,
  SendLinkedinConnectionArgs,
  SendLinkedinPostCommentArgs,
  GetLinkedinUserConnectionsArgs,
  GetLinkedinPostRepostsArgs,
  GetLinkedinPostCommentsArgs,
  GetLinkedinGoogleCompanyArgs,
  GetLinkedinCompanyArgs,
  GetLinkedinCompanyEmployeesArgs,
  SendLinkedinPostArgs,
  LinkedinSalesNavigatorSearchUsersArgs,
  LinkedinManagementConversationsPayload,
  GoogleSearchPayload,
  isValidLinkedinSearchUsersArgs,
  isValidLinkedinUserProfileArgs,
  isValidLinkedinEmailUserArgs,
  isValidLinkedinUserPostsArgs,
  isValidLinkedinUserReactionsArgs,
  isValidLinkedinChatMessagesArgs,
  isValidSendLinkedinChatMessageArgs,
  isValidSendLinkedinConnectionArgs,
  isValidSendLinkedinPostCommentArgs,
  isValidGetLinkedinUserConnectionsArgs,
  isValidGetLinkedinPostRepostsArgs,
  isValidGetLinkedinPostCommentsArgs,
  isValidGetLinkedinGoogleCompanyArgs,
  isValidGetLinkedinCompanyArgs,
  isValidGetLinkedinCompanyEmployeesArgs,
  isValidSendLinkedinPostArgs,
  isValidLinkedinSalesNavigatorSearchUsersArgs,
  isValidLinkedinManagementConversationsArgs,
  isValidGoogleSearchPayload
} from "./types.js";

dotenv.config();

const API_KEY = process.env.HDW_ACCESS_TOKEN;
const ACCOUNT_ID = process.env.HDW_ACCOUNT_ID;

if (!API_KEY) {
  throw new Error("HDW_ACCESS_TOKEN environment variable is required");
}
if (!ACCOUNT_ID) {
  throw new Error("HDW_ACCOUNT_ID environment variable is required for chat endpoints");
}

const API_CONFIG = {
  BASE_URL: "https://api.horizondatawave.ai",
  DEFAULT_QUERY: "software engineer",
  ENDPOINTS: {
    SEARCH_USERS: "/api/linkedin/search/users",
    USER_PROFILE: "/api/linkedin/user",
    USER_EXPERIENCE: "/api/linkedin/user/experience",
    USER_EDUCATION: "/api/linkedin/user/education",
    USER_SKILLS: "/api/linkedin/user/skills",
    LINKEDIN_EMAIL: "/api/linkedin/email/user",
    LINKEDIN_USER_POSTS: "/api/linkedin/user/posts",
    LINKEDIN_USER_REACTIONS: "/api/linkedin/user/reactions",
    CHAT_MESSAGES: "/api/linkedin/management/chat/messages",
    CHAT_MESSAGE: "/api/linkedin/management/chat/message",
    USER_CONNECTION: "/api/linkedin/management/user/connection",
    USER_CONNECTIONS: "/api/linkedin/management/user/connections",
    POST_COMMENT: "/api/linkedin/management/post/comment",
    LINKEDIN_POST: "/api/linkedin/management/post",
    LINKEDIN_POST_REPOSTS: "/api/linkedin/post/reposts",
    LINKEDIN_POST_COMMENTS: "/api/linkedin/post/comments",
    LINKEDIN_GOOGLE_COMPANY: "/api/linkedin/google/company",
    LINKEDIN_COMPANY: "/api/linkedin/company",
    LINKEDIN_COMPANY_EMPLOYEES: "/api/linkedin/company/employees",
    LINKEDIN_SN_SEARCH_USERS: "/api/linkedin/sn_search/users",
    CONVERSATIONS: "/api/linkedin/management/conversations",
    GOOGLE_SEARCH: "/api/google/search",
  }
} as const;

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function log(message: string, ...args: any[]) {
  console.error(`[${new Date().toISOString()}] ${message}`, ...args);
}

async function makeGetRequestWithBody(url: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const bodyString = JSON.stringify(data);
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "access-token": API_KEY!,
        "Content-Length": Buffer.byteLength(bodyString, "utf-8").toString()
      }
    };
    log(`Making GET request to ${url} with body: ${bodyString}`);
    const req = https.request(url, options, (res) => {
      let rawData = "";
      res.on("data", (chunk) => { rawData += chunk; });
      res.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("error", (e) => reject(e));
    req.write(bodyString);
    req.end();
  });
}

async function makeRequest(endpoint: string, data: any, method: string = "POST"): Promise<any> {
  if (method === "GET" && (endpoint === API_CONFIG.ENDPOINTS.CHAT_MESSAGES ||
                           endpoint === API_CONFIG.ENDPOINTS.USER_CONNECTIONS ||
                           endpoint === API_CONFIG.ENDPOINTS.CONVERSATIONS)) {
    const url = API_CONFIG.BASE_URL.replace(/\/+$/, "") + endpoint;
    return await makeGetRequestWithBody(url, data);
  } else {
    const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, "");
    const url = baseUrl + (endpoint.startsWith("/") ? endpoint : `/${endpoint}`);
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("access-token", API_KEY!);
    const options: RequestInit = {
      method,
      headers,
      body: JSON.stringify(data)
    };
    log(`Making ${method} request to ${endpoint} with data: ${JSON.stringify(data)}`);
    const startTime = Date.now();
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} ${errorData.message || response.statusText}`);
      }
      const result = await response.json();
      log(`API request to ${endpoint} completed in ${Date.now() - startTime}ms`);
      return result;
    } catch (error) {
      log(`API request to ${endpoint} failed after ${Date.now() - startTime}ms:`, error);
      throw error;
    }
  }
}

function normalizeUserURN(urn: string): string {
  if (!urn.includes(":")) {
    log(`Warning: URN format might be missing a prefix. Adding "fsd_profile:" to: ${urn}`);
    return `fsd_profile:${urn}`;
  }
  return urn;
}

function isValidUserURN(urn: string): boolean {
  return urn.startsWith("fsd_profile:");
}

const SEARCH_LINKEDIN_USERS_TOOL: Tool = {
  name: "search_linkedin_users",
  description: "Search for LinkedIn users with various filters like keywords, name, title, company, location etc.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: { type: "string", description: "Any keyword for searching in the user page." },
      first_name: { type: "string", description: "Exact first name" },
      last_name: { type: "string", description: "Exact last name" },
      title: { type: "string", description: "Exact word in the title" },
      company_keywords: { type: "string", description: "Exact word in the company name" },
      school_keywords: { type: "string", description: "Exact word in the school name" },
      current_company: { type: "string", description: "Company URN or name" },
      past_company: { type: "string", description: "Past company URN or name" },
      location: { type: "string", description: "Location name or URN" },
      industry: { type: "string", description: "Industry URN or name" },
      education: { type: "string", description: "Education URN or name" },
      count: { type: "number", description: "Maximum number of results (max 1000)", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["count"]
  }
};

const GET_LINKEDIN_PROFILE_TOOL: Tool = {
  name: "get_linkedin_profile",
  description: "Get detailed information about a LinkedIn user profile",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User alias, URL, or URN" },
      with_experience: { type: "boolean", description: "Include experience info", default: true },
      with_education: { type: "boolean", description: "Include education info", default: true },
      with_skills: { type: "boolean", description: "Include skills info", default: true }
    },
    required: ["user"]
  }
};

const GET_LINKEDIN_EMAIL_TOOL: Tool = {
  name: "get_linkedin_email_user",
  description: "Get LinkedIn user details by email",
  inputSchema: {
    type: "object",
    properties: {
      email: { type: "string", description: "Email address" },
      count: { type: "number", description: "Max results", default: 5 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["email"]
  }
};

const GET_LINKEDIN_USER_POSTS_TOOL: Tool = {
  name: "get_linkedin_user_posts",
  description: "Get LinkedIn posts for a user by URN (must include prefix, example: fsd_profile:ACoAAEWn01QBWENVMWqyM3BHfa1A-xsvxjdaXsY)",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "User URN (must include prefix, example: fsd_profile:ACoAA...)" },
      count: { type: "number", description: "Max posts", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn"]
  }
};

const GET_LINKEDIN_USER_REACTIONS_TOOL: Tool = {
  name: "get_linkedin_user_reactions",
  description: "Get LinkedIn reactions for a user by URN (must include prefix, example: fsd_profile:ACoAA...)",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "User URN (must include prefix, example: fsd_profile:ACoAA...)" },
      count: { type: "number", description: "Max reactions", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn"]
  }
};

const GET_CHAT_MESSAGES_TOOL: Tool = {
  name: "get_linkedin_chat_messages",
  description: "Get top chat messages from LinkedIn management API. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "User URN for filtering messages (must include prefix, e.g. fsd_profile:ACoAA...)" },
      count: { type: "number", description: "Max messages to return", default: 20 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["user"]
  }
};

const SEND_CHAT_MESSAGE_TOOL: Tool = {
  name: "send_linkedin_chat_message",
  description: "Send a chat message via LinkedIn management API. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "Recipient user URN (must include prefix, e.g. fsd_profile:ACoAA...)" },
      text: { type: "string", description: "Message text" },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["user", "text"]
  }
};

const SEND_CONNECTION_REQUEST_TOOL: Tool = {
  name: "send_linkedin_connection",
  description: "Send a connection invitation to LinkedIn user. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      user: { type: "string", description: "Recipient user URN (must include prefix, e.g. fsd_profile:ACoAA...)" },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["user"]
  }
};

const POST_COMMENT_TOOL: Tool = {
  name: "send_linkedin_post_comment",
  description: "Create a comment on a LinkedIn post or on another comment. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Comment text" },
      urn: {
        type: "string",
        description: "URN of the activity or comment to comment on (e.g., 'activity:123' or 'comment:(activity:123,456)')"
      },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["text", "urn"]
  }
};

const SEND_LINKEDIN_POST_TOOL: Tool = {
  name: "send_linkedin_post",
  description: "Create a post on LinkedIn. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string", description: "Post text content" },
      visibility: {
        type: "string",
        description: "Post visibility",
        enum: ["ANYONE", "CONNECTIONS_ONLY"],
        default: "ANYONE"
      },
      comment_scope: {
        type: "string",
        description: "Who can comment on the post",
        enum: ["ALL", "CONNECTIONS_ONLY", "NONE"],
        default: "ALL"
      },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["text"]
  }
};

const GET_USER_CONNECTIONS_TOOL: Tool = {
  name: "get_linkedin_user_connections",
  description: "Get list of LinkedIn user connections. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      connected_after: { type: "number", description: "Filter users that added after the specified date (timestamp)" },
      count: { type: "number", description: "Max connections to return", default: 20 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: []
  }
};

const GET_LINKEDIN_POST_REPOSTS_TOOL: Tool = {
  name: "get_linkedin_post_reposts",
  description: "Get LinkedIn reposts for a post by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "Post URN, only activity urn type is allowed (example: activity:7234173400267538433)" },
      count: { type: "number", description: "Max reposts to return", default: 50 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn", "count"]
  }
};

const GET_LINKEDIN_POST_COMMENTS_TOOL: Tool = {
  name: "get_linkedin_post_comments",
  description: "Get LinkedIn comments for a post by URN",
  inputSchema: {
    type: "object",
    properties: {
      urn: { type: "string", description: "Post URN, only activity urn type is allowed (example: activity:7234173400267538433)" },
      sort: { type: "string", description: "Sort type (relevance or recent)", enum: ["relevance", "recent"], default: "relevance" },
      count: { type: "number", description: "Max comments to return", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["urn", "count"]
  }
};

const GET_LINKEDIN_GOOGLE_COMPANY_TOOL: Tool = {
  name: "get_linkedin_google_company",
  description: "Search for LinkedIn companies using Google search. First result is usually the best match.",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "Company keywords for search. For example, company name or company website",
        examples: [["Software as a Service (SaaS)"], ["google.com"]]
      },
      with_urn: { type: "boolean", description: "Include URNs in response (increases execution time)", default: false },
      count_per_keyword: { type: "number", description: "Max results per keyword", default: 1, minimum: 1, maximum: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["keywords"]
  }
};

const GET_LINKEDIN_COMPANY_TOOL: Tool = {
  name: "get_linkedin_company",
  description: "Get detailed information about a LinkedIn company",
  inputSchema: {
    type: "object",
    properties: {
      company: { type: "string", description: "Company Alias or URL or URN (example: 'openai' or 'company:1441')" },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["company"]
  }
};

const GET_LINKEDIN_COMPANY_EMPLOYEES_TOOL: Tool = {
  name: "get_linkedin_company_employees",
  description: "Get employees of a LinkedIn company",
  inputSchema: {
    type: "object",
    properties: {
      companies: {
        type: "array",
        items: { type: "string" },
        description: "Company URNs (example: ['company:14064608'])"
      },
      keywords: { type: "string", description: "Any keyword for searching employees", examples: ["Alex"] },
      first_name: { type: "string", description: "Search for exact first name", examples: ["Bill"] },
      last_name: { type: "string", description: "Search for exact last name", examples: ["Gates"] },
      count: { type: "number", description: "Maximum number of results", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: ["companies", "count"]
  }
};

const LINKEDIN_SN_SEARCH_USERS_TOOL: Tool = {
  name: "linkedin_sn_search_users",
  description: "Advanced search for LinkedIn users using Sales Navigator filters",
  inputSchema: {
    type: "object",
    properties: {
      keywords: {
        type: "string",
        description: "Any keyword for searching in the user profile. Using this may reduce result count."
      },
      first_names: {
        type: "array",
        items: { type: "string" },
        description: "Exact first names to search for"
      },
      last_names: {
        type: "array",
        items: { type: "string" },
        description: "Exact last names to search for"
      },
      current_titles: {
        type: "array",
        items: { type: "string" },
        description: "Exact words to search in current titles"
      },
      location: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Location URN (geo:*) or name, or array of them"
      },
      education: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Education URN (company:*) or name, or array of them"
      },
      languages: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Arabic", "English", "Spanish", "Portuguese", "Chinese",
            "French", "Italian", "Russian", "German", "Dutch",
            "Turkish", "Tagalog", "Polish", "Korean", "Japanese",
            "Malay", "Norwegian", "Danish", "Romanian", "Swedish",
            "Bahasa Indonesia", "Czech"
          ]
        },
        description: "Profile languages"
      },
      past_titles: {
        type: "array",
        items: { type: "string" },
        description: "Exact words to search in past titles"
      },
      functions: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Accounting", "Administrative", "Arts and Design", "Business", "Development",
            "Community and Social Services", "Consulting", "Education", "Engineering",
            "Entrepreneurship", "Finance", "Healthcare Services", "Human Resources",
            "Information Technology", "Legal", "Marketing", "Media and Communication",
            "Military and Protective Services", "Operations", "Product Management",
            "Program and Project Management", "Purchasing", "Quality Assurance",
            "Research", "Real Estate", "Sales", "Customer Success and Support"
          ]
        },
        description: "Job functions"
      },
      levels: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Entry", "Director", "Owner", "CXO", "Vice President",
            "Experienced Manager", "Entry Manager", "Strategic", "Senior", "Trainy"
          ]
        },
        description: "Job seniority levels"
      },
      years_in_the_current_company: {
        type: "array",
        items: {
          type: "string",
          enum: ["0-1", "1-2", "3-5", "6-10", "10+"]
        },
        description: "Years in current company ranges"
      },
      years_in_the_current_position: {
        type: "array",
        items: {
          type: "string",
          enum: ["0-1", "1-2", "3-5", "6-10", "10+"]
        },
        description: "Years in current position ranges"
      },
      company_sizes: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Self-employed", "1-10", "11-50", "51-200", "201-500",
            "501-1,000", "1,001-5,000", "5,001-10,000", "10,001+"
          ]
        },
        description: "Company size ranges"
      },
      company_types: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "Public Company", "Privately Held", "Non Profit",
            "Educational Institution", "Partnership", "Self Employed",
            "Self Owned", "Government Agency"
          ]
        },
        description: "Company types"
      },
      company_locations: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Company location URN (geo:*) or name, or array of them"
      },
      current_companies: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Current company URN (company:*) or name, or array of them"
      },
      past_companies: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Past company URN (company:*) or name, or array of them"
      },
      industry: {
        type: ["string", "array"],
        items: { type: "string" },
        description: "Industry URN (industry:*) or name, or array of them"
      },
      count: {
        type: "number",
        description: "Maximum number of results (max 2500)",
        default: 10,
        minimum: 1,
        maximum: 2500
      },
      timeout: {
        type: "number",
        description: "Timeout in seconds (20-1500)",
        default: 300,
        minimum: 20,
        maximum: 1500
      }
    },
    required: ["count"]
  }
};

const GET_LINKEDIN_CONVERSATIONS_TOOL: Tool = {
  name: "get_linkedin_conversations",
  description: "Get list of LinkedIn conversations from the messaging interface. Account ID is taken from environment.",
  inputSchema: {
    type: "object",
    properties: {
      connected_after: { type: "number", description: "Filter conversations created after the specified date (timestamp)" },
      count: { type: "number", description: "Max conversations to return", default: 20 },
      timeout: { type: "number", description: "Timeout in seconds", default: 300 }
    },
    required: []
  }
};

const GOOGLE_SEARCH_TOOL: Tool = {
  name: "google_search",
  description: "Search for information using Google search API",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query. For example: 'python fastapi'" },
      count: { type: "number", description: "Maximum number of results (from 1 to 20)", default: 10 },
      timeout: { type: "number", description: "Timeout in seconds (20-1500)", default: 300 }
    },
    required: ["query"]
  }
};

const server = new Server(
  { name: "hdw-mcp", version: "0.1.0" },
  {
    capabilities: {
      resources: { supportedTypes: ["application/json", "text/plain"] },
      tools: { linkedin: { description: "LinkedIn data access functionality" } }
    }
  }
);

server.onerror = (error) => {
  log("MCP Server Error:", error);
};

server.onclose = () => {
  log("MCP Server Connection Closed");
};

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: `linkedin://users/${encodeURIComponent(API_CONFIG.DEFAULT_QUERY)}`,
      name: `LinkedIn users for "${API_CONFIG.DEFAULT_QUERY}"`,
      mimeType: "application/json",
      description: "LinkedIn user search results including name, headline, and location"
    }
  ]
}));


server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    SEARCH_LINKEDIN_USERS_TOOL,
    GET_LINKEDIN_PROFILE_TOOL,
    GET_LINKEDIN_EMAIL_TOOL,
    GET_LINKEDIN_USER_POSTS_TOOL,
    GET_LINKEDIN_USER_REACTIONS_TOOL,
    GET_CHAT_MESSAGES_TOOL,
    SEND_CHAT_MESSAGE_TOOL,
    SEND_CONNECTION_REQUEST_TOOL,
    POST_COMMENT_TOOL,
    GET_USER_CONNECTIONS_TOOL,
    GET_LINKEDIN_POST_REPOSTS_TOOL,
    GET_LINKEDIN_POST_COMMENTS_TOOL,
    GET_LINKEDIN_GOOGLE_COMPANY_TOOL,
    GET_LINKEDIN_COMPANY_TOOL,
    GET_LINKEDIN_COMPANY_EMPLOYEES_TOOL,
    SEND_LINKEDIN_POST_TOOL,
    LINKEDIN_SN_SEARCH_USERS_TOOL,
    GET_LINKEDIN_CONVERSATIONS_TOOL,
    GOOGLE_SEARCH_TOOL
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) throw new Error("No arguments provided");

    switch (name) {
      case "search_linkedin_users": {
        if (!isValidLinkedinSearchUsersArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn search arguments");
        }
        const {
          keywords, first_name, last_name, title, company_keywords,
          school_keywords, current_company, past_company, location,
          industry, education, count = 10, timeout = 300
        } = args as LinkedinSearchUsersArgs;
        const requestData: any = { timeout, count };
        if (keywords) requestData.keywords = keywords;
        if (first_name) requestData.first_name = first_name;
        if (last_name) requestData.last_name = last_name;
        if (title) requestData.title = title;
        if (company_keywords) requestData.company_keywords = company_keywords;
        if (school_keywords) requestData.school_keywords = school_keywords;
        if (current_company) {
          requestData.current_company =
            typeof current_company === "string" && current_company.includes("company:")
              ? [{ type: "company", value: current_company.replace("company:", "") }]
              : current_company;
        }
        if (past_company) {
          requestData.past_company =
            typeof past_company === "string" && past_company.includes("company:")
              ? [{ type: "company", value: past_company.replace("company:", "") }]
              : past_company;
        }
        if (location) {
          requestData.location =
            typeof location === "string" && location.includes("geo:")
              ? [{ type: "geo", value: location.replace("geo:", "") }]
              : location;
        }
        if (industry) {
          requestData.industry =
            typeof industry === "string" && industry.includes("industry:")
              ? [{ type: "industry", value: industry.replace("industry:", "") }]
              : industry;
        }
        if (education) {
          requestData.education =
            typeof education === "string" && education.includes("fsd_company:")
              ? [{ type: "fsd_company", value: education.replace("fsd_company:", "") }]
              : education;
        }
        log("Starting LinkedIn users search with:", JSON.stringify(requestData));
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.SEARCH_USERS, requestData);
          log(`Search complete, found ${response.length} results`);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
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
                mimeType: "text/plain",
                text: `LinkedIn search API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_profile": {
        if (!isValidLinkedinUserProfileArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn profile arguments");
        }
        const { user, with_experience = true, with_education = true, with_skills = true } = args as LinkedinUserProfileArgs;
        const requestData = { timeout: 300, user, with_experience, with_education, with_skills };
        log("Starting LinkedIn profile lookup for:", user);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_PROFILE, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
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
                mimeType: "text/plain",
                text: `LinkedIn API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_email_user": {
        if (!isValidLinkedinEmailUserArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid email parameter");
        }
        const { email, count = 5, timeout = 300 } = args as LinkedinEmailUserArgs;
        const requestData = { timeout, email, count };
        log("Starting LinkedIn email lookup for:", email);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_EMAIL, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn email lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn email API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_user_posts": {
        if (!isValidLinkedinUserPostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid user posts arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as LinkedinUserPostsArgs;
        const normalizedURN = normalizeUserURN(urn);
        if (!isValidUserURN(normalizedURN)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        log("Starting LinkedIn user posts lookup for urn:", normalizedURN);
        const requestData = { timeout, urn: normalizedURN, count };
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_POSTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn user posts lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn user posts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_user_reactions": {
        if (!isValidLinkedinUserReactionsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid user reactions arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as LinkedinUserReactionsArgs;
        const normalizedURN = normalizeUserURN(urn);
        if (!isValidUserURN(normalizedURN)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        log("Starting LinkedIn user reactions lookup for urn:", normalizedURN);
        const requestData = { timeout, urn: normalizedURN, count };
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_USER_REACTIONS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn user reactions lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn user reactions API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_chat_messages": {
        if (!isValidLinkedinChatMessagesArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid chat messages arguments");
        }
        const { user, count = 20, timeout = 300 } = args as LinkedinChatMessagesArgs;
        const normalizedUser = normalizeUserURN(user);
        if (!isValidUserURN(normalizedUser)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        const requestData = { timeout, user: normalizedUser, count, account_id: ACCOUNT_ID };
        log("Starting LinkedIn chat messages lookup for user:", normalizedUser);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGES, requestData, "GET");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn chat messages lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn chat messages API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_chat_message": {
        if (!isValidSendLinkedinChatMessageArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for sending chat message");
        }
        const { user, text, timeout = 300 } = args as SendLinkedinChatMessageArgs;
        const normalizedUser = normalizeUserURN(user);
        if (!isValidUserURN(normalizedUser)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        const requestData = { timeout, user: normalizedUser, text, account_id: ACCOUNT_ID };
        log("Starting LinkedIn send chat message for user:", normalizedUser);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.CHAT_MESSAGE, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn send chat message error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn send chat message API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_connection": {
        if (!isValidSendLinkedinConnectionArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for connection request");
        }
        const { user, timeout = 300 } = args as SendLinkedinConnectionArgs;
        const normalizedUser = normalizeUserURN(user);
        if (!isValidUserURN(normalizedUser)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid URN format. Must start with 'fsd_profile:'");
        }
        const requestData = { timeout, user: normalizedUser, account_id: ACCOUNT_ID };
        log("Sending LinkedIn connection request to user:", normalizedUser);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTION, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn connection request error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn connection request API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_post_comment": {
        if (!isValidSendLinkedinPostCommentArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for commenting on a post");
        }
        const { text, urn, timeout = 300 } = args as SendLinkedinPostCommentArgs;
        const isActivityOrComment = urn.includes("activity:") || urn.includes("comment:");
        if (!isActivityOrComment) {
          throw new McpError(ErrorCode.InvalidParams, "URN must be for an activity or comment");
        }
        let urnObj;
        if (urn.startsWith("activity:")) {
          urnObj = { type: "activity", value: urn.replace("activity:", "") };
        } else if (urn.startsWith("comment:")) {
          urnObj = { type: "comment", value: urn.replace("comment:", "") };
        } else {
          urnObj = urn;
        }
        const requestData = {
          timeout,
          text,
          urn: urnObj,
          account_id: ACCOUNT_ID
        };
        log(`Creating LinkedIn comment on ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.POST_COMMENT, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn comment creation error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn comment API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "send_linkedin_post": {
        if (!isValidSendLinkedinPostArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid parameters for creating a LinkedIn post");
        }
        const {
          text,
          visibility = "ANYONE",
          comment_scope = "ALL",
          timeout = 300
        } = args as SendLinkedinPostArgs;

        const requestData = {
          text,
          visibility,
          comment_scope,
          timeout,
          account_id: ACCOUNT_ID
        };

        log("Creating LinkedIn post with text:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST, requestData, "POST");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn post creation error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn post creation API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_user_connections": {
        if (!isValidGetLinkedinUserConnectionsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid user connections arguments");
        }
        const { connected_after, count = 20, timeout = 300 } = args as GetLinkedinUserConnectionsArgs;
        const requestData: {
          timeout: number;
          account_id: string;
          connected_after?: number;
          count?: number;
        } = {
          timeout: Number(timeout),
          account_id: ACCOUNT_ID!
        };
        if (connected_after != null) {
          requestData.connected_after = Number(connected_after);
        }
        if (count != null) {
          requestData.count = Number(count);
        }
        log("Starting LinkedIn user connections lookup");
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.USER_CONNECTIONS, requestData, "GET");
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn user connections lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn user connections API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_post_reposts": {
        if (!isValidGetLinkedinPostRepostsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid post reposts arguments");
        }
        const { urn, count = 10, timeout = 300 } = args as GetLinkedinPostRepostsArgs;
        const requestData = {
          timeout: Number(timeout),
          urn,
          count: Number(count)
        };
        log(`Starting LinkedIn post reposts lookup for: ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_REPOSTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn post reposts lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn post reposts API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_post_comments": {
        if (!isValidGetLinkedinPostCommentsArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid post comments arguments");
        }
        const { urn, sort = "relevance", count = 10, timeout = 300 } = args as GetLinkedinPostCommentsArgs;
        const requestData = {
          timeout: Number(timeout),
          urn,
          sort,
          count: Number(count)
        };
        log(`Starting LinkedIn post comments lookup for: ${urn}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_POST_COMMENTS, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn post comments lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn post comments API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_google_company": {
        if (!isValidGetLinkedinGoogleCompanyArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid Google company search arguments");
        }
        const { keywords, with_urn = false, count_per_keyword = 1, timeout = 300 } = args as GetLinkedinGoogleCompanyArgs;
        const requestData = {
          timeout: Number(timeout),
          keywords,
          with_urn: Boolean(with_urn),
          count_per_keyword: Number(count_per_keyword)
        };
        log(`Starting LinkedIn Google company search for keywords: ${keywords.join(', ')}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_GOOGLE_COMPANY, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn Google company search error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn Google company search API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_company": {
        if (!isValidGetLinkedinCompanyArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid company arguments");
        }
        const { company, timeout = 300 } = args as GetLinkedinCompanyArgs;
        const requestData = {
          timeout: Number(timeout),
          company
        };
        log(`Starting LinkedIn company lookup for: ${company}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn company lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn company API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "get_linkedin_company_employees": {
        if (!isValidGetLinkedinCompanyEmployeesArgs(args)) {
          throw new McpError(ErrorCode.InvalidParams, "Invalid company employees arguments");
        }
        const { companies, keywords, first_name, last_name, count = 10, timeout = 300 } = args as GetLinkedinCompanyEmployeesArgs;
        const requestData: {
          timeout: number;
          companies: string[];
          keywords?: string;
          first_name?: string;
          last_name?: string;
          count: number;
        } = {
          timeout: Number(timeout),
          companies,
          count: Number(count)
        };
        if (keywords != null && typeof keywords === 'string') {
          requestData.keywords = keywords;
        }
        if (first_name != null && typeof first_name === 'string') {
          requestData.first_name = first_name;
        }
        if (last_name != null && typeof last_name === 'string') {
          requestData.last_name = last_name;
        }
        log(`Starting LinkedIn company employees lookup for companies: ${companies.join(', ')}`);
        try {
          const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_COMPANY_EMPLOYEES, requestData);
          return {
            content: [
              {
                type: "text",
                mimeType: "application/json",
                text: JSON.stringify(response, null, 2)
              }
            ]
          };
        } catch (error) {
          log("LinkedIn company employees lookup error:", error);
          return {
            content: [
              {
                type: "text",
                mimeType: "text/plain",
                text: `LinkedIn company employees API error: ${formatError(error)}`
              }
            ],
            isError: true
          };
        }
      }

      case "linkedin_sn_search_users": {
  if (!isValidLinkedinSalesNavigatorSearchUsersArgs(args)) {
    throw new McpError(ErrorCode.InvalidParams, "Invalid LinkedIn Sales Navigator search arguments");
  }

  const {
    keywords,
    first_names,
    last_names,
    current_titles,
    location,
    education,
    languages,
    past_titles,
    functions,
    levels,
    years_in_the_current_company,
    years_in_the_current_position,
    company_sizes,
    company_types,
    company_locations,
    current_companies,
    past_companies,
    industry,
    count,
    timeout = 300
  } = args as LinkedinSalesNavigatorSearchUsersArgs;

  const requestData: Record<string, any> = {
    count,
    timeout
  };

  if (keywords) requestData.keywords = keywords;
  if (first_names) requestData.first_names = first_names;
  if (last_names) requestData.last_names = last_names;
  if (current_titles) requestData.current_titles = current_titles;

  if (location) {
    requestData.location = typeof location === "string" && location.includes("geo:")
      ? [{ type: "geo", value: location.replace("geo:", "") }]
      : location;
  }

  if (education) {
    requestData.education = typeof education === "string" && education.includes("company:")
      ? [{ type: "company", value: education.replace("company:", "") }]
      : education;
  }

  if (languages) requestData.languages = languages;
  if (past_titles) requestData.past_titles = past_titles;
  if (functions) requestData.functions = functions;
  if (levels) requestData.levels = levels;
  if (years_in_the_current_company) requestData.years_in_the_current_company = years_in_the_current_company;
  if (years_in_the_current_position) requestData.years_in_the_current_position = years_in_the_current_position;
  if (company_sizes) requestData.company_sizes = company_sizes;
  if (company_types) requestData.company_types = company_types;

  if (company_locations) {
    requestData.company_locations = typeof company_locations === "string" && company_locations.includes("geo:")
      ? [{ type: "geo", value: company_locations.replace("geo:", "") }]
      : company_locations;
  }

  if (current_companies) {
    requestData.current_companies = typeof current_companies === "string" && current_companies.includes("company:")
      ? [{ type: "company", value: current_companies.replace("company:", "") }]
      : current_companies;
  }

  if (past_companies) {
    requestData.past_companies = typeof past_companies === "string" && past_companies.includes("company:")
      ? [{ type: "company", value: past_companies.replace("company:", "") }]
      : past_companies;
  }

  if (industry) {
    requestData.industry = typeof industry === "string" && industry.includes("industry:")
      ? [{ type: "industry", value: industry.replace("industry:", "") }]
      : industry;
  }

  log("Starting LinkedIn Sales Navigator users search with filters");
  try {
    const response = await makeRequest(API_CONFIG.ENDPOINTS.LINKEDIN_SN_SEARCH_USERS, requestData);
    log(`Search complete, found ${response.length} results`);
    return {
      content: [
        {
          type: "text",
          mimeType: "application/json",
          text: JSON.stringify(response, null, 2)
        }
      ]
    };
  } catch (error) {
    log("LinkedIn Sales Navigator search error:", error);
    return {
      content: [
        {
          type: "text",
          mimeType: "text/plain",
          text: `LinkedIn Sales Navigator search API error: ${formatError(error)}`
        }
      ],
      isError: true
    };
  }
}



      case "get_linkedin_conversations": {
      if (!isValidLinkedinManagementConversationsArgs(args)) {
        throw new McpError(ErrorCode.InvalidParams, "Invalid conversations arguments");
      }
      const { connected_after, count = 20, timeout = 300 } = args as LinkedinManagementConversationsPayload;
      const requestData: {
        timeout: number;
        account_id: string;
        connected_after?: number;
        count?: number;
      } = {
        timeout: Number(timeout),
        account_id: ACCOUNT_ID!
      };
      if (connected_after != null) {
        requestData.connected_after = Number(connected_after);
      }
      if (count != null) {
        requestData.count = Number(count);
      }
      log("Starting LinkedIn conversations lookup");
      try {
        const response = await makeRequest(API_CONFIG.ENDPOINTS.CONVERSATIONS, requestData, "GET");
        return {
          content: [
            {
              type: "text",
              mimeType: "application/json",
              text: JSON.stringify(response, null, 2)
            }
          ]
        };
      } catch (error) {
        log("LinkedIn conversations lookup error:", error);
        return {
          content: [
            {
              type: "text",
              mimeType: "text/plain",
              text: `LinkedIn conversations API error: ${formatError(error)}`
            }
          ],
          isError: true
        };
      }
    }

      case "google_search": {
          if (!isValidGoogleSearchPayload(args)) {
            throw new McpError(ErrorCode.InvalidParams, "Invalid Google search arguments");
          }
          const { query, count = 10, timeout = 300 } = args as GoogleSearchPayload;
          const requestData = {
            timeout,
            query,
            count: Math.min(Math.max(1, count), 20) // Ensure count is between 1 and 20
          };
          log(`Starting Google search for: ${query}`);
          try {
            const response = await makeRequest(API_CONFIG.ENDPOINTS.GOOGLE_SEARCH, requestData);
            return {
              content: [
                {
                  type: "text",
                  mimeType: "application/json",
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
                  mimeType: "text/plain",
                  text: `Google search API error: ${formatError(error)}`
                }
              ],
              isError: true
            };
          }
          }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    log("Tool error:", error);
    return {
      content: [
        {
          type: "text",
          mimeType: "text/plain",
          text: `API error: ${formatError(error)}`
        }
      ],
      isError: true
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  log("Starting HDW MCP Server...");

  process.on("uncaughtException", (error) => {
    log("Uncaught Exception:", error);
  });
  process.on("unhandledRejection", (reason, promise) => {
    log("Unhandled Rejection at:", promise, "reason:", reason);
  });

  await server.connect(transport);
  log("HDW MCP Server running on stdio");
}

runServer().catch((error) => {
  log("Fatal error running server:", error);
  process.exit(1);
});