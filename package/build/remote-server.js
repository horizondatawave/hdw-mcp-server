#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// Load environment variables
try {
    dotenv.config();
}
catch (error) {
    console.error("Error loading .env file:", error);
}
const API_KEY = process.env.HDW_ACCESS_TOKEN;
const ACCOUNT_ID = process.env.HDW_ACCOUNT_ID;
if (!API_KEY) {
    console.error("Error: HDW_ACCESS_TOKEN environment variable is required");
    process.exit(1);
}
// Create server instance with the same capabilities as your local server
const server = new Server({
    name: "hdw-mcp-remote-server",
    version: "0.1.5"
}, {
    capabilities: {
        tools: {},
        logging: {}
    }
});
// Store active transports for session management
const transports = {};
// Copy all your existing tool definitions and handlers here
// ... (same tools as in your existing server)
const app = express();
// Enable CORS for browser clients
app.use(cors({
    origin: true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}));
app.use(express.json());
const router = express.Router();
// POST endpoint for handling JSON-RPC messages
const POST_ENDPOINT = "/messages";
router.post(POST_ENDPOINT, async (req, res) => {
    console.log("Message request received:", req.method, req.url);
    const sessionId = req.query.sessionId;
    if (!sessionId) {
        res.status(400).json({ error: "Missing sessionId parameter" });
        return;
    }
    const transport = transports[sessionId];
    if (!transport) {
        res.status(400).json({ error: "No transport found for sessionId" });
        return;
    }
    try {
        // Important: pass req.body explicitly to avoid stream errors
        await transport.handlePostMessage(req, res);
    }
    catch (error) {
        console.error("Error handling post message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET endpoint for establishing SSE connection
router.get("/sse", async (req, res) => {
    console.log("SSE connection request received");
    try {
        // Validate Origin header to prevent DNS rebinding attacks
        const origin = req.headers.origin;
        const host = req.headers.host;
        // In production, implement proper origin validation
        // For development, we'll allow localhost origins
        if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
            console.warn(`Suspicious origin detected: ${origin}`);
            // Uncomment in production:
            // res.status(403).json({ error: "Forbidden origin" });
            // return;
        }
        const transport = new SSEServerTransport(POST_ENDPOINT, res);
        console.log("New transport created with session id:", transport.sessionId);
        transports[transport.sessionId] = transport;
        // Clean up transport when connection closes
        res.on("close", () => {
            console.log("SSE connection closed for session:", transport.sessionId);
            delete transports[transport.sessionId];
        });
        res.on("error", (error) => {
            console.error("SSE connection error:", error);
            delete transports[transport.sessionId];
        });
        // Connect the server to this transport
        await server.connect(transport);
    }
    catch (error) {
        console.error("Error establishing SSE connection:", error);
        res.status(500).json({ error: "Failed to establish SSE connection" });
    }
});
// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        server: "hdw-mcp-remote-server",
        version: "0.1.5",
        activeConnections: Object.keys(transports).length
    });
});
app.use("/", router);
const PORT = process.env.PORT || 3001;
// Start server
app.listen(PORT, () => {
    console.log(`HDW MCP Remote Server running on port ${PORT}`);
    console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully');
    process.exit(0);
});
