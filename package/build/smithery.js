import { z } from "zod";
// Configuration schema for Smithery
export const configSchema = z.object({
    anysiteAccessToken: z.string().min(1).describe("Your AnySite API access token"),
    anysiteAccountId: z.string().optional().describe("Your AnySite account ID (optional, required for management operations)"),
});
// Export default createServer function for Smithery
export default async function createServer({ config }) {
    // Set environment variables BEFORE importing index.ts
    // This is critical - env vars must be set before the module is loaded
    process.env.ANYSITE_ACCESS_TOKEN = config.anysiteAccessToken;
    if (config.anysiteAccountId) {
        process.env.ANYSITE_ACCOUNT_ID = config.anysiteAccountId;
    }
    // Dynamic import to ensure env vars are set first
    const { server } = await import("./index.js");
    return server;
}
