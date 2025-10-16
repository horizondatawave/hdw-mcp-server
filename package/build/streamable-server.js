#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { randomUUID } from "crypto";
// Load environment variables (only for server configuration, not user API keys)
try {
    dotenv.config();
}
catch (error) {
    console.error("Error loading .env file:", error);
}
// Create server instance
const server = new Server({
    name: "hdw-mcp-streamable-server",
    version: "0.1.5"
}, {
    capabilities: {
        tools: {},
        logging: {}
    }
});
// Session management for Streamable HTTP
const sessions = {};
const app = express();
// Enable CORS for browser clients
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Mcp-Session-Id', 'Origin', 'X-HDW-Access-Token', 'X-HDW-Account-Id']
}));
app.use(express.json());
const router = express.Router();
// Single MCP endpoint that handles both GET and POST
const MCP_ENDPOINT = "/mcp";
// POST handler for JSON-RPC messages
router.post(MCP_ENDPOINT, async (req, res) => {
    console.log("POST request to MCP endpoint");
    try {
        // Check for session ID in header
        let sessionId = req.headers['mcp-session-id'];
        // Handle initialization request
        if (!sessionId && isInitializeRequest(req.body)) {
            sessionId = randomUUID();
            sessions[sessionId] = { initialized: false };
            // Set session ID in response header
            res.setHeader('Mcp-Session-Id', sessionId);
            res.setHeader('Content-Type', 'application/json');
            // Handle initialize request
            const response = {
                jsonrpc: "2.0",
                id: req.body.id,
                result: {
                    protocolVersion: "2024-11-05",
                    capabilities: {
                        tools: {},
                        logging: {}
                    },
                    serverInfo: {
                        name: "hdw-mcp-streamable-server",
                        version: "0.1.5"
                    }
                }
            };
            sessions[sessionId].initialized = true;
            res.json(response);
            return;
        }
        // Handle other requests with existing session
        if (sessionId && sessions[sessionId]) {
            // Handle different JSON-RPC methods
            if (req.body.method === "notifications/initialized") {
                res.status(202).send(); // Accepted with no body
                return;
            }
            if (req.body.method === "tools/list") {
                const response = {
                    jsonrpc: "2.0",
                    id: req.body.id,
                    result: {
                        tools: [
                            {
                                name: "search_linkedin_users",
                                description: "Search for LinkedIn users with various filters",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        keywords: { type: "string", description: "Any keyword for searching" },
                                        count: { type: "number", description: "Maximum number of results", default: 10 }
                                    },
                                    required: ["count"]
                                }
                            },
                            {
                                name: "get_linkedin_profile",
                                description: "Get detailed LinkedIn profile information",
                                inputSchema: {
                                    type: "object",
                                    properties: {
                                        user: { type: "string", description: "User alias, URL, or URN" }
                                    },
                                    required: ["user"]
                                }
                            }
                            // Add more tools from your existing server here
                        ]
                    }
                };
                res.json(response);
                return;
            }
            if (req.body.method === "tools/call") {
                // Get API credentials from request headers
                const apiKey = req.headers['x-hdw-access-token'];
                const accountId = req.headers['x-hdw-account-id'];
                if (!apiKey) {
                    const response = {
                        jsonrpc: "2.0",
                        id: req.body.id,
                        error: {
                            code: -32602,
                            message: "Missing X-HDW-Access-Token header"
                        }
                    };
                    res.status(401).json(response);
                    return;
                }
                // Handle tool calls - implement your existing tool logic here
                const toolName = req.body.params?.name;
                const toolArgs = req.body.params?.arguments;
                // Example implementation for search_linkedin_users
                if (toolName === "search_linkedin_users") {
                    try {
                        // Call your existing API logic here with user's credentials
                        const result = await handleLinkedInSearch(toolArgs, apiKey, accountId);
                        const response = {
                            jsonrpc: "2.0",
                            id: req.body.id,
                            result: {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify(result, null, 2)
                                    }
                                ]
                            }
                        };
                        res.json(response);
                        return;
                    }
                    catch (error) {
                        const response = {
                            jsonrpc: "2.0",
                            id: req.body.id,
                            error: {
                                code: -32000,
                                message: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
                            }
                        };
                        res.json(response);
                        return;
                    }
                }
                if (toolName === "get_linkedin_profile") {
                    try {
                        const result = await handleLinkedInProfile(toolArgs, apiKey, accountId);
                        const response = {
                            jsonrpc: "2.0",
                            id: req.body.id,
                            result: {
                                content: [
                                    {
                                        type: "text",
                                        text: JSON.stringify(result, null, 2)
                                    }
                                ]
                            }
                        };
                        res.json(response);
                        return;
                    }
                    catch (error) {
                        const response = {
                            jsonrpc: "2.0",
                            id: req.body.id,
                            error: {
                                code: -32000,
                                message: `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
                            }
                        };
                        res.json(response);
                        return;
                    }
                }
                // Unknown tool
                const response = {
                    jsonrpc: "2.0",
                    id: req.body.id,
                    error: {
                        code: -32601,
                        message: `Unknown tool: ${toolName}`
                    }
                };
                res.json(response);
                return;
            }
        }
        // Session not found or invalid request
        res.status(400).json({
            jsonrpc: "2.0",
            error: {
                code: -32600,
                message: "Invalid Request"
            }
        });
    }
    catch (error) {
        console.error("Error handling POST request:", error);
        res.status(500).json({
            jsonrpc: "2.0",
            error: {
                code: -32603,
                message: "Internal error"
            }
        });
    }
});
// GET handler for SSE streams (optional)
router.get(MCP_ENDPOINT, async (req, res) => {
    console.log("GET request to MCP endpoint");
    // For basic servers, we can return 405 Method Not Allowed
    // This indicates we don't support SSE streams at this endpoint
    res.status(405).set('Allow', 'POST').send('Method Not Allowed');
});
// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        server: "hdw-mcp-streamable-server",
        version: "0.1.5",
        activeSessions: Object.keys(sessions).length,
        transport: "streamable-http",
        security: "credentials-from-headers"
    });
});
app.use("/", router);
const PORT = process.env.PORT || 3033;
// Start server
app.listen(PORT, () => {
    console.log(`HDW MCP Streamable HTTP Server running on port ${PORT}`);
    console.log(`MCP endpoint: http://localhost:${PORT}/mcp`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Transport: Streamable HTTP`);
    console.log(`Security: API credentials passed via headers`);
});
// Helper functions
function isInitializeRequest(body) {
    return body && body.method === "initialize" && body.params && body.params.protocolVersion;
}
// API call implementations that accept user credentials
async function handleLinkedInSearch(args, apiKey, accountId) {
    const API_CONFIG = {
        BASE_URL: "https://api.horizondatawave.ai",
        ENDPOINTS: {
            SEARCH_USERS: "/api/linkedin/search/users"
        }
    };
    const url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SEARCH_USERS;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("access-token", apiKey);
    const options = {
        method: "POST",
        headers,
        body: JSON.stringify(args)
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} ${errorData.message || response.statusText}`);
    }
    return await response.json();
}
async function handleLinkedInProfile(args, apiKey, accountId) {
    const API_CONFIG = {
        BASE_URL: "https://api.horizondatawave.ai",
        ENDPOINTS: {
            USER_PROFILE: "/api/linkedin/user"
        }
    };
    const url = API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.USER_PROFILE;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("access-token", apiKey);
    const requestData = {
        user: args.user,
        with_experience: args.with_experience ?? true,
        with_education: args.with_education ?? true,
        with_skills: args.with_skills ?? true
    };
    const options = {
        method: "POST",
        headers,
        body: JSON.stringify(requestData)
    };
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error: ${response.status} ${errorData.message || response.statusText}`);
    }
    return await response.json();
}
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});
