# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Model Context Protocol (MCP) server for AnySite's LinkedIn and Instagram APIs. It provides comprehensive data access including LinkedIn user search, profile lookup, posts, reactions, comments, chat functionality, connection management, company information, Instagram user profiles and posts, and Reddit/Google search capabilities.

## Build and Development Commands

- `npm run build` - Compile TypeScript to JavaScript and make executable
- `npm run prepare` - Runs build automatically (used by npm during install)
- `npm run watch` - Watch mode for development, recompiles on changes
- `npm run inspector` - Launch MCP inspector for debugging tools

## Code Architecture

### Entry Point (`src/index.ts`)
- Main MCP server implementation with comprehensive LinkedIn API integration
- Exports executable CLI tools: `anysite-mcp`, `anysite`, `mcp`
- Uses Model Context Protocol SDK for server functionality
- Implements 19+ LinkedIn tools and additional Reddit/Google search

### Type System (`src/types.ts`)
- Complete TypeScript definitions for all API endpoints
- Input validation functions for each tool (e.g., `isValidLinkedinSearchUsersArgs`)
- Complex nested interfaces for LinkedIn entities (posts, comments, reactions, users)
- Validation ensures data integrity and proper API parameter handling

### Key Components

#### Environment Configuration
- Requires `ANYSITE_ACCESS_TOKEN` for API authentication
- Optional `ANYSITE_ACCOUNT_ID` for management endpoints (chat, connections, posting)
- Supports `.env` file and `~/.anysite-mcp.env` for configuration

#### API Structure
- Base URL: `https://api.anysite.io`
- All endpoints use POST requests with JSON payloads
- Comprehensive error handling and logging
- Timeout support (20-1500 seconds) for long-running operations

#### Tool Categories
1. **Search & Lookup**: User search, profile lookup, email lookup, company search
2. **Posts & Content**: User posts, post comments/reactions/reposts, post search, company posts
3. **Management**: Chat messages, connection requests, post creation/commenting
4. **Company Data**: Company lookup, employee search, Google company search, company posts
5. **Instagram**: User profiles, user posts, post comments
6. **External APIs**: Reddit search, Google search

### URN Format Requirements
- User URNs must include `fsd_profile:` prefix (e.g., `fsd_profile:ACoAAEWn01Q...`)
- Post URNs use `activity:` prefix (e.g., `activity:7234173400267538433`)
- Company URNs use `company:` prefix
- System automatically normalizes URN formats when possible

### LinkedIn Sales Navigator Integration
- Advanced user search with 15+ filter categories
- Supports complex filtering: location, education, languages, job functions, company sizes
- Enum-based validation for predefined filter values

### Error Handling Pattern
- All API calls wrapped in try-catch with detailed logging
- Structured error responses with `isError: true` flag
- Timestamp-based logging for debugging
- Graceful handling of API rate limits and timeouts

## Development Notes

- TypeScript with strict mode enabled
- ES2022 target with Node16 module resolution  
- Output directory: `./build/`
- Uses dotenv for environment variable management
- Comprehensive input validation before API calls
- All tools return JSON responses formatted for MCP clients

## API Usage Patterns

When extending functionality:
1. Add interface to `types.ts` with validation function
2. Define tool schema in `index.ts` with proper input validation
3. Implement handler in the main switch statement
4. Follow existing error handling patterns
5. Add appropriate logging for debugging

## Environment Setup

Required environment variables:
- `ANYSITE_ACCESS_TOKEN` - API authentication token
- `ANYSITE_ACCOUNT_ID` - Account ID for management operations (optional for read-only)

The server will exit with error code 1 if `ANYSITE_ACCESS_TOKEN` is missing.